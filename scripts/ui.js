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

    if (categoryValue === "Other") {
        categoryValue = otherCategoryInput.value.trim();
    }

    let transaction = {
        id: generateId(),
        description: descriptionInput.value,
        amount: amountInput.value.trim(),
        category: categoryValue,
        date: dateInput.value.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    let errors = validateTransaction(transaction);

    showError(descriptionInput, descriptionError, errors.description);
    showError(amountInput, amountError, errors.amount);

    let categoryField;

    if (categoryInput.value === "Other") {
        categoryField = otherCategoryInput;
    } else {
        categoryField = categoryInput;
    }

    showError(categoryField, categoryError, errors.category);

    showError(dateInput, dateError, errors.date);

    let hasErrors = false;

    if (errors.description !== "") {
        hasErrors = true;
    }

    if (errors.amount !== "") {
        hasErrors = true;
    }

    if (errors.category !== "") {
        hasErrors = true;
    }

    if (errors.date !== "") {
        hasErrors = true;
    }

    if (hasErrors === true) {
        return;
    }

    addTransaction(transaction);
    renderTransactions(getTransactions());

    form.reset();

    otherCategoryInput.style.display = "none";
    otherCategoryInput.disabled = true;

    descriptionError.textContent = "";
    amountError.textContent = "";
    categoryError.textContent = "";
    dateError.textContent = "";
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

function highlightMatch(text, regex) {
    if (!regex) return text;
    return String(text).replace(regex, match => `<mark>${match}</mark>`);
}

renderTransactions(getTransactions());

let currentSort = { key: "", ascending: true };

function sortTransactions(transactions, key) {

    let sorted = [];

    for (let i = 0; i < transactions.length; i++) {
        sorted.push(transactions[i]);
    }

    sorted.sort(function (a, b) {

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

        if (valA < valB) {
            if (currentSort.ascending === true) {
                return -1;
            } else {
                return 1;
            }
        }

        if (valA > valB) {
            if (currentSort.ascending === true) {
                return 1;
            } else {
                return -1;
            }
        }

        return 0;
    });

    return sorted;
}


const arrows = document.querySelectorAll(".sort-arrow");

for (let i = 0; i < arrows.length; i++) {

    let arrow = arrows[i];

    arrow.addEventListener("click", function () {

        let key = arrow.dataset.sort;

        if (currentSort.key === key) {

            if (currentSort.ascending === true) {
                currentSort.ascending = false;
            } else {
                currentSort.ascending = true;
            }

        } else {
            currentSort.key = key;
            currentSort.ascending = true;
        }

        let sorted = sortTransactions(getTransactions(), key);
        renderTransactions(sorted);

        for (let j = 0; j < arrows.length; j++) {
            arrows[j].classList.remove("asc");
            arrows[j].classList.remove("desc");
        }

        if (currentSort.ascending === true) {
            arrow.classList.add("asc");
        } else {
            arrow.classList.add("desc");
        }
    });
}
