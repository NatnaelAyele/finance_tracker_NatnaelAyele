import {
    validateDescription,
    validateAmount,
    validateDate,
    validateCategory,
    validateTransaction
} from './validators.js';

const resultsContainerDiv = document.getElementById("results");

function printTestResult(testNameText, testPassedValue) {

    const paragraphElement = document.createElement("p");

    if (testPassedValue === true) {
        paragraphElement.textContent = testNameText + " -> PASSED";
    } else {
        paragraphElement.textContent = testNameText + " -> FAILED";
    }

    resultsContainerDiv.appendChild(paragraphElement);
}

let descriptionTestResult1 = validateDescription("");
let descriptionTestCheck1 = false;

if (descriptionTestResult1 === "Description is required.") {
    descriptionTestCheck1 = true;
}

printTestResult("Description required", descriptionTestCheck1);


let descriptionTestResult2 = validateDescription(" Coffee");
let descriptionTestCheck2 = false;

if (descriptionTestResult2 === "Description cannot start or end with spaces.") {
    descriptionTestCheck2 = true;
}

printTestResult("Description no leading space", descriptionTestCheck2);


let descriptionTestResult3 = validateDescription("Coffee ");
let descriptionTestCheck3 = false;

if (descriptionTestResult3 === "Description cannot start or end with spaces.") {
    descriptionTestCheck3 = true;
}

printTestResult("Description no trailing space", descriptionTestCheck3);


let descriptionTestResult4 = validateDescription("coffee coffee");
let descriptionTestCheck4 = false;

if (descriptionTestResult4 === "Description contains duplicate words.") {
    descriptionTestCheck4 = true;
}

printTestResult("Description no duplicate words", descriptionTestCheck4);


let descriptionTestResult5 = validateDescription("Morning coffee");
let descriptionTestCheck5 = false;

if (descriptionTestResult5 === "") {
    descriptionTestCheck5 = true;
}

printTestResult("Description valid", descriptionTestCheck5);

let amountTestResult1 = validateAmount("");
let amountTestCheck1 = false;

if (amountTestResult1 === "Amount is required.") {
    amountTestCheck1 = true;
}

printTestResult("Amount required", amountTestCheck1);


let amountTestResult2 = validateAmount("25");
let amountTestCheck2 = false;

if (amountTestResult2 === "") {
    amountTestCheck2 = true;
}

printTestResult("Amount valid integer", amountTestCheck2);


let amountTestResult3 = validateAmount("25.50");
let amountTestCheck3 = false;

if (amountTestResult3 === "") {
    amountTestCheck3 = true;
}

printTestResult("Amount valid decimal", amountTestCheck3);


let amountTestResult4 = validateAmount("25.555");
let amountTestCheck4 = false;

if (amountTestResult4 === "Amount must be a number (max 2 decimals).") {
    amountTestCheck4 = true;
}

printTestResult("Amount invalid 3 decimals", amountTestCheck4);


let amountTestResult5 = validateAmount("abc");
let amountTestCheck5 = false;

if (amountTestResult5 === "Amount must be a number (max 2 decimals).") {
    amountTestCheck5 = true;
}

printTestResult("Amount invalid letters", amountTestCheck5);

let dateTestResult1 = validateDate("");
let dateTestCheck1 = false;

if (dateTestResult1 === "Date is required.") {
    dateTestCheck1 = true;
}
printTestResult("Date required", dateTestCheck1);


let dateTestResult2 = validateDate("2025-06-01");
let dateTestCheck2 = false;

if (dateTestResult2 === "") {
    dateTestCheck2 = true;
}
printTestResult("Date valid past", dateTestCheck2);

const todayStr = new Date().toISOString().split('T')[0];
let dateTestResult3 = validateDate(todayStr);
let dateTestCheck3 = false;

if (dateTestResult3 === "") {
    dateTestCheck3 = true;
}
printTestResult("Date valid today", dateTestCheck3);

let dateTestResult4 = validateDate("01-06-2025");
let dateTestCheck4 = false;

if (dateTestResult4 === "Date must be in YYYY-MM-DD format.") {
    dateTestCheck4 = true;
}
printTestResult("Date invalid format", dateTestCheck4);

const future = new Date();
future.setDate(future.getDate() + 1);
const futureStr = future.toISOString().split('T')[0];

let dateTestResult5 = validateDate(futureStr);
let dateTestCheck5 = false;

if (dateTestResult5 === "Date cannot be in the future.") {
    dateTestCheck5 = true;
}
printTestResult("Date cannot be future", dateTestCheck5);

let categoryTestResult1 = validateCategory("");
let categoryTestCheck1 = false;

if (categoryTestResult1 === "Category is required.") {
    categoryTestCheck1 = true;
}

printTestResult("Category required", categoryTestCheck1);


let categoryTestResult2 = validateCategory("Food-Dining");
let categoryTestCheck2 = false;

if (categoryTestResult2 === "") {
    categoryTestCheck2 = true;
}

printTestResult("Category valid", categoryTestCheck2);


let categoryTestResult3 = validateCategory("Food123");
let categoryTestCheck3 = false;

if (categoryTestResult3 === "Category can only contain letters, spaces, or hyphens.") {
    categoryTestCheck3 = true;
}

printTestResult("Category invalid numbers", categoryTestCheck3);

let validTransactionObject = {
    description: "Lunch",
    amount: "15.50",
    category: "Food",
    date: "2025-06-01"
};

let fullTransactionErrorsResult = validateTransaction(validTransactionObject);

let isAllFieldsEmptyCheck = true;

if (fullTransactionErrorsResult.description !== "") {
    isAllFieldsEmptyCheck = false;
}

if (fullTransactionErrorsResult.amount !== "") {
    isAllFieldsEmptyCheck = false;
}

if (fullTransactionErrorsResult.category !== "") {
    isAllFieldsEmptyCheck = false;
}

if (fullTransactionErrorsResult.date !== "") {
    isAllFieldsEmptyCheck = false;
}

printTestResult("Full transaction valid", isAllFieldsEmptyCheck);