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


const RATE_KEY = "finance:rates";
const DISPLAY_CURRENCY_KEY = "finance:displayCurrency";

export function saveRates(rates) {
    localStorage.setItem(RATE_KEY, JSON.stringify(rates));
}

export function loadRates() {

    const data = localStorage.getItem(RATE_KEY);

    if (data !== null) {
        const parsedData = JSON.parse(data);
        return parsedData;
    } else {
        const defaultRates = { EUR: 0.8, RWF: 1450.8 };
        return defaultRates;
    }
}


export function saveDisplayCurrency(currency) {
    localStorage.setItem(DISPLAY_CURRENCY_KEY, currency);
}

export function loadDisplayCurrency() {
    return localStorage.getItem(DISPLAY_CURRENCY_KEY) || "USD";
}
