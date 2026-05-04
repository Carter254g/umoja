const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UmojaMembers", function () {
  let umojaMembers;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const UmojaMembers = await ethers.getContractFactory("UmojaMembers");
    umojaMembers = await UmojaMembers.deploy();

    await umojaMembers.createCommunity(
      "Mama Mboga Chama",
      "A savings group",
      0,
      60
    );

    await umojaMembers.initializeCommunityAdmin(0, "Carter", "+254712345678");
  });

  describe("Admin Initialization", function () {
    it("Should initialize creator as admin", async function () {
      const member = await umojaMembers.getMember(0, owner.address);
      expect(member.name).to.equal("Carter");
      expect(member.role).to.equal(2);
      expect(member.isActive).to.equal(true);
    });

    it("Should fail if initialized twice", async function () {
      await expect(
        umojaMembers.initializeCommunityAdmin(0, "Carter", "+254712345678")
      ).to.be.revertedWith("Already initialized");
    });
  });

  describe("Join Requests", function () {
    it("Should allow member to request to join", async function () {
      await umojaMembers.connect(addr1).requestToJoin(0, "Mary", "+254722222222");
      const pending = await umojaMembers.getPendingRequests(0);
      expect(pending.length).to.equal(1);
      expect(pending[0]).to.equal(addr1.address);
    });

    it("Should fail if already a member", async function () {
      await expect(
        umojaMembers.requestToJoin(0, "Carter", "+254712345678")
      ).to.be.revertedWith("Already a member");
    });

    it("Should fail if request already pending", async function () {
      await umojaMembers.connect(addr1).requestToJoin(0, "Mary", "+254722222222");
      await expect(
        umojaMembers.connect(addr1).requestToJoin(0, "Mary", "+254722222222")
      ).to.be.revertedWith("Request already pending");
    });
  });

  describe("Approve and Reject", function () {
    beforeEach(async function () {
      await umojaMembers.connect(addr1).requestToJoin(0, "Mary", "+254722222222");
    });

    it("Should approve join request", async function () {
      await umojaMembers.approveJoinRequest(0, addr1.address);
      const member = await umojaMembers.getMember(0, addr1.address);
      expect(member.isActive).to.equal(true);
      expect(await umojaMembers.isMember(0, addr1.address)).to.equal(true);
    });

    it("Should reject join request", async function () {
      await umojaMembers.rejectJoinRequest(0, addr1.address);
      expect(await umojaMembers.isMember(0, addr1.address)).to.equal(false);
    });

    it("Should fail if non-admin approves", async function () {
      await expect(
        umojaMembers.connect(addr2).approveJoinRequest(0, addr1.address)
      ).to.be.revertedWith("Not an admin");
    });

    it("Should update member count after approval", async function () {
      await umojaMembers.approveJoinRequest(0, addr1.address);
      const count = await umojaMembers.getMemberCount(0);
      expect(count).to.equal(2);
    });
  });

  describe("Member Management", function () {
    beforeEach(async function () {
      await umojaMembers.connect(addr1).requestToJoin(0, "Mary", "+254722222222");
      await umojaMembers.approveJoinRequest(0, addr1.address);
    });

    it("Should remove a member", async function () {
      await umojaMembers.removeMember(0, addr1.address);
      const member = await umojaMembers.getMember(0, addr1.address);
      expect(member.isActive).to.equal(false);
    });

    it("Should fail to remove creator", async function () {
      await expect(
        umojaMembers.removeMember(0, owner.address)
      ).to.be.revertedWith("Cannot remove creator");
    });

    it("Should update member role", async function () {
      await umojaMembers.updateMemberRole(0, addr1.address, 1);
      const member = await umojaMembers.getMember(0, addr1.address);
      expect(member.role).to.equal(1);
    });

    it("Should get all community members", async function () {
      const members = await umojaMembers.getCommunityMembers(0);
      expect(members.length).to.equal(2);
    });
  });
});
