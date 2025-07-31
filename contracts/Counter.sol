// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract Counter {
    uint256 public value = 0;

    function increment(uint256 num) external {
        value += num;
    }
}
