// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UmojaMembers.sol";

contract UmojaProposals is UmojaMembers {

    enum ProposalStatus { Active, Passed, Failed, Expired, Cancelled }
    enum VoteType { SimpleMajority, SuperMajority, Unanimous }

    struct Proposal {
        uint256 id;
        uint256 communityId;
        address proposer;
        string title;
        string description;
        ProposalStatus status;
        VoteType voteType;
        uint256 createdAt;
        uint256 deadline;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 abstainVotes;
        bool fundsInvolved;
        uint256 fundAmount;
        address fundRecipient;
    }

    uint256 public proposalCount;

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => uint256[]) public communityProposals;

    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 indexed communityId,
        address indexed proposer,
        string title
    );

    event ProposalCancelled(uint256 indexed proposalId);
    event ProposalExecuted(uint256 indexed proposalId, ProposalStatus status);

    modifier proposalExists(uint256 proposalId) {
        require(proposalId < proposalCount, "Proposal does not exist");
        _;
    }

    modifier proposalActive(uint256 proposalId) {
        require(
            proposals[proposalId].status == ProposalStatus.Active,
            "Proposal is not active"
        );
        require(
            block.timestamp < proposals[proposalId].deadline,
            "Proposal has expired"
        );
        _;
    }

    function createProposal(
        uint256 communityId,
        string memory title,
        string memory description,
        VoteType voteType,
        uint256 durationDays,
        bool fundsInvolved,
        uint256 fundAmount,
        address fundRecipient
    ) public communityExists(communityId) onlyMember(communityId) returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(durationDays > 0 && durationDays <= 30, "Duration must be 1 to 30 days");

        if (fundsInvolved) {
            require(fundAmount > 0, "Fund amount must be greater than 0");
            require(fundRecipient != address(0), "Invalid fund recipient");
        }

        uint256 proposalId = proposalCount;

        proposals[proposalId] = Proposal({
            id: proposalId,
            communityId: communityId,
            proposer: msg.sender,
            title: title,
            description: description,
            status: ProposalStatus.Active,
            voteType: voteType,
            createdAt: block.timestamp,
            deadline: block.timestamp + (durationDays * 1 days),
            yesVotes: 0,
            noVotes: 0,
            abstainVotes: 0,
            fundsInvolved: fundsInvolved,
            fundAmount: fundAmount,
            fundRecipient: fundRecipient
        });

        communityProposals[communityId].push(proposalId);
        proposalCount++;

        emit ProposalCreated(proposalId, communityId, msg.sender, title);

        return proposalId;
    }

    function cancelProposal(uint256 proposalId)
        public
        proposalExists(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];
        require(
            proposal.proposer == msg.sender ||
            members[proposal.communityId][msg.sender].role == Role.Admin,
            "Not authorized to cancel"
        );
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        proposal.status = ProposalStatus.Cancelled;
        emit ProposalCancelled(proposalId);
    }

    function getProposal(uint256 proposalId) public view returns (Proposal memory) {
        require(proposalId < proposalCount, "Proposal does not exist");
        return proposals[proposalId];
    }

    function getCommunityProposals(uint256 communityId) public view returns (uint256[] memory) {
        return communityProposals[communityId];
    }

    function getActiveProposals(uint256 communityId) public view returns (Proposal[] memory) {
        uint256[] memory ids = communityProposals[communityId];
        uint256 activeCount = 0;

        for (uint256 i = 0; i < ids.length; i++) {
            if (proposals[ids[i]].status == ProposalStatus.Active &&
                block.timestamp < proposals[ids[i]].deadline) {
                activeCount++;
            }
        }

        Proposal[] memory active = new Proposal[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < ids.length; i++) {
            if (proposals[ids[i]].status == ProposalStatus.Active &&
                block.timestamp < proposals[ids[i]].deadline) {
                active[index] = proposals[ids[i]];
                index++;
            }
        }

        return active;
    }

    function isProposalExpired(uint256 proposalId) public view returns (bool) {
        return block.timestamp >= proposals[proposalId].deadline;
    }
}
