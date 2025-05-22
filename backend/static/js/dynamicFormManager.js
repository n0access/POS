/**
 * Constants for common selectors
 */
const SELECTORS = {
    DYNAMIC_ROW: '.dynamic-row',
    REMOVE_BTN: 'remove-row-btn',
    UNIT_COST: 'unit_cost',
    UNIT_PRICE: 'unit_price',
    MARGIN_CELL: '.margin-cell',
};

/**
 * Main inventory manager script to handle dynamic row management,
 * margin calculations, form validation, and unsaved changes warnings.
 */

// Manage dynamic row addition and removal
function handleDynamicRows(config) {
    const {tableId, rowTemplateCallback, totalFormsFieldSelector} = config;
    const tableBody = document.querySelector(`#${tableId} tbody`);
    const totalFormsField = document.querySelector(totalFormsFieldSelector);

    if (!tableBody || !totalFormsField) {
        console.error(`handleDynamicRows: Table body or total forms field not found for tableId: ${tableId}`);
        return;
    }

    // Adds a new dynamic row
    const addNewRow = () => {
        const rowIndex = tableBody.querySelectorAll(SELECTORS.DYNAMIC_ROW).length;
        const newRowHtml = rowTemplateCallback(rowIndex);
        tableBody.insertAdjacentHTML('beforeend', newRowHtml);
        totalFormsField.value = rowIndex + 1;
        focusLastRowInput();
    };

    // Removes the clicked row
    const removeRow = (e) => {
        if (!e.target.classList.contains(SELECTORS.REMOVE_BTN)) return;

        const row = e.target.closest('tr');
        if (row) row.remove();
        totalFormsField.value = tableBody.querySelectorAll(SELECTORS.DYNAMIC_ROW).length;
    };

    // Focuses the last input in the new row
    const focusLastRowInput = () => {
        const lastInput = tableBody.querySelector('tr:last-child input');
        if (lastInput) lastInput.focus();
    };

    // Handles the 'Tab' key to dynamically add a new row
    const handleTabKey = (e) => {
        const activeElement = document.activeElement;
        const inputs = Array.from(tableBody.querySelectorAll("input"));
        const lastInput = inputs[inputs.length - 1];

        if (e.key === 'Tab' && activeElement === lastInput) {
            e.preventDefault();
            addNewRow();
        }
    };

    tableBody.addEventListener('keydown', handleTabKey);
    tableBody.addEventListener('click', removeRow);
}

// Calculate and update margins dynamically
function calculateMargins({tableId}) {
    const tableBody = document.querySelector(`#${tableId} tbody`);

    if (!tableBody) {
        console.error(`calculateMargins: Table body not found for tableId: ${tableId}`);
        return;
    }

    const updateMarginsOnInput = (event) => {
        const target = event.target;
        if (isCostOrPriceInput(target.name)) {
            const row = target.closest(SELECTORS.DYNAMIC_ROW);
            if (row) updateMargin(row);
        }
    };

    const isCostOrPriceInput = (name) => name.includes(SELECTORS.UNIT_COST) || name.includes(SELECTORS.UNIT_PRICE);

    const updateMargin = (row) => {
        const unitCost = parseFloat(getInputValue(row, SELECTORS.UNIT_COST)) || 0;
        const unitPrice = parseFloat(getInputValue(row, SELECTORS.UNIT_PRICE)) || 0;
        const marginCell = row.querySelector(SELECTORS.MARGIN_CELL);

        if (marginCell) {
            marginCell.textContent = calculateMargin(unitCost, unitPrice);
        }
    };

    const getInputValue = (row, suffix) => {
        const input = row.querySelector(`input[name$="${suffix}"]`);
        return input ? input.value : '';
    };

    const calculateMargin = (unitCost, unitPrice) => {
        if (unitPrice > 0 && unitPrice > unitCost) {
            return `${(((unitPrice - unitCost) / unitPrice) * 100).toFixed(2)}%`;
        }
        return 'N/A';
    };

    tableBody.addEventListener('input', updateMarginsOnInput);
}

// Validate form inputs before submission
function validateFormBeforeSubmit(formId) {
    const form = document.querySelector(formId);

    if (!form) {
        console.error(`validateFormBeforeSubmit: Form not found for formId: ${formId}`);
        return;
    }

    form.addEventListener('submit', (e) => {
        const rows = document.querySelectorAll(SELECTORS.DYNAMIC_ROW);
        let isFormValid = true;

        rows.forEach((row) => {
            const unitCostInput = row.querySelector(`input[name$="${SELECTORS.UNIT_COST}"]`);
            const unitPriceInput = row.querySelector(`input[name$="${SELECTORS.UNIT_PRICE}"]`);
            if (!unitCostInput || !unitPriceInput) return;

            const unitCost = parseFloat(unitCostInput.value) || 0;
            const unitPrice = parseFloat(unitPriceInput.value) || 0;

            if (unitCost <= 0 || unitPrice <= 0) {
                alert('Unit cost and unit price must be strictly positive.');
                isFormValid = false;
                unitCostInput.focus();
            } else if (unitCost >= unitPrice) {
                alert('Unit cost must be strictly less than unit price.');
                isFormValid = false;
                unitCostInput.focus();
            }
        });

        if (!isFormValid) {
            e.preventDefault();
        }
    });
}

// Warn users about unsaved changes
function warnOnUnsavedChanges(formId) {
    const form = document.querySelector(formId);

    if (!form) {
        console.error(`warnOnUnsavedChanges: Form not found for formId: ${formId}`);
        return;
    }

    let isFormDirty = false;

    form.addEventListener('change', () => {
        isFormDirty = true;
    });

    window.addEventListener('beforeunload', (event) => {
        if (isFormDirty) {
            event.preventDefault();
            event.returnValue = '';
        }
    });

    form.addEventListener('submit', () => {
        isFormDirty = false;
    });
}