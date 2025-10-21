// SPDX-License-Identifier: GPL-3.0

pragma solidity = 0.8.19;

contract Donate {
    address private owner;
    uint256 public balance;

    struct Artist {
        string musicId;
        uint balance;
        bool isClaimed;
    }

    struct Donation {
        address donor;
        uint musicId;
        uint256 amount;
        uint256 timestamp;
    }

    constructor() {
        owner = msg.sender;
    }

/*
Possible Solutions:

1. Events + Indexing (Best approach)
- Emit an event in the contract when an artist
is created/donated to
- Use a service like The Graph, or client-side
indexing to track all artist IDs
- Query the indexed list of IDs
2. Array alongside mapping (Requires contract
change)
- Add string[] public artistIds; to the contract
- Push new artist IDs to the array when created
- Iterate through the array to fetch all artists
- ⚠️ This would require redeploying the contract
3. Client-side tracking (Current solution)
- Keep track of artist IDs as users interact
with them (already implemented)
- Store known artist IDs in localStorage or a
database
- This is what the component currently does when
you query or donate
4. Subgraph/Indexer (Production-ready)
- Use The Graph protocol to index blockchain
events
- Query all historical donations and extract
artist IDs
- Most scalable solution for production

Would you like me to implement any of these
solutions? The easiest immediate fix would be to
modify the contract to include an array of artist
IDs, but that requires a redeploy.

*/
//mapping(string => Artist) public artists;
    // mapping(uint256 => Donation[]) public projectDonations;
    Artist[] public artists;

    function tip() external payable {
        payable(owner).transfer(msg.value);
    }

    function getArtistsCount() public view returns (uint) {
        return artists.length;
    }

    function donateToArtist(string memory id) external payable {
        uint donatedAmount = msg.value;
       //  uint tip = donatedAmount / 10;
      //  uint artistRoyality = (donatedAmount / 10) * 9;
        // payable(owner).transfer(tip);
        Artist memory newArtist = Artist(id,msg.value, false );
//        artists[id] = newArtist;
        artists.push(newArtist);
        balance += donatedAmount;
        /*   artists[id].balance += artistRoyality;*/
    }

        function withdraw() external {
                 require(msg.sender == owner, "Not owner");
            (bool success, bytes memory data) = owner.call{ value: address(this).balance }("");
        require(success);


        // emit Approved(contractBalance);
    }

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
}

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
