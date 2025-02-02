// Load existing quotes from Local Storage or use default quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Success" },
    { text: "Don't let yesterday take up too much of today.", category: "Motivation" },
];

// Load last viewed quote from Session Storage
const lastQuote = sessionStorage.getItem('lastQuote');
if (lastQuote) document.getElementById("quoteDisplay").textContent = lastQuote;

// ... (Existing functions: displayRandomQuote, saveQuotes, addQuote, populateCategories, filterQuotes, exportToJsonFile, importFromJsonFile remain the same)

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Or your mock API endpoint
const SYNC_INTERVAL = 5000; // Sync every 5 seconds

async function fetchQuotesFromServer() {
    try {
        const response = await fetch(SERVER_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const serverQuotes = await response.json();
        return serverQuotes.slice(0, 5).map(post => ({
            text: post.title,
            category: "Server"
        }));
    } catch (error) {
        console.error("Error fetching quotes:", error);
        document.getElementById("syncStatus").textContent = "Failed to fetch from server!";
        return [];
    }
}

async function syncWithServer() {
    try {
        const serverQuotes = await fetchQuotesFromServer();
        const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

        let updated = false;
        let conflicts = [];

        serverQuotes.forEach(serverQuote => {
            const existingQuote = localQuotes.find(localQuote => localQuote.text === serverQuote.text);

            if (!existingQuote) {
                localQuotes.push(serverQuote);
                updated = true;
                document.getElementById("syncStatus").textContent = "New quotes from server!";
            } else if (existingQuote.category !== serverQuote.category) {
                conflicts.push({ local: existingQuote, server: serverQuote });
                existingQuote.category = serverQuote.category; // Server wins
                updated = true;
                document.getElementById("syncStatus").textContent = "Conflicts resolved (server wins)!";
            }
        });

        if (updated) {
            localStorage.setItem('quotes', JSON.stringify(localQuotes));
            populateCategories();
            displayRandomQuote();
        } else {
            document.getElementById("syncStatus").textContent = "No updates from server.";
        }

        if (conflicts.length > 0) {
            displayConflicts(conflicts);
        }

    } catch (error) {
        console.error("Sync error:", error);
        document.getElementById("syncStatus").textContent = "Sync failed!";
    }
}

function displayConflicts(conflicts) {
    const conflictList = document.getElementById("conflictList");
    conflictList.innerHTML = "";

    conflicts.forEach(conflict => {
        const listItem = document.createElement("li");
        listItem.textContent = `Conflict: "${conflict.local.text}" - Local: ${conflict.local.category}, Server: ${conflict.server.category}`;
        conflictList.appendChild(listItem);
    });
}


// Periodic Syncing
setInterval(syncWithServer, SYNC_INTERVAL);

// Attach event listeners
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);
document.addEventListener("DOMContentLoaded", syncWithServer); // Sync on initial load
