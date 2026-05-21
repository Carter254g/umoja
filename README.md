# Umoja

A decentralized community governance platform for Kenya. Chamas, churches, schools, tenant associations and any community group can create proposals, vote transparently, and manage funds  all on the blockchain.

No crypto knowledge needed. Members use M-Pesa and phone numbers.

## The Problem

Kenya has over 2 million community organisations making collective decisions every day with zero transparent infrastructure. Money disappears. Leaders claim mandates they never had. Votes are disputed. Records are altered.

Umoja fixes this by putting community governance on the blockchain  permanent, transparent, and tamper-proof.

## Features

- Create and join verified communities
- Raise proposals and vote — one member one vote
- Treasury management — funds held in smart contract, released by vote only
- M-Pesa integration — members pay via M-Pesa, no crypto required
- SMS notifications — vote reminders and results via SMS
- Role-based access — admin, committee, and member roles
- Quorum enforcement — votes only count when enough members participate
- Full audit trail — every decision recorded permanently on-chain

## Tech Stack

- Smart Contracts: Solidity 0.8.19
- Blockchain: Polygon (Amoy testnet)
- Development: Hardhat
- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, PostgreSQL
- Payments: M-Pesa Daraja API
- SMS: Africa's Talking
- Wallet abstraction: Web3Auth

## Project Structure
umoja/
├── contracts/
│   ├── UmojaCommunity.sol     # Community registry
│   ├── UmojaMembers.sol       # Member management
│   ├── UmojaProposals.sol     # Proposal creation
│   ├── UmojaVoting.sol        # Voting logic
│   └── UmojaTreasury.sol      # Fund management
├── test/
│   └── Umoja.test.js          # Full test suite
├── scripts/
│   └── deploy.js              # Deployment script
├── client/                    # React frontend
└── ignition/                  # Deployment modules
## Getting Started

```bash
git clone https://github.com/Carter254g/umoja.git
cd umoja
npm install
npx hardhat compile
npx hardhat test
```

## Roadmap

- Phase 1: Smart contracts and tests
- Phase 2: Backend API with phone auth
- Phase 3: React frontend with professional UI
- Phase 4: M-Pesa integration
- Phase 5: Polygon testnet deployment

## Author

Carter - Full-stack developer and water engineer based in Kenya
GitHub: https://github.com/Carter254g

## License

MIT
# test
