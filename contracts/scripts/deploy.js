const { ethers } = require("hardhat");

let tokenFactory, tokenSaleFactory;
let exchangeToken, tokenSale;

// erc20 (exchange-) token init supply
let tokenName = 'ExchangeToken';
let tokenSymbol = 'EXC';
let initSupply = utils.parseUnits('100000000', 'ether');

// TokenSale config
let name = 'VeryNiceTokenSale';
let version = '1';
let purchaseMinimum = utils.parseUnits('100', 'ether');
let exchangeRate = 100; // in %
let currencyAddress = '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735'; // rinkeby testdai

const main = async () => {
  const [deployer] = await ethers.getSigner();

  tokenFactory = await ethers.getContractFactory('StandardToken');
  exchangeToken = await tokenFactory.deploy(tokenName, tokenSymbol, initSupply);

  tokenSaleFactory = await ethers.getContractFactory('TokenSale');
  tokenSale = await tokenSaleFactory.deploy(
    name,
    version,
    currencyAddress,
    exchangeToken.address,
    exchangeRate,
    purchaseMinimum
  );

  console.log('Deployer address: '+deployer);
  console.log('Exchange token ('+tokenSymbol+') address: '+exchangeToken.address);
  console.log('TokenSale address: '+tokenSale.address);
}


main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })