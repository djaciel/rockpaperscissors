const path = require('path');
require('dotenv').config({ path: './.env' });
const HDWalletProvider = require('@truffle/hdwallet-provider');
const AccountIndex = 0;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, '../client/src/contracts'),
  networks: {
    develop: {
      port: 8545,
    },
    ganache_local: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC_GANACHE,
          'http://127.0.0.1:7545',
          AccountIndex
        );
      },
      network_id: 5777,
    },
    goerli_infura: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          'https://goerli.infura.io/v3/9eece724fc5145b0b07c5eb4eeb7992b',
          AccountIndex
        );
      },
      network_id: 5,
    },
    ropsten_infura: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          'https://ropsten.infura.io/v3/9eece724fc5145b0b07c5eb4eeb7992b',
          AccountIndex
        );
      },
      network_id: 3,
    },
    bsc_testnet: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          'https://data-seed-prebsc-2-s1.binance.org:8545/',
          AccountIndex
        );
      },
      network_id: 97,
    },
  },
  compilers: {
    solc: {
      version: '0.8.0',
    },
  },
};
