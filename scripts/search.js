import { renderTransactions } from './ui.js';
import { getTransactions } from './state.js';

const searchInput = document.getElementById("search");
const caseToggle = document.getElementById("case-toggle");
const searchStatus = document.getElementById("search-status");

function showSearchError(message, isError) {

    if (isError === undefined) {
        isError = true;
    }

    searchStatus.textContent = message;

    if (isError === true) {
        searchStatus.style.color = "red";
    } else {
        searchStatus.style.color = "black";
    }
}

searchInput.addEventListener("input", performSearch);
caseToggle.addEventListener("change", performSearch);


function performSearch() {

    let pattern = searchInput.value;
    let caseInsensitive = caseToggle.checked;

    let allTransactions = getTransactions();

    if (pattern.trim() === "") {

        renderTransactions(allTransactions);
        showSearchError("");
        return;
    }

    let regex;

    try {
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

        let descriptionMatch = regex.test(String(txn.description));
        let amountMatch = regex.test(String(txn.amount));
        let categoryMatch = regex.test(String(txn.category));
        let dateMatch = regex.test(String(txn.date));

        if (descriptionMatch === true || amountMatch === true || categoryMatch === true || dateMatch === true) {
            filteredTransactions.push(txn);
        }
    }

    if (filteredTransactions.length === 0) {
        renderTransactions([]);
        showSearchError("No match found.", false);
    } else {
        renderTransactions(filteredTransactions, regex);
        showSearchError("");
    }
}
