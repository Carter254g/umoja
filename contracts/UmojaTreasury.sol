// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UmojaVoting.sol";

contract UmojaTreasury is UmojaVoting {

    struct Contribution {
        address contributor;
        uint256 amount;
        uint256 timestamp;
        string description;
    }

    struct TreasuryRelease {
        uint256 proposalId;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        bool executed;
    }

    mapping(uint256 => uint256) public communityBalance;
    mapping(uint256 => Contribution[]) public contributions;
    mapping(uint256 => TreasuryRelease[]) public releases;
    mapping(uint256 => uint256) public totalContributed;
    mapping(uint256 => uint256) public totalReleased;

    event ContributionReceived(
        uint256 indexed communityId,
        address indexed contributor,
        uint256 amount,
        string description
    );

    event FundsReleased(
        uint256 indexed communityId,
        uint256 indexed proposalId,
        address indexed recipient,
        uint256 amount
    );

    event FundsDeposited(
        uint256 indexed communityId,
        address indexed depositor,
        uint256 amount
    );

    function contribute(
        uint256 communityId,
        string memory description
    ) public payable communityExists(communityId) onlyMember(communityId) {
        require(msg.value > 0, "Contribution must be greater than 0");

        communityBalance[communityId] += msg.value;
        totalContributed[communityId] += msg.value;

        contributions[communityId].push(Contribution({
            contributor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            description: description
        }));

        emit ContributionReceived(communityId, msg.sender, msg.value, description);
    }

    function releaseFunds(uint256 proposalId)
        public
        proposalExists(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Passed, "Proposal has not passed");
        require(proposal.fundsInvolved, "No funds involved in this proposal");
        require(proposal.fundRecipient != address(0), "Invalid recipient");

        uint256 communityId = proposal.communityId;
        uint256 amount = proposal.fundAmount;

        require(communityBalance[communityId] >= amount, "Insufficient community balance");

        for (uint256 i = 0; i < releases[communityId].length; i++) {
            if (releases[communityId][i].proposalId == proposalId) {
                require(!releases[communityId][i].executed, "Funds already released");
            }
        }

        communityBalance[communityId] -= amount;
        totalReleased[communityId] += amount;

        releases[communityId].push(TreasuryRelease({
            proposalId: proposalId,
            recipient: proposal.fundRecipient,
            amount: amount,
            timestamp: block.timestamp,
            executed: true
        }));

        payable(proposal.fundRecipient).transfer(amount);

        emit FundsReleased(communityId, proposalId, proposal.fundRecipient, amount);
    }

    function getBalance(uint256 communityId) public view returns (uint256) {
        return communityBalance[communityId];
    }

    function getContributions(uint256 communityId) public view returns (Contribution[] memory) {
        return contributions[communityId];
    }

    function getReleases(uint256 communityId) public view returns (TreasuryRelease[] memory) {
        return releases[communityId];
    }

    function getTreasuryStats(uint256 communityId) public view returns (
        uint256 balance,
        uint256 contributed,
        uint256 released,
        uint256 contributionCount,
        uint256 releaseCount
    ) {
        balance = communityBalance[communityId];
        contributed = totalContributed[communityId];
        released = totalReleased[communityId];
        contributionCount = contributions[communityId].length;
        releaseCount = releases[communityId].length;
    }
}
