import { validateTransaction } from './validators.js';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, getBudget, setBudget,  getRates, setRates, getDisplayCurrency, setDisplayCurrency } from './state.js';

if (window.location.hash === "") {
    window.location.hash = "#about";
}

const form = document.querySelector("form");

const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category-select");
const otherCategoryInput = document.getElementById("other-category");
const dateInput = document.getElementById("date");

const descriptionError = document.getElementById("description-error");
const amountError = document.getElementById("amount-error");
const categoryError = document.getElementById("category-error");
const dateError = document.getElementById("date-error");
const exportBtn = document.getElementById("export-json");
const importInput = document.getElementById("import-json");
const loadSampleBtn = document.getElementById("import-sample");


let isEditMode = false;
let editTransactionId = null;

function updateFormHeading() {
    const heading = document.getElementById("form-heading");
    heading.textContent = isEditMode ? "Edit Transaction" : "Add Transaction";
}

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

function showError(inputElement, errorElement, message) {
    if (message !== "") {
        inputElement.classList.add("error");
        errorElement.textContent = message;
    } else {
        inputElement.classList.remove("error");
        errorElement.textContent = "";
    }
}

function generateId() {
    return 'txn_' + Date.now();
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    let categoryValue = categoryInput.value;
    if (categoryValue === "Other") categoryValue = otherCategoryInput.value.trim();

    let transaction = {
        description: descriptionInput.value,
        amount: amountInput.value.trim(),
        category: categoryValue,
        date: dateInput.value.trim(),
        updatedAt: new Date().toISOString()
    };

    let errors = validateTransaction(transaction);

    showError(descriptionInput, descriptionError, errors.description);
    showError(amountInput, amountError, errors.amount);

    let categoryField = categoryInput.value === "Other" ? otherCategoryInput : categoryInput;
    showError(categoryField, categoryError, errors.category);
    showError(dateInput, dateError, errors.date);

    if (errors.description || errors.amount || errors.category || errors.date) return;

    if (isEditMode && editTransactionId) {
        const updatedTransaction = {
            ...transaction,
            id: editTransactionId,
            createdAt: getTransactions().find(txn => txn.id === editTransactionId).createdAt
        };
        updateTransaction(editTransactionId, updatedTransaction);
        isEditMode = false;
        editTransactionId = null;
    } else {
        transaction.id = generateId();
        transaction.createdAt = new Date().toISOString();
        addTransaction(transaction);
    }

    renderTransactions(getTransactions());
    updateDashboard();


    form.reset();
    otherCategoryInput.style.display = "none";
    otherCategoryInput.disabled = true;

    descriptionError.textContent = "";
    amountError.textContent = "";
    categoryError.textContent = "";
    dateError.textContent = "";

    updateFormHeading();
});

const recordsBody = document.getElementById("records-body");  
const totalCountEl = document.getElementById("total-count");
const totalSpentEl = document.getElementById("total-spent");
const topCategoryEl = document.getElementById("top-category");
const budgetCapInput = document.getElementById("budget-cap");
const budgetStatusEl = document.getElementById("budget-status");
const budgetValueEl = document.getElementById("budget-value");


const saveBudgetBtn = document.getElementById("save-budget");



const rateEurInput = document.getElementById("rate-eur");
const rateRwfInput = document.getElementById("rate-rwf");
const saveRateBtn = document.getElementById("save-rate");

const currencySelect = document.querySelector("#currency-select select");
const currentRates = getRates();
rateEurInput.value = currentRates.EUR;
rateRwfInput.value = currentRates.RWF;

currencySelect.value = getDisplayCurrency();

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

currencySelect.addEventListener("change", function () {
    setDisplayCurrency(currencySelect.value);
    updateDashboard();
    renderTransactions(getTransactions());
});


const savedBudget = getBudget();
if (savedBudget !== null && !isNaN(savedBudget)) {
    budgetCapInput.value = savedBudget;
}

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

function updateDashboard() {
    const transactions = getTransactions();

    totalCountEl.textContent = transactions.length;

    let total = 0;
    for (let i = 0; i < transactions.length; i++) {
        total += parseFloat(transactions[i].amount);
    }

    const currency = getDisplayCurrency();
    const rates = getRates();

    let convertedTotal = total;

    if (currency !== "USD") {
        convertedTotal = total * rates[currency];
    }

    totalSpentEl.textContent = convertedTotal.toFixed(2) + " " + currency;

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

    renderTrendChart();
}

function renderTrendChart() {
    const trendContainer = document.getElementById("trend-chart");
    if (!trendContainer) return;
    const transactions = getTransactions();
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

    Object.entries(totalsByDate).forEach(([date, amount]) => {
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
        const percentage = (amount / maxValue) * 100;
        bar.style.width = `${percentage}%`;

        barContainer.appendChild(bar);
        const value = document.createElement("div");
        value.className = "chart-value";
        value.textContent = `${amount.toFixed(2)} ${currency}`;
        row.appendChild(label);
        row.appendChild(barContainer);
        row.appendChild(value);

        trendContainer.appendChild(row);
    });
}



function createRow(transaction, highlightRegex = null) {
    function highlight(text) {
        if (!highlightRegex) return text;
        return String(text).replace(highlightRegex, match => `<mark>${match}</mark>`);
    }

    const tr = document.createElement("tr");
    const currency = getDisplayCurrency();
    const rates = getRates();
    let displayAmount = parseFloat(transaction.amount);

    if (currency !== "USD") {
        displayAmount = displayAmount * rates[currency];
    }

    tr.innerHTML = `
        <td data-label="Description" class="tdata">${highlight(transaction.description)}</td>
        <td data-label="Amount" class="tdata">${highlight(displayAmount.toFixed(2) + " " + currency)}</td>
        <td data-label="Category" class="tdata">${highlight(transaction.category)}</td>
        <td data-label="Date" class="tdata">${highlight(transaction.date)}</td>
        <td>
            <button class="edit-btn" data-id="${transaction.id}" data-label="Actions">Edit</button>
            <button class="delete-btn" data-id="${transaction.id}" data-label="Actions">Delete</button>
        </td>
    `;
    return tr;
}

let currentSort = { key: "", ascending: true };

function sortTransactions(transactions, key) {
    let sorted = [...transactions];

    sorted.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

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

renderTransactions(getTransactions());
updateDashboard();

recordsBody.addEventListener("click", function (event) {
    const target = event.target;
    if (target.classList.contains("delete-btn")) {
        const id = target.dataset.id;
        const confirmDelete = confirm("Are you sure you want to delete this transaction?");
        if (!confirmDelete) return;

        deleteTransaction(id);
        const searchInput = document.getElementById("search");
        
        if (searchInput && searchInput.value.trim() !== "") {
            searchInput.dispatchEvent(new Event('input'));
        } else {
            renderTransactions(getTransactions());
        }

        updateDashboard();
        return;
    }

    if (target.classList.contains("edit-btn")) {
        const id = target.dataset.id;
        const transactionToEdit = getTransactions().find(txn => txn.id === id);
        if (!transactionToEdit) return;

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

        isEditMode = true;
        editTransactionId = id;
        updateFormHeading();

        window.location.hash = "#add-transaction";

        updateView("#add-transaction"); 
    }
});

function updateView(hash) {

    const pages = document.querySelectorAll("main > section");
    
    pages.forEach(page => page.style.display = "none");

    const targetId = hash.replace("#", "") || "about";
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
        targetSection.style.display = "block";
    }
}

let lastHash = window.location.hash || "#about";

window.addEventListener("hashchange", () => {
    const newHash = window.location.hash;

    if (isEditMode) {
        if (newHash === "#add-transaction") {
            lastHash = newHash;
            return;
        }

        const confirmDiscard = confirm("You have unsaved changes. Do you want to discard them?");
        
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

            history.pushState(null, "", lastHash); 
            updateView(lastHash);
            return; 
        }
    } else {

        updateView(newHash);
        lastHash = newHash;
    }

    if (newHash === "#add-transaction" && !isEditMode) {
        updateFormHeading();
    }
});

const arrows = document.querySelectorAll(".sort-arrow");
arrows.forEach(arrow => {
    arrow.addEventListener("click", function () {
        const key = arrow.dataset.sort;
        currentSort.ascending = currentSort.key === key ? !currentSort.ascending : true;
        currentSort.key = key;
        arrows.forEach(a => a.classList.remove("asc", "desc"));
        arrow.classList.add(currentSort.ascending ? "asc" : "desc");

        const searchInput = document.getElementById("search");
        if (searchInput && searchInput.value.trim() !== "") {
            searchInput.dispatchEvent(new Event('input'));
        } else {
            renderTransactions(getTransactions());
        }
    });
});


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

function validateAndProcessData(importedData, sourceName = "File") {
    try {
        if (!Array.isArray(importedData)) {
            throw new Error("Invalid format: Data must be an array.");
        }

        const mandatoryKeys = ['description', 'amount', 'category', 'date'];
        const allAllowedKeys = ['description', 'amount', 'category', 'date', 'id', 'createdAt', 'updatedAt'];
        const today = new Date().toISOString().split('T')[0];
        const descRegex = /^[A-Za-z\s-]+$/;

        for (let i = 0; i < importedData.length; i++) {
            const txn = importedData[i];
            const txnKeys = Object.keys(txn);

            const hasMandatory = mandatoryKeys.every(key => txn.hasOwnProperty(key) && String(txn[key]).trim() !== "");
            const hasNoExtras = txnKeys.every(key => allAllowedKeys.includes(key));

            if (!hasMandatory || !hasNoExtras) {
                throw new Error(`${sourceName} item ${i + 1} has invalid structure or empty fields.`);
            }

            if (!descRegex.test(txn.description)) {
                throw new Error(`${sourceName} item ${i + 1}: Description can only contain letters, spaces, or hyphens.`);
            }

            const numAmount = parseFloat(txn.amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                throw new Error(`${sourceName} item ${i + 1}: Amount must be a positive number.`);
            }

            if (txn.date > today) {
                throw new Error(`${sourceName} item ${i + 1}: Date cannot be in the future.`);
            }
        }

        if (confirm(`Importing ${importedData.length} transactions from ${sourceName}. Continue?`)) {
            const now = new Date().toISOString();
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

            renderTransactions(getTransactions());
            updateDashboard();
            alert("Import successful!");
        }
    } catch (error) {
        alert(`Import Failed: ${error.message}`);
    }
}

importInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            validateAndProcessData(JSON.parse(e.target.result), "Uploaded File");
        } catch (err) { alert("Invalid JSON file."); }
        importInput.value = "";
    };
    reader.readAsText(file);
});

loadSampleBtn.addEventListener("click", function() {
    fetch('./seed.json')
        .then(response => {
            if (!response.ok) throw new Error("Could not find seed.json in the root folder.");
            return response.json();
        })
        .then(data => {
            validateAndProcessData(data, "Sample Data");
        })
        .catch(error => {
            console.error(error);
            alert("Error loading sample data: " + error.message);
        });
});
