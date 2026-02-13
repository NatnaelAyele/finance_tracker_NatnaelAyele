import { validateTransaction } from './validators.js';

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

form.addEventListener("submit", function (event) {

    event.preventDefault();

    let categoryValue = categoryInput.value;

    if (categoryValue === "Other") {
        categoryValue = otherCategoryInput.value.trim();
    }

    let transaction = {
        description: descriptionInput.value,
        amount: amountInput.value.trim(),
        category: categoryValue,
        date: dateInput.value.trim()
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

    console.log("Transaction valid:", transaction);

    form.reset();

    otherCategoryInput.style.display = "none";
    otherCategoryInput.disabled = true;

    descriptionError.textContent = "";
    amountError.textContent = "";
    categoryError.textContent = "";
    dateError.textContent = "";
});