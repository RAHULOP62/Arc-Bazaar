/**
 * ArcRelay Marketplace - Strict On-Chain Validation
 */

const ARC_CONFIG = {
    chainId: '0x1F4', 
    USDC_ADDRESS: "0x3600000000000000000000000000000000000000",
    RPC: "https://rpc-testnet.arc.io"
};

const ERC20_ABI = ["function transfer(address to, uint256 amount) returns (bool)"];

async function buyItem(button, itemName, price) {
    if (!window.ethereum) return alert("MetaMask connect karo!");

    const originalText = button.innerText;

    try {
        // 1. Setup Provider aur Signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddr = await signer.getAddress();

        // 2. Network check (Must be Arc Testnet)
        const { chainId } = await provider.getNetwork();
        if (Number(chainId) !== 500) {
            alert("Please switch to Arc Testnet in MetaMask");
            return;
        }

        // UI Update: Transaction start
        button.innerText = "Confirm in Wallet...";
        button.disabled = true;

        // 3. Contract Instance
        const usdc = new ethers.Contract(ARC_CONFIG.USDC_ADDRESS, ERC20_ABI, signer);

        // Arc USDC ERC-20 uses 6 decimals
        const amount = ethers.parseUnits(price.toString(), 6);
        const receiver = "0x867650F5eAe8df91445971f14d89fd84F0C9a9f8";

        // 4. TRIGGER POPUP (User yahan sign karega)
        // Agar user cancel karega, toh code seedha catch block mein jayega
        const tx = await usdc.transfer(receiver, amount);
        
        // 5. WAITING FOR ON-CHAIN CONFIRMATION
        // Iske bina "Success" alert nahi aana chahiye
        button.innerText = "Verifying Transaction...";
        console.log("Tx Sent! Hash:", tx.hash);

        const receipt = await tx.wait(); // Ye line sabse important hai

        // 6. FINAL SUCCESS CHECK
        if (receipt && receipt.status === 1) {
            // Success alert exactly as per image_cce449.png
            alert(`Success! ${itemName} is now yours. Transaction confirmed on Arc Testnet.`);
            
            button.innerText = "Sold";
            button.style.opacity = "0.5";
            button.onclick = null;
        } else {
            throw new Error("Blockchain par transaction fail ho gayi.");
        }

    } catch (error) {
        console.error("Critical Error:", error);
        
        // User ne reject kiya ya balance nahi tha
        if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
            alert("User rejected the transaction. Purchase cancelled.");
        } else {
            alert("Transaction Error: " + (error.reason || "Check your USDC balance/gas."));
        }

        // Reset Button
        button.innerText = originalText;
        button.disabled = false;
    }
}
