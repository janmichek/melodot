// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Donate – Artist donation and tipping contract
/// @author Melodot
/// @notice Accepts ETH tips for artists identified by Spotify artist ID, accrues a
///         platform fee, and lets a claimant settle then withdraw via pull payments.
/// @dev Non-upgradeable. Uses OpenZeppelin Ownable2Step and ReentrancyGuard.
///      Identity verification (Spotify bio) is off-chain; the first address to call
///      `claimArtist` is bound as claimant and is the only address that can settle.
///      Direct ETH transfers are rejected. Forced ETH (e.g. `selfdestruct`) is not
///      credited to accounting; `address(this).balance` may exceed `totalBalance`.
contract Donate is Ownable2Step, ReentrancyGuard {
    // -------------------------------------------------------------------------
    // Type declarations
    // -------------------------------------------------------------------------

    /// @notice Per-artist donation state.
    /// @dev `exists` is set on the first donation so `artistsCount` is not incremented twice
    ///      after a settle zeros `balance`.
    struct ArtistData {
        uint256 balance;
        address claimant;
        bool exists;
    }

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    /// @notice Denominator for basis-point math (100% = 10_000).
    uint256 public constant BPS_DENOMINATOR = 10_000;

    /// @notice Maximum platform fee in basis points (100%).
    uint16 public constant MAX_FEE_BPS = 10_000;

    /// @notice Default platform fee in basis points (1%).
    uint16 public constant DEFAULT_PLATFORM_FEE_BPS = 100;

    /// @notice Maximum Spotify artist ID length in bytes.
    uint256 public constant MAX_ARTIST_ID_LENGTH = 22;

    // -------------------------------------------------------------------------
    // State Variables
    // -------------------------------------------------------------------------

    /// @notice Recipient of newly accrued platform fees (informational; settle credits pending).
    address private _platformFeeRecipient;

    /// @notice Platform fee in basis points, packed with `_platformFeeRecipient`.
    uint16 private _platformFeeBps;

    /// @notice Sum of artist balances, accrued platform fees, and pending withdrawals.
    uint256 public totalBalance;

    /// @notice Unsettled platform fees, in wei.
    uint256 private _platformFeeAccrued;

    /// @notice Number of unique artists that have received at least one donation.
    uint256 private _artistsCount;

    /// @notice Artist state keyed by Spotify artist ID.
    mapping(string => ArtistData) private _artists;

    /// @notice ETH credited by settle and waiting to be pulled by `withdraw`.
    mapping(address => uint256) public pendingWithdrawals;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    /// @notice Emitted when a donor tips an artist.
    /// @param donor Donor address.
    /// @param artistId Spotify artist ID (indexed as keccak256 of the string).
    /// @param donatedAmount Gross `msg.value`.
    /// @param artistFee Amount credited to the artist (remainder after protocol-favouring fee).
    /// @param platformFee Amount accrued as platform fee.
    event DonationMade(
        address indexed donor, string indexed artistId, uint256 donatedAmount, uint256 artistFee, uint256 platformFee
    );

    /// @notice Emitted when an artist ID is claimed.
    /// @param artistId Spotify artist ID.
    /// @param claimant Address bound as the artist claimant.
    event ArtistClaimed(string indexed artistId, address indexed claimant);

    /// @notice Emitted when an artist balance is moved to a pending withdrawal.
    /// @param artistId Spotify artist ID.
    /// @param claimant Claimant who settled.
    /// @param amount Amount credited to `pendingWithdrawals[claimant]`.
    event DonationsSettled(string indexed artistId, address indexed claimant, uint256 amount);

    /// @notice Emitted when platform fees are moved to a pending withdrawal.
    /// @param owner Owner who settled.
    /// @param amount Amount credited to `pendingWithdrawals[owner]`.
    event PlatformFeesSettled(address indexed owner, uint256 amount);

    /// @notice Emitted when pending ETH is pulled.
    /// @param account Owner of the pending balance.
    /// @param recipient Address that received the ETH.
    /// @param amount Amount sent.
    event Withdrawn(address indexed account, address indexed recipient, uint256 amount);

    /// @notice Emitted when platform fee configuration changes.
    /// @param oldRecipient Previous fee recipient.
    /// @param newRecipient New fee recipient.
    /// @param oldFeeBps Previous fee in basis points.
    /// @param newFeeBps New fee in basis points.
    event PlatformFeeInfoUpdated(
        address indexed oldRecipient, address indexed newRecipient, uint16 oldFeeBps, uint16 newFeeBps
    );

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    /// @notice Thrown when `msg.value` or a settled amount is zero.
    error ZeroAmount();

    /// @notice Thrown when an address parameter is the zero address.
    error ZeroAddress();

    /// @notice Thrown when `artistId` is empty.
    error EmptyArtistId();

    /// @notice Thrown when `artistId` exceeds `MAX_ARTIST_ID_LENGTH`.
    /// @param length Actual byte length.
    /// @param max Allowed maximum.
    error ArtistIdTooLong(uint256 length, uint256 max);

    /// @notice Thrown when `claimArtist` is called for an already-claimed ID.
    error ArtistAlreadyClaimed();

    /// @notice Thrown when settle is called before the artist ID is claimed.
    error ArtistNotClaimed();

    /// @notice Thrown when `msg.sender` is not the bound claimant.
    /// @param caller Caller address.
    /// @param claimant Bound claimant.
    error NotArtistClaimant(address caller, address claimant);

    /// @notice Thrown when platform fee bps exceeds `MAX_FEE_BPS`.
    /// @param max Maximum allowed bps.
    /// @param actual Requested bps.
    error FeeBpsTooHigh(uint256 max, uint256 actual);

    /// @notice Thrown when an ETH transfer returns `false`.
    error TransferFailed();

    /// @notice Thrown when ETH is sent directly to the contract.
    error DirectEtherNotAccepted();

    /// @notice Thrown when calldata does not match any function.
    error FallbackNotSupported();

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /// @notice Deploys Donate and sets the initial owner and 1% platform fee.
    /// @dev OpenZeppelin `Ownable` reverts with `OwnableInvalidOwner` if `owner_` is zero.
    ///      Does not assign ownership from `msg.sender`.
    /// @param owner_ Initial owner and platform-fee recipient.
    constructor(address owner_) Ownable(owner_) {
        _setPlatformFeeInfo(owner_, DEFAULT_PLATFORM_FEE_BPS);
    }

    // -------------------------------------------------------------------------
    // Receive / fallback
    // -------------------------------------------------------------------------

    /// @notice Rejects plain ETH transfers. Donate via `donateToArtist`.
    receive() external payable {
        revert DirectEtherNotAccepted();
    }

    /// @notice Rejects unknown selectors and ETH-with-data.
    fallback() external {
        revert FallbackNotSupported();
    }

    // -------------------------------------------------------------------------
    // External: payable
    // -------------------------------------------------------------------------

    /// @notice Tip an artist in ETH. A platform fee is accrued from `msg.value`.
    /// @dev Emits `DonationMade`. Reverts on zero value or invalid artist ID.
    ///      Fee math: artist share is `(amount * (BPS_DENOMINATOR - feeBps)) / BPS_DENOMINATOR`
    ///      (rounds down). Remainder goes to the platform (protocol-favouring).
    ///      Multiply then divide. First donation for an ID increments `artistsCount`.
    /// @param artistId Spotify artist ID (1–22 bytes).
    function donateToArtist(string calldata artistId) external payable {
        _validateArtistId(artistId);

        uint256 donatedAmount = msg.value;
        if (donatedAmount == 0) {
            revert ZeroAmount();
        }

        uint16 feeBps = _platformFeeBps;
        uint256 artistFee = (donatedAmount * (BPS_DENOMINATOR - uint256(feeBps))) / BPS_DENOMINATOR;
        uint256 platformFee = donatedAmount - artistFee;

        ArtistData storage artist = _artists[artistId];
        if (!artist.exists) {
            artist.exists = true;
            ++_artistsCount;
        }

        artist.balance += artistFee;
        _platformFeeAccrued += platformFee;
        totalBalance += donatedAmount;

        emit DonationMade(msg.sender, artistId, donatedAmount, artistFee, platformFee);
    }

    // -------------------------------------------------------------------------
    // External: state-changing
    // -------------------------------------------------------------------------

    /// @notice Bind `msg.sender` as the claimant for `artistId`.
    /// @dev Emits `ArtistClaimed`. Off-chain verification is a trust assumption.
    ///      The first successful caller wins; later callers revert.
    /// @param artistId Spotify artist ID (1–22 bytes).
    function claimArtist(string calldata artistId) external {
        _validateArtistId(artistId);

        ArtistData storage artist = _artists[artistId];
        if (artist.claimant != address(0)) {
            revert ArtistAlreadyClaimed();
        }

        artist.claimant = msg.sender;

        emit ArtistClaimed(artistId, msg.sender);
    }

    /// @notice Move the artist balance to `pendingWithdrawals[msg.sender]`.
    /// @dev Emits `DonationsSettled`. Only the bound claimant. Does not send ETH;
    ///      the claimant must call `withdraw`.
    /// @param artistId Spotify artist ID (1–22 bytes).
    function settleDonations(string calldata artistId) external {
        _validateArtistId(artistId);

        ArtistData storage artist = _artists[artistId];
        address claimant = artist.claimant;
        if (claimant == address(0)) {
            revert ArtistNotClaimed();
        }
        if (msg.sender != claimant) {
            revert NotArtistClaimant(msg.sender, claimant);
        }

        uint256 amount = artist.balance;
        if (amount == 0) {
            revert ZeroAmount();
        }

        artist.balance = 0;
        pendingWithdrawals[claimant] += amount;

        emit DonationsSettled(artistId, claimant, amount);
    }

    /// @notice Move accrued platform fees to `pendingWithdrawals[msg.sender]`.
    /// @dev Emits `PlatformFeesSettled`. Owner only. Does not send ETH;
    ///      the owner must call `withdraw`.
    function settlePlatformFees() external onlyOwner {
        uint256 amount = _platformFeeAccrued;
        if (amount == 0) {
            revert ZeroAmount();
        }

        _platformFeeAccrued = 0;
        pendingWithdrawals[msg.sender] += amount;

        emit PlatformFeesSettled(msg.sender, amount);
    }

    /// @notice Pull `pendingWithdrawals[msg.sender]` to `recipient`.
    /// @dev Emits `Withdrawn` after the transfer. Follows CEI and `nonReentrant`.
    /// @param recipient Address that receives the ETH.
    function withdraw(address recipient) external nonReentrant {
        if (recipient == address(0)) {
            revert ZeroAddress();
        }

        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) {
            revert ZeroAmount();
        }

        pendingWithdrawals[msg.sender] = 0;
        totalBalance -= amount;

        (bool success,) = recipient.call{ value: amount }("");
        if (!success) {
            revert TransferFailed();
        }

        emit Withdrawn(msg.sender, recipient, amount);
    }

    /// @notice Update the platform fee recipient and rate.
    /// @dev Emits `PlatformFeeInfoUpdated`. Owner only. Does not change already-accrued fees.
    /// @param recipient_ Address recorded as fee recipient.
    /// @param feeBps_ New fee in basis points; must be `<= MAX_FEE_BPS`.
    function setPlatformFeeInfo(address recipient_, uint256 feeBps_) external onlyOwner {
        _setPlatformFeeInfo(recipient_, feeBps_);
    }

    // -------------------------------------------------------------------------
    // External: view
    // -------------------------------------------------------------------------

    /// @notice Artist spendable balance and claim flag. Returns zeros for unknown IDs.
    /// @param artistId Spotify artist ID.
    /// @return artistBalance Unsettled artist balance in wei.
    /// @return isClaimed True if a claimant is bound.
    function getArtistInfo(string calldata artistId) external view returns (uint256 artistBalance, bool isClaimed) {
        ArtistData storage artist = _artists[artistId];
        return (artist.balance, artist.claimant != address(0));
    }

    /// @notice Bound claimant for `artistId`, or `address(0)` if unclaimed.
    /// @param artistId Spotify artist ID.
    /// @return claimant Bound claimant.
    function getArtistClaimant(string calldata artistId) external view returns (address claimant) {
        return _artists[artistId].claimant;
    }

    /// @notice Number of unique artists that have received at least one donation.
    /// @return count Unique artist count.
    function getArtistsCount() external view returns (uint256 count) {
        return _artistsCount;
    }

    /// @notice Unsettled platform fee balance in wei. Returns 0 when none accrued.
    /// @return feeBalance Accrued, unsettled platform fees.
    function getPlatformFeeBalance() external view returns (uint256 feeBalance) {
        return _platformFeeAccrued;
    }

    /// @notice Current platform fee recipient and rate.
    /// @return recipient Fee recipient address.
    /// @return feeBps Fee in basis points.
    function getPlatformFeeInfo() external view returns (address recipient, uint16 feeBps) {
        return (_platformFeeRecipient, _platformFeeBps);
    }

    // -------------------------------------------------------------------------
    // Internal
    // -------------------------------------------------------------------------

    /// @dev Reverts if `artistId` is empty or longer than `MAX_ARTIST_ID_LENGTH`.
    function _validateArtistId(string calldata artistId) internal pure {
        uint256 length = bytes(artistId).length;
        if (length == 0) {
            revert EmptyArtistId();
        }
        if (length > MAX_ARTIST_ID_LENGTH) {
            revert ArtistIdTooLong(length, MAX_ARTIST_ID_LENGTH);
        }
    }

    /// @dev Writes fee recipient and bps. Reverts on zero recipient or bps above max.
    function _setPlatformFeeInfo(address recipient_, uint256 feeBps_) internal {
        if (recipient_ == address(0)) {
            revert ZeroAddress();
        }
        if (feeBps_ > MAX_FEE_BPS) {
            revert FeeBpsTooHigh(MAX_FEE_BPS, feeBps_);
        }

        address oldRecipient = _platformFeeRecipient;
        uint16 oldFeeBps = _platformFeeBps;
        // casting to 'uint16' is safe because feeBps_ <= MAX_FEE_BPS (10_000)
        // forge-lint: disable-next-line(unsafe-typecast)
        uint16 newFeeBps = uint16(feeBps_);

        _platformFeeRecipient = recipient_;
        _platformFeeBps = newFeeBps;

        emit PlatformFeeInfoUpdated(oldRecipient, recipient_, oldFeeBps, newFeeBps);
    }
}
