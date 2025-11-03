// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

/// @title Donate - Artist Donation Platform
/// @notice Based on thirdweb's Ownable and PlatformFee patterns (Apache 2.0)
/// @author Original: Your Team | Patterns from: thirdweb

/**
 * ============================================================================
 * Ownable Contract Extension (Apache-2.0 by thirdweb)
 * ============================================================================
 */
abstract contract Ownable {
    address private _owner;

    error OwnableUnauthorized();

    modifier onlyOwner() {
        if (msg.sender != _owner) {
            revert OwnableUnauthorized();
        }
        _;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function setOwner(address _newOwner) external {
        if (!_canSetOwner()) {
            revert OwnableUnauthorized();
        }
        _setupOwner(_newOwner);
    }

    function _setupOwner(address _newOwner) internal {
        address _prevOwner = _owner;
        _owner = _newOwner;
        emit OwnerUpdated(_prevOwner, _newOwner);
    }

    function _canSetOwner() internal view virtual returns (bool);

    event OwnerUpdated(address indexed prevOwner, address indexed newOwner);
}

/**
 * ============================================================================
 * PlatformFee Contract Extension (Apache-2.0 by thirdweb)
 * ============================================================================
 */
abstract contract PlatformFee {
    address private platformFeeRecipient;
    uint16 private platformFeeBps; // basis points (100 bps = 1%)

    error PlatformFeeUnauthorized();
    error PlatformFeeInvalidRecipient(address recipient);
    error PlatformFeeExceededMaxFeeBps(uint256 max, uint256 actual);

    function getPlatformFeeInfo() public view returns (address, uint16) {
        return (platformFeeRecipient, platformFeeBps);
    }

    function setPlatformFeeInfo(address _platformFeeRecipient, uint256 _platformFeeBps) external {
        if (!_canSetPlatformFeeInfo()) {
            revert PlatformFeeUnauthorized();
        }
        _setupPlatformFeeInfo(_platformFeeRecipient, _platformFeeBps);
    }

    function _setupPlatformFeeInfo(address _platformFeeRecipient, uint256 _platformFeeBps) internal {
        if (_platformFeeBps > 10_000) {
            revert PlatformFeeExceededMaxFeeBps(10_000, _platformFeeBps);
        }
        if (_platformFeeRecipient == address(0)) {
            revert PlatformFeeInvalidRecipient(_platformFeeRecipient);
        }

        platformFeeBps = uint16(_platformFeeBps);
        platformFeeRecipient = _platformFeeRecipient;

        emit PlatformFeeInfoUpdated(_platformFeeRecipient, _platformFeeBps);
    }

    function _canSetPlatformFeeInfo() internal view virtual returns (bool);

    event PlatformFeeInfoUpdated(address indexed platformFeeRecipient, uint256 platformFeeBps);
}

/**
 * ============================================================================
 * Donate Contract - Artist Donation Platform
 * ============================================================================
 */
contract Donate is Ownable, PlatformFee {
    uint256 public balance;

    struct ArtistData {
        uint256 balance;
        bool isClaimed;
    }

    // Custom errors (more gas efficient than require)
    error InvalidDonationAmount();
    error EmptyArtistId();
    error NoBalanceToClaim();
    error ArtistAlreadyClaimed();
    error InvalidRecipientAddress();
    error NoBalanceToWithdraw();
    error WithdrawalFailed();
    error NotArtistClaimed();

    // Store artist data by ID
    mapping(string => ArtistData) public artists;

    // Keep track of all artist IDs for iteration
    string[] public artistIds;

    // Events
    event DonationReceived(
        string indexed artistId,
        address indexed donor,
        uint256 donatedAmount,
        uint256 platformFeeAmount,
        uint256 artistFee
    );

    event ArtistClaimed(string indexed artistId, address indexed claimer, uint256 amount);

    event ArtistWithdrawal(string indexed artistId, address indexed recipient, uint256 amount);

    event PlatformFeeWithdrawn(address indexed recipient, uint256 amount);

    constructor() {
        _setupOwner(msg.sender);
        _setupPlatformFeeInfo(msg.sender, 100); // 100 basis points (1%)
    }

    function getArtistsCount() public view returns (uint) {
        return artistIds.length;
    }

    function getArtistStatus(string memory artistId) public view returns (bool) {
        return artists[artistId].isClaimed;
    }

    function getArtistBalance(string memory artistId) public view returns (uint256) {
        return artists[artistId].balance;
//        todo can i merge with getArtistStatus
    }

    function getPlatformFeeBalance() public view returns (uint256) {
        // Calculate total fees collected so far (balance - all artist balances)
        uint256 totalArtistBalances = 0;
        for (uint i = 0; i < artistIds.length; i++) {
            totalArtistBalances += artists[artistIds[i]].balance;
        }
        return balance - totalArtistBalances;
    }

    function donateToArtist(string memory artistId) external payable {
        uint256 donatedAmount = msg.value;
        if (donatedAmount == 0) {
            revert InvalidDonationAmount();
        }

        // Get platform fee info
        (, uint16 feeBps) = getPlatformFeeInfo();

        uint256 platformFee = (donatedAmount * feeBps) / 10_000;
        uint256 artistFee = donatedAmount - platformFee;

        // If artist doesn't exist yet, add them to the list
        if (artists[artistId].balance == 0) {
            artistIds.push(artistId);
        }

        // Add donation to artist's balance
        artists[artistId].balance += artistFee;
        balance += donatedAmount;

        emit DonationReceived(artistId, msg.sender, donatedAmount, platformFee, artistFee);
    }

//      todo  are evenets important if so then use them
    function claimArtist(string memory artistId) external {
        if (bytes(artistId).length == 0) {
            revert EmptyArtistId();
        }

        if (artists[artistId].isClaimed) {
            revert ArtistAlreadyClaimed();
        }

        uint256 amount = artists[artistId].balance;

        // Mark artist as claimed
        artists[artistId].isClaimed = true;

        emit ArtistClaimed(artistId, msg.sender, amount);
    }

//    todo rename
    function withdrawDonate(string memory artistId, address recipient) external {
        if (bytes(artistId).length == 0) {
            revert EmptyArtistId();
        }
        if (recipient == address(0)) {
            revert InvalidRecipientAddress();
        }
        if (!artists[artistId].isClaimed) {
            revert NotArtistClaimed();
        }

        uint256 amount = artists[artistId].balance;
        if (amount == 0) {
            revert NoBalanceToWithdraw();
        }

        // Reset artist balance after withdrawal
        artists[artistId].balance = 0;
        balance -= amount;

        (bool success, ) = payable(recipient).call{ value: amount }("");
        if (!success) {
            revert WithdrawalFailed();
        }

        emit ArtistWithdrawal(artistId, recipient, amount);
    }


    function withdrawPlatformFees(address recipient) external onlyOwner {
        if (recipient == address(0)) {
            revert InvalidRecipientAddress();
        }

        uint256 amount = getPlatformFeeBalance();
        if (amount == 0) {
            revert NoBalanceToWithdraw();
        }

        // Reset balance (all fees withdrawn)
        balance -= amount;

        (bool success, ) = payable(recipient).call{ value: amount }("");
        if (!success) {
            revert WithdrawalFailed();
        }

        emit PlatformFeeWithdrawn(recipient, amount);
    }

    /**
     * @dev Internal function to check if owner can be set
     * Only the current owner can set a new owner
     */
    function _canSetOwner() internal view override returns (bool) {
        return msg.sender == owner();
    }

    /**
     * @dev Internal function to check if platform fee info can be set
     * Only the owner can set platform fee info
     */
    function _canSetPlatformFeeInfo() internal view override returns (bool) {
        return msg.sender == owner();
    }
}
