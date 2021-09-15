import React, { useEffect, useState } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import ConnectButton from '../web3/components/ConnectButton.jsx';
import { useCallContract, useConnectedAccount, useSendTransaction } from '../web3/hooks';
import useErc20BalanceOf from '../web3/hooks/useErc20BalanceOf';
import TokenSale from '../data/contracts/TokenSale.json'
import Token from '../data/contracts/Token.json'
import { fromWeiToFixed, toWei } from '../web3/utils/func';

const Exchange = () => {
  const { account, } = useConnectedAccount();
  const daiUser = useErc20BalanceOf('0xc7ad46e0b8a400bb3c915120d284aafba8fc4735', account); // dai address
  const tokenUser = useErc20BalanceOf(Token.address, account); // exchange token address
  const { callResult, call } = useCallContract();
  const tokenConract = useErc20BalanceOf(Token.address, TokenSale.address);
  const [sold, setSold] = useState('')
  const [status, setStatus] = useState('')

  const send = useSendTransaction();

  const buyHundred = async () => {
    setStatus('waiting for wallet interaction');
    let hundred = toWei('100');
    send({
      confirmations: 1,
      address: TokenSale.address,
      abi: TokenSale.abi,
      method: 'buy',
      args: [hundred, hundred]
    }).on('transactionHash', hash => {
      setStatus('Hash received: '+hash)
    }).on('receipt', receipt => {
      setStatus('receipt received')
    }).on('confirmation', number => {
      setStatus('transaction confirmed')
    }).on('error', error => {
      setStatus('error')
    })
  }

  useEffect(async () => {
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
            <ConnectButton language='de' network={4} />
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
            <button onClick={buyHundred}>Buy 100 EXC</button>
          </Row>
          <Row>
            Status: {status}
          </Row>
        </Container>
      </Container>
    </>
  );
}

export default Exchange;