/**
 * ArcRelay Marketplace - Final Production Logic
 * Network: Arc Testnet (Chain ID: 500)
 */

const CONFIG = {
    USDC_ADDRESS: "0x3600000000000000000000000000000000000000", // Native USDC on Arc
    CHAIN_ID: "0x1F4", // 500 in Hex
    RPC_URL: "https://rpc-testnet.arc.io",
    EXPLORER: "https://testnet.arcscan.app"
};

const MINIMAL_ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
];

let provider, signer, userAddress;

// Initialize connection
async function init() {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        window.ethereum.on('accountsChanged', () => window.location.reload());
        window.ethereum.on('chainChanged', () => window.location.reload());
    }
}

async function connectWallet() {
    try {
        await checkNetwork();
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = accounts[0];
        signer = await provider.getSigner();
        
        const btn = document.getElementById('walletBtn');
        if(btn) btn.innerText = `${userAddress.substring(0, 6)}...${userAddress.slice(-4)}`;
    } catch (err) {
        console.error("Connection failed", err);
    }
}

async function checkNetwork() {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== CONFIG.CHAIN_ID) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: CONFIG.CHAIN_ID }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: CONFIG.CHAIN_ID,
                        chainName: "Arc Testnet",
                        nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
                        rpcUrls: [CONFIG.RPC_URL],
                        blockExplorerUrls: [CONFIG.EXPLORER]
                    }]
                });
            }
        }
    }
}

/**
 * The "Buy" Logic - Triggers Real Transaction
 */
async function buyItem(button, itemName, price) {
    if (!userAddress) return await connectWallet();

    const originalHTML = button.innerHTML;
    
    try {
        // UI Visual Feedback
        button.disabled = true;
        button.innerText = "Check Wallet...";

        await checkNetwork();

        const usdcContract = new ethers.Contract(CONFIG.USDC_ADDRESS, MINIMAL_ERC20_ABI, signer);
        
        // Arc ERC-20 interface uses 6 decimals for USDC transfers
        const amount = ethers.parseUnits(price.toString(), 6); 
        const merchantAddress = "0x0077777d7EBA4688BDeF3E311b846F25870A19B9"; // Placeholder

        // 1. Send Transaction (MetaMask will pop up here)
        const tx = await usdcContract.transfer(merchantAddress, amount);
        
        button.innerText = "Confirming...";
        console.log("Tx Hash:", tx.hash);

        // 2. Wait for confirmation on Arc Testnet
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            alert(`Success! ${itemName} is now yours.\nConfirmed on Arc Testnet.`);
            button.innerText = "Sold";
            button.className = "bg-gray-200 text-gray-500 px-6 py-2 rounded-xl font-bold cursor-not-allowed";
        }

    } catch (error) {
        console.error("Transaction Error:", error);
        alert(error.action === "sendTransaction" ? "Transaction rejected by user." : "Error processing payment.");
        button.innerHTML = originalHTML;
        button.disabled = false;
    }
}

init();
