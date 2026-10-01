// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test } from "forge-std/Test.sol";
import { Donate } from "../../src/Donate.sol";

/// @notice Bounded handler for Donate invariant tests. Unexpected reverts fail the campaign.
contract DonateHandler is Test {
    Donate public donate;

    address public owner;
    address[] public actors;

    address internal currentActor;

    uint256 public ghost_donated;
    uint256 public ghost_withdrawn;
    uint256 public ghost_donateCalls;
    uint256 public ghost_claimCalls;
    uint256 public ghost_settleArtistCalls;
    uint256 public ghost_settleFeeCalls;
    uint256 public ghost_withdrawCalls;

    string[3] internal artistIds;

    modifier useActor(uint256 actorSeed) {
        currentActor = actors[bound(actorSeed, 0, actors.length - 1)];
        vm.startPrank(currentActor);
        _;
        vm.stopPrank();
    }

    constructor(Donate donate_, address owner_, address[] memory actors_) {
        donate = donate_;
        owner = owner_;
        actors = actors_;
        artistIds[0] = "4Z8W4fKeB5YxbusRsdQVPb";
        artistIds[1] = "6nS5roXSAGhTGr34W6n7Et";
        artistIds[2] = "1Xyo4u8uXC1ZmMpatJ1ovw";
    }

    function donateToArtist(uint256 amount, uint256 artistSeed, uint256 actorSeed) external useActor(actorSeed) {
        amount = bound(amount, 1, 10 ether);
        string memory artistId = artistIds[bound(artistSeed, 0, artistIds.length - 1)];
        vm.deal(currentActor, amount);
        donate.donateToArtist{ value: amount }(artistId);
        ghost_donated += amount;
        ++ghost_donateCalls;
    }

    function claimArtist(uint256 artistSeed, uint256 actorSeed) external useActor(actorSeed) {
        string memory artistId = artistIds[bound(artistSeed, 0, artistIds.length - 1)];
        if (donate.getArtistClaimant(artistId) != address(0)) {
            return;
        }
        donate.claimArtist(artistId);
        ++ghost_claimCalls;
    }

    function settleDonations(uint256 artistSeed, uint256 actorSeed) external useActor(actorSeed) {
        string memory artistId = artistIds[bound(artistSeed, 0, artistIds.length - 1)];
        address claimant = donate.getArtistClaimant(artistId);
        if (claimant != currentActor) {
            return;
        }
        (uint256 artistBalance,) = donate.getArtistInfo(artistId);
        if (artistBalance == 0) {
            return;
        }
        donate.settleDonations(artistId);
        ++ghost_settleArtistCalls;
    }

    function settlePlatformFees() external {
        if (donate.getPlatformFeeBalance() == 0) {
            return;
        }
        vm.prank(owner);
        donate.settlePlatformFees();
        ++ghost_settleFeeCalls;
    }

    function withdraw(uint256 actorSeed, uint256 recipientSeed) external useActor(actorSeed) {
        uint256 pending = donate.pendingWithdrawals(currentActor);
        if (pending == 0) {
            return;
        }
        address recipient = actors[bound(recipientSeed, 0, actors.length - 1)];
        uint256 recipientBefore = recipient.balance;
        donate.withdraw(recipient);
        assertEq(recipient.balance, recipientBefore + pending);
        ghost_withdrawn += pending;
        ++ghost_withdrawCalls;
    }
}
