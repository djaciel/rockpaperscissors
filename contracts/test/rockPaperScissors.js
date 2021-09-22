const { BN, expectRevert } = require("@openzeppelin/test-helpers");
const { assert, expect } = require("chai");

const RockPaperScissors = artifacts.require("./RockPaperScissors.sol");
const PisiToken = artifacts.require("./PisiToken.sol");

contract("RockPaperScissors", (accounts) => {
  const [alice, bob] = accounts;
  let rockPaperScissorsInstance;

  beforeEach(async () => {
    pisiToken = await PisiToken.new(1000);
    rockPaperScissorsInstance = await RockPaperScissors.new(pisiToken.address);
    await pisiToken.transfer(bob, new BN("500"), { from: alice });
    await pisiToken.approve(rockPaperScissorsInstance.address, new BN("500"), { from: alice });
    await pisiToken.approve(rockPaperScissorsInstance.address, new BN("500"), { from: bob });
  });

  it("Should have the correct value for betFee before and after updating", async () => {
    let betFee = await rockPaperScissorsInstance.betFee.call();

    expect(betFee).to.be.a.bignumber.equal(new BN("1000000000000000000"));

    await rockPaperScissorsInstance.setBetFee(new BN("2000000000000000000"), { from: alice });

    betFee = await rockPaperScissorsInstance.betFee.call();
    expect(betFee).to.be.a.bignumber.equal(new BN("2000000000000000000"));
  });

  it("Should have the correct value for deadline before and after updating", async () => {
    let deadline = await rockPaperScissorsInstance.deadline.call();

    expect(deadline).to.be.a.bignumber.equal(new BN("90"));

    await rockPaperScissorsInstance.setDeadline(new BN("60"), { from: alice });

    deadline = await rockPaperScissorsInstance.deadline.call();
    expect(deadline).to.be.a.bignumber.equal(new BN("60"));
  });

  it("Should ownable methods be ownable", async () => {
    await expectRevert(rockPaperScissorsInstance.setDeadline(60, { from: bob }), "Ownable: caller is not the owner");

    await expectRevert(
      rockPaperScissorsInstance.setBetFee(new BN("2000000000000000000"), { from: bob }),
      "Ownable: caller is not the owner"
    );
  });

  it("Should have 0 tokens balance", async () => {
    // Get balance value
    const balance = await rockPaperScissorsInstance.getBalance.call();
    assert.equal(balance, 0, "The value was not  correct.");
  });

  it("Balance pisi token", async () => {
    const balance = await pisiToken.balanceOf(alice);
    expect(balance).to.be.a.bignumber.equal(new BN("500"));
  });
});
