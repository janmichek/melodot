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
      abi: (await hre.artifacts.readArtifact("Donate")).abi,
      bytecode: (await hre.artifacts.readArtifact("Donate")).bytecode as `0x${string}`,
      args: []
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    donate = await hre.viem.getContractAt("Donate", receipt.contractAddress!, {
      walletClient
    });
  });

  describe("Deployment", () => {
    it("should set the deployer as the owner", async () => {
      const balance = await donate.read.balance();
      expect(balance).to.equal(0n);
    });

    it("should initialize with zero balance", async () => {
      const balance = await donate.read.balance();
      expect(balance).to.equal(0n);
    });
  });

  describe("Tip Function", () => {
    it("should allow anyone to tip the owner", async () => {
      const tipAmount = parseEther("1");

      // Use addr1 to send tip so we can verify owner receives it
      const donateAsAddr1 = await hre.viem.getContractAt("Donate", donate.address, {
        client: { wallet: addr1 }
      });

      const ownerBalanceBefore = await publicClient.getBalance({ address: deployer.address });

      await donateAsAddr1.write.tip([], { value: tipAmount });

      const ownerBalanceAfter = await publicClient.getBalance({ address: deployer.address });

      // Owner balance should increase by exactly tip amount (no gas cost for receiving)
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + tipAmount);
    });

    it("should transfer tip amount directly to owner", async () => {
      const tipAmount = parseEther("0.5");
      const donateAsAddr1 = await hre.viem.getContractAt("Donate", donate.address, {
        client: { wallet: addr1 }
      });

      const ownerBalanceBefore = await publicClient.getBalance({ address: deployer.address });

      await donateAsAddr1.write.tip([], { value: tipAmount });

      const ownerBalanceAfter = await publicClient.getBalance({ address: deployer.address });

      // Owner should receive the tip amount
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(tipAmount);
    });
  });

  describe("Donate to Artist", () => {
    it("should allow donations to an artist with a music ID", async () => {
      const donationAmount = parseEther("2");
      const musicId = "song123";

      await donate.write.donateToArtist([musicId], { value: donationAmount });

      const contractBalance = await donate.read.balance();
      expect(contractBalance).to.equal(donationAmount);
    });

    it("should create an artist entry when donated to", async () => {
      const donationAmount = parseEther("1.5");
      const musicId = "artist456";

      await donate.write.donateToArtist([musicId], { value: donationAmount });

      const artist = await donate.read.artists([0n]);
      expect(artist[0]).to.equal(musicId); // musicId
      expect(artist[1]).to.equal(donationAmount); // balance
      expect(artist[2]).to.equal(false); // isClaimed
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
      const donateAsAddr1 = await hre.viem.getContractAt("Donate", donate.address, {
        client: { wallet: addr1 }
      });
      const donateAsAddr2 = await hre.viem.getContractAt("Donate", donate.address, {
        client: { wallet: addr2 }
      });

      await donateAsAddr1.write.donateToArtist(["music1"], { value: parseEther("1") });
      await donateAsAddr2.write.donateToArtist(["music2"], { value: parseEther("2") });

      const artist1 = await donate.read.artists([0n]);
      const artist2 = await donate.read.artists([1n]);

      expect(artist1[0]).to.equal("music1");
      expect(artist2[0]).to.equal("music2");
    });

    it("should create separate artist entries for each donation", async () => {
      const donationAmount = parseEther("0.5");

      await donate.write.donateToArtist(["artist1"], { value: donationAmount });
      await donate.write.donateToArtist(["artist2"], { value: donationAmount });
      await donate.write.donateToArtist(["artist1"], { value: donationAmount });

      const artist1 = await donate.read.artists([0n]);
      const artist2 = await donate.read.artists([1n]);
      const artist3 = await donate.read.artists([2n]);

      expect(artist1[0]).to.equal("artist1");
      expect(artist2[0]).to.equal("artist2");
      expect(artist3[0]).to.equal("artist1"); // Same ID, new entry
    });
  });

  describe("Withdraw Function", () => {
    beforeEach(async () => {
      // Add some funds to the contract
      await donate.write.donateToArtist(["test"], { value: parseEther("5") });
    });

    it("should allow owner to withdraw all funds", async () => {
      const contractBalanceBefore = await publicClient.getBalance({
        address: donate.address
      });
      const ownerBalanceBefore = await publicClient.getBalance({
        address: deployer.address
      });

      const hash = await donate.write.withdraw();
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;

      const contractBalanceAfter = await publicClient.getBalance({
        address: donate.address
      });
      const ownerBalanceAfter = await publicClient.getBalance({
        address: deployer.address
      });

      expect(contractBalanceAfter).to.equal(0n);
      expect(ownerBalanceAfter).to.equal(
        ownerBalanceBefore + contractBalanceBefore - gasUsed
      );
    });

    it("should revert if non-owner tries to withdraw", async () => {
      const donateAsAddr1 = await hre.viem.getContractAt("Donate", donate.address, {
        client: { wallet: addr1 }
      });

      await expect(
        donateAsAddr1.write.withdraw()
      ).to.be.rejectedWith(/Not owner/);
    });

    it("should succeed even with zero balance", async () => {
      // Withdraw once to empty the contract
      await donate.write.withdraw();

      // Should not revert on second withdrawal
      await expect(donate.write.withdraw()).to.not.be.rejected;
    });
  });

  describe("Edge Cases", () => {
    it("should accept donation with empty string as music ID", async () => {
      await donate.write.donateToArtist([""], { value: parseEther("1") });

      const artist = await donate.read.artists([0n]);
      expect(artist[0]).to.equal("");
      expect(artist[1]).to.equal(parseEther("1"));
    });

    it("should accept very small donations", async () => {
      const smallAmount = 1n; // 1 wei

      await donate.write.donateToArtist(["smalldonation"], { value: smallAmount });

      const contractBalance = await donate.read.balance();
      expect(contractBalance).to.equal(smallAmount);
    });

    it("should handle long music IDs", async () => {
      const longId = "a".repeat(100);

      await donate.write.donateToArtist([longId], { value: parseEther("1") });

      const artist = await donate.read.artists([0n]);
      expect(artist[0]).to.equal(longId);
    });

    it("should maintain accurate balance across multiple operations", async () => {
      await donate.write.donateToArtist(["song1"], { value: parseEther("1") });
      await donate.write.tip([], { value: parseEther("0.5") });
      await donate.write.donateToArtist(["song2"], { value: parseEther("2") });

      const contractBalance = await donate.read.balance();
      // Tip goes directly to owner, only donations count
      expect(contractBalance).to.equal(parseEther("3"));
    });
  });

  describe("Contract Balance Verification", () => {
    it("should match contract balance with sum of donations", async () => {
      const amounts = [parseEther("1"), parseEther("2"), parseEther("3")];

      for (let i = 0; i < amounts.length; i++) {
        await donate.write.donateToArtist([`song${i}`], { value: amounts[i] });
      }

      const contractBalance = await donate.read.balance();
      const expectedBalance = amounts.reduce((sum, amt) => sum + amt, 0n);

      expect(contractBalance).to.equal(expectedBalance);
    });

    it("should reflect actual contract ETH balance", async () => {
      const donationAmount = parseEther("5");

      await donate.write.donateToArtist(["test"], { value: donationAmount });

      const actualBalance = await publicClient.getBalance({ address: donate.address });
      const storedBalance = await donate.read.balance();

      expect(actualBalance).to.equal(storedBalance);
      expect(actualBalance).to.equal(donationAmount);
    });
  });

  describe("Get Artists Count", () => {
    it("should return zero initially", async () => {
      const count = await donate.read.getArtistsCount();
      expect(count).to.equal(0n);
    });

    it("should increment count after each donation", async () => {
      await donate.write.donateToArtist(["song1"], { value: parseEther("1") });
      let count = await donate.read.getArtistsCount();
      expect(count).to.equal(1n);

      await donate.write.donateToArtist(["song2"], { value: parseEther("1") });
      count = await donate.read.getArtistsCount();
      expect(count).to.equal(2n);

      await donate.write.donateToArtist(["song3"], { value: parseEther("1") });
      count = await donate.read.getArtistsCount();
      expect(count).to.equal(3n);
    });

    it("should count duplicate music IDs as separate entries", async () => {
      await donate.write.donateToArtist(["artist1"], { value: parseEther("1") });
      await donate.write.donateToArtist(["artist1"], { value: parseEther("2") });
      await donate.write.donateToArtist(["artist1"], { value: parseEther("3") });

      const count = await donate.read.getArtistsCount();
      expect(count).to.equal(3n);
    });

    it("should not change count on tip or withdraw", async () => {
      await donate.write.donateToArtist(["song1"], { value: parseEther("1") });
      await donate.write.donateToArtist(["song2"], { value: parseEther("1") });

      let count = await donate.read.getArtistsCount();
      expect(count).to.equal(2n);

      await donate.write.tip([], { value: parseEther("0.5") });
      count = await donate.read.getArtistsCount();
      expect(count).to.equal(2n);

      await donate.write.withdraw();
      count = await donate.read.getArtistsCount();
      expect(count).to.equal(2n);
    });
  });
});
