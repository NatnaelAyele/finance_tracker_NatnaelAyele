# Student Finance Tracker

A **web-based application** for students to track their expenses, manage budgets, and analyze spending trends. Built with HTML, CSS, and JavaScript, featuring modular architecture, validation, and accessibility-focused design.

## Demo Link:
##  Live website:
##  Features


---

## 🎯 Chosen Theme
**Student Finance Tracker** – Manage personal budgets, add transactions, track spending, and visualize trends.  

---
## ⚡ Features
- Add, edit, and delete transactions.
- Sort transactions by **Description, Amount, Category, or Date**.
- Regex-based search with **case toggle** and accessible highlighting.
- Track total transactions, total spent, top category(Most frequent), and weekly trends.
- Manage **budget caps** with alerts when exceeding limit.
- **Currency conversion** between USD, EUR, and RWF.
- Import and export transactions as JSON.
- Modular code structure (`validators.js`, `ui.js`, `state.js`, `storage.js`, `search.js`).
- Fully responsive and accessible design with keyboard navigation.

---

## 🧩 Regex Catalog

| Field            | Regex Rule                               | Regex Expression                                         | Example (Valid)         | Example (Invalid)           |
|-----------------|-----------------------------------------|---------------------------------------------------------|-------------------------|-----------------------------|
| Description      | No leading/trailing spaces, no duplicate words | `/^\S(?:.*\S)?$/`                                       | `"Morning coffee"`      | `" Coffee"`, `"coffee coffee"` |
| Amount           | Number, max 2 decimals                    | `/^\d+(\.\d{1,2})?$/`                                  | `"25"`, `"25.50"`      | `"25.555"`, `"abc"`         |
| Date             | `YYYY-MM-DD` format, not future          | `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/`      | `"2025-06-01"`         | `"01-06-2025"`, `"2026-12-01"` |
| Category         | Letters, spaces, hyphens only            | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`                      | `"Food-Dining"`         | `"Food123"`                  |
| Duplicate Words  | Case-sensitive duplicate checking        | `/\b(\w+)\b\s+\b\1\b/`                                  | `"books books" matches` | `"Books books" passes`       |



**Search:** Regex patterns can be entered in the search box. Use the checkbox to toggle **case-insensitive** searches. Matches are highlighted in the table.

---

## ⌨️ Keyboard Map
| Key / Shortcut | Action |
|----------------|--------|
| `Tab`          | Navigate through form inputs, buttons, and links |
| `Shift + Tab`  | Navigate backward |
| `Enter`        | Activate focused button, link, or sort arrow (sorts the table by that column) |
| Skip link (`Skip to main content`) | Focus jumps directly to the main content |
| Arrow keys| Navigate up and down in the web page using tab + Enter (sorting only) |
| `Space`| Activate buttons (e.g., Save Transaction, Export/Import)  |

---

## 🔄 Import & Export Feature

Your data can be **exported** or **imported** in JSON format.

### Export
- Export all transactions to a JSON file.  
- Contains all transaction fields including optional `id`, `createdAt`, `updatedAt`.

### Import
- Import **sample data** or your **custom JSON**.

#### Rules for Custom JSON Import
1. **File format:** Must be valid JSON.  
2. **Mandatory keys per transaction:** `description`, `amount`, `category`, `date`  
3. **Optional keys:** `id`, `createdAt`, `updatedAt`  
4. **No extra keys:** Files with other keys will fail.  
5. **Field validation:**  
   - `description`: Leading/trailing spaces allowed; will be trimmed automatically.  
   - `amount`: Number > 0, max 2 decimals.  
   - `category`: Letters, spaces, hyphens only.  
   - `date`: Must be in `YYYY-MM-DD` format; future dates not allowed.  

Invalid transactions will cause the import to fail and notify which ones are invalid.

---

## ♿ Accessibility Notes
- All interactive elements have proper `aria-labels` and roles.
- Error messages and status updates use `aria-live="polite"` for screen readers.
- Skip links enable bypassing navigation to reach main content directly.
- Focus styles on inputs, buttons, and links are clearly visible.
- Color contrast passes WCAG AA standards.
- Semantic HTML structure with proper headings hierarchy (`<h1>` → `<h2>` → `<h3>`).

---

## 🧪 Running Tests

The app includes a set of automated validation tests to ensure that all transaction inputs follow the defined rules. These tests are written in JavaScript and are executed when opening `tests.html`.

### How it works

1. Open `tests.html` in a web browser.
2. The page automatically runs the code in `scripts/tests.js`.
3. Each test in `tests.js` calls the validation functions defined in `validators.js`:
   - `validateDescription()`
   - `validateAmount()`
   - `validateDate()`
   - `validateCategory()`
   - `validateTransaction()` (for checking all fields together)
4. The test script compares the returned messages from these validators with the expected results.
5. Each test prints a line in the `#results` div:
   - `"PASSED"` if the validation output matches the expected result.
   - `"FAILED"` if it doesn’t.
6. This provides a clear, real-time indication of which validations are working and which are not.

### Adding New Tests

To add new tests for additional validation rules or edge cases:

1. Open `scripts/tests.js`.
2. Use the existing test pattern:
```javascript
// Example: testing description validation for a leading space
let testResult = validateDescription(" Coffee");
let testPassed = testResult === "Description cannot start or end with spaces."; // check against expected message
printTestResult("Description leading space", testPassed);

// Example: testing a valid description
let testResult2 = validateDescription("Morning coffee");
let testPassed2 = testResult2 === ""; // empty string means valid
printTestResult("Description valid input", testPassed2);
```
3. For testing full transactions:
```
let transaction = {
    description: "Lunch",
    amount: "15.50",
    category: "Food",
    date: "2025-06-01"
};
let errors = validateTransaction(transaction);
let allPassed = !errors.description && !errors.amount && !errors.category && !errors.date;
printTestResult("Full transaction test", allPassed);
```

4. Save changes and refresh tests.html in your browser to see the updated test results.

💡 Note: Each test is isolated, so you can safely add new cases without affecting existing ones


---

## 🚀 How to Run
1. Clone the repository:
   ```bash
   git clone https://github.com/NatnaelAyele/student-finance-tracker.git
2. Open index.html in a browser.
3. Navigate through sections via navigation bar or skip link.
4. Add, edit, sort, search, and export/import transactions.
5. Monitor console for debugging (no errors expected).


📂 File Structure
```
/
├─ index.html
├─ styles/
│ └─ main.css
├─ scripts/
│ ├─ validators.js
│ ├─ ui.js
│ ├─ state.js
│ ├─ storage.js
│ ├─ search.js
│ └─ tests.js
├─ tests.html
├─ README.md
└─ seed.json
```

---
Author
---
Natnael Ayele n.eticha@alustudent.com
