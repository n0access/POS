document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#po-form"); // Replace with your form's ID
    const saveAndCloseButton = document.querySelector("#po-save-and-close"); // Replace with your save and close button ID
    const saveAndNewButton = document.querySelector("#po-save-and-new"); // Replace with your save and new button ID
    const requiredFields = document.querySelectorAll("[data-required]"); // Fields marked as required
    let isFormModified = false; // Track if the form has been modified

    // Mark the form as modified when any input changes
    form.addEventListener("input", () => {
        isFormModified = true;
    });

    // Function to validate required fields
    function validateForm() {
        let isValid = true;
        requiredFields.forEach((field) => {
            const value = field.value.trim();
            if (!value) {
                isValid = false;
                field.classList.add("error"); // Add an error class for styling
                field.nextElementSibling.textContent = "This field is required."; // Display an error message
            } else {
                field.classList.remove("error"); // Remove error class if valid
                field.nextElementSibling.textContent = ""; // Clear the error message
            }
        });
        return isValid;
    }

    // Reset error states for fields
    function resetErrors() {
        requiredFields.forEach((field) => {
            field.classList.remove("error");
            if (field.nextElementSibling) {
                field.nextElementSibling.textContent = "";
            }
        });
    }

    // Save and Close Button
    saveAndCloseButton.addEventListener("click", function (e) {
        e.preventDefault();
        resetErrors(); // Reset previous errors
        if (validateForm()) {
            isFormModified = false; // Reset form modification status
          //  form.submit(); // Submit the form
        } else {
            alert("Please fill out all required fields before saving.");
        }
    });

    // Save and New Button
    saveAndNewButton.addEventListener("click", function (e) {
        e.preventDefault();
        resetErrors(); // Reset previous errors
        if (validateForm()) {
            isFormModified = false; // Reset form modification status
           // form.reset(); // Clear the form for new entry
        } else {
            alert("Please fill out all required fields before saving.");
        }
    });

    // Warn user if they try to leave the page with unsaved changes
    window.addEventListener("beforeunload", function (e) {
        if (isFormModified) {
            const confirmationMessage = "You have unsaved changes. Are you sure you want to leave the page?";
            e.preventDefault(); // Some browsers require this for the dialog to show
            e.returnValue = confirmationMessage;
            return confirmationMessage; // For older browsers
        }
    });


});