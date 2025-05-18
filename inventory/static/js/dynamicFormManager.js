/**
 * Main inventory manager script to handle dynamic row management,
 * margin calculations, form validation, and unsaved changes warnings.
 */

// Function to handle dynamic row addition and removal
export function handleDynamicRows(config) {
    const { tableId, rowTemplateCallback, totalFormsFieldSelector } = config;
    const tableBody = document.querySelector(`#${tableId} tbody`);
    const totalFormsField = document.querySelector(totalFormsFieldSelector);

    if (!tableBody || !totalFormsField) {
        console.error(`Table or total forms field not found for ${tableId}`);
        return;
    }
    function addNewRow() {
        const formIdx = document.querySelectorAll(`#${tableId} .dynamic-row`).length;
        const newRowHtml = rowTemplateCallback(formIdx);
        tableBody.insertAdjacentHTML('beforeend', newRowHtml);
        totalFormsField.value = formIdx + 1;

        const newInput = tableBody.querySelector('tr:last-child input');
        if (newInput) newInput.focus();
    }

    tableBody.addEventListener('keydown', (e) => {
        const activeElement = document.activeElement;
        const inputs = Array.from(tableBody.querySelectorAll("input"));
        const lastInput = inputs[inputs.length - 1];

        if (e.key === 'Tab' && activeElement === lastInput) {
            e.preventDefault();
            addNewRow();
        }
    });

    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-row-btn')) {
            const row = e.target.closest('tr');
            row.remove();
            totalFormsField.value = document.querySelectorAll(`#${tableId} .dynamic-row`).length;
        }
    });
}

// Function to calculate and update margins dynamically
export function calculateMargins({ tableId }) {
    const tableBody = document.querySelector(`#${tableId} tbody`);

    if (!tableBody) return;

    tableBody.addEventListener('input', handleInput);

    function handleInput(event) {
        const target = event.target;
        if (isUnitCostOrPriceInput(target.name)) {
            updateMargin(target.closest('.dynamic-row'));
        }
    }

    function isUnitCostOrPriceInput(name) {
        return name.includes('unit_cost') || name.includes('unit_price');
    }

    function updateMargin(row) {
        const unitCost = parseFloat(getInputValue(row, 'unit_cost')) || 0;
        const unitPrice = parseFloat(getInputValue(row, 'unit_price')) || 0;
        const marginCell = row.querySelector('.margin-cell');

        if (marginCell) {
            marginCell.textContent = calculateMargin(unitCost, unitPrice);
        }
    }

    function getInputValue(row, inputNameSuffix) {
        return row.querySelector(`input[name$="${inputNameSuffix}"]`).value;
    }

    function calculateMargin(unitCost, unitPrice) {
        if (unitPrice > 0 && unitPrice > unitCost) {
            return `${(((unitPrice - unitCost) / unitPrice) * 100).toFixed(2)}%`;
        }
        return 'N/A';
    }
}

// Function to validate form inputs before submission
export function validateFormBeforeSubmit(formId) {
    const form = document.querySelector(formId);

    if (!form) return;

    form.addEventListener('submit', (e) => {
        const rows = document.querySelectorAll('.dynamic-row');
        let valid = true;

        rows.forEach((row) => {
            const unitCostInput = row.querySelector('input[name$="unit_cost"]');
            const unitPriceInput = row.querySelector('input[name$="unit_price"]');

            const unitCost = parseFloat(unitCostInput.value) || 0;
            const unitPrice = parseFloat(unitPriceInput.value) || 0;

            if (unitCost <= 0 || unitPrice <= 0) {
                alert('Unit cost and unit price must be strictly positive.');
                unitCostInput.focus();
                valid = false;
            } else if (unitCost >= unitPrice) {
                alert('Unit cost must be strictly less than unit price.');
                valid = false;
                unitCostInput.focus();
            }
        });

        if (!valid) {
            e.preventDefault();
        }
    });
}

// Function to warn users about unsaved changes
export function warnOnUnsavedChanges(formId) {
    const form = document.querySelector(formId);

    if (!form) return;

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
