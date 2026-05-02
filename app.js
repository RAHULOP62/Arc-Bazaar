/**
 * ArcRelay Marketplace - Circle USDC Integration
 * Network: Arc Testnet
 */

const ARC_CONFIG = {
    chainId: '0x1F4', 
    chainName: 'Arc Testnet',
    rpcUrl: 'https://rpc-testnet.arc.io', 
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
    blockExplorer: 'https://testnet.arcscan.app'
};

// Circle USDC Contract Address on Arc Testnet
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000"; 

// Minimal ABI to interact with USDC (ERC-20)
const USDC_ABI = [
    "function transfer(to, amount) returns (bool)",
    "function decimals() view returns (uint8)",
    "function balanceOf(owner) view returns (uint256)"
];

let provider, signer, userAddress;

async function connectWallet() {
    if (!window.ethereum) return alert("MetaMask install karein!");
    try {
        await checkAndSwitchNetwork();
        provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        signer = await provider.getSigner();
        userAddress = accounts[0];
        
        updateWalletUI();
    } catch (error) {
        console.error("Connection Error:", error);
    }
}

/**
 * Real USDC Payment Transaction
 */
async function buyItem(button, itemName, priceInUSDC) {
    if (!userAddress) { await connectWallet(); return; }

    const originalText = button.innerText;
    
    try {
        button.innerText = "Initiating...";
        button.disabled = true;

        await checkAndSwitchNetwork();

        // 1. Setup USDC Contract Instance
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

        // 2. Handle Decimals (USDC ERC-20 interface uses 6 decimals)
        const amount = ethers.parseUnits(priceInUSDC.toString(), 6);

        // 3. Request Transaction via MetaMask
        console.log(`Requesting payment of ${priceInUSDC} USDC for ${itemName}`);
        button.innerText = "Confirm in Wallet...";
        
        // This triggers the actual MetaMask popup
        const tx = await usdcContract.transfer("0x0077777d7EBA4688BDeF3E311b846F25870A19B9", amount); 
        
        // 4. Wait for Blockchain Confirmation
        button.innerText = "Verifying on Arc...";
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            alert(`Payment Successful! Transaction Hash: ${tx.hash}`);
            finalizePurchase(button);
        }

    } catch (error) {
        console.error("Transaction Failed:", error);
        alert(error.reason || "Transaction Cancelled or Failed");
        button.innerText = originalText;
        button.disabled = false;
    }
}

// Helper: Network Switcher
async function checkAndSwitchNetwork() {
    const hexChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (hexChainId !== ARC_CONFIG.chainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ARC_CONFIG.chainId }],
            });
        } catch (err) {
            if (err.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [ARC_CONFIG],
                });
            }
        }
    }
}

function finalizePurchase(button) {
    button.innerText = "Owned";
    button.className = "bg-slate-200 text-slate-500 px-6 py-2 rounded-xl font-bold text-sm cursor-not-allowed";
    button.onclick = null;
}

function updateWalletUI() {
    const btn = document.getElementById('walletBtn');
    if(btn) btn.innerText = `${userAddress.substring(0,6)}...${userAddress.slice(-4)}`;
}
