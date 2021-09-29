const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const { assert, expect } = require('chai');

const RockPaperScissors = artifacts.require('./RockPaperScissors.sol');
const PisiToken = artifacts.require('./PisiToken.sol');

const RPS = {
  None: 0,
  Rock: 1,
  Paper: 2,
  Scissors: 3,
  0: 'None',
  1: 'Rock',
  2: 'Paper',
  3: 'Scissors',
};

contract('RockPaperScissors', (accounts) => {
  const [alice, bob, charlie] = accounts;
  let rockPaperScissorsInstance;

  beforeEach(async () => {
    pisiToken = await PisiToken.new(new BN('1100000000000000000000'));
    rockPaperScissorsInstance = await RockPaperScissors.new(pisiToken.address);
    await pisiToken.transfer(bob, new BN('500000000000000000000'), {
      from: alice,
    });
    await pisiToken.transfer(charlie, new BN('100000000000000000000'), {
      from: alice,
    });
    await pisiToken.approve(
      rockPaperScissorsInstance.address,
      new BN('500000000000000000000'),
      {
        from: alice,
      }
    );
    await pisiToken.approve(
      rockPaperScissorsInstance.address,
      new BN('500000000000000000000'),
      {
        from: bob,
      }
    );
    await pisiToken.approve(
      rockPaperScissorsInstance.address,
      new BN('100000000000000000000'),
      {
        from: charlie,
      }
    );
  });

  describe('General Methods', function() {
    it('Should have the correct value for betFee before and after updating', async () => {
      let betFee = await rockPaperScissorsInstance.betFee.call();

      expect(betFee).to.be.a.bignumber.equal(new BN('1000000000000000000'));

      await rockPaperScissorsInstance.setBetFee(new BN('2000000000000000000'), {
        from: alice,
      });

      betFee = await rockPaperScissorsInstance.betFee.call();
      expect(betFee).to.be.a.bignumber.equal(new BN('2000000000000000000'));
    });

    it('Should have the correct value for deadline before and after updating', async () => {
      let deadline = await rockPaperScissorsInstance.deadline.call();

      expect(deadline).to.be.a.bignumber.equal(new BN('90'));

      await rockPaperScissorsInstance.setDeadline(new BN('30'), {
        from: alice,
      });

      deadline = await rockPaperScissorsInstance.deadline.call();
      expect(deadline).to.be.a.bignumber.equal(new BN('30'));
    });

    it('Should ownable methods be ownable', async () => {
      await expectRevert(
        rockPaperScissorsInstance.setDeadline(60, { from: bob }),
        'Ownable: caller is not the owner'
      );

      await expectRevert(
        rockPaperScissorsInstance.setBetFee(new BN('2000000000000000000'), {
          from: bob,
        }),
        'Ownable: caller is not the owner'
      );

      const owner = await rockPaperScissorsInstance.owner.call();
      assert.equal(owner, alice);

      const tokenAddress = await rockPaperScissorsInstance.tokenAddress.call();
      assert.equal(tokenAddress, pisiToken.address);
    });

    it('Should have 0 tokens balance', async () => {
      // Get balance value
      const balance = await rockPaperScissorsInstance.getBalance.call();
      assert.equal(balance, 0, 'The value was not  correct.');
    });
  });

  describe('Create Game Method', function() {
    it('Should validate the state of a game when it doesnt start yet', async () => {
      await expectRevert(
        rockPaperScissorsInstance.finishGame(bob, { from: alice }),
        "You don't have an open game or your opponent has already finished the game"
      );

      const message = await rockPaperScissorsInstance.gameStatus.call(bob);
      assert.equal(message, 'The game does not exist or is over');
    });

    it('Correct game flow', async () => {
      let gameStatusMessage;

      await expectRevert(
        rockPaperScissorsInstance.createGame(bob, RPS.Rock, true, {
          from: alice,
        }),
        'You need to deposit the bet, you do not have enough winnings to participate'
      );

      await rockPaperScissorsInstance.createGame(bob, RPS.Rock, false, {
        from: alice,
      });

      await expectRevert(
        rockPaperScissorsInstance.createGame(bob, RPS.Rock, false, {
          from: alice,
        }),
        'You already have an open game'
      );

      await expectRevert(
        rockPaperScissorsInstance.finishGame(bob, { from: alice }),
        "You can't finish the game yet"
      );

      gameStatusMessage = await rockPaperScissorsInstance.gameStatus.call(bob);
      assert.equal(gameStatusMessage, 'The opponent has not yet made his move');

      await expectRevert(
        rockPaperScissorsInstance.createGame(bob, RPS.Rock, false, {
          from: charlie,
        }),
        'The opponent has an open game with someone else'
      );

      await expectRevert(
        rockPaperScissorsInstance.createGame(charlie, RPS.Paper, false, {
          from: bob,
        }),
        'You already have an open game'
      );

      const opponent = await rockPaperScissorsInstance.getOpponent.call({
        from: bob,
      });
      assert.equal(opponent, alice);

      gameStatusMessage = await rockPaperScissorsInstance.gameStatus.call(
        alice,
        { from: bob }
      );
      assert.equal(gameStatusMessage, "You haven't made your move yet");

      await rockPaperScissorsInstance.createGame(alice, RPS.Rock, false, {
        from: bob,
      });

      gameStatusMessage = await rockPaperScissorsInstance.gameStatus.call(bob);
      assert.equal(
        gameStatusMessage,
        'Both players have made their move, the game is ready to end'
      );
    });
  });

  describe('Finish Game Method', function() {
    beforeEach(async function() {
      await rockPaperScissorsInstance.setDeadline(new BN('5'), {
        from: alice,
      });

      await rockPaperScissorsInstance.createGame(bob, RPS.Paper, false, {
        from: alice,
      });
    });

    function timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    it('Alice won game', async () => {
      await rockPaperScissorsInstance.createGame(alice, RPS.Rock, false, {
        from: bob,
      });

      await timeout(6000);

      let result = await rockPaperScissorsInstance.finishGame(bob, {
        from: alice,
      });

      assert.equal(
        result['logs'][0]['args']['message'],
        'You won! Your reward was saved in your earnings'
      );

      const balance = web3.utils.fromWei(
        await rockPaperScissorsInstance.getBalance.call(),
        'ether'
      );

      const pisiTokenAliceBalance = web3.utils.fromWei(
        await pisiToken.balanceOf(alice),
        'ether'
      );

      const betFee = web3.utils.fromWei(
        await rockPaperScissorsInstance.betFee.call(),
        'ether'
      );

      const earnings = betFee * 2;

      assert.equal(balance, earnings, 'The balance was not correct.');

      await rockPaperScissorsInstance.withdrawal();

      const newPisiTokenAliceBalance = web3.utils.fromWei(
        await pisiToken.balanceOf(alice),
        'ether'
      );

      assert.equal(
        parseInt(newPisiTokenAliceBalance),
        parseInt(earnings) + parseInt(pisiTokenAliceBalance),
        'The balance was not correct.'
      );
    });

    it('Bob won game', async () => {
      await rockPaperScissorsInstance.createGame(alice, RPS.Scissors, false, {
        from: bob,
      });

      await timeout(6000);

      let result = await rockPaperScissorsInstance.finishGame(bob, {
        from: alice,
      });

      assert.equal(
        result['logs'][0]['args']['message'],
        'You lost, better luck next time'
      );
    });

    it('Draw', async () => {
      await rockPaperScissorsInstance.createGame(alice, RPS.Paper, false, {
        from: bob,
      });

      await timeout(6000);

      let result = await rockPaperScissorsInstance.finishGame(bob, {
        from: alice,
      });

      assert.equal(
        result['logs'][0]['args']['message'],
        'Draw!, the bets were returned to the earnings of both players'
      );
    });
  });
});
