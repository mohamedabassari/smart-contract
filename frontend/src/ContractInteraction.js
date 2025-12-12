// ContractInteraction.jsx
import { useState, useEffect } from "react";
import Web3 from "web3";
import HelloWorldContract from "./contracts/HelloWorld.json";
import "./ContractInteraction.css";

function ContractInteraction() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [currentName, setCurrentName] = useState("");
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [txHash, setTxHash] = useState("");
  const [blockNumber, setBlockNumber] = useState("");
  const [gasUsed, setGasUsed] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [networkId, setNetworkId] = useState("");

  useEffect(() => {
    initWeb3();
  }, []);

  const initWeb3 = async () => {
    try {
      const web3Instance = new Web3("http://127.0.0.1:7545");
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);

      const netId = await web3Instance.eth.net.getId();
      setNetworkId(netId.toString());

      const block = await web3Instance.eth.getBlockNumber();
      setBlockNumber(block.toString());

      const deployedNetwork = HelloWorldContract.networks[netId];
      const contractInstance = new web3Instance.eth.Contract(
        HelloWorldContract.abi,
        deployedNetwork.address
      );
      setContract(contractInstance);

      const name = await contractInstance.methods.yourName().call();
      setCurrentName(name);
      setLoading(false);
    } catch (error) {
      console.error("Error initializing Web3:", error);
      setLoading(false);
    }
  };

  const handleSetName = async () => {
    if (!newName || !contract) return;

    setLoading(true);
    setShowSuccess(false);

    try {
      const receipt = await contract.methods
        .setName(newName)
        .send({ from: account });

      const updatedName = await contract.methods.yourName().call();
      setCurrentName(updatedName);

      setTxHash(receipt.transactionHash);
      setGasUsed(receipt.gasUsed.toString());
      setBlockNumber(receipt.blockNumber.toString());

      setNewName("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      setLoading(false);
    } catch (error) {
      console.error("Error setting name:", error);
      setLoading(false);
    }
  };

  if (loading && !contract) {
    return (
      <div className="app-wrapper">
        <div className="grid-background"></div>
        <div className="loading-container">
          <div className="loader"></div>
          <p className="loading-text">Connecting to Blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <div className="grid-background"></div>
      
      <div className="main-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <div className="logo-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="header-text">
              <h1 className="app-title">Identity</h1>
              <p className="app-subtitle">On-chain storage</p>
            </div>
          </div>
          
          <div className="network-status">
            <span className="status-indicator"></span>
            <span className="status-text">Ganache</span>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Account</p>
            <p className="stat-value">{account.slice(0, 8)}...{account.slice(-6)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Block</p>
            <p className="stat-value">#{blockNumber}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Gas Used</p>
            <p className="stat-value">{gasUsed || "—"}</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="content-card">
          {/* Identity Display */}
          <div className="identity-section">
            <p className="identity-label">Stored Identity</p>
            <div className="identity-display">
              <span className="greeting-light">Hello,</span>
              <span className="greeting-name">{currentName}</span>
            </div>
          </div>

          {/* Success Alert */}
          {showSuccess && (
            <div className="alert-success">
              <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="alert-text">Transaction confirmed on blockchain</p>
            </div>
          )}

          {/* Input Form */}
          <div className="form-section">
            <label className="form-label">Update Identity</label>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter new name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSetName()}
                disabled={loading}
                className="text-input"
              />
              <button
                onClick={handleSetName}
                disabled={loading || !newName}
                className="submit-button"
              >
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    <span>Writing...</span>
                  </>
                ) : (
                  <>
                    <span>Update</span>
                    <svg className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            <p className="form-hint">This action will create a transaction on the Ethereum blockchain</p>
          </div>
        </div>

        {/* Transaction Details */}
        {txHash && (
          <div className="transaction-card">
            <div className="transaction-header">
              <h3 className="transaction-title">Latest Transaction</h3>
              <span className="transaction-badge">Confirmed</span>
            </div>
            
            <div className="transaction-details">
              <div className="detail-row">
                <span className="detail-label">Hash</span>
                <div className="detail-value-group">
                  <span className="detail-value">{txHash.slice(0, 12)}...{txHash.slice(-10)}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(txHash);
                      alert("Copied!");
                    }}
                    className="copy-button"
                  >
                    <svg className="copy-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Block</span>
                <span className="detail-value">#{blockNumber}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Gas</span>
                <span className="detail-value">{gasUsed} wei</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Network</span>
                <span className="detail-value">{networkId}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="app-footer">
          <p className="footer-text">Powered by Web3.js, Truffle & Ganache</p>
        </footer>
      </div>
    </div>
  );
}

export default ContractInteraction;