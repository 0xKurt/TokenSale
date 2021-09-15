import { useState } from 'react';
import Web3 from 'web3'
import { RPCURL } from '../../config';

const useEmptyWeb3 = () => {
  const [web3, setWeb3] = useState(new Web3(RPCURL))
  return (
    web3
  );
}

export default useEmptyWeb3;