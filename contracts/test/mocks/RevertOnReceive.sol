// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @notice Recipient that reverts on ETH receive, used to prove pull isolation.
contract RevertOnReceive {
    receive() external payable {
        revert();
    }
}
