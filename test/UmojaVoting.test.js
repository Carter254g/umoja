const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("UmojaVoting", function () {
  let umojaVoting;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const UmojaVoting = await ethers.getContractFactory("UmojaVoting");
    umojaVoting = await UmojaVoting.deploy();

    await umojaVoting.createCommunity("Test Chama", "A test chama", 0, 50);
    await umojaVoting.initializeCommunityAdmin(0, "Carter", "+254712345678");

    await umojaVoting.connect(addr1).requestToJoin(0, "Mary", "+254722222222");
    await umojaVoting.approveJoinRequest(0, addr1.address);

    await umojaVoting.connect(addr2).requestToJoin(0, "John", "+254733333333");
    await umojaVoting.approveJoinRequest(0, addr2.address);

    await umojaVoting.createProposal(
      0, "Raise contribution", "Raise from 1000 to 1500",
      0, 7, false, 0, ethers.ZeroAddress
    );
  });

  describe("Voting", function () {
    it("Should cast a yes vote", async function () {
      await umojaVoting.castVote(0, 0);
      const vote = await umojaVoting.getVote(0, owner.address);
      expect(vote.choice).to.equal(0);
    });

    it("Should cast a no vote", async function () {
      await umojaVoting.connect(addr1).castVote(0, 1);
      const vote = await umojaVoting.getVote(0, addr1.address);
      expect(vote.choice).to.equal(1);
    });

    it("Should cast an abstain vote", async function () {
      await umojaVoting.connect(addr2).castVote(0, 2);
      const vote = await umojaVoting.getVote(0, addr2.address);
      expect(vote.choice).to.equal(2);
    });

    it("Should fail if member votes twice", async function () {
      await umojaVoting.castVote(0, 0);
      await expect(
        umojaVoting.castVote(0, 0)
      ).to.be.revertedWith("Already voted");
    });

    it("Should fail if non-member votes", async function () {
      await expect(
        umojaVoting.connect(addr3).castVote(0, 0)
      ).to.be.revertedWith("Not an active member");
    });

    it("Should track vote counts correctly", async function () {
      await umojaVoting.castVote(0, 0);
      await umojaVoting.connect(addr1).castVote(0, 0);
      await umojaVoting.connect(addr2).castVote(0, 1);

      const [yes, no, abstain, total] = await umojaVoting.getVoteCount(0);
      expect(yes).to.equal(2);
      expect(no).to.equal(1);
      expect(abstain).to.equal(0);
      expect(total).to.equal(3);
    });

    it("Should track voters list", async function () {
      await umojaVoting.castVote(0, 0);
      await umojaVoting.connect(addr1).castVote(0, 1);
      const voters = await umojaVoting.getProposalVoters(0);
      expect(voters.length).to.equal(2);
    });
  });

  describe("Finalization", function () {
    it("Should fail to finalize before deadline", async function () {
      await umojaVoting.castVote(0, 0);
      await expect(
        umojaVoting.finalizeProposal(0)
      ).to.be.revertedWith("Voting still in progress");
    });

    it("Should pass with simple majority after deadline", async function () {
      await umojaVoting.castVote(0, 0);
      await umojaVoting.connect(addr1).castVote(0, 0);
      await umojaVoting.connect(addr2).castVote(0, 1);

      await time.increase(7 * 24 * 60 * 60 + 1);
      await umojaVoting.finalizeProposal(0);

      const proposal = await umojaVoting.getProposal(0);
      expect(proposal.status).to.equal(1);
    });

    it("Should fail without quorum", async function () {
      await umojaVoting.castVote(0, 0);
      await time.increase(7 * 24 * 60 * 60 + 1);
      await umojaVoting.finalizeProposal(0);

      const proposal = await umojaVoting.getProposal(0);
      expect(proposal.status).to.equal(2);
    });

    it("Should check quorum correctly", async function () {
      await umojaVoting.castVote(0, 0);
      await umojaVoting.connect(addr1).castVote(0, 0);
      const quorumReached = await umojaVoting.checkQuorum(0);
      expect(quorumReached).to.equal(true);
    });
  });
});
