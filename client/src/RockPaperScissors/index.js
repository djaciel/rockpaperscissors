import React from 'react';
import RockPaperScissorsContract from '../contracts/RockPaperScissors.json';

import ApproveToken from './approveToken';

const RockPaperScissors = ({ web3, accounts }) => {
  return (
    <>
      <div className="m-5">
        <ApproveToken web3={web3} accounts={accounts} />
      </div>
    </>
  );
};

export default RockPaperScissors;
