export const regex = {
    description: /^\S(?:.*\S)?$/,
    amount: /^(?:0\.(?:[1-9]\d?)|[1-9]\d*(?:\.\d{1,2})?)$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWords: /\b(\w+)\b\s+\b\1\b/

};


export function validateDescription(desc) {

    if (desc === "" || desc === null || desc === undefined) {
        return "Description is required.";
    }

    let hasNoSpacesAtEnds = regex.description.test(desc);

    if (hasNoSpacesAtEnds === false) {
        return "Description cannot start or end with spaces.";
    }

    let hasDuplicate = regex.duplicateWords.test(desc);

    if (hasDuplicate === true) {
        return "Description contains duplicate words.";
    }

    return "";
}

export function validateAmount(amount) {

    if (amount === "" || amount === null || amount === undefined) {
        return "Amount is required.";
    }

    let isValidAmount = regex.amount.test(amount);

    if (isValidAmount === false) {
        return "Amount must be a number greater than zero (max 2 decimals).";
    }
    return "";
}

export function validateDate(date) {
    if (date === "" || date === null || date === undefined) {
        return "Date is required.";
    }

    let isValidDate = regex.date.test(date);

    if (isValidDate === false) {
        return "Date must be in YYYY-MM-DD format.";
    }
    let inputDate = new Date(date);
    let today = new Date();
    inputDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);

    if (inputDate > today) {
        return "Date cannot be in the future.";
    }

    return "";
}


export function validateCategory(cat) {

    if (cat === "" || cat === null || cat === undefined) {
        return "Category is required.";
    }

    let isValidCategory = regex.category.test(cat);

    if (isValidCategory === false) {
        return "Category can only contain letters, spaces, or hyphens.";
    }

    return "";
}

export function validateTransaction(data) {

    let errors = {};

    errors.description = validateDescription(data.description);
    errors.amount = validateAmount(data.amount);
    errors.category = validateCategory(data.category);
    errors.date = validateDate(data.date);

    return errors;
}
