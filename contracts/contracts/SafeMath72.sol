// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

library SafeMath72 {
    function add(uint72 a, uint72 b) internal pure returns (uint72) {
        uint72 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function sub(uint72 a, uint72 b) internal pure returns (uint72) {
        require(b <= a, "SafeMath: subtraction overflow");
        uint72 c = a - b;

        return c;
    }

    function mul(uint72 a, uint72 b) internal pure returns (uint72) {
        if (a == 0) {
            return 0;
        }

        uint72 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    function div(uint72 a, uint72 b) internal pure returns (uint72) {
        require(b > 0, "SafeMath: division by zero");
        uint72 c = a / b;

        return c;
    }

    function mod(uint72 a, uint72 b) internal pure returns (uint72) {
        require(b != 0, "SafeMath: modulo by zero");
        return a % b;
    }
}
