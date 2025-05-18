document.addEventListener("DOMContentLoaded", function () {
    const addLinesBtn = document.getElementById("add-lines-btn");
    const formsetContainer = document.querySelector("#item-formset-container tbody");
    const totalForms = document.getElementById("id_items-TOTAL_FORMS");
    const lineCountInput = document.getElementById("line-count-input");

    function initializeLine(line) {
        const searchInput = line.querySelector(".item-search");
        const resultsDiv = line.querySelector(".item-results");
        const hiddenInput = line.querySelector(".item-id");
        const itemDescInput = line.querySelector('[name$="-item_desc"]'); // Item Description editable
        const unitCostInput = line.querySelector('[name$="-unit_cost"]');
        const quantityInput = line.querySelector('[name$="-quantity"]');
        const lineTotalCell = line.querySelector(".item-total");

        if (!searchInput || !resultsDiv || !hiddenInput || !itemDescInput || !unitCostInput || !quantityInput || !lineTotalCell) {
            console.error("Missing required elements in the row:", line);
            return;
        }

        resultsDiv.setAttribute("role", "listbox");
        let currentFocus = -1;

         function positionDropdown(searchInput, resultsDiv) {
    // Get input's position relative to the viewport
    const rect = searchInput.getBoundingClientRect();

    // Apply dynamic positioning to the dropdown
    resultsDiv.style.position = "absolute"; // Ensure the dropdown is detached from normal flow
    resultsDiv.style.top = `${rect.bottom + window.scrollY}px`; // Below the input
    resultsDiv.style.left = `${rect.left + window.scrollX}px`; // Align to the input
    resultsDiv.style.width = `${rect.width}px`; // Match width of input
    resultsDiv.style.zIndex = 1000; // Ensure dropdown is always on top
}

// Show the dropdown when input value changes
searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim();

    if (query) {
        // Position dropdown whenever it becomes visible
        resultsDiv.style.display = "block";
        positionDropdown(searchInput, resultsDiv);
    } else {
        resultsDiv.style.display = "none";
    }
});

// Adjust position on window resize or scrolling
window.addEventListener("resize", () => positionDropdown(searchInput, resultsDiv));
window.addEventListener("scroll", () => positionDropdown(searchInput, resultsDiv));

        function scrollToLine(line) {
    line.scrollIntoView({
        behavior: "smooth", // Enables smooth scrolling
        block: "center",    // Scrolls the line to the center of the viewport
        inline: "nearest"   // Ensures horizontal scrolling only if necessary
    });
}

      searchInput.addEventListener("focus", function () {
            // Scroll to this line when it gains focus
            scrollToLine(line);
        });

        // Item Search
        searchInput.addEventListener("input", async function () {
            const query = searchInput.value.trim();
            if (!query) {
                resultsDiv.style.display = "none";
                return;
            }

            try {
                const response = await fetch(`/api/items/search/?q=${query}`);
                if (!response.ok) {
                    console.error(`Error fetching items: ${response.status} ${response.statusText}`);
                    resultsDiv.style.display = "none";
                    return;
                }

                const results = await response.json();
                if (!Array.isArray(results)) {
                    console.error("Unexpected response structure:", results);
                    resultsDiv.style.display = "none";
                    return;
                }

                resultsDiv.innerHTML = "";
                results.forEach((item, index) => {
                    const div = document.createElement("div");
                    div.className = "dropdown-item";
                    div.textContent = `${item.item_name} (Barcode: ${item.barcode})`;
                    div.dataset.itemId = item.item_id;
                    div.dataset.unitCost = item.unit_cost;
                    div.setAttribute("role", "option");
                    div.addEventListener("click", () => {
                         console.log("Selecting item:", item);
                        searchInput.value = item.item_id;
                        hiddenInput.value = item.item_id;
                         itemDescInput.value = `${item.item_name} (Barcode: ${item.barcode})`; // Set description to the item's name
                        unitCostInput.value = parseFloat(item.unit_cost).toFixed(2);
                        resultsDiv.style.display = "none";
                        calculateLineTotal();
                    });
                    div.setAttribute("data-index", index);
                    resultsDiv.appendChild(div);
                });

                resultsDiv.style.display = "block";
                currentFocus = -1;
            } catch (error) {
                console.error("Error fetching items:", error);
            }
        });

 searchInput.addEventListener("keydown", function (e) {

    const items = resultsDiv.querySelectorAll(".dropdown-item");
    if (!items.length) return; // Prevent keyboard events if no items are present

    if (e.key === "ArrowDown") {
        e.preventDefault();
        currentFocus = (currentFocus + 1) % items.length;
        highlightItem(items, currentFocus);
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        currentFocus = (currentFocus - 1 + items.length) % items.length;
        highlightItem(items, currentFocus);
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentFocus === -1 && items.length > 0) {
            items[0].click();
        } else if (currentFocus >= 0 && currentFocus < items.length) {
            items[currentFocus].click();
        }
    }
});

        function highlightItem(items, index) {
            items.forEach((item, idx) => {
                if (idx === index) {
                    item.classList.add("active");
                    item.setAttribute("aria-selected", "true");
                    item.scrollIntoView({ block: "nearest" });
                } else {
                    item.classList.remove("active");
                    item.setAttribute("aria-selected", "false");
                }
            });
        }

        function calculateLineTotal() {
            const quantity = parseFloat(quantityInput.value) || 0;
            const unitCost = parseFloat(unitCostInput.value) || 0;

            if (quantity < 0 || unitCost < 0) {
                console.error("Invalid values entered. Quantity and Unit Cost must be non-negative.");
                return;
            }

            const lineTotal = quantity * unitCost;
            lineTotalCell.textContent = lineTotal.toFixed(2);
            calculateTotalCost();
        }

        [quantityInput, unitCostInput].forEach((input) =>
            input.addEventListener("input", calculateLineTotal)
        );
    }

    function calculateTotalCost() {
        const lineTotalCells = document.querySelectorAll(".item-total");
        const totalCostSpan = document.getElementById("total-cost");
        const totalQuantitySpan = document.getElementById("total-quantity");
        let totalCost = 0;
        let totalQuantity = 0;

        lineTotalCells.forEach((cell) => {
            totalCost += parseFloat(cell.textContent) || 0;
        });

        document
            .querySelectorAll('[name$="-quantity"]')
            .forEach((input) => (totalQuantity += parseFloat(input.value) || 0));

        totalCostSpan.textContent = totalCost.toFixed(2);
        totalQuantitySpan.textContent = totalQuantity;
    }

    formsetContainer.addEventListener("keydown", function (event) {
    const activeElement = document.activeElement;

    // Check if the active element is the Unit Cost input in the last row
    const lastRow = formsetContainer.querySelector("tr:last-child");
    const unitCostInput = lastRow.querySelector('[name$="-unit_cost"]');

    if (activeElement === unitCostInput && event.key === "Tab") {
        event.preventDefault(); // Prevent default tab behavior
        addNewRow(); // Add a new row
    }
        });




    addLinesBtn.addEventListener("click", function () {
        const linesToAdd = parseInt(lineCountInput.value, 10);
        if (!linesToAdd || linesToAdd <= 0) {
            alert("Please enter a valid number of lines to add.");
            return;
        }

         let firstNewRow; // Variable to track the first added row

    for (let i = 0; i < linesToAdd; i++) {
        const newRow = addNewRow(); // Capture the new row returned by the function
        if (i === 0) {
            firstNewRow = newRow; // Store the first added row
        }
    }

    // Move the cursor to the first input field of the first added row
    if (firstNewRow) {
        const firstInput = firstNewRow.querySelector("input");
        if (firstInput) {
            firstInput.focus();
        } else {
            console.warn("No input field found in the first added row to focus.");
        }
    }
    });

    function addNewRow(){
        const formIndex = parseInt(totalForms.value, 10);
        const lastRow = formsetContainer.querySelector("tr:last-child");


            if (!lastRow) {
                console.error("No rows found to clone.");
                return;
            }

            const newRow = lastRow.cloneNode(true);
            newRow.querySelectorAll("input, label").forEach((el) => {
                if (el.name) el.name = el.name.replace(/-\d+-/, `-${formIndex}-`);
                if (el.id) el.id = el.id.replace(/-\d+-/, `-${formIndex}-`);
                if (el.tagName === "INPUT" && el.type !== "hidden") el.value = "";
                if (el.classList.contains("item-search")) el.value = "";
                if (el.classList.contains("item-id")) el.value = "";
            });

            const itemTotalCell = newRow.querySelector(".item-total");
            if (itemTotalCell) {
                itemTotalCell.textContent = "0.00";
            } else {
                console.error("New row does not have a total cell:", newRow);
            }

            formsetContainer.appendChild(newRow);
            totalForms.value = formIndex + 1;
            initializeLine(newRow);

         // Move the cursor to the first input field in the new row
            const firstInput = newRow.querySelector("input");
            if (firstInput) {
                firstInput.focus();
            } else {
                console.warn("No input field found in the new row to focus.");
            }
            return newRow;
    }

    formsetContainer.querySelectorAll("tr").forEach(initializeLine);

    formsetContainer.addEventListener("input", function (event) {
    const rows = formsetContainer.querySelectorAll("tr");
    const lastRow = rows[rows.length - 1];
    if (event.target.closest("tr") === lastRow) {
        lastRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
});

    document.addEventListener("DOMContentLoaded", function () {
    const firstRow = formsetContainer.querySelector("tr:first-child");
    if (firstRow) {
        const removeButton = firstRow.querySelector(".remove-item");
        if (removeButton) {
            removeButton.style.display = "none"; // Hide the button
        }
    }



});

    document.addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-item")) {
        const row = event.target.closest("tr");
        const rows = formsetContainer.querySelectorAll("tr");

        if (row && rows.length > 1) { // Prevent deletion if only one row exists

            row.remove();
            calculateTotalCost();

            // Update the totalForms counter
            totalForms.value = rows.length - 1; // Decrement after removing the row
        } else {
            alert("Cannot delete the last remaining row.");
        }
    }

});


});