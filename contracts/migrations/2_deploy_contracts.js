var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var RockPaperScissors = artifacts.require("./RockPaperScissors.sol");

const tokenAddress = "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47"; //busd_bsc_testnet

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(RockPaperScissors, tokenAddress);
};
