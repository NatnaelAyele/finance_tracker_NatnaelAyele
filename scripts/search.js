//import required functions to display records table and access the transaction
import { renderTransactions } from './ui.js';
import { getTransactions } from './state.js';


// grab search related elements
const searchInput = document.getElementById("search");
const caseToggle = document.getElementById("case-toggle");
const searchStatus = document.getElementById("search-status");



// Displays error message below the search input.
function showSearchError(message, isError) {

     // If caller does not specify, then consider it an error
    if (isError === undefined) {
        isError = true;
    }

    searchStatus.textContent = message;

    // Red for actual errors such as invalid regex
    // Black for informational messages such as "No match found" in searching
    if (isError === true) {
        searchStatus.style.color = "red";
    } else {
        searchStatus.style.color = "black";
    }
}

// re-run the search whe user types
searchInput.addEventListener("input", performSearch);
// re run the search when user toggles case-sensetivity
caseToggle.addEventListener("change", performSearch);


// performs search on the records table
function performSearch() {

    let pattern = searchInput.value;
    let caseInsensitive = caseToggle.checked;

    let allTransactions = getTransactions();

    // If input box is empty, reset the table to full list
    if (pattern.trim() === "") {

        renderTransactions(allTransactions);
        showSearchError("");
        return;
    }

    let regex;

    try {

        // search dynamicaly based on case-sensetivity toggle
        if (caseInsensitive === true) {
            regex = new RegExp(pattern, "i");
        } else {
            regex = new RegExp(pattern);
        }
    } catch (e) {
        renderTransactions([]);
        showSearchError("Invalid regex pattern.");
        return;
    }

    let filteredTransactions = [];


    for (let i = 0; i < allTransactions.length; i++) {

        let txn = allTransactions[i];
        // change all records to string so that regex would work error free
        let descriptionMatch = regex.test(String(txn.description));
        let amountMatch = regex.test(String(txn.amount));
        let categoryMatch = regex.test(String(txn.category));
        let dateMatch = regex.test(String(txn.date));

        // If any field matches, include transaction in the matches
        if (descriptionMatch === true || amountMatch === true || categoryMatch === true || dateMatch === true) {
            filteredTransactions.push(txn);
        }
    }

    // if no match found show 'no match found' message
    if (filteredTransactions.length === 0) {
        renderTransactions([]);
        showSearchError("No match found.", false);
    } else {
        renderTransactions(filteredTransactions, regex);
        showSearchError("");
    }
}
