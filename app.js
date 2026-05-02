/**
 * ArcRelay Marketplace - Arc Testnet Version
 */

// Arc Testnet Configuration
const ARC_TESTNET_PARAMS = {
    chainId: '0x1F4', // Example Chain ID (Aap apne actual Arc Chain ID se replace karein)
    chainName: 'Arc Testnet',
    nativeCurrency: { name: 'ARC', symbol: 'ARC', decimals: 18 },
    rpcUrls: ['https://rpc-testnet.arc.io'], // Replace with actual Arc RPC
    blockExplorerUrls: ['https://explorer.arc.io']
};

let provider, signer, userAddress;

// 1. Switch to Arc Testnet Automatically
async function switchToArcTestnet() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ARC_TESTNET_PARAMS.chainId }],
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [ARC_TESTNET_PARAMS],
                });
            } catch (addError) {
                console.error("Could not add Arc Testnet", addError);
            }
        }
    }
}

// 2. Connect Wallet with Network Check
async function connectWallet() {
    if (window.ethereum) {
        try {
            await switchToArcTestnet();
            
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            userAddress = await signer.getAddress();

            const walletBtn = document.getElementById('walletBtn');
            walletBtn.innerText = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
            walletBtn.classList.replace('bg-indigo-600', 'bg-emerald-500');
            
            console.log("Connected to Arc Testnet:", userAddress);
        } catch (error) {
            alert("Connection failed. Check MetaMask.");
        }
    } else {
        alert("MetaMask not found!");
    }
}

// 3. Real Arc Testnet Transaction Request
async function buyItem(button, itemName, price) {
    if (!userAddress) {
        await connectWallet();
        return;
    }

    const originalText = button.innerText;
    button.innerText = "Requesting...";
    button.disabled = true;

    try {
        // Transaction Parameters
        const txParams = {
            to: "0xYOUR_CONTRACT_OR_TREASURY_ADDRESS", // Yaha apna wallet/contract address dalein
            value: ethers.parseEther("0.01"), // For demo, sending small ARC amount
            // Agar USDC use kar rahe hain toh yaha Contract Interaction logic aayega
        };

        alert(`Confirm transaction for ${itemName} in your wallet.`);
        
        const tx = await signer.sendTransaction(txParams);
        
        button.innerText = "Verifying...";
        console.log("Transaction Sent:", tx.hash);

        // Wait for block confirmation
        await tx.wait();

        alert(`Success! ${itemName} is now yours. \nTx Hash: ${tx.hash}`);
        
        button.innerText = "Sold";
        button.classList.add('bg-slate-100', 'text-slate-400', 'cursor-not-allowed');
        button.onclick = null;

    } catch (error) {
        console.error("Arc Testnet Error:", error);
        alert("Transaction Rejected or Failed.");
        button.innerText = originalText;
        button.disabled = false;
    }
}

// 4. Listing Logic
document.getElementById('listingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!userAddress) return alert("Connect Wallet First");

    const name = document.getElementById('itemName').value;
    const btn = e.target.querySelector('button');
    
    btn.innerText = "Waiting for Arc...";
    btn.disabled = true;

    // Yaha aapka Smart Contract logic add hoga
    setTimeout(() => {
        alert(`${name} listed on Arc Testnet!`);
        btn.innerText = "Post Listing";
        btn.disabled = false;
        e.target.reset();
    }, 2000);
});
