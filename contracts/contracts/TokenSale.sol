pragma solidity ^0.8.2;
import './metatx-standard/EIP712MetaTransaction.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

// minimal ERC20 interface
interface ERC20 {
    function allowance(address owner, address spender) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address, address, uint256) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address, uint256) external;
}

contract TokenSale is EIP712MetaTransaction, ReentrancyGuard {
    
    address public owner;
    
    ERC20 public currency;
    ERC20 public exchangeToken;
    
    address[] public buyersList;
    mapping(address=>bool) isBuyer;
    
    uint256 public minAmount;
    uint256 public exchangeRate;
    uint256 public soldExchangeToken;
    uint256 public currencyAmount;
    
    bool public saleActive;
    
    constructor(
        string memory name, 
        string memory version, 
        address currencyAddress, 
        address exchangeTokenAddress, 
        uint256 initExchangeRate,
        uint256 minimumAmount
    ) public EIP712MetaTransaction(name, version) {
        owner = msg.sender;
        currency = ERC20(currencyAddress);
        exchangeToken = ERC20(exchangeTokenAddress);
        exchangeRate = initExchangeRate;
        saleActive = false;
        soldExchangeToken = 0;
        currencyAmount = 0;
        minAmount = minimumAmount;
    }
    
    // *******************************************************************************
    //
    //                                    events
    //
    // *******************************************************************************
    
    // @dev Emitted when ownership changes
    event ChangedOwnership(address indexed oldOwner, address indexed newOwner);
    
     // @dev Emitted when user bought token
    event Bought(address indexed user, uint256 amount, uint256 receives);

    // @dev Emitted when owner withdraws from contract
    event Withdrawed(address indexed to, address indexed token, uint256 amount);
    
    // @dev Emitted when ownership changes
    event ChangedExchangeRate(uint256 indexed newExchangeRate);

    // @dev Emitted when saleActive changes
    event ChangedSaleActive(bool active);
    
    // @dev Emitted when minAmount changes
    event ChangedMinAmount(uint256 minAmount);

    // *******************************************************************************
    //
    //                                    modifier
    //
    // *******************************************************************************
    
    // @dev Checks if the msg sender is owner
    modifier onlyOwner() {
        require(msgSender() == owner, "msg.sender is not authorized");
        _;
    }
    
    // @dev checks if the contract is allowed to transfer the given currency amount of the user
    modifier checkAllowance(uint256 amount) {
        require(currency.allowance(msgSender(), address(this)) >= amount,'contract is not allowed to transfer users funds');
        _;
    }
    
    modifier checkAvailableUserFunds(uint256 amount) {
        require(currency.balanceOf(msgSender()) >= amount, 'user has not enough funds');
        _;
    }
    
    modifier isSaleActive() {
        require(saleActive, 'sale is currently inactive');
        _;
    }
    
    modifier contractHasEnoughToken(uint256 amount) {
        require(exchangeToken.balanceOf(address(this)) >= amount, 'not enough exchangeToken left :(');
        _;
    }
    
    modifier checkPriceRatio(uint256 price, uint256 exchangeTokenAmount) {
        require(exchangeTokenAmount == getAmountOfExchangeToken(price), 'wrong amount of exchange token for given price');
        _;
    }
    
    modifier isPurchaseMinimum(uint256 amount) {
        require(amount >= minAmount && amount >= 100, 'the user tries to buy too few tokens');
        _;
    }
    
    // *******************************************************************************
    //
    //                                 public functions
    //
    // *******************************************************************************
    
    // @notice function is called to buy token
    // @param price The amount of currency token the user wants to spent in exchange for the exchangeToken
    // @param exchangeTokenAmount the amount of tokens the user wants to buy
    // @return Returns the amount of exchangToken the user receives in exchange for his currency token
    function buy(uint256 price, uint256 exchangeTokenAmount) public 
        nonReentrant 
        isSaleActive 
        isPurchaseMinimum(exchangeTokenAmount)
        checkPriceRatio(price, exchangeTokenAmount)
        contractHasEnoughToken(exchangeTokenAmount)
        checkAvailableUserFunds(price) 
        checkAllowance(price) 
        returns(uint256) 
    {
        currency.transferFrom(msgSender(), address(this), price);
        currencyAmount += price;
        
        exchangeToken.transfer(msgSender(), exchangeTokenAmount);
        soldExchangeToken += exchangeTokenAmount;   
        
        addBuyerToList(msgSender());
        
        emit Bought(msgSender(), price, exchangeTokenAmount);
        
        return exchangeTokenAmount;
    }

    // *******************************************************************************
    //
    //                                internal functions
    //
    // *******************************************************************************
    
    // @notice adds the address of a new buyer at its first purchase to buyersList.
    // @dev internal function
    function addBuyerToList(address buyer) internal {
        if(!isBuyer[buyer]) { 
            isBuyer[buyer] = true;
            buyersList.push(buyer);
        }
    }
    
    // *******************************************************************************
    //
    //                                  public getter
    //
    // *******************************************************************************
    
    // @notice Getter for te address of the contract owner
    // @return Returns address of the proxy contract owner
    function getOwner() public view returns(address) {
        return owner;
    }
    
    function getExchangeRate() public view returns(uint256) {
        return exchangeRate;
    }
    
    function getCurrencyAddress() public view returns(address) {
        return address(currency);
    }
    
    function getExchangeTokenAddress() public view returns(address) {
        return address(exchangeToken);
    } 
    
    function getBuyersList() public view returns(address[] memory) {
        return buyersList;
    }
    
    function getCurrencyAmount() public view returns(uint256) {
        return currencyAmount;
    }
    
    function getSoldExchangeTokenAmount() public view returns(uint256) {
        return soldExchangeToken;
    }
    
    function getAmountOfExchangeToken(uint256 amount) public view returns(uint256) {
        return amount*exchangeRate/100;
    }
    
    function getPriceOfExchangeToken(uint256 amount) public view returns(uint256) {
        return amount*100/exchangeRate;
    }
    
    function getPurchaseMinimum() public view returns(uint256) {
        return minAmount;
    }
    
    function getSaleActive() public view returns (bool) {
        return saleActive;
    }
    
    // *******************************************************************************
    //
    //                                owner functions
    //
    // *******************************************************************************

    // @notice Transfers the ownership of the contract to a new address
    // @dev Can only called by the old owner
    // @param newOwner Address of the new owner
    function setOwner(address newOwner) public onlyOwner {
        owner = newOwner;
        emit ChangedOwnership(msgSender(), newOwner);
    }
    
    // @notice set a new exchange rate in percent. 
    // @dev Can only called by the owner. currencyAmount/100*exchangeRate=exchangeTokenAmount
    // @param newExchangeRate new exchange rate uint256
    function setExchangeRate(uint256 newExchangeRate) public onlyOwner {
        exchangeRate = newExchangeRate;
        emit ChangedExchangeRate(newExchangeRate);
    }
    
    function withdrawCurrency(address to, uint256 amount) public onlyOwner returns(uint256) {
        currency.transfer(to, amount);
        emit Withdrawed(to, address(currency), amount);
        return amount;
    }
    
    function withdrawAllCurrency(address to) public onlyOwner returns(uint256) {
        uint256 amount = currency.balanceOf(address(this));
        currency.transfer(to, amount);
        emit Withdrawed(to, address(currency), amount);
        return amount;
    }
    
    function withdrawExchangeToken(address to, uint256 amount) public onlyOwner returns(uint256) {
        exchangeToken.transfer(to, amount);
        emit Withdrawed(to, address(exchangeToken), amount);
        return amount;
    }
    
    function withdrawAllExchangeTokens(address to) public onlyOwner returns(uint256) {
        uint256 amount = exchangeToken.balanceOf(address(this));
        exchangeToken.transfer(to, amount);
        emit Withdrawed(to, address(exchangeToken), amount);
        return amount;
    }
    
    function setSaleActive() public onlyOwner returns(bool) {
        saleActive = true;
        emit ChangedSaleActive(saleActive);
        return saleActive;
    }
    
    function setSaleInActive() public onlyOwner returns(bool) {
        saleActive = false;
        emit ChangedSaleActive(saleActive);
        return saleActive;
    }
    
    function setMinAmount(uint256 min) public onlyOwner returns(uint256) {
        minAmount = min;
        emit ChangedMinAmount(min);
        return min;
    }
}
