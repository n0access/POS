const formUtils = (() => {
    let isFormDirty = false; // Tracks whether the form has unsaved changes

    // Initialize the form utilities
    function initFormUtilities(formId, cancelButtonId, requiredSelector, formsetContainerSelector, totalFormsSelector) {
        const form = document.getElementById(formId);
        const cancelButton = document.getElementById(cancelButtonId);
        const formsetContainer = document.querySelector(formsetContainerSelector);
        const totalForms = document.querySelector(totalFormsSelector);

        // Track changes to mark the form as dirty
        form.querySelectorAll("input, select, textarea").forEach((input) => {
            input.addEventListener("input", () => {
                isFormDirty = true; // Set dirty flag to true
                input.classList.remove("error"); // Remove error highlight
            });
        });

        // Handle cancel button and link navigation
        document.addEventListener("click", function (event) {
            const target = event.target;
            if ((target.tagName === "A" || target.closest("a")) || target.id === cancelButtonId) {
                if (isFormDirty) {
                    const confirmLeave = confirm("You have unsaved changes. If you leave this page, your progress will be lost. Are you sure you want to continue?");
                    if (!confirmLeave) {
                        event.preventDefault(); // Stop navigation
                    }
                }
            }
        });

        // Remove blank rows on form submission
        form.addEventListener("submit", function (event) {
            const rows = formsetContainer.querySelectorAll("tr");
            rows.forEach((row) => {
                if (isRowBlank(row)) {
                    row.remove(); // Remove blank row
                }
            });

            // Update total forms count
            const updatedRows = formsetContainer.querySelectorAll("tr");
            totalForms.value = updatedRows.length;

            // Validate required fields
            const missingFields = validateRequiredFields(form, requiredSelector);
            if (missingFields.length > 0) {
                event.preventDefault(); // Prevent submission
                alert(`Please fill in the following required fields:\n${missingFields.join("\n")}`);
            } else {
                isFormDirty = false; // Reset dirty flag on successful submission
            }
        });

        // Warn on page unload
        window.addEventListener("beforeunload", (event) => {
            if (isFormDirty) {
                event.preventDefault();
                event.returnValue = ""; // Trigger browser's unload warning
            }
        });
    }

    // Check if a row is blank
    function isRowBlank(row) {
        const inputs = row.querySelectorAll("input");
        for (let input of inputs) {
            if (input.value.trim() !== "") {
                return false; // Row is not blank
            }
        }
        return true; // Row is blank if all fields are empty
    }

    // Validate required fields
    function validateRequiredFields(form, requiredSelector) {
        const requiredFields = form.querySelectorAll(requiredSelector);
        const missingFields = [];

        requiredFields.forEach((field) => {
            if (field.value.trim() === "") {
                field.classList.add("error"); // Highlight the missing field
                const label = getFieldLabel(field);
                missingFields.push(label || "Missing field");
            } else {
                field.classList.remove("error"); // Remove highlight if filled
            }
        });

        return missingFields; // Return missing fields
    }

    // Get the label for a field
    function getFieldLabel(field) {
        const labelledById = field.getAttribute("aria-labelledby");
        if (labelledById) {
            const header = document.getElementById(labelledById);
            return header ? header.textContent.trim() : null;
        }
        return null;
    }

    return {
        initFormUtilities,
    };
})();
