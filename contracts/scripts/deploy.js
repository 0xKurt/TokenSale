const { ethers } = require("hardhat");
const { utils } = require("ethers");
const fs = require('fs');

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
  const [deployer, _] = await ethers.getSigners();

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

  console.log('Deployer address: ' + deployer.address);
  console.log('Deployer balance: ' + await deployer.getBalance());
  console.log('Network id: ' + deployer.provider._network.chainId)
  console.log('Network: ' + deployer.provider._network.name)
  console.log()
  console.log('Exchange token (' + tokenSymbol + ') address: ' + exchangeToken.address);
  console.log('TokenSale address: ' + tokenSale.address);

  const tokenData = {
    Token: {
      name: tokenName,
      symbol: tokenSymbol,
      address: exchangeToken.address,
      abi: JSON.parse(exchangeToken.interface.format('json'))
    }
  };

  fs.writeFileSync('../frontend/src/data/contracts/Token.json', JSON.stringify(tokenData));

  const saleData = {
    TokenSale: {
      name: name,
      version: version,
      address: tokenSale.address,
      abi: JSON.parse(tokenSale.interface.format('json'))
    }
  };

  fs.writeFileSync('../frontend/src/data/contracts/TokenSale.json', JSON.stringify(saleData));
}


main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })