import React, { Component } from 'react';
import getWeb3 from './getWeb3';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import RockPaperScissors from './RockPaperScissors';

class App extends Component {
  state = { web3: null, accounts: null };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      this.setState({ web3, accounts });
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <RockPaperScissors
        web3={this.state.web3}
        accounts={this.state.accounts}
      />
    );
  }
}

export default App;
