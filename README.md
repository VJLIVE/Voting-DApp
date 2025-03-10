# Algorand Voting dApp

This is a decentralized voting application built on the **Algorand blockchain** using **Algopy** for smart contracts and **React with TypeScript** for the frontend. Users can vote on predefined options, and the smart contract securely tracks the votes.

---

## Features
- **Smart contract-based voting**: Ensures security and immutability.
- **Wallet connection**: Supports Pera Wallet.
- **User-friendly UI**: Built with React and TypeScript.
- **Real-time updates**: Fetches live voting status from the blockchain.

---

## Technologies Used
- **Algorand Blockchain**
- **Algopy** (for smart contract development)
- **React + TypeScript** (for frontend development)
- **Algorand SDK (`algosdk`)** (for blockchain interactions)
- **use-wallet** (for wallet integration)
- **Algonode** (for API access)

---

## Prerequisites
Ensure you have the following installed:
- **Node.js** (>= 16.x)
- **Python** (>= 3.8)
- **Algopy**: Install it using
  ```sh
  pip install algopy
  ```
- **Algorand Sandbox or Testnet account**

---

## Usage
1. **Connect your Wallet** (Pera Wallet supported).
2. **Create a Vote** (Admin action to initialize the voting session).
3. **Vote for an Option** (Users can select and vote once).
4. **View Results** (Real-time vote count updates).

---

## Smart Contract Overview
### Functions:
- `create_vote(title, description, noOfOptions, option1, option2, option3, option4, endsAt)`: Initializes a new vote.
- `vote(option)`: Allows users to vote.
- `opt_in()`: Required for users to participate.

---

## Roadmap
- ✅ Basic voting system
- ✅ Fetch live vote counts
- ⏳ Add admin panel for result verification
- ✅ Improve UI/UX

---

## Contributing
1. Fork the repo.
2. Create a new branch (`feature/your-feature`).
3. Commit your changes.
4. Push to your fork and create a PR.

---

## License
This project is licensed under the **MIT License**.

---

## Contact
For questions, open an issue or reach out via [your-email@example.com](mailto:your-email@example.com).



## Setup

### Initial setup
1. Clone this repository to your local machine.
2. Ensure [Docker](https://www.docker.com/) is installed and operational. Then, install `AlgoKit` following this [guide](https://github.com/algorandfoundation/algokit-cli#install).
3. Run `algokit project bootstrap all` in the project directory. This command sets up your environment by installing necessary dependencies, setting up a Python virtual environment, and preparing your `.env` file.
4. In the case of a smart contract project, execute `algokit generate env-file -a target_network localnet` from the `votte-contracts` directory to create a `.env.localnet` file with default configuration for `localnet`.
5. To build your project, execute `algokit project run build`. This compiles your project and prepares it for running.
6. For project-specific instructions, refer to the READMEs of the child projects:
   - Smart Contracts: [votte-contracts](projects/votte-contracts/README.md)
   - Frontend Application: [votte-frontend](projects/votte-frontend/README.md)

> This project is structured as a monorepo, refer to the [documentation](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/features/project/run.md) to learn more about custom command orchestration via `algokit project run`.

### Subsequently

1. If you update to the latest source code and there are new dependencies, you will need to run `algokit project bootstrap all` again.
2. Follow step 3 above.

### VS Code

It has also been configured to have a productive dev experience out of the box in [VS Code](https://code.visualstudio.com/), see the [backend .vscode](./backend/.vscode) and [frontend .vscode](./frontend/.vscode) folders for more details.

## Integrating with smart contracts and application clients

Refer to the [votte-contracts](projects/votte-contracts/README.md) folder for overview of working with smart contracts, [projects/votte-frontend](projects/votte-frontend/README.md) for overview of the React project and the [projects/votte-frontend/contracts](projects/votte-frontend/src/contracts/README.md) folder for README on adding new smart contracts from backend as application clients on your frontend. The templates provided in these folders will help you get started.
When you compile and generate smart contract artifacts, your frontend component will automatically generate typescript application clients from smart contract artifacts and move them to `frontend/src/contracts` folder, see [`generate:app-clients` in package.json](projects/votte-frontend/package.json). Afterwards, you are free to import and use them in your frontend application.

The frontend starter also provides an example of interactions with your VotteClient in [`AppCalls.tsx`](projects/votte-frontend/src/components/AppCalls.tsx) component by default.

## Next Steps

You can take this project and customize it to build your own decentralized applications on Algorand. Make sure to understand how to use AlgoKit and how to write smart contracts for Algorand before you start.
