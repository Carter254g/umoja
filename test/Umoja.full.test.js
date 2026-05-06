const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Umoja Full Integration Tests", function () {
  let umoja;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    const UmojaTreasury = await ethers.getContractFactory("UmojaTreasury");
    umoja = await UmojaTreasury.deploy();
  });

  describe("Full Community Lifecycle", function () {
    it("Should complete full community setup flow", async function () {
      await umoja.createCommunity("Mama Mboga Chama", "Market vendors savings group", 0, 60);
      await umoja.initializeCommunityAdmin(0, "Carter", "+254712345678");

      await umoja.connect(addr1).requestToJoin(0, "Mary", "+254722222222");
      await umoja.connect(addr2).requestToJoin(0, "Jane", "+254733333333");
      await umoja.connect(addr3).requestToJoin(0, "Peter", "+254744444444");

      await umoja.approveJoinRequest(0, addr1.address);
      await umoja.approveJoinRequest(0, addr2.address);
      await umoja.approveJoinRequest(0, addr3.address);

      const count = await umoja.getMemberCount(0);
      expect(count).to.equal(4);
    });

    it("Should complete full proposal and voting flow", async function () {
      await umoja.createCommunity("Test Chama", "Test", 0, 50);
      await umoja.initializeCommunityAdmin(0, "Carter", "+254712345678");
      await umoja.connect(addr1).requestToJoin(0, "Mary", "+254722222222");
      await umoja.connect(addr2).requestToJoin(0, "Jane", "+254733333333");
      await umoja.approveJoinRequest(0, addr1.address);
      await umoja.approveJoinRequest(0, addr2.address);

      await umoja.createProposal(
        0, "Raise monthly contribution",
        "Raise from KES 1000 to KES 1500",
        0, 7, false, 0, ethers.ZeroAddress
      );

      await umoja.castVote(0, 0);
      await umoja.connect(addr1).castVote(0, 0);
      await umoja.connect(addr2).castVote(0, 1);

      const [yes, no, abstain, total] = await umoja.getVoteCount(0);
      expect(yes).to.equal(2);
      expect(no).to.equal(1);
      expect(total).to.equal(3);

      await time.increase(7 * 24 * 60 * 60 + 1);
      await umoja.finalizeProposal(0);

      const proposal = await umoja.getProposal(0);
      expect(proposal.status).to.equal(1);
    });

    it("Should complete full treasury flow", async function () {
      await umoja.createCommunity("Investment Chama", "Investment group", 0, 50);
      await umoja.initializeCommunityAdmin(0, "Carter", "+254712345678");
      await umoja.connect(addr1).requestToJoin(0, "Mary", "+254722222222");
      await umoja.connect(addr2).requestToJoin(0, "Jane", "+254733333333");
      await umoja.approveJoinRequest(0, addr1.address);
      await umoja.approveJoinRequest(0, addr2.address);

      await umoja.contribute(0, "Monthly - May", { value: ethers.parseEther("1") });
      await umoja.connect(addr1).contribute(0, "Monthly - May", { value: ethers.parseEther("1") });
      await umoja.connect(addr2).contribute(0, "Monthly - May", { value: ethers.parseEther("1") });

      expect(await umoja.getBalance(0)).to.equal(ethers.parseEther("3"));

      await umoja.createProposal(
        0, "Emergency loan for Mary",
        "Mary needs KES 50000 for hospital",
        0, 1, true,
        ethers.parseEther("1"),
        addr1.address
      );

      await umoja.castVote(0, 0);
      await umoja.connect(addr1).castVote(0, 0);
      await umoja.connect(addr2).castVote(0, 0);

      await time.increase(24 * 60 * 60 + 1);
      await umoja.finalizeProposal(0);

      const proposal = await umoja.getProposal(0);
      expect(proposal.status).to.equal(1);

      await umoja.releaseFunds(0);

      expect(await umoja.getBalance(0)).to.equal(ethers.parseEther("2"));
    });
  });

  describe("Security and Edge Cases", function () {
    beforeEach(async function () {
      await umoja.createCommunity("Secure Chama", "Security test", 0, 60);
      await umoja.initializeCommunityAdmin(0, "Carter", "+254712345678");
      await umoja.connect(addr1).requestToJoin(0, "Mary", "+254722222222");
      await umoja.approveJoinRequest(0, addr1.address);
    });

    it("Should prevent non-members from voting", async function () {
      await umoja.createProposal(
        0, "Test", "Test", 0, 7, false, 0, ethers.ZeroAddress
      );
      await expect(
        umoja.connect(addr4).castVote(0, 0)
      ).to.be.revertedWith("Not an active member");
    });

    it("Should prevent double voting", async function () {
      await umoja.createProposal(
        0, "Test", "Test", 0, 7, false, 0, ethers.ZeroAddress
      );
      await umoja.castVote(0, 0);
      await expect(
        umoja.castVote(0, 0)
      ).to.be.revertedWith("Already voted");
    });

    it("Should prevent voting after deadline", async function () {
      await umoja.createProposal(
        0, "Test", "Test", 0, 1, false, 0, ethers.ZeroAddress
      );
      await time.increase(24 * 60 * 60 + 1);
      await expect(
        umoja.castVote(0, 0)
      ).to.be.revertedWith("Proposal has expired");
    });

    it("Should prevent releasing funds before proposal passes", async function () {
      await umoja.contribute(0, "Test", { value: ethers.parseEther("1") });
      await umoja.createProposal(
        0, "Loan", "Test loan", 0, 7, true,
        ethers.parseEther("0.5"), addr1.address
      );
      await expect(
        umoja.releaseFunds(0)
      ).to.be.revertedWith("Proposal has not passed");
    });

    it("Should prevent releasing funds with insufficient balance", async function () {
      await umoja.contribute(0, "Test", { value: ethers.parseEther("1") });
      await umoja.connect(addr1).requestToJoin === undefined;

      await umoja.createProposal(
        0, "Big loan", "Too big",
        0, 1, true,
        ethers.parseEther("100"),
        addr1.address
      );

      await umoja.castVote(0, 0);
      await umoja.connect(addr1).castVote(0, 0);
      await time.increase(24 * 60 * 60 + 1);
      await umoja.finalizeProposal(0);

      await expect(
        umoja.releaseFunds(0)
      ).to.be.revertedWith("Insufficient community balance");
    });

    it("Should prevent non-creator from deactivating community", async function () {
      await expect(
        umoja.connect(addr1).deactivateCommunity(0)
      ).to.be.revertedWith("Not the community creator");
    });

    it("Should prevent removing the creator", async function () {
      await expect(
        umoja.removeMember(0, owner.address)
      ).to.be.revertedWith("Cannot remove creator");
    });
  });

  describe("Multiple Communities", function () {
    it("Should handle multiple independent communities", async function () {
      await umoja.createCommunity("Chama A", "First chama", 0, 60);
      await umoja.connect(addr1).createCommunity("Chama B", "Second chama", 0, 51);

      await umoja.initializeCommunityAdmin(0, "Carter", "+254712345678");
      await umoja.connect(addr1).initializeCommunityAdmin(1, "Mary", "+254722222222");

      const chamaA = await umoja.getCommunity(0);
      const chamaB = await umoja.getCommunity(1);

      expect(chamaA.name).to.equal("Chama A");
      expect(chamaB.name).to.equal("Chama B");
      expect(chamaA.creator).to.equal(owner.address);
      expect(chamaB.creator).to.equal(addr1.address);

      expect(await umoja.communityCount()).to.equal(2);
    });
  });
});
