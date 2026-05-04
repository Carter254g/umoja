// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UmojaCommunity {

    enum CommunityType { Chama, Church, School, Tenants, Sacco, Sports, Other }

    struct Community {
        uint256 id;
        string name;
        string description;
        CommunityType communityType;
        address creator;
        uint256 memberCount;
        uint256 createdAt;
        bool isActive;
        uint256 quorum;
    }

    uint256 public communityCount;

    mapping(uint256 => Community) public communities;
    mapping(address => uint256[]) public creatorCommunities;
    mapping(uint256 => mapping(address => bool)) public isMember;

    event CommunityCreated(
        uint256 indexed id,
        string name,
        CommunityType communityType,
        address indexed creator
    );

    event CommunityDeactivated(uint256 indexed id);

    modifier communityExists(uint256 communityId) {
        require(communityId < communityCount, "Community does not exist");
        require(communities[communityId].isActive, "Community is not active");
        _;
    }

    modifier onlyCreator(uint256 communityId) {
        require(communities[communityId].creator == msg.sender, "Not the community creator");
        _;
    }

    function createCommunity(
        string memory name,
        string memory description,
        CommunityType communityType,
        uint256 quorum
    ) public returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(quorum > 0 && quorum <= 100, "Quorum must be between 1 and 100");

        uint256 communityId = communityCount;

        communities[communityId] = Community({
            id: communityId,
            name: name,
            description: description,
            communityType: communityType,
            creator: msg.sender,
            memberCount: 1,
            createdAt: block.timestamp,
            isActive: true,
            quorum: quorum
        });

        isMember[communityId][msg.sender] = true;
        creatorCommunities[msg.sender].push(communityId);
        communityCount++;

        emit CommunityCreated(communityId, name, communityType, msg.sender);

        return communityId;
    }

    function getCommunity(uint256 communityId) public view returns (Community memory) {
        require(communityId < communityCount, "Community does not exist");
        return communities[communityId];
    }

    function getAllCommunities() public view returns (Community[] memory) {
        Community[] memory all = new Community[](communityCount);
        for (uint256 i = 0; i < communityCount; i++) {
            all[i] = communities[i];
        }
        return all;
    }

    function getCreatorCommunities(address creator) public view returns (uint256[] memory) {
        return creatorCommunities[creator];
    }

    function deactivateCommunity(uint256 communityId)
        public
        communityExists(communityId)
        onlyCreator(communityId)
    {
        communities[communityId].isActive = false;
        emit CommunityDeactivated(communityId);
    }

    function updateQuorum(uint256 communityId, uint256 newQuorum)
        public
        communityExists(communityId)
        onlyCreator(communityId)
    {
        require(newQuorum > 0 && newQuorum <= 100, "Quorum must be between 1 and 100");
        communities[communityId].quorum = newQuorum;
    }
}
