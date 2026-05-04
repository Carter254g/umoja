const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UmojaCommunity", function () {
  let umojaCommunity;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const UmojaCommunity = await ethers.getContractFactory("UmojaCommunity");
    umojaCommunity = await UmojaCommunity.deploy();
  });

  describe("Community Creation", function () {
    it("Should create a community successfully", async function () {
      await umojaCommunity.createCommunity(
        "Mama Mboga Chama",
        "A savings group for market vendors",
        0,
        60
      );
      expect(await umojaCommunity.communityCount()).to.equal(1);
    });

    it("Should set the creator as first member", async function () {
      await umojaCommunity.createCommunity("Test Chama", "Test", 0, 60);
      const isMember = await umojaCommunity.isMember(0, owner.address);
      expect(isMember).to.equal(true);
    });

    it("Should store community details correctly", async function () {
      await umojaCommunity.createCommunity(
        "Nairobi Church",
        "A church community",
        1,
        51
      );
      const community = await umojaCommunity.getCommunity(0);
      expect(community.name).to.equal("Nairobi Church");
      expect(community.description).to.equal("A church community");
      expect(community.quorum).to.equal(51);
      expect(community.isActive).to.equal(true);
      expect(community.memberCount).to.equal(1);
    });

    it("Should fail with empty name", async function () {
      await expect(
        umojaCommunity.createCommunity("", "Description", 0, 60)
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should fail with invalid quorum", async function () {
      await expect(
        umojaCommunity.createCommunity("Test", "Description", 0, 0)
      ).to.be.revertedWith("Quorum must be between 1 and 100");

      await expect(
        umojaCommunity.createCommunity("Test", "Description", 0, 101)
      ).to.be.revertedWith("Quorum must be between 1 and 100");
    });

    it("Should track creator communities", async function () {
      await umojaCommunity.createCommunity("Chama 1", "First", 0, 60);
      await umojaCommunity.createCommunity("Chama 2", "Second", 0, 60);
      const creatorCommunities = await umojaCommunity.getCreatorCommunities(owner.address);
      expect(creatorCommunities.length).to.equal(2);
    });
  });

  describe("Community Management", function () {
    beforeEach(async function () {
      await umojaCommunity.createCommunity("Test Chama", "Test", 0, 60);
    });

    it("Should deactivate community by creator", async function () {
      await umojaCommunity.deactivateCommunity(0);
      const community = await umojaCommunity.getCommunity(0);
      expect(community.isActive).to.equal(false);
    });

    it("Should fail to deactivate by non-creator", async function () {
      await expect(
        umojaCommunity.connect(addr1).deactivateCommunity(0)
      ).to.be.revertedWith("Not the community creator");
    });

    it("Should update quorum by creator", async function () {
      await umojaCommunity.updateQuorum(0, 75);
      const community = await umojaCommunity.getCommunity(0);
      expect(community.quorum).to.equal(75);
    });

    it("Should return all communities", async function () {
      await umojaCommunity.connect(addr1).createCommunity("Church 1", "Test", 1, 51);
      const all = await umojaCommunity.getAllCommunities();
      expect(all.length).to.equal(2);
    });
  });
});
