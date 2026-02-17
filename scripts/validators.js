//regular expressions used for validation
export const regex = {
    description: /^\S(?:.*\S)?$/,
    amount: /^(?:0\.(?:[1-9]\d?)|[1-9]\d*(?:\.\d{1,2})?)$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWords: /\b(\w+)\b\s+\b\1\b/

};

// Validates description field
export function validateDescription(desc) {

    // Check if description is empty or missing
    if (desc === "" || desc === null || desc === undefined) {
        return "Description is required.";
    }

    // Check if it starts or ends with spaces
    let hasNoSpacesAtEnds = regex.description.test(desc);
    if (hasNoSpacesAtEnds === false) {
        return "Description cannot start or end with spaces.";
    }

    // Check if there are duplicate words
    let hasDuplicate = regex.duplicateWords.test(desc);
    if (hasDuplicate === true) {
        return "Description contains duplicate words.";
    }

    return "";
}


// validate amount field
export function validateAmount(amount) {

    // check if amount is empty or missing
    if (amount === "" || amount === null || amount === undefined) {
        return "Amount is required.";
    }

    // check whether it matches the correct number format or not
    let isValidAmount = regex.amount.test(amount);
    if (isValidAmount === false) {
        return "Amount must be a number greater than zero (max 2 decimals).";
    }
    return "";
}

// validate date field

export function validateDate(date) {
    // check if date is empty or missing
    if (date === "" || date === null || date === undefined) {
        return "Date is required.";
    }

    // check whether it matches the correct date format from the regex or not
    let isValidDate = regex.date.test(date);
    if (isValidDate === false) {
        return "Date must be in YYYY-MM-DD format.";
    }

    let inputDate = new Date(date);
    let today = new Date();
    inputDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);

    // check if date inserted is in the future
    if (inputDate > today) {
        return "Date cannot be in the future.";
    }

    return "";
}


// validate catagory field
export function validateCategory(cat) {

    // check if catagory is empty or missing
    if (cat === "" || cat === null || cat === undefined) {
        return "Category is required.";
    }

    //  check if it contains something morethan letters, spaces, or hyphens
    let isValidCategory = regex.category.test(cat);
    if (isValidCategory === false) {
        return "Category can only contain letters, spaces, or hyphens.";
    }

    return "";
}

// validate the whole transaction object once
export function validateTransaction(data) {

    // Create an object to store all validation errors
    let errors = {};

     // Validate each field separately
    errors.description = validateDescription(data.description);
    errors.amount = validateAmount(data.amount);
    errors.category = validateCategory(data.category);
    errors.date = validateDate(data.date);

    return errors;
}
