import { ethers } from "ethers";
import { emit } from "process";
import { useState } from "react";
import { useConnectedAccount, useConnectedWeb3, useTriggerEvent } from ".";
const emitter = require('events').EventEmitter;

const useSendTransaction = () => {
  const [sendResult, setSendResult] = useState('');
  const [status, setStatus] = useState('');
  const { web3, } = useConnectedWeb3();
  const { account, } = useConnectedAccount();
  const { event, trigger } = useTriggerEvent();
  // send({
  //   address: contractAddress,
  //   abi: contractAbi,
  //   method: 'setOwner',
  //   args: [ownerAddress]
  // }).then(console.log(status))

  const send = (txData) => {
    let e = new emitter();

    if (web3 && account) {
      const abi = new ethers.utils.Interface(txData.abi)
      const methodData = abi.encodeFunctionData(txData.method, txData.args)
      web3.eth.sendTransaction({
        to: txData.address,
        from: account,
        data: methodData
      })
        .on("transactionHash", async (h) => {
          e.emit('transactionHash', h);
        })
        .on('receipt', async (receipt) => {
          e.emit('receipt', receipt);
        })
        .on("confirmation", async (number) => {
          let conf = txData.confirmations ? txData.confirmations : 4;
          if (number >= conf) {
            await web3.eth.clearSubscriptions()
            e.emit('confirmation', number);
            trigger();
          }
          console.log(number)
        })
        .on("error" || "Error", async (error) => {
          e.emit('error', error)
        })
        .catch(error => {
          e.emit('error', error)
        })
    } else {
      e.emit('error', 'user not connected')
    }
    return e;
  }

  return (send);
}

export default useSendTransaction;