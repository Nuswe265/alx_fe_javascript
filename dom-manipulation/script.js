// Load existing quotes from Local Storage
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Success" },
    { text: "Don't let yesterday take up too much of today.", category: "Motivation" },
];

// Load last viewed quote from Session Storage
const lastQuote = sessionStorage.getItem('lastQuote');
if (lastQuote) document.getElementById("quoteDisplay").textContent = lastQuote;

// Function to show a random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById("quoteDisplay").textContent = "No quotes available!";
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    document.getElementById("quoteDisplay").textContent = `"${randomQuote.text}" - (${randomQuote.category})`;

    // Save last viewed quote in Session Storage
    sessionStorage.setItem('lastQuote', `"${randomQuote.text}" - (${randomQuote.category})`);
}

// Function to save quotes to Local Storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateCategories();
}

// Function to add a new quote
function addQuote() {
    const quoteText = document.getElementById("newQuoteText").value.trim();
    const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

    if (!quoteText || !quoteCategory) {
        alert("Please enter both a quote and a category!");
        return;
    }

    quotes.push({ text: quoteText, category: quoteCategory });

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    saveQuotes();
    alert("Quote added successfully!");
}

// Populate categories dynamically
function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

    const uniqueCategories = [...new Set(quotes.map(q => q.category))];

    uniqueCategories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    const quoteDisplay = document.getElementById("quoteDisplay");

    if (selectedCategory === "all") {
        showRandomQuote();
    } else {
        const filteredQuotes = quotes.filter(q => q.category === selectedCategory);
        if (filteredQuotes.length > 0) {
            quoteDisplay.textContent = `"${filteredQuotes[0].text}" - (${filteredQuotes[0].category})`;
        } else {
            quoteDisplay.textContent = "No quotes available in this category!";
        }
    }

    // Save selected filter in Local Storage
    localStorage.setItem('selectedCategory', selectedCategory);
}

// Load last selected category on page load
document.addEventListener("DOMContentLoaded", () => {
    populateCategories();
    const lastCategory = localStorage.getItem("selectedCategory");
    if (lastCategory) {
        document.getElementById("categoryFilter").value = lastCategory;
        filterQuotes();
    }
});

// Export quotes to JSON
function exportToJsonFile() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "quotes.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            quotes.push(...importedQuotes);
            saveQuotes();
            alert('Quotes imported successfully!');
        } catch (error) {
            alert("Invalid JSON format!");
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Sync with a mock server
async function syncWithServer() {
    try {
        // Simulate fetching quotes from server
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");
        const serverQuotes = await response.json();

        // Simulate conflict resolution (Server Data Takes Precedence)
        quotes = serverQuotes.slice(0, 5).map(post => ({ text: post.title, category: "Server" }));
        
        saveQuotes();
        document.getElementById("syncStatus").textContent = "Quotes synced with server!";
    } catch (error) {
        document.getElementById("syncStatus").textContent = "Failed to sync with server!";
    }
}

// Attach event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
