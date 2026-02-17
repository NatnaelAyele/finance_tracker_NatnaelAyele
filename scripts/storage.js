// storage key to store transactions in local storage
const STORAGE_KEY = "finance:transactions";


// retrieve all transacrion from local storage
export function loadTransactions() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// save transactions to local storage
export function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}


// saves budget inserted by the user
export function saveBudgetToStorage(amount) {
    localStorage.setItem('finance_budget', amount);
}


// load saved budget
// if no budget is set returns null
export function loadBudgetFromStorage() {
    const stored = localStorage.getItem('finance_budget');
    return stored ? parseFloat(stored) : null;
}


// keys for currency rates, and user selected currency type
const RATE_KEY = "finance:rates";
const DISPLAY_CURRENCY_KEY = "finance:displayCurrency";


// stores currency rates
export function saveRates(rates) {
    localStorage.setItem(RATE_KEY, JSON.stringify(rates));
}


// loads saved currency rates
export function loadRates() {

    const data = localStorage.getItem(RATE_KEY);

    if (data !== null) {
        const parsedData = JSON.parse(data);
        return parsedData;
    } else {
        // set default rates
        const defaultRates = { EUR: 0.8, RWF: 1450.8 };
        return defaultRates;
    }
}


// save the currency selected by the user
export function saveDisplayCurrency(currency) {
    localStorage.setItem(DISPLAY_CURRENCY_KEY, currency);
}

// load the saved currency
// if nothing is saved uses 'USD' as default
export function loadDisplayCurrency() {
    return localStorage.getItem(DISPLAY_CURRENCY_KEY) || "USD";
}
