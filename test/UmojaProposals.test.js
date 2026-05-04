const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UmojaProposals", function () {
  let umojaProposals;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const UmojaProposals = await ethers.getContractFactory("UmojaProposals");
    umojaProposals = await UmojaProposals.deploy();

    await umojaProposals.createCommunity("Test Chama", "A test chama", 0, 60);
    await umojaProposals.initializeCommunityAdmin(0, "Carter", "+254712345678");

    await umojaProposals.connect(addr1).requestToJoin(0, "Mary", "+254722222222");
    await umojaProposals.approveJoinRequest(0, addr1.address);
  });

  describe("Proposal Creation", function () {
    it("Should create a proposal successfully", async function () {
      await umojaProposals.createProposal(
        0, "Raise contribution", "Raise from 1000 to 1500",
        0, 7, false, 0, ethers.ZeroAddress
      );
      expect(await umojaProposals.proposalCount()).to.equal(1);
    });

    it("Should store proposal details correctly", async function () {
      await umojaProposals.createProposal(
        0, "Raise contribution", "Raise from 1000 to 1500",
        0, 7, false, 0, ethers.ZeroAddress
      );
      const proposal = await umojaProposals.getProposal(0);
      expect(proposal.title).to.equal("Raise contribution");
      expect(proposal.status).to.equal(0);
      expect(proposal.yesVotes).to.equal(0);
    });

    it("Should fail with empty title", async function () {
      await expect(
        umojaProposals.createProposal(
          0, "", "Description", 0, 7, false, 0, ethers.ZeroAddress
        )
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("Should fail with invalid duration", async function () {
      await expect(
        umojaProposals.createProposal(
          0, "Test", "Description", 0, 0, false, 0, ethers.ZeroAddress
        )
      ).to.be.revertedWith("Duration must be 1 to 30 days");
    });

    it("Should fail if non-member creates proposal", async function () {
      await expect(
        umojaProposals.connect(addr2).createProposal(
          0, "Test", "Description", 0, 7, false, 0, ethers.ZeroAddress
        )
      ).to.be.revertedWith("Not an active member");
    });

    it("Should create a fund proposal", async function () {
      await umojaProposals.createProposal(
        0, "Loan for Mary", "Emergency loan",
        0, 7, true, ethers.parseEther("1"), addr1.address
      );
      const proposal = await umojaProposals.getProposal(0);
      expect(proposal.fundsInvolved).to.equal(true);
      expect(proposal.fundRecipient).to.equal(addr1.address);
    });

    it("Should track community proposals", async function () {
      await umojaProposals.createProposal(
        0, "Proposal 1", "First", 0, 7, false, 0, ethers.ZeroAddress
      );
      await umojaProposals.createProposal(
        0, "Proposal 2", "Second", 0, 7, false, 0, ethers.ZeroAddress
      );
      const ids = await umojaProposals.getCommunityProposals(0);
      expect(ids.length).to.equal(2);
    });
  });

  describe("Proposal Management", function () {
    beforeEach(async function () {
      await umojaProposals.createProposal(
        0, "Test Proposal", "Description", 0, 7, false, 0, ethers.ZeroAddress
      );
    });

    it("Should cancel proposal by proposer", async function () {
      await umojaProposals.cancelProposal(0);
      const proposal = await umojaProposals.getProposal(0);
      expect(proposal.status).to.equal(4);
    });

    it("Should fail to cancel by non-proposer", async function () {
      await expect(
        umojaProposals.connect(addr1).cancelProposal(0)
      ).to.be.revertedWith("Not authorized to cancel");
    });

    it("Should get active proposals", async function () {
      const active = await umojaProposals.getActiveProposals(0);
      expect(active.length).to.equal(1);
    });

    it("Should check if proposal is expired", async function () {
      const expired = await umojaProposals.isProposalExpired(0);
      expect(expired).to.equal(false);
    });
  });
});
