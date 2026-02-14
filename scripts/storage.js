const STORAGE_KEY = "finance:transactions";

export function loadTransactions() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}



export function saveBudgetToStorage(amount) {
    localStorage.setItem('finance_budget', amount);
}

export function loadBudgetFromStorage() {
    const stored = localStorage.getItem('finance_budget');
    return stored ? parseFloat(stored) : null;
}