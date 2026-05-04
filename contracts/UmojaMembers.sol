// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UmojaCommunity.sol";

contract UmojaMembers is UmojaCommunity {

    enum Role { Member, Committee, Admin }

    struct Member {
        address wallet;
        string name;
        string phone;
        Role role;
        uint256 joinedAt;
        bool isActive;
    }

    mapping(uint256 => mapping(address => Member)) public members;
    mapping(uint256 => address[]) public communityMembers;
    mapping(uint256 => mapping(address => bool)) public pendingRequests;
    mapping(uint256 => address[]) public pendingList;

    event MemberAdded(uint256 indexed communityId, address indexed member, Role role);
    event MemberRemoved(uint256 indexed communityId, address indexed member);
    event MemberRoleUpdated(uint256 indexed communityId, address indexed member, Role role);
    event JoinRequested(uint256 indexed communityId, address indexed requester);
    event JoinRequestApproved(uint256 indexed communityId, address indexed member);
    event JoinRequestRejected(uint256 indexed communityId, address indexed requester);

    modifier onlyAdmin(uint256 communityId) {
        require(
            members[communityId][msg.sender].role == Role.Admin ||
            communities[communityId].creator == msg.sender,
            "Not an admin"
        );
        _;
    }

    modifier onlyMember(uint256 communityId) {
        require(
            isMember[communityId][msg.sender] &&
            members[communityId][msg.sender].isActive,
            "Not an active member"
        );
        _;
    }

    function initializeCommunityAdmin(
        uint256 communityId,
        string memory name,
        string memory phone
    ) public communityExists(communityId) {
        require(communities[communityId].creator == msg.sender, "Not the creator");
        require(members[communityId][msg.sender].joinedAt == 0, "Already initialized");

        members[communityId][msg.sender] = Member({
            wallet: msg.sender,
            name: name,
            phone: phone,
            role: Role.Admin,
            joinedAt: block.timestamp,
            isActive: true
        });

        communityMembers[communityId].push(msg.sender);
        emit MemberAdded(communityId, msg.sender, Role.Admin);
    }

    function requestToJoin(
        uint256 communityId,
        string memory name,
        string memory phone
    ) public communityExists(communityId) {
        require(!isMember[communityId][msg.sender], "Already a member");
        require(!pendingRequests[communityId][msg.sender], "Request already pending");

        pendingRequests[communityId][msg.sender] = true;
        pendingList[communityId].push(msg.sender);

        members[communityId][msg.sender] = Member({
            wallet: msg.sender,
            name: name,
            phone: phone,
            role: Role.Member,
            joinedAt: 0,
            isActive: false
        });

        emit JoinRequested(communityId, msg.sender);
    }

    function approveJoinRequest(
        uint256 communityId,
        address applicant
    ) public communityExists(communityId) onlyAdmin(communityId) {
        require(pendingRequests[communityId][applicant], "No pending request");

        pendingRequests[communityId][applicant] = false;
        isMember[communityId][applicant] = true;
        members[communityId][applicant].isActive = true;
        members[communityId][applicant].joinedAt = block.timestamp;
        communities[communityId].memberCount++;
        communityMembers[communityId].push(applicant);

        emit JoinRequestApproved(communityId, applicant);
        emit MemberAdded(communityId, applicant, Role.Member);
    }

    function rejectJoinRequest(
        uint256 communityId,
        address applicant
    ) public communityExists(communityId) onlyAdmin(communityId) {
        require(pendingRequests[communityId][applicant], "No pending request");
        pendingRequests[communityId][applicant] = false;
        delete members[communityId][applicant];
        emit JoinRequestRejected(communityId, applicant);
    }

    function removeMember(
        uint256 communityId,
        address memberAddress
    ) public communityExists(communityId) onlyAdmin(communityId) {
        require(isMember[communityId][memberAddress], "Not a member");
        require(memberAddress != communities[communityId].creator, "Cannot remove creator");

        isMember[communityId][memberAddress] = false;
        members[communityId][memberAddress].isActive = false;
        communities[communityId].memberCount--;

        emit MemberRemoved(communityId, memberAddress);
    }

    function updateMemberRole(
        uint256 communityId,
        address memberAddress,
        Role newRole
    ) public communityExists(communityId) onlyAdmin(communityId) {
        require(isMember[communityId][memberAddress], "Not a member");
        members[communityId][memberAddress].role = newRole;
        emit MemberRoleUpdated(communityId, memberAddress, newRole);
    }

    function getMember(
        uint256 communityId,
        address memberAddress
    ) public view returns (Member memory) {
        return members[communityId][memberAddress];
    }

    function getCommunityMembers(
        uint256 communityId
    ) public view returns (address[] memory) {
        return communityMembers[communityId];
    }

    function getPendingRequests(
        uint256 communityId
    ) public view returns (address[] memory) {
        return pendingList[communityId];
    }

    function getMemberCount(uint256 communityId) public view returns (uint256) {
        return communities[communityId].memberCount;
    }
}
