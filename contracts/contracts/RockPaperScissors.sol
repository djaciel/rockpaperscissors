// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
// Imported OZ helper contracts
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// Inherited allowing for ownership of contract
import "@openzeppelin/contracts/access/Ownable.sol";
// Safe math
import "./SafeMath72.sol";

contract RockPaperScissors is Ownable {
    // Libraries
    // Safe ERC20
    using SafeERC20 for IERC20;

    // Safe math
    using SafeMath72 for uint72;

    enum Move {
        None,
        Rock,
        Paper,
        Scissors
    }

    enum GameResult {
        Draw,
        Player1Win,
        Player2Win
    }

    struct Game {
        address opponent;
        Move move;
        uint32 deadline;
    }

    mapping(address => Game) games;
    mapping(address => uint72) userTokens;

    uint8 public deadline = 90;
    uint72 public betFee = 1 ether;
    address public tokenAddress;

    //Modifiers
    modifier notSamePlayer(address opponent) {
        require(opponent != msg.sender, "The opponent cannot be yourself");
        _;
    }

    //Events
    event GameCreated(address player1, address player2);
    event GameFinished(string message);
    event WithdrawalMade(string message);

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }

    //external Methods
    function createGame(
        address _opponent,
        Move _move,
        bool _useWinings
    ) external payable notSamePlayer(_opponent) {
        require(
            games[msg.sender].opponent == address(0) ||
                (games[msg.sender].opponent == _opponent &&
                    games[msg.sender].move == Move.None),
            "You already have an open game"
        );

        if (games[_opponent].opponent != address(0)) {
            require(
                games[_opponent].opponent == msg.sender,
                "The opponent has an open game with someone else"
            );
        }

        if (_useWinings) {
            require(
                userTokens[msg.sender] >= betFee,
                "You need to deposit the bet, you do not have enough winnings to participate"
            );
            userTokens[msg.sender] = userTokens[msg.sender].sub(betFee);
        } else {
            IERC20(tokenAddress).transferFrom(
                msg.sender,
                address(this),
                betFee
            );
        }

        games[msg.sender] = Game(
            _opponent,
            _move,
            uint32(block.timestamp + deadline)
        );

        if (games[_opponent].opponent == address(0)) {
            games[_opponent] = Game(
                msg.sender,
                Move.None,
                uint32(block.timestamp + deadline)
            );
        }

        emit GameCreated(msg.sender, _opponent);
    }

    function gameStatus(address _opponent)
        external
        view
        notSamePlayer(_opponent)
        returns (string memory message)
    {
        Game storage player1 = games[msg.sender];
        Game storage player2 = games[_opponent];

        if (player1.opponent == address(0) && player2.opponent == address(0)) {
            return "The game does not exist or is over";
        } else if (
            player1.opponent == _opponent &&
            (player2.opponent == address(0) && player2.move == Move.None)
        ) {
            return "The opponent has not yet made his move";
        } else if (
            (player1.opponent == address(0) && player1.move == Move.None) &&
            player2.opponent == msg.sender
        ) {
            return "You haven't made your move yet";
        } else if (
            player1.opponent == _opponent && player2.opponent == msg.sender
        ) {
            return
                "Both players have made their move, the game is ready to end";
        }
    }

    function finishGame(address _opponent) external notSamePlayer(_opponent) {
        Game storage player1 = games[msg.sender];
        Game storage player2 = games[_opponent];

        require(
            games[msg.sender].opponent != address(0),
            "You don't have an open game or your opponent has already finished the game"
        );

        require(
            block.timestamp > uint256(player1.deadline),
            "You can't finish the game yet"
        );

        if (player2.move == Move.None) {
            userTokens[msg.sender] = userTokens[msg.sender].add(betFee);

            delete games[msg.sender];
            delete games[_opponent];

            emit GameFinished(
                "The opponent didn't make his move, the amount of the bet was saved in your earnings"
            );
        } else {
            _gameLogic(msg.sender, _opponent);

            delete games[msg.sender];
            delete games[_opponent];
        }
    }

    function getBalance() external view returns (uint72 tokensBalance) {
        return userTokens[msg.sender];
    }

    function withdrawal() external {
        require(userTokens[msg.sender] != 0, "You have no funds to withdraw");

        IERC20(tokenAddress).transfer(msg.sender, userTokens[msg.sender]);
        userTokens[msg.sender] = 0;

        emit WithdrawalMade("Profits were sent to your address");
    }

    // Config Methods
    function setDeadline(uint8 _deadline) external onlyOwner {
        require(_deadline >= 30, "The deadline cannot be less than 30 sec");
        deadline = _deadline;
    }

    function setBetFee(uint72 _betFee) external onlyOwner {
        betFee = _betFee;
    }

    function destroySmartContract() external onlyOwner {
        selfdestruct(payable(msg.sender));
    }

    // Private Methods
    function _gameLogic(address _player1, address _player2) private {
        Game storage player1 = games[_player1];
        Game storage player2 = games[_player2];

        GameResult result;

        if (player1.move == player2.move) {
            result = GameResult.Draw;
        } else if (
            (player1.move == Move.Rock && player2.move == Move.Scissors) ||
            (player1.move == Move.Paper && player2.move == Move.Rock) ||
            (player1.move == Move.Scissors && player2.move == Move.Paper)
        ) {
            result = GameResult.Player1Win;
        } else {
            result = GameResult.Player2Win;
        }

        if (player1.move > player2.move) {
            userTokens[_player1] = userTokens[_player1].add(betFee.mul(2));
            emit GameFinished(
                "You won! Your reward was saved in your earnings"
            );
        } else if (player1.move < player2.move) {
            userTokens[_player2] = userTokens[_player2].add(betFee.mul(2));
            emit GameFinished("You lost, better luck next time");
        } else if (player1.move == player2.move) {
            userTokens[_player1] = userTokens[_player1].add(betFee);
            userTokens[_player2] = userTokens[_player2].add(betFee);

            emit GameFinished(
                "Draw!, the bets were returned to the earnings of both players"
            );
        }
    }
}
