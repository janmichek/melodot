import { expect } from "chai";
import { parseEther } from "viem";
import hre from "hardhat";

describe("Donate Contract", () => {
  let publicClient: any;
  let walletClient: any;
  let donate: any;
  let deployer: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async () => {
    // Get wallet clients
    const accounts = await hre.viem.getWalletClients();
    [walletClient, addr1, addr2] = accounts;
    deployer = walletClient.account;

    publicClient = await hre.viem.getPublicClient();

    // Deploy the Donate contract
    const hash = await walletClient.deployContract({
      abi: (await hre.artifacts.readArtifact("contracts/Donate.sol:Donate")).abi,
      bytecode: (await hre.artifacts.readArtifact("contracts/Donate.sol:Donate")).bytecode as `0x${string}`,
      args: []
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    donate = await hre.viem.getContractAt("contracts/Donate.sol:Donate", receipt.contractAddress!, {
      walletClient
    });
  });

  describe("Deployment", () => {
    it("should set the deployer as the owner", async () => {
      const owner = await donate.read.owner();
      expect(owner.toLowerCase()).to.equal(deployer.address.toLowerCase());
    });

    it("should initialize with zero balance", async () => {
      const balance = await donate.read.balance();
      expect(balance).to.equal(0n);
    });

    it("should initialize with platform fee of 1% (100 bps)", async () => {
      const [recipient, feeBps] = await donate.read.getPlatformFeeInfo();
      expect(recipient.toLowerCase()).to.equal(deployer.address.toLowerCase());
      expect(feeBps).to.equal(100n);
    });
  });

  describe("Donate to Artist", () => {
    it("should allow donations to an artist with an artist ID", async () => {
      const donationAmount = parseEther("2");
      const artistId = "artist123";

      await donate.write.donateToArtist([artistId], { value: donationAmount });

      const contractBalance = await donate.read.balance();
      expect(contractBalance).to.equal(donationAmount);
    });

    it("should deduct platform fee from artist balance", async () => {
      const donationAmount = parseEther("1");
      const artistId = "artist456";

      // 1% fee = 0.01 ETH, artist gets 0.99 ETH
      const expectedArtistBalance = parseEther("0.99");

      await donate.write.donateToArtist([artistId], { value: donationAmount });

      const artistBalance = await donate.read.getArtistBalance([artistId]);
      expect(artistBalance).to.equal(expectedArtistBalance);
    });

    it("should add new artist to artists list", async () => {
      const artistId = "newartist";
      await donate.write.donateToArtist([artistId], { value: parseEther("1") });

      const count = await donate.read.getArtistsCount();
      expect(count).to.equal(1n);
    });

    it("should increment contract balance on donation", async () => {
      const donation1 = parseEther("1");
      const donation2 = parseEther("2");

      await donate.write.donateToArtist(["song1"], { value: donation1 });
      await donate.write.donateToArtist(["song2"], { value: donation2 });

      const contractBalance = await donate.read.balance();
      expect(contractBalance).to.equal(donation1 + donation2);
    });

    it("should allow multiple donations from different addresses", async () => {
      const donateAsAddr1 = await hre.viem.getContractAt("contracts/Donate.sol:Donate", donate.address, {
        client: { wallet: addr1 }
      });
      const donateAsAddr2 = await hre.viem.getContractAt("contracts/Donate.sol:Donate", donate.address, {
        client: { wallet: addr2 }
      });

      await donateAsAddr1.write.donateToArtist(["music1"], { value: parseEther("1") });
      await donateAsAddr2.write.donateToArtist(["music2"], { value: parseEther("2") });

      const count = await donate.read.getArtistsCount();
      expect(count).to.equal(2n);
    });

    it("should track unique artists and accumulate donations", async () => {
      const donationAmount = parseEther("0.5");

      await donate.write.donateToArtist(["artist1"], { value: donationAmount });
      await donate.write.donateToArtist(["artist2"], { value: donationAmount });
      await donate.write.donateToArtist(["artist1"], { value: donationAmount });

      const count = await donate.read.getArtistsCount();
      // Should only have 2 unique artists, even though artist1 received 2 donations
      expect(count).to.equal(2n);

      // Artist1 should have accumulated balance from both donations (minus fees)
      const artist1Balance = await donate.read.getArtistBalance(["artist1"]);
      expect(artist1Balance).to.equal(parseEther("0.99")); // 2 donations of 0.5 each = 1 ETH, minus 1% fee = 0.99 ETH
    });

    it("should revert on zero donation", async () => {
      await expect(
        donate.write.donateToArtist(["artist1"], { value: 0n })
      ).to.be.rejected;
    });

    it("should accept very small donations", async () => {
      const smallAmount = 1n; // 1 wei

      await donate.write.donateToArtist(["smalldonation"], { value: smallAmount });

      const contractBalance = await donate.read.balance();
      expect(contractBalance).to.equal(smallAmount);
    });
  });

  describe("Claim Artist", () => {
    it("should allow artist to be claimed", async () => {
      const artistId = "artist1";
      await donate.write.donateToArtist([artistId], { value: parseEther("1") });

      await donate.write.claimArtist([artistId]);

      const isClaimed = await donate.read.getArtistStatus([artistId]);
      expect(isClaimed).to.equal(true);
    });

    it("should revert if artist already claimed", async () => {
      const artistId = "artist1";
      await donate.write.donateToArtist([artistId], { value: parseEther("1") });
      await donate.write.claimArtist([artistId]);

      await expect(
        donate.write.claimArtist([artistId])
      ).to.be.rejectedWith(/ArtistAlreadyClaimed/);
    });

    it("should revert on empty artist ID", async () => {
      await expect(
        donate.write.claimArtist([""])
      ).to.be.rejectedWith(/EmptyArtistId/);
    });
  });

  describe("Withdraw Donation", () => {
    beforeEach(async () => {
      // Add some funds to the contract
      await donate.write.donateToArtist(["artist1"], { value: parseEther("5") });
    });

    it("should allow artist to withdraw after claiming", async () => {
      const artistId = "artist1";
      await donate.write.claimArtist([artistId]);

      const artistBalanceBefore = await donate.read.getArtistBalance([artistId]);
      const recipientBalanceBefore = await publicClient.getBalance({ address: addr1.account.address });

      const hash = await donate.write.withdrawDonate([artistId, addr1.account.address]);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;

      const artistBalanceAfter = await donate.read.getArtistBalance([artistId]);
      const recipientBalanceAfter = await publicClient.getBalance({ address: addr1.account.address });

      expect(artistBalanceAfter).to.equal(0n);
      expect(recipientBalanceAfter).to.equal(recipientBalanceBefore + artistBalanceBefore);
    });

    it("should revert if artist not claimed", async () => {
      await expect(
        donate.write.withdrawDonate(["artist1", addr1.account.address])
      ).to.be.rejectedWith(/NotArtistClaimed/);
    });

    it("should revert on invalid recipient address", async () => {
      const artistId = "artist1";
      await donate.write.claimArtist([artistId]);

      await expect(
        donate.write.withdrawDonate([artistId, "0x0000000000000000000000000000000000000000"])
      ).to.be.rejectedWith(/InvalidRecipientAddress/);
    });

    it("should revert on empty artist ID", async () => {
      await expect(
        donate.write.withdrawDonate(["", addr1.account.address])
      ).to.be.rejectedWith(/EmptyArtistId/);
    });
  });

  describe("Platform Fee Withdrawal", () => {
    it("should allow owner to withdraw platform fees", async () => {
      const donationAmount = parseEther("10");
      const expectedFee = parseEther("0.1"); // 1% fee

      await donate.write.donateToArtist(["artist1"], { value: donationAmount });

      const ownerBalanceBefore = await publicClient.getBalance({ address: deployer.address });

      const hash = await donate.write.withdrawPlatformFees([deployer.address]);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;

      const ownerBalanceAfter = await publicClient.getBalance({ address: deployer.address });
      const platformFeeBalance = await donate.read.getPlatformFeeBalance();

      expect(platformFeeBalance).to.equal(0n);
      expect(ownerBalanceAfter).to.be.greaterThan(ownerBalanceBefore);
    });

    it("should revert if non-owner tries to withdraw fees", async () => {
      await donate.write.donateToArtist(["artist1"], { value: parseEther("1") });

      const donateAsAddr1 = await hre.viem.getContractAt("contracts/Donate.sol:Donate", donate.address, {
        client: { wallet: addr1 }
      });

      await expect(
        donateAsAddr1.write.withdrawPlatformFees([addr1.account.address])
      ).to.be.rejectedWith(/OwnableUnauthorized/);
    });

    it("should revert on invalid recipient address", async () => {
      await donate.write.donateToArtist(["artist1"], { value: parseEther("1") });

      await expect(
        donate.write.withdrawPlatformFees(["0x0000000000000000000000000000000000000000"])
      ).to.be.rejectedWith(/InvalidRecipientAddress/);
    });

    it("should revert with no platform fees to withdraw", async () => {
      await expect(
        donate.write.withdrawPlatformFees([deployer.address])
      ).to.be.rejectedWith(/NoBalanceToWithdraw/);
    });
  });

  describe("Artist Query Functions", () => {
    it("should return artist balance correctly", async () => {
      const artistId = "artist1";
      const donationAmount = parseEther("1");

      await donate.write.donateToArtist([artistId], { value: donationAmount });

      const balance = await donate.read.getArtistBalance([artistId]);
      // Should be donation minus 1% fee
      expect(balance).to.equal(parseEther("0.99"));
    });

    it("should return artist claim status correctly", async () => {
      const artistId = "artist1";

      await donate.write.donateToArtist([artistId], { value: parseEther("1") });
      let status = await donate.read.getArtistStatus([artistId]);
      expect(status).to.equal(false);

      await donate.write.claimArtist([artistId]);
      status = await donate.read.getArtistStatus([artistId]);
      expect(status).to.equal(true);
    });

    it("should return correct artists count", async () => {
      let count = await donate.read.getArtistsCount();
      expect(count).to.equal(0n);

      await donate.write.donateToArtist(["artist1"], { value: parseEther("1") });
      count = await donate.read.getArtistsCount();
      expect(count).to.equal(1n);

      await donate.write.donateToArtist(["artist2"], { value: parseEther("1") });
      count = await donate.read.getArtistsCount();
      expect(count).to.equal(2n);
    });
  });

  describe("Contract Balance Verification", () => {
    it("should match contract balance with sum of donations", async () => {
      const amounts = [parseEther("1"), parseEther("2"), parseEther("3")];

      for (let i = 0; i < amounts.length; i++) {
        await donate.write.donateToArtist([`artist${i}`], { value: amounts[i] });
      }

      const contractBalance = await donate.read.balance();
      const expectedBalance = amounts.reduce((sum, amt) => sum + amt, 0n);

      expect(contractBalance).to.equal(expectedBalance);
    });

    it("should reflect actual contract ETH balance", async () => {
      const donationAmount = parseEther("5");

      await donate.write.donateToArtist(["artist1"], { value: donationAmount });

      const actualBalance = await publicClient.getBalance({ address: donate.address });
      const storedBalance = await donate.read.balance();

      expect(actualBalance).to.equal(storedBalance);
      expect(actualBalance).to.equal(donationAmount);
    });

    it("should calculate platform fee balance correctly", async () => {
      const donation1 = parseEther("10");
      const donation2 = parseEther("5");

      await donate.write.donateToArtist(["artist1"], { value: donation1 });
      await donate.write.donateToArtist(["artist2"], { value: donation2 });

      const platformFeeBalance = await donate.read.getPlatformFeeBalance();
      const expectedFeeBalance = parseEther("0.15"); // 1% of 15 ETH

      expect(platformFeeBalance).to.equal(expectedFeeBalance);
    });
  });
});
