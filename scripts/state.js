//Import required functions from storage.js to save and load data
import { loadTransactions, saveTransactions,loadBudgetFromStorage, saveBudgetToStorage, loadRates, saveRates, loadDisplayCurrency, saveDisplayCurrency  } from './storage.js';

// Load saved datas on start
let transactions = loadTransactions();
let budgetCap = loadBudgetFromStorage();
let rates = loadRates();
let displayCurrency = loadDisplayCurrency();


// return all transactions
export function getTransactions() {
    return transactions;
}

// return current setted budget
export function getBudget() {
    return budgetCap;
}


export function setBudget(amount) {
    budgetCap = amount;
    saveBudgetToStorage(amount);
}


// Add a new transaction to the list and save it
export function addTransaction(transaction) {
    transactions.push(transaction);
    saveTransactions(transactions);
}



// update transaction based on id
export function updateTransaction(id, updatedTransaction) {
    // Find the index of the transaction
    let indexFound = -1;
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id === id) {
            indexFound = i;
            break;
        }
    }

    // If transaction is found update the changed fields
    if (indexFound !== -1) {

        if (updatedTransaction.description !== undefined) {
            transactions[indexFound].description = updatedTransaction.description;
        }

        if (updatedTransaction.amount !== undefined) {
            transactions[indexFound].amount = updatedTransaction.amount;
        }

        if (updatedTransaction.category !== undefined) {
            transactions[indexFound].category = updatedTransaction.category;
        }

        if (updatedTransaction.date !== undefined) {
            transactions[indexFound].date = updatedTransaction.date;
        }

        // save the updated time
        transactions[indexFound].updatedAt = new Date().toISOString();

        // save the updated transaction
        saveTransactions(transactions);
    }
}



// delete transaction based on id
export function deleteTransaction(id) {

    let newTransactions = [];
    // Keep only transactions that do not match the id
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id !== id) {
            newTransactions.push(transactions[i]);
        }
    }

    transactions = newTransactions;

    saveTransactions(transactions);
}


export function clearTransactions() {
    transactions = [];
    saveTransactions(transactions);
}

// return saved currency rates
export function getRates() {
    return rates;
}

// Update exchange rates and save
export function setRates(newRates) {
    rates = newRates;
    saveRates(newRates);
}

// return currently selected currency
export function getDisplayCurrency() {
    return displayCurrency;
}

// update selected currency
export function setDisplayCurrency(currency) {
    displayCurrency = currency;
    saveDisplayCurrency(currency);
}

