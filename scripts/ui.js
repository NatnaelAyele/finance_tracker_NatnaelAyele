import { validateTransaction } from './validators.js';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from './state.js';

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

function createRow(transaction, highlightRegex = null) {
    function highlight(text) {
        if (!highlightRegex) return text;
        return String(text).replace(highlightRegex, match => `<mark>${match}</mark>`);
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${highlight(transaction.description)}</td>
        <td>${highlight(transaction.amount)}</td>
        <td>${highlight(transaction.category)}</td>
        <td>${highlight(transaction.date)}</td>
        <td>
            <button class="edit-btn" data-id="${transaction.id}">Edit</button>
            <button class="delete-btn" data-id="${transaction.id}">Delete</button>
        </td>
    `;
    return tr;
}

export function renderTransactions(transactionsArray, highlightRegex = null) {
    recordsBody.innerHTML = "";
    transactionsArray.forEach(transaction => {
        const tr = createRow(transaction, highlightRegex);
        recordsBody.appendChild(tr);
    });
}

renderTransactions(getTransactions());

recordsBody.addEventListener("click", function (event) {
    const target = event.target;
    if (target.classList.contains("delete-btn")) {
        const id = target.dataset.id;
        const confirmDelete = confirm("Are you sure you want to delete this transaction?");
        if (!confirmDelete) return;

        deleteTransaction(id);
        renderTransactions(getTransactions());
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
        }

        if (valA < valB) return currentSort.ascending ? -1 : 1;
        if (valA > valB) return currentSort.ascending ? 1 : -1;
        return 0;
    });

    return sorted;
}

const arrows = document.querySelectorAll(".sort-arrow");
arrows.forEach(arrow => {
    arrow.addEventListener("click", function () {
        const key = arrow.dataset.sort;
        currentSort.ascending = currentSort.key === key ? !currentSort.ascending : true;
        currentSort.key = key;

        renderTransactions(sortTransactions(getTransactions(), key));

        arrows.forEach(a => a.classList.remove("asc", "desc"));
        arrow.classList.add(currentSort.ascending ? "asc" : "desc");
    });
});
