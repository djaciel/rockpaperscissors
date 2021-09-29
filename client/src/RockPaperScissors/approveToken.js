import React, { useEffect, useState } from 'react';
import TokenContract from '../contracts/BUSD.json';
import networkId from '../constants';

const ApproveToken = ({ web3, accounts }) => {
  const [tokenContract, setTokenContract] = useState(null);

  useEffect(() => {
    setTokenContract(
      new web3.eth.Contract(
        TokenContract,
        '0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47',
        accounts[0]
      )
    );
  }, []);

  const approveContractBtn = async () => {
    const tokenBalance = await tokenContract.methods
      .balanceOf(accounts[0])
      .call();
    console.log(tokenBalance);
  };

  return (
    <>
      <div className="m-5">
        <div>
          <span>Aprovar token para poder jugar</span>
        </div>
        <div className="pt-2">
          <button className="btn btn-primary" onClick={approveContractBtn}>
            Aprovar
          </button>
        </div>
      </div>
    </>
  );
};

export default ApproveToken;
