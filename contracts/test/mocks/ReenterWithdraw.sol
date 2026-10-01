// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Donate } from "../../src/Donate.sol";

/// @notice Reenters `withdraw` from `receive` to test `nonReentrant`.
contract ReenterWithdraw {
    Donate public donate;
    bool internal entered;

    constructor(Donate donate_) {
        donate = donate_;
    }

    function claimAndSettle(string calldata artistId) external {
        donate.claimArtist(artistId);
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
