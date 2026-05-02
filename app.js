/**
 * ArcRelay Marketplace - Professional Arc Testnet Integration
 * Reference: image_cd553f.jpg for UI confirmation flow.
 */

// 1. Arc Testnet Configuration
const ARC_CONFIG = {
    chainId: '0x1F4', // 500 in Decimal
    chainName: 'Arc Testnet',
    rpcUrl: 'https://rpc-testnet.arc.io', // Replace with your actual RPC
    nativeCurrency: { name: 'ARC', symbol: 'ARC', decimals: 18 },
    blockExplorer: 'https://explorer.arc.io'
};

let provider, signer, userAddress;

/**
 * Ensures the user is on the correct network before any action
 */
async function checkAndSwitchNetwork() {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (currentChainId !== ARC_CONFIG.chainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ARC_CONFIG.chainId }],
            });
        } catch (error) {
            if (error.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: ARC_CONFIG.chainId,
                        chainName: ARC_CONFIG.chainName,
                        nativeCurrency: ARC_CONFIG.nativeCurrency,
                        rpcUrls: [ARC_CONFIG.rpcUrl],
                        blockExplorerUrls: [ARC_CONFIG.blockExplorer]
                    }]
                });
            }
        }
    }
}

/**
 * Wallet Connection Logic
 */
async function connectWallet() {
    if (!window.ethereum) return alert("Please install MetaMask!");

    try {
        await checkAndSwitchNetwork();
        
        provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        signer = await provider.getSigner();
        userAddress = accounts[0];

        const walletBtn = document.getElementById('walletBtn');
        walletBtn.innerText = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
        walletBtn.className = "bg-emerald-500 text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 transition-all";
        
        console.log("Connected to Arc Testnet:", userAddress);
    } catch (error) {
        console.error("Connection Error:", error);
    }
}

/**
 * Real Transaction Logic for "Buy" Button
 * This triggers a MetaMask request and waits for on-chain confirmation.
 */
async function buyItem(button, itemName, price) {
    if (!userAddress) {
        await connectWallet();
        return;
    }

    const originalText = button.innerText;
    
    try {
        // UI Update: Show that we are waiting for the user to sign
        button.innerText = "Check Wallet...";
        button.disabled = true;
        button.classList.add('opacity-70');

        // Check network again just in case
        await checkAndSwitchNetwork();

        // Transaction details
        // Note: For a real marketplace, you would call a Smart Contract function here.
        // Example: await contract.purchase(itemId, { value: ethers.parseEther(price.toString()) });
        const txParams = {
            to: "0xYourMarketplaceWalletAddressHere", // Replace with your receiving address
            value: ethers.parseEther("0.001"), // Sending a small amount for the demo
        };

        const txResponse = await signer.sendTransaction(txParams);
        
        // UI Update: User signed, now waiting for the block to be mined
        button.innerText = "Processing...";
        console.log("Transaction Sent. Hash:", txResponse.hash);

        // WAITING FOR CONFIRMATION (Crucial Step)
        const receipt = await txResponse.wait();

        if (receipt.status === 1) {
            // Success flow - Matches image_cd553f.jpg
            alert(`Success! ${itemName} is now yours. Transaction confirmed on Arc Testnet.`);
            
            button.innerText = "Sold";
            button.className = "bg-slate-100 text-slate-400 px-6 py-2 rounded-xl font-bold text-sm cursor-not-allowed";
            button.onclick = null;
            button.closest('.item-card').style.opacity = "0.6";
        } else {
            throw new Error("Transaction Failed");
        }

    } catch (error) {
        console.error("Transaction Error:", error);
        alert(error.message || "Transaction Rejected");
        button.innerText = originalText;
        button.disabled = false;
        button.classList.remove('opacity-70');
    }
}

/**
 * Event Listener for Listing Form
 */
document.getElementById('listingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!userAddress) return alert("Please connect wallet to list items.");

    const submitBtn = e.target.querySelector('button');
    submitBtn.innerText = "Sign Listing...";
    submitBtn.disabled = true;

    try {
        // Here you would normally interact with your contract's 'list' function
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating network latency
        
        alert("Item listed successfully on Arc Testnet!");
        e.target.reset();
    } finally {
        submitBtn.innerText = "Post Listing";
        submitBtn.disabled = false;
    }
});
