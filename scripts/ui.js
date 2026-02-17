// import functions required for validation, saving and loading data
import { validateTransaction } from './validators.js';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, getBudget, setBudget,  getRates, setRates, getDisplayCurrency, setDisplayCurrency } from './state.js';

//when the page is loaded for the first time and no hash is in URL it default to about section
if (window.location.hash === "") {
    window.location.hash = "#about";
}

// grab main form and all inputs
const form = document.querySelector("form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category-select");
const otherCategoryInput = document.getElementById("other-category");
const dateInput = document.getElementById("date");

// error message elements
const descriptionError = document.getElementById("description-error");
const amountError = document.getElementById("amount-error");
const categoryError = document.getElementById("category-error");
const dateError = document.getElementById("date-error");

// import/export buttons
const exportBtn = document.getElementById("export-json");
const importInput = document.getElementById("import-json");
const loadSampleBtn = document.getElementById("import-sample");



// wait until HTML fully loads before running nav code
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navList = document.getElementById('nav-list');
    const navLinks = navList.querySelectorAll('a');

   // when menu button is clicked, show or hide the nav list
    menuBtn.addEventListener('click', () => {
        navList.classList.toggle('show');
        const isExpanded = navList.classList.contains('show');
        // update aria-expanded for accessibility
        menuBtn.setAttribute('aria-expanded', isExpanded);
    });

    // if it is on small screen and the user clicks link, close the menu automatically
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                navList.classList.remove('show');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    });
});


// flag used to know if the user is editing or adding new transaction
let isEditMode = false;
let editTransactionId = null;

// change form title depending on mode(adding transaction or editing transaction)
function updateFormHeading() {
    const heading = document.getElementById("form-heading");
    heading.textContent = isEditMode ? "Edit Transaction" : "Add Transaction";
}

// if user selects other catagory option show extra input field
categoryInput.addEventListener("change", function () {
    if (categoryInput.value === "Other") {
        otherCategoryInput.disabled = false;
        otherCategoryInput.style.display = "block";
        otherCategoryInput.focus();
    } else {
        otherCategoryInput.disabled = true;
        otherCategoryInput.style.display = "none";
        otherCategoryInput.value = "";
        if (otherCategoryInput.classList.contains("error")) {
            otherCategoryInput.classList.remove("error");
        }
    }
});


// reusable function for showing or removing error styles
function showError(inputElement, errorElement, message) {
    if (message !== "") {
        inputElement.classList.add("error");
        errorElement.textContent = message;
    } else {
        inputElement.classList.remove("error");
        errorElement.textContent = "";
    }
}


// generate id for transaction
function generateId() {
    return 'txn_' + Date.now();
}


// show a successfull message when saving or updating
function showSaveMessage(text) {
    const messageEl = document.getElementById("save-message");
    messageEl.textContent = text;
    messageEl.style.display = "block";

    // start fade out after 2 seconds 
   setTimeout(() => {
        messageEl.style.animation = "fadeOut 0.5s forwards";
    }, 2000);

    // hide it completely after fade
    setTimeout(() => {
        messageEl.style.display = "none";
        messageEl.style.animation = "fadeIn 0.3s forwards";
    }, 2500);
}

// // handle form submission, adding transaction and updating transaction
form.addEventListener("submit", function (event) {
    event.preventDefault();

    // if custom catagory was inserted, set catagory value to it.
    let categoryValue = categoryInput.value;
    if (categoryValue === "Other") categoryValue = otherCategoryInput.value.trim();

    // create transaction object from form inputs
    let transaction = {
        description: descriptionInput.value,
        amount: amountInput.value.trim(),
        category: categoryValue,
        date: dateInput.value.trim(),
        updatedAt: new Date().toISOString()
    };

    // validate transaction using the imported validators
    let errors = validateTransaction(transaction);

    // show errors if any
    showError(descriptionInput, descriptionError, errors.description);
    showError(amountInput, amountError, errors.amount);
    let categoryField = categoryInput.value === "Other" ? otherCategoryInput : categoryInput;
    showError(categoryField, categoryError, errors.category);
    showError(dateInput, dateError, errors.date);

    if (errors.description || errors.amount || errors.category || errors.date) return;

    // if it was editing , update exissting transaction
    if (isEditMode && editTransactionId) {
        const updatedTransaction = {
            ...transaction,
            id: editTransactionId,
            createdAt: getTransactions().find(txn => txn.id === editTransactionId).createdAt
        };
        updateTransaction(editTransactionId, updatedTransaction);
        isEditMode = false;
        editTransactionId = null;
        showSaveMessage("Transaction updated successfully!");
    } else {
        // if it was new transaction, add new transaction
        transaction.id = generateId();
        transaction.createdAt = new Date().toISOString();
        addTransaction(transaction);
         showSaveMessage("Transaction saved successfully!");
    }

    // refresh table and dashboard
    renderTransactions(getTransactions());
    updateDashboard();

    // reset form
    form.reset();
    otherCategoryInput.style.display = "none";
    otherCategoryInput.disabled = true;

    // clear all error messages
    descriptionError.textContent = "";
    amountError.textContent = "";
    categoryError.textContent = "";
    dateError.textContent = "";

    // update form heading after submission
    updateFormHeading();
});

// grab dashboard elements for latter use
const recordsBody = document.getElementById("records-body");  
const totalCountEl = document.getElementById("total-count");
const totalSpentEl = document.getElementById("total-spent");
const topCategoryEl = document.getElementById("top-category");
const budgetCapInput = document.getElementById("budget-cap");
const budgetStatusEl = document.getElementById("budget-status");
const budgetValueEl = document.getElementById("budget-value");
const saveBudgetBtn = document.getElementById("save-budget");


// grab currency choise and rate related elements for latter use
const rateEurInput = document.getElementById("rate-eur");
const rateRwfInput = document.getElementById("rate-rwf");
const saveRateBtn = document.getElementById("save-rate");
const currencySelect = document.querySelector("#currency-select select");
const currentRates = getRates();

// load saved rates into inputs
rateEurInput.value = currentRates.EUR;
rateRwfInput.value = currentRates.RWF;
// load selected currency
currencySelect.value = getDisplayCurrency();


// save new currency rates
saveRateBtn.addEventListener("click", function () {
    const eur = parseFloat(rateEurInput.value);
    const rwf = parseFloat(rateRwfInput.value);

    if (!isNaN(eur) && eur > 0 && !isNaN(rwf) && rwf > 0) {
        setRates({ EUR: eur, RWF: rwf });
        alert("Rates saved.");
        updateDashboard();
        renderTransactions(getTransactions());
    } else {
        alert("Enter valid rates.");
    }
});

// change displayed currency
currencySelect.addEventListener("change", function () {
    setDisplayCurrency(currencySelect.value);
    updateDashboard();
    renderTransactions(getTransactions());
});

// load saved budget if any
const savedBudget = getBudget();
if (savedBudget !== null && !isNaN(savedBudget)) {
    budgetCapInput.value = savedBudget;
}

// save setted budget cap
saveBudgetBtn.addEventListener("click", function() {
    const inputValue = parseFloat(budgetCapInput.value);

    if (!isNaN(inputValue) && inputValue > 0) {
        setBudget(inputValue); 
        updateDashboard();     
        alert("Budget Saved Successfully!"); 
    } else {
        setBudget(null);
        updateDashboard();
        alert("Budget Cleared.");
    }
});


// dashboard updating function
function updateDashboard() {
    const transactions = getTransactions();

    // calculate total number of transactions
    totalCountEl.textContent = transactions.length;

    // calculate total spent amounts
    let total = 0;
    for (let i = 0; i < transactions.length; i++) {
        total += parseFloat(transactions[i].amount);
    }

    const currency = getDisplayCurrency();
    const rates = getRates();

    // if selected currency is not 'USD' convert total to selected currency 
    let convertedTotal = total;
    if (currency !== "USD") {
        convertedTotal = total * rates[currency];
    }

    totalSpentEl.textContent = convertedTotal.toFixed(2) + " " + currency;

    // calculate top catagory
    if (transactions.length === 0) {
        topCategoryEl.textContent = "None";
    } else {
        let categoryCount = {};
        for (let i = 0; i < transactions.length; i++) {
            let cat = transactions[i].category;
            if (!categoryCount[cat]) {
                categoryCount[cat] = 1;
            } else {
                categoryCount[cat]++;
            }
        }
        let max = 0;
        let topCategory = "None";
        for (let cat in categoryCount) {
            if (categoryCount[cat] > max) {
                max = categoryCount[cat];
                topCategory = cat;
            }
        }
        topCategoryEl.textContent = topCategory;
    }

    // display budget status
    let capValue = getBudget(); 
    if (capValue !== null && !isNaN(capValue)) {
                let convertedCap = capValue;
        if (currency !== "USD") {
            convertedCap = capValue * rates[currency];
        }

        if (convertedTotal > convertedCap) {
            let over = (convertedTotal - convertedCap).toFixed(2);
            
            budgetStatusEl.setAttribute("aria-live", "assertive");
            budgetValueEl.textContent = `Over budget by ${over} ${currency}`;
            budgetValueEl.style.color = "red"; 
        } else {
            let remaining = (convertedCap - convertedTotal).toFixed(2);
            
            budgetStatusEl.setAttribute("aria-live", "polite");
            budgetValueEl.textContent = `Remaining ${remaining} ${currency}`;
            budgetValueEl.style.color = "green"; 
        }
    } else {
        budgetValueEl.textContent = "No cap set";
        budgetValueEl.style.color = "inherit";
    }

    // render chart again
    renderTrendChart();
}


// Render trend chart for last 7 days
function renderTrendChart() {
    const trendContainer = document.getElementById("trend-chart");
    // exit if chart container not found
    if (!trendContainer) return;
    const transactions = getTransactions();
    // clear previous chart
    trendContainer.innerHTML = "";

    const currency = getDisplayCurrency();
    const rates = getRates();

    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        last7Days.push(d.toISOString().split("T")[0]);
    }


     // calculate total amount per day
    const totalsByDate = {};
    last7Days.forEach(date => { totalsByDate[date] = 0; });
    transactions.forEach(txn => {
        if (totalsByDate.hasOwnProperty(txn.date)) {
            let amount = parseFloat(txn.amount);
            if (currency !== "USD") {
                amount = amount * rates[currency];
            }
            totalsByDate[txn.date] += amount;
        }
    });

    const maxValue = Math.max(...Object.values(totalsByDate), 1);

    // draw chart rows for each day
    Object.entries(totalsByDate).forEach(([date, amount]) => {
        // dispaly dates as day abbreviation'mon', 'tue'... for readability
        const dateObj = new Date(date);
        const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
        const row = document.createElement("div");
        row.className = "chart-row";
        const label = document.createElement("div");
        label.className = "chart-label";
        label.textContent = dayName;
        const barContainer = document.createElement("div");
        barContainer.className = "chart-bar-container";

        const bar = document.createElement("div");
        bar.className = "chart-bar";
        // scale bar width proportionaly, highest day gets 100% width
        const percentage = (amount / maxValue) * 100;
        bar.style.width = `${percentage}%`;

        barContainer.appendChild(bar);
        const value = document.createElement("div");
        // show numeric values for each day nest to the bar
        value.className = "chart-value";
        value.textContent = `${amount.toFixed(2)} ${currency}`;
        row.appendChild(label);
        row.appendChild(barContainer);
        row.appendChild(value);

        trendContainer.appendChild(row);
    });
}


// create table row element for a transaction
function createRow(transaction, highlightRegex = null) {
    function highlight(text) {
        if (!highlightRegex) return text;
         // highlight search matches in table 
        return String(text).replace(highlightRegex, match => `<mark>${match}</mark>`);
    }

    const tr = document.createElement("tr");
    const currency = getDisplayCurrency();
    const rates = getRates();
    let displayAmount = parseFloat(transaction.amount);

    // if selected currency is not 'USD' convert amounts field to selected currency
    if (currency !== "USD") {
        displayAmount = displayAmount * rates[currency];
    }

    // insert the transaction table rows
    tr.innerHTML = `
        <td data-label="Description" >${highlight(transaction.description)}</td>
        <td data-label="Amount">${highlight(displayAmount.toFixed(2) + " " + currency)}</td>
        <td data-label="Category">${highlight(transaction.category)}</td>
        <td data-label="Date">${highlight(transaction.date)}</td>
        <td data-label="Actions">
            <button class="edit-btn" data-id="${transaction.id}" >Edit</button>
            <button class="delete-btn" data-id="${transaction.id}">Delete</button>
        </td>
    `;
    return tr;
}

// sorting state key
let currentSort = { key: "", ascending: true };

//handles sorting of numbers, dates, and strings
function sortTransactions(transactions, key) {
    // save clone of the records not mutate with the sate
    let sorted = [...transactions];

    sorted.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        // convert types for proper comparison
        if (key === "amount") {
            valA = parseFloat(valA);
            valB = parseFloat(valB);
        }
        if (key === "date") {
            valA = new Date(valA);
            valB = new Date(valB);
        } else if (typeof valA === "string" && typeof valB === "string") {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }


        if (valA < valB) return currentSort.ascending ? -1 : 1;
        if (valA > valB) return currentSort.ascending ? 1 : -1;
        return 0;
    });

    return sorted;
}


// render all transactions in the table
export function renderTransactions(transactionsArray, highlightRegex = null) {
    if (currentSort.key) {
        transactionsArray = sortTransactions(transactionsArray, currentSort.key);
    }
    recordsBody.innerHTML = "";
    transactionsArray.forEach(transaction => {
        const tr = createRow(transaction, highlightRegex);
        recordsBody.appendChild(tr);
    });
}

// initialize table and dashboard
renderTransactions(getTransactions());
updateDashboard();


// handle clicks in the table for edit and delete buttons
recordsBody.addEventListener("click", function (event) {
    const target = event.target;
    if (target.classList.contains("delete-btn")) {
        const id = target.dataset.id;
        const confirmDelete = confirm("Are you sure you want to delete this transaction?");
        // if user does not confirm to delete, cancel it
        if (!confirmDelete) return;
        // if confirmed, delete
        deleteTransaction(id);

        // if search is currently active, reapply it; else refresh table fully
        const searchInput = document.getElementById("search");
        if (searchInput && searchInput.value.trim() !== "") {
            searchInput.dispatchEvent(new Event('input'));
        } else {
            renderTransactions(getTransactions());
        }

        // update the dashboard
        updateDashboard();
        return;
    }

    // edit
    if (target.classList.contains("edit-btn")) {
        const id = target.dataset.id;
        const transactionToEdit = getTransactions().find(txn => txn.id === id);
        if (!transactionToEdit) return;
        // when edit is clicked
        // refill the form with transaction details for editing
        descriptionInput.value = transactionToEdit.description;
        amountInput.value = transactionToEdit.amount;
        dateInput.value = transactionToEdit.date;

        if (categoryInput.querySelector(`option[value="${transactionToEdit.category}"]`)) {
            categoryInput.value = transactionToEdit.category;
            otherCategoryInput.style.display = "none";
            otherCategoryInput.disabled = true;
        } else {
            categoryInput.value = "Other";
            otherCategoryInput.style.display = "block";
            otherCategoryInput.disabled = false;
            otherCategoryInput.value = transactionToEdit.category;
        }

        // mark edit mode and track which transaction is being edited
        isEditMode = true;
        editTransactionId = id;
        updateFormHeading();

        // when 'edit' button is clicked, automatically switch section to 'for'
        window.location.hash = "#add-transaction";
        updateView("#add-transaction"); 
    }
});


// Update which main section is visible based on the URL hash
function updateView(hash) {
    // hide all sections first
    const pages = document.querySelectorAll("main > section");
    
    pages.forEach(page => page.style.display = "none");

    // determine which section to show; default to "about" if hash is empty
    const targetId = hash.replace("#", "") || "about";
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
        targetSection.style.display = "block";
    }
}


// store last visible section to properly handle unsaved edits
let lastHash = window.location.hash || "#about";


// listen for URL hash changes 
window.addEventListener("hashchange", () => {
    const newHash = window.location.hash;

    // if editing a transaction, warn the user before navigating away
    if (isEditMode) {
        if (newHash === "#add-transaction") {
            lastHash = newHash;
            return;
        }

        const confirmDiscard = confirm("You have unsaved changes. Do you want to discard them?");
        
         // the user discards edits; reset form and clear error messages
        if (confirmDiscard) {
            isEditMode = false;
            editTransactionId = null;
            updateFormHeading();
            form.reset();
            otherCategoryInput.style.display = "none";
            otherCategoryInput.disabled = true;
            descriptionError.textContent = "";
            amountError.textContent = "";
            categoryError.textContent = "";
            dateError.textContent = "";

            updateView(newHash);
            lastHash = newHash;

        } else {
            // if the user cancels navigation; revert to previous hash
            history.pushState(null, "", lastHash); 
            updateView(lastHash);
            return; 
        }
    } else {

        // if not editing, just update view normally
        updateView(newHash);
        lastHash = newHash;
    }
    if (newHash === "#add-transaction" && !isEditMode) {
        updateFormHeading();
    }
});

// make table headers sortable using both mouse and keyboard
const arrows = document.querySelectorAll(".sort-arrow");
arrows.forEach(arrow => {

    // make arrow focusable for keyboard users
    arrow.setAttribute("tabindex", "0");
    const sortHandler = () => {
        const key = arrow.dataset.sort;

        // if same column clicked, toggle sort direction , else default to ascending
        currentSort.ascending = currentSort.key === key ? !currentSort.ascending : true;
        currentSort.key = key;

        // reset all arrow states before applying new sort
        arrows.forEach(a => {
            a.classList.remove("asc", "desc");

            const field = a.dataset.sort;
            if (field === "description" || field === "category") {
                a.textContent = "A↕Z";
            } else {
                a.textContent = "⇅";
            }

            a.removeAttribute("aria-sort");
        });

        arrow.classList.add(currentSort.ascending ? "asc" : "desc");

        // update arrow text to reflect sort order
        if (key === "description" || key === "category") {
            arrow.textContent = currentSort.ascending ? "A→Z" : "Z→A";
        } else {
            arrow.textContent = currentSort.ascending ? "↑" : "↓";
        }

        arrow.setAttribute(
            "aria-sort",
            currentSort.ascending ? "ascending" : "descending"
        );

         // if user is searching, reapply filter after sort
        const searchInput = document.getElementById("search");
        if (searchInput && searchInput.value.trim() !== "") {
            searchInput.dispatchEvent(new Event("input"));
        } else {
            renderTransactions(getTransactions());
        }
    };

    arrow.addEventListener("click", sortHandler);

    arrow.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            sortHandler();
        }
    });
});



// export transaction records as json file
exportBtn.addEventListener("click", function () {
    const transactions = getTransactions();

    if (transactions.length === 0) {
        alert("No transactions to export.");
        return;
    }
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.href = url;
    link.download = `finance_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

// validate and add imported transactions to the system
function validateAndProcessData(importedData, sourceName = "File") {
    try {
        // check if the data is an array
        if (!Array.isArray(importedData)) {
            throw new Error("Invalid format: Data must be an array.");
        }

        // madatory keys required in every transaction
        const mandatoryKeys = ['description', 'amount', 'category', 'date'];
        // allowed keys in a transaction
        const allAllowedKeys = ['description', 'amount', 'category', 'date', 'id', 'createdAt', 'updatedAt'];
        const today = new Date().toISOString().split('T')[0];
        const descRegex = /^[A-Za-z\s-]+$/;
        const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;


        // Loop through each transaction to validate
        for (let i = 0; i < importedData.length; i++) {
            const txn = importedData[i];
            const txnKeys = Object.keys(txn);

            // check if it has all the mandatory keys and are not empty
            const hasMandatory = mandatoryKeys.every(key => txn.hasOwnProperty(key) && String(txn[key]).trim() !== "");

            // Check that there are no extra or invalid keys
            const hasNoExtras = txnKeys.every(key => allAllowedKeys.includes(key));

            //validate each field

            if (!hasMandatory || !hasNoExtras) {
                throw new Error(`${sourceName} item ${i + 1} has invalid structure or empty fields.`);
            }

            if (!descRegex.test(txn.category)) {
                throw new Error(`${sourceName} item ${i + 1}: catagory can only contain letters, spaces, or hyphens.`);
            }

            const numAmount = parseFloat(txn.amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                throw new Error(`${sourceName} item ${i + 1}: Amount must be a positive number.`);
            }

            if (txn.date > today) {
                throw new Error(`${sourceName} item ${i + 1}: Date cannot be in the future.`);
            }
            if (!dateRegex.test(txn.date)) {
                throw new Error(`${sourceName} item ${i + 1}: Date must be in yyyy/mm/dd format.`);
            }
        }

        // Ask the user to confirm import
        if (confirm(`Importing ${importedData.length} transactions from ${sourceName}. Continue?`)) {
            // catch timestamp for createdAt and updatedAt
            const now = new Date().toISOString();

             // Add each transaction to the system with unique ID
            importedData.forEach(txn => {
                addTransaction({
                    description: txn.description.trim(),
                    amount: parseFloat(txn.amount).toFixed(2),
                    category: txn.category.trim(),
                    date: txn.date,
                    id: 'txn_' + Date.now() + Math.floor(Math.random() * 1000),
                    createdAt: now,
                    updatedAt: now
                });
            });

             // Re-render transactions and dashboard after the import
            renderTransactions(getTransactions());
            updateDashboard();
            alert("Import successful!");
        }
    } catch (error) {
        alert(`Import Failed: ${error.message}`);
    }
}

// Listen for file selection
importInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    // Read file content as a text
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            // Parse JSON, validate and add transactions to the system
            validateAndProcessData(JSON.parse(e.target.result), "Uploaded File");
        } catch (err) { alert("Invalid JSON file."); }
        importInput.value = "";
    };
    reader.readAsText(file);
});

// Load predefined sample transactions from seed.json
loadSampleBtn.addEventListener("click", function() {
    fetch('./seed.json')

        // if file is not found or server returns an error display error message
        .then(response => {
            if (!response.ok) throw new Error("Could not find seed.json in the root folder.");
            // Convert response body into usable JavaScript object
            return response.json();
        })
        .then(data => {

            // perform validation on the parsed object
            validateAndProcessData(data, "Sample Data");
        })
        .catch(error => {
            // log the error for future debuging
            console.error(error);
            alert("Error loading sample data: " + error.message);
        });
});
