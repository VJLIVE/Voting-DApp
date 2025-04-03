import { NetworkId, useWallet } from "@txnlab/use-wallet-react";
import { toast } from "react-toastify";
import { useEffect, useState, useMemo } from "react";
import ConnectWalletModal from "./components/ConnectWalletModal";
import * as algokit from "@algorandfoundation/algokit-utils";
import { VotingClient, VotingFactory } from "./contracts/Voting";

// Constants
const NETWORKS = {
  TESTNET: {
    id: NetworkId.TESTNET,
    client: algokit.AlgorandClient.testNet(),
    label: "Testnet",
  },
  MAINNET: {
    id: NetworkId.MAINNET,
    client: algokit.AlgorandClient.mainNet(),
    label: "Mainnet",
  },
} as const;

// Types
interface VotingState {
  title: string;
  description: string;
  noOfOptions: number;
  options: string[];
  optionVotes: number[];
  endsAt: number;
}

// Utility functions
const formatAddress = (address: string) => `${address.slice(0, 3)}...${address.slice(-3)}`;

const formatTimestamp = (timestamp: number): string => {
  const localDate = new Date(timestamp * 1000);
  // Extract local date-time components
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(localDate.getDate()).padStart(2, "0");
  const hours = String(localDate.getHours()).padStart(2, "0");
  const minutes = String(localDate.getMinutes()).padStart(2, "0");

  // Format as "yyyy-MM-ddThh:mm"
  const formattedLocalDate = `${year}-${month}-${day}T${hours}:${minutes}`;
  return formattedLocalDate;
};

const App = () => {
  // Wallet connection state
  const { wallets, activeWallet, activeAccount, transactionSigner, setActiveNetwork } = useWallet();

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState<"home" | "create" | "vote">("home");
  const [network, setNetwork] = useState<keyof typeof NETWORKS>("TESTNET");

  // Voting state
  const [votingId, setVotingId] = useState(0);
  const [appId, setAppId] = useState(0);
  const [isCreating, setIsCreating] = useState("");
  const [selectedVoteOption, setSelectedVoteOption] = useState(1);
  const [votedOption, setVotedOption] = useState(0);

  // Form state for creating new vote
  const [votingState, setVotingState] = useState<VotingState>({
    title: "",
    description: "",
    noOfOptions: 2,
    options: ["", "", "", ""],
    optionVotes: [0, 0, 0, 0],
    endsAt: Math.floor(new Date().getTime() / 1000),
  });

  // Memoized client based on network
  const client = useMemo(() => NETWORKS[network.toUpperCase() as keyof typeof NETWORKS].client, [network]);

  // Network effect
  useEffect(() => {
    setActiveNetwork(NETWORKS[network.toUpperCase() as keyof typeof NETWORKS].id);
  }, [network, setActiveNetwork]);

  // Validation helper
  const validateVotingForm = () => {
    if (!activeAccount) throw new Error("Please connect wallet first");
    if (!votingState.title) throw new Error("Title is required");
    if (!votingState.description) throw new Error("Description is required");
    if (votingState.noOfOptions < 2) throw new Error("Minimum Number of options should be 2");

    // Validate required options based on noOfOptions
    for (let i = 0; i < votingState.noOfOptions; i++) {
      if (!votingState.options[i]) throw new Error(`Option ${i + 1} is required`);
    }
  };

  // Create new voting
  const createVoting = async () => {
    setIsCreating("Creating Voting...");
    try {
      validateVotingForm();

      if (!activeAccount) throw new Error("Please connect wallet first");

      // Deploy contract
      const votingFactory = new VotingFactory({
        algorand: client,
        defaultSender: activeAccount.address,
        defaultSigner: transactionSigner,
      });

      const deployResult = await votingFactory.send.create.bare();
      toast.success("App created successfully");

      // Register voting details
      setIsCreating("Registering Voting...");
      const appId = deployResult.result.appId;

      const votingClient = new VotingClient({
        algorand: client,
        appId,
        defaultSigner: transactionSigner,
      });

      await votingClient.send.createVote({
        args: {
          title: votingState.title,
          description: votingState.description,
          noOfOptions: votingState.noOfOptions,
          option1: votingState.options[0],
          option2: votingState.options[1],
          option3: votingState.options[2],
          option4: votingState.options[3],
          endsAt: votingState.endsAt,
        },
        sender: activeAccount.address,
        signer: transactionSigner,
      });

      toast.success("Voting registered successfully");
      setAppId(Number(appId));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating("");
    }
  };

  // Fetch existing voting
  const fetchVoting = async () => {
    try {
      if (!activeAccount) throw new Error("Please connect wallet first");
      if (!votingId) throw new Error("Voting ID is required");

      const votingClient = new VotingClient({
        algorand: client,
        appId: BigInt(votingId),
        defaultSigner: transactionSigner,
      });

      // Get global state
      const state = await votingClient.appClient.getGlobalState();

      // Update voting state from blockchain
      setVotingState({
        title: String(state.title.value),
        description: String(state.description.value),
        noOfOptions: Number(state.noOfOptions.value),
        options: [String(state.option1.value), String(state.option2.value), String(state.option3.value), String(state.option4.value)],
        optionVotes: [
          Number(state.option1Votes.value),
          Number(state.option2Votes.value),
          Number(state.option3Votes.value),
          Number(state.option4Votes.value),
        ],
        endsAt: Number(state.endsAt.value),
      });

      // Get user's vote if exists
      try {
        const localState = await votingClient.appClient.getLocalState(activeAccount.address);
        setVotedOption(Number(localState["localState"].value));
      } catch (error) {
        // User hasn't voted yet
        setVotedOption(0);
      }

      setPage("vote");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Submit vote
  const submitVote = async (voteOption: number) => {
    try {
      if (!activeAccount) throw new Error("Please connect wallet first");
      if (!voteOption) throw new Error("Please select an option to vote");

      const votingClient = new VotingClient({
        algorand: client,
        appId: BigInt(votingId),
        defaultSigner: transactionSigner,
      });

      // Create opt-in transaction
      const optinTxn = await votingClient.appClient.createTransaction.optIn({
        sender: activeAccount.address,
        signer: transactionSigner,
        method: "opt_in",
      });

      // Create and send transaction group
      await votingClient
        .newGroup()
        .addTransaction(optinTxn.transactions[0], transactionSigner)
        .vote({
          args: [voteOption],
          sender: activeAccount.address,
          signer: transactionSigner,
        })
        .send({ maxRoundsToWaitForConfirmation: 3 });

      toast.success("Voted successfully");
      await fetchVoting(); // Refresh voting data
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Render voting form
  const renderVotingForm = () => (
    <div className="asset_info">
      <h1>Create Voting</h1>
      <div className="input_div">
        <label>Title</label>
        <input
          value={votingState.title}
          onChange={(e) => setVotingState((prev) => ({ ...prev, title: e.target.value }))}
          className="input_1"
        />
      </div>
      <div className="input_div">
        <label>Description</label>
        <input
          value={votingState.description}
          onChange={(e) => setVotingState((prev) => ({ ...prev, description: e.target.value }))}
          className="input_1"
        />
      </div>
      <div className="input_div">
        <label>No. of Options (Min 2)</label>
        <input
          type="number"
          min={2}
          max={4}
          defaultValue={2}
          value={votingState.noOfOptions}
          onChange={(e) => setVotingState((prev) => ({ ...prev, noOfOptions: Number(e.target.value) }))}
          className="input_1"
        />
      </div>
      {votingState.noOfOptions >= 1 && (
        <div className="input_div">
          <label>Option 1</label>
          <input
            value={votingState.options[0]}
            onChange={(e) =>
              setVotingState((prev) => ({ ...prev, options: prev.options.map((option, index) => (index === 0 ? e.target.value : option)) }))
            }
            className="input_1"
          />
        </div>
      )}
      {votingState.noOfOptions >= 2 && (
        <div className="input_div">
          <label>Option 2</label>
          <input
            value={votingState.options[1]}
            onChange={(e) =>
              setVotingState((prev) => ({ ...prev, options: prev.options.map((option, index) => (index === 1 ? e.target.value : option)) }))
            }
            className="input_1"
          />
        </div>
      )}
      {votingState.noOfOptions >= 3 && (
        <div className="input_div">
          <label>Option 3</label>
          <input
            value={votingState.options[2]}
            onChange={(e) =>
              setVotingState((prev) => ({ ...prev, options: prev.options.map((option, index) => (index === 2 ? e.target.value : option)) }))
            }
            className="input_1"
          />
        </div>
      )}
      {votingState.noOfOptions >= 4 && (
        <div className="input_div">
          <label>Option 4</label>
          <input
            value={votingState.options[3]}
            onChange={(e) =>
              setVotingState((prev) => ({ ...prev, options: prev.options.map((option, index) => (index === 3 ? e.target.value : option)) }))
            }
            className="input_1"
          />
        </div>
      )}
      <div className="input_div">
        <label>Ends At (Unix Timestamp)</label>
        <input
          type="datetime-local"
          value={formatTimestamp(votingState.endsAt)}
          onChange={(e) => setVotingState((prev) => ({ ...prev, endsAt: new Date(e.target.value).getTime() / 1000 }))}
          className="input_1"
        />
      </div>
      {/* Add other form fields */}
      <button disabled={!!isCreating} onClick={createVoting}>
        {isCreating || "Create Voting"}
      </button>

      {/* Show app ID if created */}
      {appId > 0 && (
        <div style={{ marginTop: "20px" }} className="input_div">
          <label>{<p>App ID: {appId}</p>}</label>
        </div>
      )}
    </div>
  );

  // Render voting view
  const renderVotingView = () => {
    const hasEnded = votingState.endsAt < Date.now() / 1000;

    return (
      <div className="asset_info">
        <h1>{votingState.title}</h1>
        <p>{votingState.description}</p>
        <p>
          {hasEnded ? "Ended" : "Ends"} At: {formatTimestamp(votingState.endsAt)}
        </p>

        {/* Render voting options */}
        {votingState.options.slice(0, votingState.noOfOptions).map((option, index) => (
          <div key={index} className="input_div">
            <label>
              Option {index + 1} ({option}) - {votingState.optionVotes[index]}
              {votingState.optionVotes[index] === 1 ? " Vote" : " Votes"}
            </label>
          </div>
        ))}

        {/* Render voting controls if not ended and not voted */}
        {!hasEnded && !votedOption && (
          <>
            <div className="input_div">
              <label>Your Vote</label>
              <select onChange={(e) => setSelectedVoteOption(Number(e.target.value))} className="input_1">
                {votingState.options.slice(0, votingState.noOfOptions).map((option, index) => (
                  <option key={index} value={index + 1}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={() => submitVote(selectedVoteOption)}>Vote</button>
          </>
        )}

        {/* Show user's vote if they voted */}
        {votedOption > 0 && (
          <div className="input_div">
            <label>Your Vote</label>
            <input value={`Option ${votedOption} (${votingState.options[votedOption - 1]})`} disabled className="input_1" />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Header Section */}
      <section className="header_section">
        <div className="sticky_nav">
          <a className="cmpny_name">Voting Dapp</a>
        </div>
        <div className="header_wrapper">
          <div className="first_wrap">
            <input value={votingId} onChange={(e) => setVotingId(parseInt(e.target.value))} type="number" />
            <select onChange={(e) => setNetwork(e.target.value as "TESTNET" | "MAINNET")} className="network_select">
              {Object.entries(NETWORKS).map(([key, value]) => (
                <option key={key.toLowerCase()} value={key.toLowerCase()}>
                  {value.label}
                </option>
              ))}
            </select>
            <button onClick={fetchVoting} className="fetch_asset_btn">
              Fetch Voting
            </button>
            <button onClick={() => setPage("create")} className="fetch_asset_btn">
              Create Voting
            </button>
          </div>
          <div className="second_wrap">
            <button onClick={() => setIsModalOpen(true)} className="connect_wallet_btn">
              {activeAccount ? `Connected as ${formatAddress(activeAccount.address)}` : "Connect Wallet"}
            </button>
          </div>
        </div>

      </section>

      {/* Main Content */}
      <div className="asset_ifo_div">
        {page === "create" && renderVotingForm()}
        {page === "vote" && renderVotingView()}
      </div>

      {/* Wallet Connection Modal */}
      <ConnectWalletModal wallets={wallets} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default App;
