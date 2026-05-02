/**
 * ArcRelay Marketplace - Fixed Arc Testnet Integration
 */

const ARC_CONFIG = {
    chainId: '0x1F4', // 500 Decimal
    chainName: 'Arc Testnet',
    rpcUrl: 'https://rpc-testnet.arc.io', 
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 }, // Gas uses 18 decimals
    blockExplorer: 'https://testnet.arcscan.app'
};

// Official USDC Contract Address on Arc
const USDC_CONTRACT_ADDRESS = "0x3600000000000000000000000000000000000000";

const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
];

let provider, signer, userAddress;

async function checkNetwork() {
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

async function connectWallet() {
    if (!window.ethereum) return alert("MetaMask install karo!");
    try {
        await checkNetwork();
        provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        userAddress = accounts[0];
        
        document.getElementById('walletBtn').innerText = `${userAddress.substring(0, 6)}...${userAddress.slice(-4)}`;
        console.log("Connected:", userAddress);
    } catch (err) {
        console.error(err);
    }
}

/**
 * FIXED BUY FUNCTION
 */
async function buyItem(button, itemName, price) {
    if (!userAddress) return await connectWallet();

    const originalText = button.innerText;
    
    try {
        button.innerText = "Wallet Check...";
        button.disabled = true;

        await checkNetwork();

        // USDC Contract instance setup
        const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, signer);

        // CRITICAL: ERC-20 interface on Arc uses 6 decimals
        const amount = ethers.parseUnits(price.toString(), 6);
        
        // Target address (Merchant/Receiver)
        const toAddress = "0x867650F5eAe8df91445971f14d89fd84F0C9a9f8"; // StableFX Escrow or your wallet

        console.log(`Sending ${price} USDC to ${toAddress}...`);

        // Trigger Transaction
        const tx = await usdcContract.transfer(toAddress, amount);
        
        button.innerText = "Processing...";
        
        // Wait for Block Confirmation
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            // Success flow - Matches image_cce449.png
            alert(`Success! ${itemName} is now yours. Transaction confirmed on Arc Testnet.`);
            button.innerText = "Sold";
            button.classList.add('opacity-50', 'cursor-not-allowed');
            button.onclick = null;
        }

    } catch (error) {
        console.error("TX Error:", error);
        alert(error.reason || "Transaction failed or rejected.");
        button.innerText = originalText;
        button.disabled = false;
    }
}
