import { loadTransactions, saveTransactions } from './storage.js';

let transactions = loadTransactions();

export function getTransactions() {
    return transactions;
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

        // Update each field manually
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
