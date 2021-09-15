import { ethers } from "ethers";
import { useState } from "react";
import { useConnectedAccount, useConnectedWeb3, useTriggerEvent } from ".";
const emitter = require('events').EventEmitter;

const useSendTransaction = () => {
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
          await web3.eth.clearSubscriptions()
        })
        .catch(async error => {
          e.emit('error', error)
          await web3.eth.clearSubscriptions()
        })
    } else {
      e.emit('error', 'user not connected')
      web3.eth.clearSubscriptions()
    }
    return e;
  }

  return (send);
}

export default useSendTransaction;