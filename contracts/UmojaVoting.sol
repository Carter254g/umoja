// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UmojaProposals.sol";

contract UmojaVoting is UmojaProposals {

    enum VoteChoice { Yes, No, Abstain }

    struct Vote {
        address voter;
        VoteChoice choice;
        uint256 timestamp;
    }

    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(uint256 => address[]) public proposalVoters;

    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        VoteChoice choice
    );

    event ProposalFinalized(
        uint256 indexed proposalId,
        ProposalStatus status,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 abstainVotes
    );

    function castVote(
        uint256 proposalId,
        VoteChoice choice
    ) public proposalExists(proposalId) proposalActive(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        uint256 communityId = proposal.communityId;

        require(
            isMember[communityId][msg.sender] &&
            members[communityId][msg.sender].isActive,
            "Not an active member"
        );
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        hasVoted[proposalId][msg.sender] = true;
        votes[proposalId][msg.sender] = Vote({
            voter: msg.sender,
            choice: choice,
            timestamp: block.timestamp
        });

        proposalVoters[proposalId].push(msg.sender);

        if (choice == VoteChoice.Yes) {
            proposal.yesVotes++;
        } else if (choice == VoteChoice.No) {
            proposal.noVotes++;
        } else {
            proposal.abstainVotes++;
        }

        emit VoteCast(proposalId, msg.sender, choice);
    }

    function finalizeProposal(uint256 proposalId)
        public
        proposalExists(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(
            block.timestamp >= proposal.deadline,
            "Voting still in progress"
        );

        uint256 communityId = proposal.communityId;
        uint256 totalMembers = communities[communityId].memberCount;
        uint256 totalVotes = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
        uint256 quorum = communities[communityId].quorum;

        bool quorumReached = (totalVotes * 100) >= (totalMembers * quorum);

        if (!quorumReached) {
            proposal.status = ProposalStatus.Failed;
            emit ProposalFinalized(
                proposalId,
                ProposalStatus.Failed,
                proposal.yesVotes,
                proposal.noVotes,
                proposal.abstainVotes
            );
            return;
        }

        bool passed = false;

        if (proposal.voteType == VoteType.SimpleMajority) {
            passed = proposal.yesVotes > proposal.noVotes;
        } else if (proposal.voteType == VoteType.SuperMajority) {
            passed = (proposal.yesVotes * 100) >= (totalVotes * 66);
        } else if (proposal.voteType == VoteType.Unanimous) {
            passed = proposal.noVotes == 0 && proposal.abstainVotes == 0;
        }

        proposal.status = passed ? ProposalStatus.Passed : ProposalStatus.Failed;

        emit ProposalFinalized(
            proposalId,
            proposal.status,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.abstainVotes
        );
    }

    function getVote(
        uint256 proposalId,
        address voter
    ) public view returns (Vote memory) {
        return votes[proposalId][voter];
    }

    function getProposalVoters(
        uint256 proposalId
    ) public view returns (address[] memory) {
        return proposalVoters[proposalId];
    }

    function getVoteCount(uint256 proposalId) public view returns (
        uint256 yes,
        uint256 no,
        uint256 abstain,
        uint256 total
    ) {
        Proposal memory proposal = proposals[proposalId];
        yes = proposal.yesVotes;
        no = proposal.noVotes;
        abstain = proposal.abstainVotes;
        total = yes + no + abstain;
    }

    function checkQuorum(uint256 proposalId) public view returns (bool) {
        Proposal memory proposal = proposals[proposalId];
        uint256 communityId = proposal.communityId;
        uint256 totalMembers = communities[communityId].memberCount;
        uint256 totalVotes = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
        uint256 quorum = communities[communityId].quorum;
        return (totalVotes * 100) >= (totalMembers * quorum);
    }
}
