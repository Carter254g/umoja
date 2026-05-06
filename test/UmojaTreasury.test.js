const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("UmojaTreasury", function () {
  let umojaTreasury;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const UmojaTreasury = await ethers.getContractFactory("UmojaTreasury");
    umojaTreasury = await UmojaTreasury.deploy();

    await umojaTreasury.createCommunity("Test Chama", "A test chama", 0, 50);
    await umojaTreasury.initializeCommunityAdmin(0, "Carter", "+254712345678");

    await umojaTreasury.connect(addr1).requestToJoin(0, "Mary", "+254722222222");
    await umojaTreasury.approveJoinRequest(0, addr1.address);

    await umojaTreasury.connect(addr2).requestToJoin(0, "John", "+254733333333");
    await umojaTreasury.approveJoinRequest(0, addr2.address);
  });

  describe("Contributions", function () {
    it("Should accept contributions from members", async function () {
      await umojaTreasury.contribute(0, "Monthly contribution", {
        value: ethers.parseEther("1")
      });
      const balance = await umojaTreasury.getBalance(0);
      expect(balance).to.equal(ethers.parseEther("1"));
    });

    it("Should fail if non-member contributes", async function () {
      const [,,,addr3] = await ethers.getSigners();
      await expect(
        umojaTreasury.connect(addr3).contribute(0, "Test", {
          value: ethers.parseEther("1")
        })
      ).to.be.revertedWith("Not an active member");
    });

    it("Should fail if contribution is zero", async function () {
      await expect(
        umojaTreasury.contribute(0, "Test", { value: 0 })
      ).to.be.revertedWith("Contribution must be greater than 0");
    });

    it("Should track total contributions", async function () {
      await umojaTreasury.contribute(0, "First", { value: ethers.parseEther("1") });
      await umojaTreasury.connect(addr1).contribute(0, "Second", { value: ethers.parseEther("2") });

      const stats = await umojaTreasury.getTreasuryStats(0);
      expect(stats.contributed).to.equal(ethers.parseEther("3"));
      expect(stats.contributionCount).to.equal(2);
    });

    it("Should get all contributions", async function () {
      await umojaTreasury.contribute(0, "Monthly", { value: ethers.parseEther("1") });
      const contribs = await umojaTreasury.getContributions(0);
      expect(contribs.length).to.equal(1);
      expect(contribs[0].contributor).to.equal(owner.address);
    });
  });

  describe("Fund Release", function () {
    beforeEach(async function () {
      await umojaTreasury.contribute(0, "Pool funds", { value: ethers.parseEther("5") });
      await umojaTreasury.connect(addr1).contribute(0, "Pool funds", { value: ethers.parseEther("5") });
      await umojaTreasury.connect(addr2).contribute(0, "Pool funds", { value: ethers.parseEther("5") });

      await umojaTreasury.createProposal(
        0, "Loan for Mary", "Emergency loan",
        0, 1, true, ethers.parseEther("3"), addr1.address
      );

      await umojaTreasury.castVote(0, 0);
      await umojaTreasury.connect(addr1).castVote(0, 0);
      await umojaTreasury.connect(addr2).castVote(0, 0);

      await time.increase(24 * 60 * 60 + 1);
      await umojaTreasury.finalizeProposal(0);
    });

    it("Should release funds after proposal passes", async function () {
      const balanceBefore = await ethers.provider.getBalance(addr1.address);
      await umojaTreasury.releaseFunds(0);
      const balanceAfter = await ethers.provider.getBalance(addr1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should update community balance after release", async function () {
      await umojaTreasury.releaseFunds(0);
      const balance = await umojaTreasury.getBalance(0);
      expect(balance).to.equal(ethers.parseEther("12"));
    });

    it("Should fail to release funds twice", async function () {
      await umojaTreasury.releaseFunds(0);
      await expect(
        umojaTreasury.releaseFunds(0)
      ).to.be.revertedWith("Funds already released");
    });

    it("Should track releases", async function () {
      await umojaTreasury.releaseFunds(0);
      const releaseList = await umojaTreasury.getReleases(0);
      expect(releaseList.length).to.equal(1);
      expect(releaseList[0].executed).to.equal(true);
    });

    it("Should fail if proposal has not passed", async function () {
      await umojaTreasury.createProposal(
        0, "Another proposal", "Test",
        0, 1, true, ethers.parseEther("1"), addr2.address
      );
      await expect(
        umojaTreasury.releaseFunds(1)
      ).to.be.revertedWith("Proposal has not passed");
    });
  });
});
