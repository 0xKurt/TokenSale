import React, { useEffect, useState } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { useCallContract, useConnectedAccount, useErc20BalanceOf } from '../web3/hooks';
import TokenSale from '../data/contracts/TokenSale.json'
import Token from '../data/contracts/Token.json'
import { fromWeiToFixed, toWei } from '../web3/utils/func';
import { TransactionButton, ConnectButton } from '../web3/components';

const Exchange = () => {
  const { account, } = useConnectedAccount();
  const daiUser = useErc20BalanceOf('0xc7ad46e0b8a400bb3c915120d284aafba8fc4735', account); // dai address
  const tokenUser = useErc20BalanceOf(Token.address, account); // exchange token address
  const tokenConract = useErc20BalanceOf(Token.address, TokenSale.address);
  const { callResult, call } = useCallContract();
  const [sold, setSold] = useState('')

  let hundred = toWei('100');

  useEffect(async () => {
    // load sold token amount
    call({
      address: TokenSale.address,
      abi: TokenSale.abi,
      method: 'getSoldExchangeTokenAmount',
      args: []
    }).then(setSold(fromWeiToFixed(callResult, 3)))
  })

  return (
    <>
      <Container fluid style={{ padding: '20px' }}>
        <Row style={{ width: '100%' }}>
          <Col style={{ maxWidth: '300px' }}>
            <ConnectButton language='de' />
          </Col>
          <Col style={{ maxWidth: '300px' }}>
            <Row>
              User Balance: {daiUser} DAI
            </Row>
            <Row>
              User Token: {tokenUser} EXC
            </Row>
          </Col>
          <Col>
            <Row>
              TokenSale: {tokenConract} EXC
            </Row>
            <Row>
              Token sold: {sold}
            </Row>
            <Row>&nbsp;</Row>
          </Col>
        </Row>
        <Container style={{ width: '100%', padding: '20px' }}>
          <Row>
            <TransactionButton
              address={TokenSale.address}
              abi={TokenSale.abi}
              method={'buy'}
              args={[hundred, hundred]}
              confirmations={1} //optional
              language={'de'} //optional
              text={'Kaufen'}
            />
          </Row>
        </Container>
      </Container>
    </>
  );
}

export default Exchange;