
pragma solidity ^0.8.0;

import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol';

contract StadardToken is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initSupply) ERC20(name, symbol) {
        _mint(msg.sender, initSupply);
    }   
}