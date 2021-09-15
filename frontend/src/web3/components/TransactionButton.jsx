import React, { useState } from 'react';
import { useConnectedAccount, useConnectedNetworkId, useReadState, useSendTransaction } from '../hooks';
import GeneralButton from './internal/GeneralButton';
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/react";
import { FaCheck } from 'react-icons/fa'
import { ImCross } from 'react-icons/im'

const override = css`
  display: block;
  margin: 0 auto;
`;

const TransactionButton = (props) => {
  const { account, } = useConnectedAccount();
  const { networkId, } = useConnectedNetworkId();
  const network = useReadState('network')
  const blockexplorer = useReadState('blockexplorer')

  const send = useSendTransaction();
  const [text, setText] = useState(props.text);
  const [status, setStatus] = useState('')
  const [msg, setMsg] = useState(<>&nbsp;</>)

  const sendTx = () => {
    setMsg(props.language == 'de' ? 'Bitte Transaktion im Wallet bestätigen' : 'Waiting for wallet interaction');
    send({
      confirmations: props.confirmations,
      address: props.address,
      abi: props.abi,
      method: props.method,
      args: props.args
    }).on('transactionHash', hash => {
      setStatus('hash')
      setText(props.language == 'de' ? 'Senden...' : 'Pending...')
      let url = <a target='_blank' href={blockexplorer.url + '/tx/' + hash}>{blockexplorer.name}</a>
      setMsg(props.language == 'de' ? <>Transaktion auf {url} ansehen.</> : <>View transaction on ${url}</>)
    }).on('receipt', receipt => {
      console.log(receipt)
    }).on('confirmation', number => {
      setStatus('confirmed')
      setText(props.language == 'de' ? 'Erfolgreich!' : 'Confirmed!')
    }).on('error', error => {
      setText(props.language == 'de' ? 'Error!' : 'Failed!')
      setStatus('error')
    })
  }

  const resetVars = () => {
    setText(props.text)
    setStatus('')
    setMsg(<>&nbsp;</>)
  }

  return (
    <div>
      {/* inactive, not logged in, wrong network */}
      {(!account || (networkId != network)) &&
        <GeneralButton
          onClick={() => { }}
          text={text}
          color={props.colorInactive ? props.colorInactive : 'lightgrey'}
          backgroundColor={props.backgroundColorInactive ? props.backgroundColorInactive : '#f1f1f1'}
          caption={msg}
        />}

        {/* Waiting for wallet interaction */}
      {account && networkId == network && status == '' &&
        <GeneralButton
          onClick={sendTx}
          text={text}
          color={props.color ? props.color : 'dodgerblue'}
          backgroundColor={props.backgroundColor ? props.backgroundColor : 'white'}
          hoverColor={props.hoverColor ? props.hoverColor : '#fafafa'}
          caption={msg}
        />}

        {/* Pending TX */}
      {account && networkId == network && status != '' && status != 'confirmed' && status != 'error' &&
        <GeneralButton
          onClick={() => { }}
          text={text}
          color={props.color ? props.color : 'dodgerblue'}
          backgroundColor={props.backgroundColor ? props.backgroundColor : 'white'}
          hoverColor={props.hoverColor ? props.hoverColor : '#1c82e6'}
          caption={msg}
          split={true}
          icon={<ClipLoader color={'#ffffff'} loading={true} css={override} size={18} />}
        />}

        {/* Confirmed TX */}
      {account && networkId == network && status != '' && status == 'confirmed' && status != 'error' &&
        <GeneralButton
          onClick={resetVars}
          text={text}
          color={props.colorConfirmed ? props.colorConfirmed : '#28a745'}
          backgroundColor={props.backgroundColorConfirmed ? props.backgroundColorConfirmed : 'white'}
          hoverColor={props.hoverColorConfirmed ? props.hoverColorConfirmed : '#24823a'}
          caption={msg}
          split={true}
          icon={<FaCheck />}
        />}

        {/* Failed TX */}
      {account && networkId == network && status != '' && status != 'confirmed' && status == 'error' &&
        <GeneralButton
          onClick={resetVars}
          text={text}
          color={props.colorFailed ? props.colorFailed : 'indianred'}
          backgroundColor={props.backgroundColorFailed ? props.backgroundColorFailed : 'white'}
          hoverColor={props.hoverFailed ? props.hoverFailed : '#b84040'}
          caption={msg}
          split={true}
          icon={<ImCross />}
        />}
    </div>
  );
}

export default TransactionButton;