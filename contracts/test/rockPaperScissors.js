const { BN } = require("@openzeppelin/test-helpers");
const { assert, expect } = require("chai");

const RockPaperScissors = artifacts.require("./RockPaperScissors.sol");

contract("RockPaperScissors", (accounts) => {
  const [alice, bob] = accounts;
  let rockPaperScissorsInstance;

  beforeEach(async () => {
    rockPaperScissorsInstance = await RockPaperScissors.deployed();
  });

  it("...should have the correct value for betFee", async () => {
    let betFee = await rockPaperScissorsInstance.betFee.call();

    expect(betFee).to.be.a.bignumber.equal(new BN("1000000000000000000"));

    await rockPaperScissorsInstance.setBetFee(new BN("2000000000000000000"), { from: alice });

    betFee = await rockPaperScissorsInstance.betFee.call();
    expect(betFee).to.be.a.bignumber.equal(new BN("2000000000000000000"));
  });

  it("...should have 0 tokens balance", async () => {
    // Get balance value
    const balance = await rockPaperScissorsInstance.getBalance.call();
    assert.equal(balance, 0, "The value was not  correct.");
  });
});
