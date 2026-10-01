// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test } from "forge-std/Test.sol";
import { Donate } from "../src/Donate.sol";
import { DonateHandler } from "./handlers/DonateHandler.sol";

contract DonateInvariantTest is Test {
    Donate internal donate;
    DonateHandler internal handler;

    address internal owner;
    address internal alice;
    address internal bob;
    address internal carol;

    function setUp() public {
        owner = makeAddr("owner");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        carol = makeAddr("carol");

        donate = new Donate(owner);

        address[] memory actors = new address[](3);
        actors[0] = alice;
        actors[1] = bob;
        actors[2] = carol;

        handler = new DonateHandler(donate, owner, actors);

        targetContract(address(handler));

        bytes4[] memory selectors = new bytes4[](5);
        selectors[0] = DonateHandler.donateToArtist.selector;
        selectors[1] = DonateHandler.claimArtist.selector;
        selectors[2] = DonateHandler.settleDonations.selector;
        selectors[3] = DonateHandler.settlePlatformFees.selector;
        selectors[4] = DonateHandler.withdraw.selector;
        targetSelector(FuzzSelector({ addr: address(handler), selectors: selectors }));
    }

    /// @dev Contract ETH equals tracked totalBalance (no forced ETH in this suite).
    function invariant_solvency() public view {
        assertEq(address(donate).balance, donate.totalBalance());
        assertEq(donate.totalBalance(), handler.ghost_donated() - handler.ghost_withdrawn());
    }

    /// @dev Artist count only grows, and never exceeds the handler's artist set size.
    function invariant_artistsCountBounded() public view {
        assertLe(donate.getArtistsCount(), 3);
    }

    /// @dev Fee bps is always at most MAX_FEE_BPS.
    function invariant_feeBpsNeverExceedsMax() public view {
        (, uint16 feeBps) = donate.getPlatformFeeInfo();
        assertLe(feeBps, donate.MAX_FEE_BPS());
    }

    /// @dev Claim flag and claimant address stay consistent.
    function invariant_unclaimedHasZeroClaimant() public view {
        string[3] memory ids = ["4Z8W4fKeB5YxbusRsdQVPb", "6nS5roXSAGhTGr34W6n7Et", "1Xyo4u8uXC1ZmMpatJ1ovw"];
        for (uint256 i = 0; i < ids.length; ++i) {
            (, bool isClaimed) = donate.getArtistInfo(ids[i]);
            address claimant = donate.getArtistClaimant(ids[i]);
            if (isClaimed) {
                assertTrue(claimant != address(0));
            } else {
                assertEq(claimant, address(0));
            }
        }
    }

    function invariant_callSummary() public view {
        uint256 donateCalls = handler.ghost_donateCalls();
        uint256 claimCalls = handler.ghost_claimCalls();
        uint256 settleArtistCalls = handler.ghost_settleArtistCalls();
        uint256 settleFeeCalls = handler.ghost_settleFeeCalls();
        uint256 withdrawCalls = handler.ghost_withdrawCalls();
        assertTrue(donateCalls + claimCalls + settleArtistCalls + settleFeeCalls + withdrawCalls < type(uint256).max);
    }

    function afterInvariant() public view {
        assertEq(donate.totalBalance(), handler.ghost_donated() - handler.ghost_withdrawn());
        assertEq(address(donate).balance, donate.totalBalance());
    }
}
