const { BN, expectRevert } = require("@openzeppelin/test-helpers");
const { assert, expect } = require("chai");

const RockPaperScissors = artifacts.require("./RockPaperScissors.sol");
const PisiToken = artifacts.require("./PisiToken.sol");

contract("RockPaperScissors", (accounts) => {
  const [alice, bob, charlie] = accounts;
  let rockPaperScissorsInstance;

  beforeEach(async () => {
    pisiToken = await PisiToken.new(new BN("1100000000000000000000"));
    rockPaperScissorsInstance = await RockPaperScissors.new(pisiToken.address);
    await pisiToken.transfer(bob, new BN("500000000000000000000"), {
      from: alice,
    });
    await pisiToken.transfer(charlie, new BN("100000000000000000000"), {
      from: alice,
    });
    await pisiToken.approve(rockPaperScissorsInstance.address, new BN("500000000000000000000"), {
      from: alice,
    });
    await pisiToken.approve(rockPaperScissorsInstance.address, new BN("500000000000000000000"), {
      from: bob,
    });
    await pisiToken.approve(rockPaperScissorsInstance.address, new BN("100000000000000000000"), {
      from: charlie,
    });
  });

  describe("General Methods", function() {
    it("Should have the correct value for betFee before and after updating", async () => {
      let betFee = await rockPaperScissorsInstance.betFee.call();

      expect(betFee).to.be.a.bignumber.equal(new BN("1000000000000000000"));

      await rockPaperScissorsInstance.setBetFee(new BN("2000000000000000000"), {
        from: alice,
      });

      betFee = await rockPaperScissorsInstance.betFee.call();
      expect(betFee).to.be.a.bignumber.equal(new BN("2000000000000000000"));
    });

    it("Should have the correct value for deadline before and after updating", async () => {
      let deadline = await rockPaperScissorsInstance.deadline.call();

      expect(deadline).to.be.a.bignumber.equal(new BN("90"));

      await rockPaperScissorsInstance.setDeadline(new BN("30"), {
        from: alice,
      });

      deadline = await rockPaperScissorsInstance.deadline.call();
      expect(deadline).to.be.a.bignumber.equal(new BN("30"));
    });

    it("Should ownable methods be ownable", async () => {
      await expectRevert(rockPaperScissorsInstance.setDeadline(60, { from: bob }), "Ownable: caller is not the owner");

      await expectRevert(
        rockPaperScissorsInstance.setBetFee(new BN("2000000000000000000"), {
          from: bob,
        }),
        "Ownable: caller is not the owner"
      );
    });

    it("Should have 0 tokens balance", async () => {
      // Get balance value
      const balance = await rockPaperScissorsInstance.getBalance.call();
      assert.equal(balance, 0, "The value was not  correct.");
    });
  });

  describe("Correct Game Flow", function() {
    it("Should validate the state of a game when it doesnt start yet", async () => {
      await expectRevert(
        rockPaperScissorsInstance.finishGame(bob, { from: alice }),
        "You don't have an open game or your opponent has already finished the game"
      );

      const message = await rockPaperScissorsInstance.gameStatus.call(bob);
      assert.equal(message, "The game does not exist or is over");
    });

    it("Should create a game and validate when a user has an active game or doesnt has winings", async () => {
      await expectRevert(
        rockPaperScissorsInstance.createGame(bob, 1, true, { from: alice }),
        "You need to deposit the bet, you do not have enough winnings to participate"
      );

      await rockPaperScissorsInstance.createGame(bob, 1, false, {
        from: alice,
      });

      await expectRevert(
        rockPaperScissorsInstance.createGame(bob, 1, false, { from: alice }),
        "You already have an open game"
      );

      await expectRevert(rockPaperScissorsInstance.finishGame(bob, { from: alice }), "You can't finish the game yet");

      const message = await rockPaperScissorsInstance.gameStatus.call(bob);
      assert.equal(message, "The opponent has not yet made his move");
    });

    it("Should reject a non-game player", async () => {
      await expectRevert(
        rockPaperScissorsInstance.createGame(bob, 1, false, { from: charlie }),
        "The opponent has an open game with someone else"
      );
    });
  });
});
