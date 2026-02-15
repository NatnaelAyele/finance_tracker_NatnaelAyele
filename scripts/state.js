import { loadTransactions, saveTransactions,loadBudgetFromStorage, saveBudgetToStorage, loadRates, saveRates, loadDisplayCurrency, saveDisplayCurrency  } from './storage.js';

let transactions = loadTransactions();
let budgetCap = loadBudgetFromStorage();

let rates = loadRates();
let displayCurrency = loadDisplayCurrency();



export function getTransactions() {
    return transactions;
}

export function getBudget() {
    return budgetCap;
}

export function setBudget(amount) {
    budgetCap = amount;
    saveBudgetToStorage(amount);
}



export function addTransaction(transaction) {
    transactions.push(transaction);
    saveTransactions(transactions);
}


export function updateTransaction(id, updatedTransaction) {

    let indexFound = -1;

    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id === id) {
            indexFound = i;
            break;
        }
    }

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

        transactions[indexFound].updatedAt = new Date().toISOString();

        saveTransactions(transactions);
    }
}


export function deleteTransaction(id) {

    let newTransactions = [];

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


export function getRates() {
    return rates;
}

export function setRates(newRates) {
    rates = newRates;
    saveRates(newRates);
}

export function getDisplayCurrency() {
    return displayCurrency;
}

export function setDisplayCurrency(currency) {
    displayCurrency = currency;
    saveDisplayCurrency(currency);
}

