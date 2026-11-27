// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Donate } from "../../src/Donate.sol";

/// @notice Reenters `withdraw` from `receive` to test `nonReentrant`.
contract ReenterWithdraw {
    Donate public donate;
    bool internal entered;

    constructor(Donate donate_) {
        donate = donate_;
    }

    function settle(string calldata artistId) external {
        donate.settleDonations(artistId);
    }

    function attack() external {
        donate.withdraw(address(this));
    }

    receive() external payable {
        if (!entered) {
            entered = true;
            donate.withdraw(address(this));
        }
    }
}
