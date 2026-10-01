// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test } from "forge-std/Test.sol";
import { Donate } from "../src/Donate.sol";

contract DonateFuzzTest is Test {
    Donate internal donate;

    address internal owner;
    address internal alice;

    string internal constant ARTIST_A = "4Z8W4fKeB5YxbusRsdQVPb";

    function setUp() public {
        owner = makeAddr("owner");
        alice = makeAddr("alice");
        vm.label(owner, "owner");
        vm.label(alice, "alice");
        donate = new Donate(owner);
        vm.deal(alice, type(uint128).max);
    }

    /// forge-config: default.fuzz.runs = 1024
    function testFuzz_donateToArtist_anyAmount_totalBalanceIncreases(uint256 amount) public {
        amount = bound(amount, 1, type(uint128).max);
        uint256 totalBefore = donate.totalBalance();

        vm.prank(alice);
        donate.donateToArtist{ value: amount }(ARTIST_A);

        assertEq(donate.totalBalance(), totalBefore + amount);
        assertEq(address(donate).balance, donate.totalBalance());
    }

    /// forge-config: default.fuzz.runs = 1024
    function testFuzz_donateToArtist_anyAmount_feesSumToDonation(uint256 amount) public {
        amount = bound(amount, 1, type(uint128).max);

        vm.prank(alice);
        donate.donateToArtist{ value: amount }(ARTIST_A);

        (uint256 artistBalance,) = donate.getArtistInfo(ARTIST_A);
        uint256 platformFee = donate.getPlatformFeeBalance();
        assertEq(artistBalance + platformFee, amount);
        assertGe(platformFee, (amount * uint256(donate.DEFAULT_PLATFORM_FEE_BPS())) / donate.BPS_DENOMINATOR());
        assertLe(
            artistBalance,
            (amount * (donate.BPS_DENOMINATOR() - donate.DEFAULT_PLATFORM_FEE_BPS())) / donate.BPS_DENOMINATOR()
        );
    }

    function testFuzz_donateToArtist_zeroValue_revertsZeroAmount(uint256 seed) public {
        vm.prank(alice);
        vm.expectRevert(Donate.ZeroAmount.selector);
        donate.donateToArtist{ value: 0 }(_artistId(seed));
    }

    function _artistId(uint256 seed) internal pure returns (string memory) {
        bytes memory alphabet = "abcdefghijklmnopqrstuvwxyz";
        bytes memory raw = new bytes(22);
        for (uint256 i = 0; i < 22; ++i) {
            raw[i] = alphabet[(seed % 26 + i) % 26];
        }
        return string(raw);
    }

    function testFuzz_donateToArtist_tooLongArtistId_reverts(uint256 extraLen) public {
        extraLen = bound(extraLen, 1, 64);
        bytes memory raw = new bytes(donate.MAX_ARTIST_ID_LENGTH() + extraLen);
        for (uint256 i = 0; i < raw.length; ++i) {
            raw[i] = "a";
        }

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(Donate.ArtistIdTooLong.selector, raw.length, donate.MAX_ARTIST_ID_LENGTH())
        );
        donate.donateToArtist{ value: 1 ether }(string(raw));
    }

    function testFuzz_withdraw_pendingAmount_sendsExactAmount(uint256 amount) public {
        amount = bound(amount, 1, type(uint128).max);

        vm.prank(alice);
        donate.donateToArtist{ value: amount }(ARTIST_A);

        vm.prank(alice);
        donate.claimArtist(ARTIST_A);

        (uint256 artistBalance,) = donate.getArtistInfo(ARTIST_A);
        if (artistBalance == 0) {
            return;
        }

        vm.prank(alice);
        donate.settleDonations(ARTIST_A);

        uint256 pending = donate.pendingWithdrawals(alice);
        assertEq(pending, artistBalance);

        uint256 aliceBefore = alice.balance;
        vm.prank(alice);
        donate.withdraw(alice);

        assertEq(alice.balance, aliceBefore + pending);
        assertEq(donate.pendingWithdrawals(alice), 0);
        assertEq(donate.totalBalance(), amount - pending);
    }

    function testFuzz_claimArtist_firstCaller_isSoleClaimant(address first, address second) public {
        vm.assume(first != address(0));
        vm.assume(second != address(0));
        vm.assume(first != second);

        vm.prank(first);
        donate.claimArtist(ARTIST_A);
        assertEq(donate.getArtistClaimant(ARTIST_A), first);

        vm.prank(second);
        vm.expectRevert(Donate.ArtistAlreadyClaimed.selector);
        donate.claimArtist(ARTIST_A);
    }

    function testFuzz_setPlatformFeeInfo_validBps_updates(uint16 feeBps, address recipient) public {
        vm.assume(recipient != address(0));
        feeBps = uint16(bound(feeBps, 0, donate.MAX_FEE_BPS()));

        vm.prank(owner);
        donate.setPlatformFeeInfo(recipient, feeBps);

        (address storedRecipient, uint16 storedBps) = donate.getPlatformFeeInfo();
        assertEq(storedRecipient, recipient);
        assertEq(storedBps, feeBps);
    }
}
