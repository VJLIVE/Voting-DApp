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

## Setup Instructions

### 1. Clone the Repository
```sh
git clone https://github.com/your-username/algorand-voting-dapp.git
cd algorand-voting-dapp
```

### 2. Smart Contract Deployment
Compile and deploy the Algopy smart contract:
```sh
algopy compile voting.py
algokit deploy voting.py
```
Copy the **App ID** from the output and update it in the frontend.

---

### 3. Install Frontend Dependencies
```sh
npm install --legacy-peer-deps
```
```sh
npm install
```

### 4. Configure the Algorand Connection
Update the `voting.ts` file with your **Algod client** details:
```tsx
const algodServer = "https://testnet-api.algonode.cloud";
const algodToken = "";
const algodPort = "";
const appId = 123456; // Replace with your App ID
```

---

### 5. Run the Frontend
```sh
npm run dev
```
```sh
npm start
```

This will start the React app at `http://localhost:5173/`.

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
