// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

contract Donate {
    address private owner;
    uint256 public balance;

    struct ArtistData {
        uint256 totalBalance;
        bool isClaimed;
    }

    // Store artist data by ID (string => ArtistData)
    mapping(string => ArtistData) public artists;

    // Keep track of all artist IDs for iteration
    string[] public artistIds;

    constructor() {
        owner = msg.sender;
    }

    function getArtistsCount() public view returns (uint) {
        return artistIds.length;
    }

    function donateToArtist(string memory artistId) external payable {
        uint256 donatedAmount = msg.value;
        require(donatedAmount > 0, "Donation amount must be greater than 0");

        // If artist doesn't exist yet, add them to the list
        if (artists[artistId].totalBalance == 0) {
            artistIds.push(artistId);
        }

        // Add donation to artist's balance
        artists[artistId].totalBalance += donatedAmount;
        balance += donatedAmount;
    }

    function getArtistBalance(string memory artistId) public view returns (uint256) {
        return artists[artistId].totalBalance;
    }

    function getArtistStatus(string memory artistId) public view returns (bool) {
        return artists[artistId].isClaimed;
    }

    function claimArtist(string memory artistId) external returns (uint256) {
        require(bytes(artistId).length > 0, "Artist ID cannot be empty");

        uint256 claimedAmount = artists[artistId].totalBalance;
        require(claimedAmount > 0, "No balance to claim");
        require(!artists[artistId].isClaimed, "Artist already claimed");

        // Mark artist as claimed
        artists[artistId].isClaimed = true;

        return claimedAmount;
    }

    function withdrawDonate(string memory artistId, address recipient) external {
        require(bytes(artistId).length > 0, "Artist ID cannot be empty");
        require(recipient != address(0), "Invalid recipient address");
        require(artists[artistId].isClaimed, "Artist has not claimed their balance");

        uint256 amount = artists[artistId].totalBalance;
        require(amount > 0, "No balance to withdraw");

        // Reset artist balance after withdrawal
        artists[artistId].totalBalance = 0;
        balance -= amount;

        (bool success, ) = payable(recipient).call{ value: amount }("");
        require(success, "Withdrawal failed");
    }
}



/*
 *
 *///    function withdraw() external {
//                 require(msg.sender == owner, "Not owner");
//            (bool success, bytes memory data) = owner.call{ value: address(this).balance }("");
//        require(success);


// emit Approved(contractBalance);
//    }

/*
function claim(address id) public view returns (uint256) {
    return 5;
}
*/
/*
function withdraw() external {
    address artistAddress = 0;
    uint artistBalance = address(this).balance;
    payable(beneficiary).transfer(artistAddress);
    // emit Approved(contractBalance);
}
*/

/*
   event ProjectCreated(
        uint256 indexed projectId,
        address indexed owner,
        string name
    );

    event DonationReceived(
        uint256 indexed projectId,
        address indexed donor,
        uint256 amount
    );
    */


      /*

  error InsufficientBalance();
  error NoActiveUserFound();
  error UserAlreadyExists();

mapping(uint => Artist) public artists;

  function donate() external {

    if(
        //no artist for Id
    ) {
createArtsit();
    }

    transferToArtist();
  }

  function createArtist() external {
    if (artists[msg.sender].isActive) {
      revert UserAlreadyExists();
    }

    Artist memory newUser = Artist(100, true);

  }

  function transfer(address recipient, uint amount) external {
    if (artists[msg.sender].balance < amount) {
      revert InsufficientBalance();
    }

    if (!artists[recipient].isActive || !artists[msg.sender].isActive) {
      revert NoActiveUserFound();
    }

    artists[msg.sender].balance -= amount;
    artists[recipient].balance += amount;
  }





*/

    /**
mapping(address => bool) public members;

  function addMember(address newMember) external {
    members[newMember] = true;
  }

  function isMember(address member) external view returns (bool) {
    return members[member];
  }
*/
