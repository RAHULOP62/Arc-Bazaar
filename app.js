/**
 * ArcRelay Marketplace Logic
 * Handles Wallet Connection, Listing, and Buying
 */

let userAddress = null;

// 1. Wallet Connection Logic
async function connectWallet() {
    // Check if MetaMask or any EIP-1193 provider is available
    if (window.ethereum) {
        try {
            // Requesting account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = accounts[0];

            // UI Update: Update button text and style
            const walletBtn = document.getElementById('walletBtn');
            if (walletBtn) {
                walletBtn.innerText = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
                walletBtn.classList.replace('bg-indigo-600', 'bg-emerald-500');
                walletBtn.classList.add('shadow-emerald-200');
            }
            
            console.log("Connected Successfully:", userAddress);
        } catch (error) {
            console.error("User rejected the connection request", error);
            alert("Connection failed. Please allow the request in MetaMask.");
        }
    } else {
        alert("Web3 Wallet not found. Please install MetaMask to use ArcRelay.");
    }
}

// 2. Listing Logic (Form Submission)
const listingForm = document.getElementById('listingForm');
if (listingForm) {
    listingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!userAddress) {
            alert("Please connect your wallet first!");
            return;
        }

        // Get Form Data
        const formData = {
            name: document.getElementById('itemName').value,
            description: document.getElementById('itemDesc').value,
            price: document.getElementById('itemPrice').value,
            category: document.getElementById('itemCat').value
        };

        // Simulate Blockchain Transaction
        const submitBtn = listingForm.querySelector('button[type="submit"]');
        submitBtn.innerText = "Broadcasting to Arc Testnet...";
        submitBtn.disabled = true;

        setTimeout(() => {
            alert(`Listing Created: ${formData.name} is now live!`);
            console.log("Transaction Hash: 0x" + Math.random().toString(16).slice(2));
            
            // Reset Form
            listingForm.reset();
            submitBtn.innerText = "Post Listing";
            submitBtn.disabled = false;
        }, 1500);
    });
}

// 3. Buy Functionality
async function buyItem(button, itemName, price) {
    if (!userAddress) {
        alert("Connect your wallet to purchase this item.");
        connectWallet();
        return;
    }

    // Confirmation
    const confirmPurchase = confirm(`Confirm purchase of ${itemName} for ${price} USDC?`);
    if (!confirmPurchase) return;

    // Loading State
    const originalText = button.innerText;
    button.innerText = "Confirming...";
    button.disabled = true;
    button.closest('.item-card').style.opacity = "0.7";

    try {
        // Mocking a Smart Contract 'buy' call
        console.log(`Initiating tx: buying ${itemName} for ${price} USDC from ${userAddress}`);
        
        // Wait for 2 seconds (Network simulation)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Success State
        alert(`Transaction Confirmed! You have successfully purchased ${itemName}.`);
        
        button.innerText = "Sold";
        button.classList.replace('bg-slate-900', 'bg-slate-100');
        button.classList.add('text-slate-400', 'cursor-not-allowed');
        button.closest('.item-card').classList.add('opacity-50');
        button.onclick = null; // Disable further clicks

    } catch (err) {
        console.error("Purchase failed", err);
        alert("Transaction failed on the blockchain.");
        button.innerText = originalText;
        button.disabled = false;
        button.closest('.item-card').style.opacity = "1";
    }
}

// 4. Global Category Filter
window.filterItems = (category) => {
    const cards = document.querySelectorAll('.item-card');
    const buttons = document.querySelectorAll('.filter-btn');

    // Update Filter Buttons UI
    buttons.forEach(btn => {
        btn.classList.remove('active-filter', 'bg-indigo-600', 'text-white');
        btn.classList.add('bg-white', 'text-slate-600');
    });

    // Handle Card Visibility
    cards.forEach(card => {
        if (category === 'all' || card.classList.contains(category)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
};
