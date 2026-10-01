// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test } from "forge-std/Test.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Donate } from "../src/Donate.sol";
import { ReenterWithdraw } from "./mocks/ReenterWithdraw.sol";
import { RevertOnReceive } from "./mocks/RevertOnReceive.sol";

contract DonateTest is Test {
    Donate internal donate;

    address internal owner;
    address internal alice;
    address internal bob;
    address internal attacker;

    string internal constant ARTIST_A = "4Z8W4fKeB5YxbusRsdQVPb";
    string internal constant ARTIST_B = "6nS5roXSAGhTGr34W6n7Et";

    event DonationMade(
        address indexed donor, string indexed artistId, uint256 donatedAmount, uint256 artistFee, uint256 platformFee
    );

    event ArtistClaimed(string indexed artistId, address indexed claimant);

    event DonationsSettled(string indexed artistId, address indexed claimant, uint256 amount);

    event PlatformFeesSettled(address indexed owner, uint256 amount);

    event Withdrawn(address indexed account, address indexed recipient, uint256 amount);

    event PlatformFeeInfoUpdated(
        address indexed oldRecipient, address indexed newRecipient, uint16 oldFeeBps, uint16 newFeeBps
    );

    function setUp() public {
        owner = makeAddr("owner");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        attacker = makeAddr("attacker");

        vm.label(owner, "owner");
        vm.label(alice, "alice");
        vm.label(bob, "bob");
        vm.label(attacker, "attacker");

        donate = new Donate(owner);
        vm.label(address(donate), "donate");

        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(attacker, 100 ether);
        vm.deal(owner, 1 ether);
    }

    function _donate(address from, string memory artistId, uint256 amount) internal {
        vm.prank(from);
        donate.donateToArtist{ value: amount }(artistId);
    }

    function _claimAs(address claimant, string memory artistId) internal {
        vm.prank(claimant);
        donate.claimArtist(artistId);
    }

    function _settleAs(address claimant, string memory artistId) internal {
        vm.prank(claimant);
        donate.settleDonations(artistId);
    }

    function _expectedArtistFee(uint256 amount, uint16 feeBps) internal pure returns (uint256) {
        return (amount * (10_000 - uint256(feeBps))) / 10_000;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    function test_constructor_validOwner_setsOwnerAndFeeInfo() public view {
        assertEq(donate.owner(), owner);
        (address recipient, uint16 feeBps) = donate.getPlatformFeeInfo();
        assertEq(recipient, owner);
        assertEq(feeBps, donate.DEFAULT_PLATFORM_FEE_BPS());
        assertEq(donate.totalBalance(), 0);
        assertEq(donate.getPlatformFeeBalance(), 0);
        assertEq(donate.getArtistsCount(), 0);
    }

    function test_constructor_zeroOwner_revertsOwnableInvalidOwner() public {
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableInvalidOwner.selector, address(0)));
        new Donate(address(0));
    }

    function test_constructor_doesNotAssignOwnerFromMsgSender() public {
        address designated = makeAddr("designatedOwner");
        Donate other = new Donate(designated);
        assertEq(other.owner(), designated);
        assertTrue(other.owner() != address(this));
    }

    // -------------------------------------------------------------------------
    // donateToArtist
    // -------------------------------------------------------------------------

    function test_donateToArtist_normalAmount_creditsArtistAndPlatformFee() public {
        uint256 amount = 1 ether;
        uint256 artistFee = _expectedArtistFee(amount, 100);
        uint256 platformFee = amount - artistFee;

        _donate(alice, ARTIST_A, amount);

        (uint256 artistBalance, bool isClaimed) = donate.getArtistInfo(ARTIST_A);
        assertEq(artistBalance, artistFee);
        assertFalse(isClaimed);
        assertEq(donate.getPlatformFeeBalance(), platformFee);
        assertEq(donate.totalBalance(), amount);
        assertEq(address(donate).balance, amount);
        assertEq(donate.getArtistsCount(), 1);
    }

    function test_donateToArtist_normalAmount_emitsDonationMade() public {
        uint256 amount = 1 ether;
        uint256 artistFee = _expectedArtistFee(amount, 100);
        uint256 platformFee = amount - artistFee;

        vm.expectEmit(true, true, false, true, address(donate));
        emit DonationMade(alice, ARTIST_A, amount, artistFee, platformFee);

        _donate(alice, ARTIST_A, amount);
    }

    function test_donateToArtist_zeroValue_revertsZeroAmount() public {
        vm.prank(alice);
        vm.expectRevert(Donate.ZeroAmount.selector);
        donate.donateToArtist{ value: 0 }(ARTIST_A);
    }

    function test_donateToArtist_emptyArtistId_revertsEmptyArtistId() public {
        vm.prank(alice);
        vm.expectRevert(Donate.EmptyArtistId.selector);
        donate.donateToArtist{ value: 1 ether }("");
    }

    function test_donateToArtist_tooLongArtistId_revertsArtistIdTooLong() public {
        string memory tooLong = "aaaaaaaaaaaaaaaaaaaaaaa";
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                Donate.ArtistIdTooLong.selector, bytes(tooLong).length, donate.MAX_ARTIST_ID_LENGTH()
            )
        );
        donate.donateToArtist{ value: 1 ether }(tooLong);
    }

    function test_donateToArtist_maxLengthArtistId_succeeds() public {
        _donate(alice, ARTIST_A, 1 ether);
        (uint256 artistBalance,) = donate.getArtistInfo(ARTIST_A);
        assertGt(artistBalance, 0);
    }

    function test_donateToArtist_firstDonation_incrementsArtistsCount() public {
        assertEq(donate.getArtistsCount(), 0);
        _donate(alice, ARTIST_A, 1 ether);
        assertEq(donate.getArtistsCount(), 1);
    }

    function test_donateToArtist_repeatDonation_doesNotIncrementArtistsCount() public {
        _donate(alice, ARTIST_A, 1 ether);
        _donate(bob, ARTIST_A, 2 ether);
        assertEq(donate.getArtistsCount(), 1);

        (uint256 artistBalance,) = donate.getArtistInfo(ARTIST_A);
        uint256 expected = _expectedArtistFee(1 ether, 100) + _expectedArtistFee(2 ether, 100);
        assertEq(artistBalance, expected);
        assertEq(donate.totalBalance(), 3 ether);
    }

    function test_donateToArtist_secondArtist_incrementsArtistsCount() public {
        _donate(alice, ARTIST_A, 1 ether);
        _donate(alice, ARTIST_B, 1 ether);
        assertEq(donate.getArtistsCount(), 2);
    }

    function test_donateToArtist_afterSettle_doesNotIncrementArtistsCount() public {
        _donate(alice, ARTIST_A, 1 ether);
        _claimAs(bob, ARTIST_A);
        _settleAs(bob, ARTIST_A);
        _donate(alice, ARTIST_A, 1 ether);
        assertEq(donate.getArtistsCount(), 1);
    }

    function test_donateToArtist_oneWei_roundsFeeInFavorOfProtocol() public {
        _donate(alice, ARTIST_A, 1);
        (uint256 artistBalance,) = donate.getArtistInfo(ARTIST_A);
        assertEq(artistBalance, 0);
        assertEq(donate.getPlatformFeeBalance(), 1);
        assertEq(donate.totalBalance(), 1);
    }

    function test_donateToArtist_multipleDonors_accumulateTotalBalance() public {
        _donate(alice, ARTIST_A, 1 ether);
        _donate(bob, ARTIST_B, 2 ether);
        assertEq(donate.totalBalance(), 3 ether);
        assertEq(address(donate).balance, 3 ether);
    }

    // -------------------------------------------------------------------------
    // claimArtist
    // -------------------------------------------------------------------------

    function test_claimArtist_unclaimed_setsClaimantToCaller() public {
        _donate(alice, ARTIST_A, 1 ether);
        _claimAs(bob, ARTIST_A);

        (, bool isClaimed) = donate.getArtistInfo(ARTIST_A);
        assertTrue(isClaimed);
        assertEq(donate.getArtistClaimant(ARTIST_A), bob);
    }

    function test_claimArtist_unclaimed_emitsArtistClaimed() public {
        vm.expectEmit(true, true, false, true, address(donate));
        emit ArtistClaimed(ARTIST_A, bob);
        _claimAs(bob, ARTIST_A);
    }

    function test_claimArtist_beforeDonation_succeeds() public {
        _claimAs(alice, ARTIST_A);
        assertEq(donate.getArtistClaimant(ARTIST_A), alice);
        assertEq(donate.getArtistsCount(), 0);
    }

    function test_claimArtist_alreadyClaimed_revertsArtistAlreadyClaimed() public {
        _claimAs(alice, ARTIST_A);
        vm.prank(attacker);
        vm.expectRevert(Donate.ArtistAlreadyClaimed.selector);
        donate.claimArtist(ARTIST_A);
    }

    function test_claimArtist_emptyArtistId_revertsEmptyArtistId() public {
        vm.prank(alice);
        vm.expectRevert(Donate.EmptyArtistId.selector);
        donate.claimArtist("");
    }

    function test_claimArtist_tooLongArtistId_revertsArtistIdTooLong() public {
        string memory tooLong = "aaaaaaaaaaaaaaaaaaaaaaa";
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                Donate.ArtistIdTooLong.selector, bytes(tooLong).length, donate.MAX_ARTIST_ID_LENGTH()
            )
        );
        donate.claimArtist(tooLong);
    }

    // -------------------------------------------------------------------------
    // settleDonations
    // -------------------------------------------------------------------------

    function test_settleDonations_claimant_creditsPendingAndZerosArtistBalance() public {
        uint256 amount = 1 ether;
        uint256 artistFee = _expectedArtistFee(amount, 100);
        _donate(alice, ARTIST_A, amount);
        _claimAs(bob, ARTIST_A);
        _settleAs(bob, ARTIST_A);

        (uint256 artistBalance,) = donate.getArtistInfo(ARTIST_A);
        assertEq(artistBalance, 0);
        assertEq(donate.pendingWithdrawals(bob), artistFee);
        assertEq(donate.totalBalance(), amount);
        assertEq(donate.getPlatformFeeBalance(), amount - artistFee);
    }

    function test_settleDonations_claimant_emitsDonationsSettled() public {
        uint256 amount = 1 ether;
        uint256 artistFee = _expectedArtistFee(amount, 100);
        _donate(alice, ARTIST_A, amount);
        _claimAs(bob, ARTIST_A);

        vm.expectEmit(true, true, false, true, address(donate));
        emit DonationsSettled(ARTIST_A, bob, artistFee);
        _settleAs(bob, ARTIST_A);
    }

    function test_settleDonations_notClaimant_revertsNotArtistClaimant() public {
        _donate(alice, ARTIST_A, 1 ether);
        _claimAs(bob, ARTIST_A);

        vm.prank(attacker);
        vm.expectRevert(abi.encodeWithSelector(Donate.NotArtistClaimant.selector, attacker, bob));
        donate.settleDonations(ARTIST_A);
    }

    function test_settleDonations_unclaimed_revertsArtistNotClaimed() public {
        _donate(alice, ARTIST_A, 1 ether);
        vm.prank(alice);
        vm.expectRevert(Donate.ArtistNotClaimed.selector);
        donate.settleDonations(ARTIST_A);
    }

    function test_settleDonations_zeroBalance_revertsZeroAmount() public {
        _claimAs(bob, ARTIST_A);
        vm.prank(bob);
        vm.expectRevert(Donate.ZeroAmount.selector);
        donate.settleDonations(ARTIST_A);
    }

    function test_settleDonations_emptyArtistId_revertsEmptyArtistId() public {
        vm.prank(bob);
        vm.expectRevert(Donate.EmptyArtistId.selector);
        donate.settleDonations("");
    }

    function test_settleDonations_afterSettle_allowsNewDonationsToAccumulate() public {
        _donate(alice, ARTIST_A, 1 ether);
        _claimAs(bob, ARTIST_A);
        _settleAs(bob, ARTIST_A);

        _donate(alice, ARTIST_A, 2 ether);
        (uint256 artistBalance,) = donate.getArtistInfo(ARTIST_A);
        assertEq(artistBalance, _expectedArtistFee(2 ether, 100));
    }

    // -------------------------------------------------------------------------
    // settlePlatformFees
    // -------------------------------------------------------------------------

    function test_settlePlatformFees_owner_creditsPending() public {
        uint256 amount = 1 ether;
        uint256 platformFee = amount - _expectedArtistFee(amount, 100);
        _donate(alice, ARTIST_A, amount);

        vm.prank(owner);
        donate.settlePlatformFees();

        assertEq(donate.getPlatformFeeBalance(), 0);
        assertEq(donate.pendingWithdrawals(owner), platformFee);
        assertEq(donate.totalBalance(), amount);
    }

    function test_settlePlatformFees_owner_emitsPlatformFeesSettled() public {
        uint256 amount = 1 ether;
        uint256 platformFee = amount - _expectedArtistFee(amount, 100);
        _donate(alice, ARTIST_A, amount);

        vm.expectEmit(true, false, false, true, address(donate));
        emit PlatformFeesSettled(owner, platformFee);
        vm.prank(owner);
        donate.settlePlatformFees();
    }

    function test_settlePlatformFees_callerNotOwner_reverts() public {
        _donate(alice, ARTIST_A, 1 ether);
        vm.prank(attacker);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, attacker));
        donate.settlePlatformFees();
    }

    function test_settlePlatformFees_zeroBalance_revertsZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert(Donate.ZeroAmount.selector);
        donate.settlePlatformFees();
    }

    // -------------------------------------------------------------------------
    // withdraw
    // -------------------------------------------------------------------------

    function test_withdraw_withPending_sendsEthAndZerosPending() public {
        uint256 amount = 1 ether;
        uint256 artistFee = _expectedArtistFee(amount, 100);
        _donate(alice, ARTIST_A, amount);
        _claimAs(bob, ARTIST_A);
        _settleAs(bob, ARTIST_A);

        uint256 bobBefore = bob.balance;
        vm.prank(bob);
        donate.withdraw(bob);

        assertEq(donate.pendingWithdrawals(bob), 0);
        assertEq(bob.balance, bobBefore + artistFee);
        assertEq(donate.totalBalance(), amount - artistFee);
        assertEq(address(donate).balance, amount - artistFee);
    }

    function test_withdraw_withPending_emitsWithdrawn() public {
        uint256 amount = 1 ether;
        uint256 artistFee = _expectedArtistFee(amount, 100);
        _donate(alice, ARTIST_A, amount);
        _claimAs(bob, ARTIST_A);
        _settleAs(bob, ARTIST_A);

        vm.expectEmit(true, true, false, true, address(donate));
        emit Withdrawn(bob, bob, artistFee);
        vm.prank(bob);
        donate.withdraw(bob);
    }

    function test_withdraw_toDifferentRecipient_sendsToRecipient() public {
        uint256 amount = 1 ether;
        uint256 artistFee = _expectedArtistFee(amount, 100);
        _donate(alice, ARTIST_A, amount);
        _claimAs(bob, ARTIST_A);
        _settleAs(bob, ARTIST_A);

        uint256 aliceBefore = alice.balance;
        vm.prank(bob);
        donate.withdraw(alice);
        assertEq(alice.balance, aliceBefore + artistFee);
        assertEq(bob.balance, 100 ether);
    }

    function test_withdraw_zeroPending_revertsZeroAmount() public {
        vm.prank(alice);
        vm.expectRevert(Donate.ZeroAmount.selector);
        donate.withdraw(alice);
    }

    function test_withdraw_zeroRecipient_revertsZeroAddress() public {
        _donate(alice, ARTIST_A, 1 ether);
        _claimAs(bob, ARTIST_A);
        _settleAs(bob, ARTIST_A);

        vm.prank(bob);
        vm.expectRevert(Donate.ZeroAddress.selector);
        donate.withdraw(address(0));
    }

    function test_withdraw_reentrancy_reverts() public {
        ReenterWithdraw attackerContract = new ReenterWithdraw(donate);
        vm.deal(address(attackerContract), 0);

        _donate(alice, ARTIST_A, 1 ether);
        attackerContract.claimAndSettle(ARTIST_A);

        vm.expectRevert(Donate.TransferFailed.selector);
        attackerContract.attack();

        assertGt(donate.pendingWithdrawals(address(attackerContract)), 0);
    }

    function test_withdraw_revertingRecipient_doesNotBrickOtherUsers() public {
        RevertOnReceive badSink = new RevertOnReceive();

        _donate(alice, ARTIST_A, 1 ether);
        _donate(alice, ARTIST_B, 1 ether);

        _claimAs(bob, ARTIST_A);
        _claimAs(attacker, ARTIST_B);
        _settleAs(bob, ARTIST_A);
        _settleAs(attacker, ARTIST_B);

        vm.prank(attacker);
        vm.expectRevert(Donate.TransferFailed.selector);
        donate.withdraw(address(badSink));

        assertGt(donate.pendingWithdrawals(attacker), 0);

        uint256 bobBefore = bob.balance;
        uint256 bobPending = donate.pendingWithdrawals(bob);
        vm.prank(bob);
        donate.withdraw(bob);
        assertEq(bob.balance, bobBefore + bobPending);
        assertEq(donate.pendingWithdrawals(bob), 0);
    }

    function test_withdraw_toDonateContract_revertsTransferFailed() public {
        _donate(alice, ARTIST_A, 1 ether);
        _claimAs(bob, ARTIST_A);
        _settleAs(bob, ARTIST_A);

        vm.prank(bob);
        vm.expectRevert(Donate.TransferFailed.selector);
        donate.withdraw(address(donate));
        assertGt(donate.pendingWithdrawals(bob), 0);
    }

    // -------------------------------------------------------------------------
    // setPlatformFeeInfo
    // -------------------------------------------------------------------------

    function test_setPlatformFeeInfo_owner_updatesRecipientAndBps() public {
        address newRecipient = makeAddr("feeRecipient");
        vm.prank(owner);
        donate.setPlatformFeeInfo(newRecipient, 250);

        (address recipient, uint16 feeBps) = donate.getPlatformFeeInfo();
        assertEq(recipient, newRecipient);
        assertEq(feeBps, 250);
    }

    function test_setPlatformFeeInfo_owner_emitsPlatformFeeInfoUpdated() public {
        address newRecipient = makeAddr("feeRecipient");
        vm.expectEmit(true, true, false, true, address(donate));
        emit PlatformFeeInfoUpdated(owner, newRecipient, 100, 250);
        vm.prank(owner);
        donate.setPlatformFeeInfo(newRecipient, 250);
    }

    function test_setPlatformFeeInfo_callerNotOwner_reverts() public {
        vm.prank(attacker);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, attacker));
        donate.setPlatformFeeInfo(attacker, 100);
    }

    function test_setPlatformFeeInfo_zeroRecipient_revertsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(Donate.ZeroAddress.selector);
        donate.setPlatformFeeInfo(address(0), 100);
    }

    function test_setPlatformFeeInfo_feeBpsOverMax_revertsFeeBpsTooHigh() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(Donate.FeeBpsTooHigh.selector, 10_000, 10_001));
        donate.setPlatformFeeInfo(owner, 10_001);
    }

    function test_setPlatformFeeInfo_maxBps_succeeds() public {
        vm.prank(owner);
        donate.setPlatformFeeInfo(owner, 10_000);
        (, uint16 feeBps) = donate.getPlatformFeeInfo();
        assertEq(feeBps, 10_000);

        _donate(alice, ARTIST_A, 1 ether);
        (uint256 artistBalance,) = donate.getArtistInfo(ARTIST_A);
        assertEq(artistBalance, 0);
        assertEq(donate.getPlatformFeeBalance(), 1 ether);
    }

    function test_setPlatformFeeInfo_zeroBps_creditsArtistInFull() public {
        vm.prank(owner);
        donate.setPlatformFeeInfo(owner, 0);
        _donate(alice, ARTIST_A, 1 ether);
        (uint256 artistBalance,) = donate.getArtistInfo(ARTIST_A);
        assertEq(artistBalance, 1 ether);
        assertEq(donate.getPlatformFeeBalance(), 0);
    }

    // -------------------------------------------------------------------------
    // Ownable2Step
    // -------------------------------------------------------------------------

    function test_transferOwnership_callerNotOwner_reverts() public {
        vm.prank(attacker);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, attacker));
        donate.transferOwnership(attacker);
    }

    function test_transferOwnership_setsPendingOwner() public {
        vm.prank(owner);
        donate.transferOwnership(alice);
        assertEq(donate.pendingOwner(), alice);
        assertEq(donate.owner(), owner);
    }

    function test_acceptOwnership_pendingOwner_transfersOwner() public {
        vm.prank(owner);
        donate.transferOwnership(alice);
        vm.prank(alice);
        donate.acceptOwnership();
        assertEq(donate.owner(), alice);
    }

    function test_acceptOwnership_notPending_reverts() public {
        vm.prank(owner);
        donate.transferOwnership(alice);
        vm.prank(attacker);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, attacker));
        donate.acceptOwnership();
    }

    // -------------------------------------------------------------------------
    // Views on empty state
    // -------------------------------------------------------------------------

    function test_getArtistInfo_unknownArtist_returnsZero() public view {
        (uint256 artistBalance, bool isClaimed) = donate.getArtistInfo(ARTIST_A);
        assertEq(artistBalance, 0);
        assertFalse(isClaimed);
    }

    function test_getArtistClaimant_unknownArtist_returnsZero() public view {
        assertEq(donate.getArtistClaimant(ARTIST_A), address(0));
    }

    function test_getArtistsCount_noDonations_returnsZero() public view {
        assertEq(donate.getArtistsCount(), 0);
    }

    function test_getPlatformFeeBalance_noDonations_returnsZero() public view {
        assertEq(donate.getPlatformFeeBalance(), 0);
    }

    function test_pendingWithdrawals_noSettle_returnsZero() public view {
        assertEq(donate.pendingWithdrawals(alice), 0);
    }

    // -------------------------------------------------------------------------
    // receive / fallback
    // -------------------------------------------------------------------------

    function test_receive_directEth_revertsDirectEtherNotAccepted() public {
        vm.deal(address(this), 1 ether);
        vm.expectRevert(Donate.DirectEtherNotAccepted.selector);
        this.forwardCall{ value: 1 ether }(address(donate), "");
    }

    function test_fallback_unknownSelector_revertsFallbackNotSupported() public {
        vm.expectRevert(Donate.FallbackNotSupported.selector);
        this.forwardCall(address(donate), hex"deadbeef");
    }

    function forwardCall(address to, bytes calldata data) external payable {
        (bool success, bytes memory result) = to.call{ value: msg.value }(data);
        if (!success) {
            assembly {
                revert(add(result, 0x20), mload(result))
            }
        }
    }

    // -------------------------------------------------------------------------
    // Table: fee rounding
    // -------------------------------------------------------------------------

    struct FeeCase {
        uint256 amount;
        uint16 feeBps;
        uint256 expectedArtistFee;
        uint256 expectedPlatformFee;
    }

    function fixtureFees() public pure returns (FeeCase[] memory entries) {
        entries = new FeeCase[](5);
        entries[0] = FeeCase(1 ether, 100, 0.99 ether, 0.01 ether);
        entries[1] = FeeCase(1, 100, 0, 1);
        entries[2] = FeeCase(99, 100, 98, 1);
        entries[3] = FeeCase(10_000, 100, 9900, 100);
        entries[4] = FeeCase(1 ether, 0, 1 ether, 0);
    }

    function tableFeeTest(FeeCase memory fees) public {
        vm.prank(owner);
        donate.setPlatformFeeInfo(owner, fees.feeBps);

        _donate(alice, ARTIST_A, fees.amount);

        (uint256 artistBalance,) = donate.getArtistInfo(ARTIST_A);
        assertEq(artistBalance, fees.expectedArtistFee);
        assertEq(donate.getPlatformFeeBalance(), fees.expectedPlatformFee);
        assertEq(artistBalance + donate.getPlatformFeeBalance(), fees.amount);
    }
}
