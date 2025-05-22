document.addEventListener("DOMContentLoaded", function () {
    const formsetContainer = document.querySelector("#item-formset-container tbody");
    const totalForms = document.getElementById("id_items-TOTAL_FORMS");
    const addLinesBtn = document.getElementById("add-lines-btn");
    const lineCountInput = document.getElementById("line-count-input");

    // Initialize the form
    function initializeForm() {
        // Initialize existing rows
        formsetContainer.querySelectorAll("tr").forEach(initializeLine);

        // Add event listeners for dynamic row management
        if (addLinesBtn) {
            addLinesBtn.addEventListener("click", handleAddLines);
        }

        // Prevent deleting the last row
        document.addEventListener("click", handleRemoveRow);
    }

    // Initialize a line (row)
    function initializeLine(line) {
        const searchInput = line.querySelector(".item-search");
        const resultsDiv = line.querySelector(".item-results");
        const hiddenInput = line.querySelector(".item-id");
        const itemDescInput = line.querySelector('[name$="-item_desc"]');
        const unitCostInput = line.querySelector('[name$="-unit_cost"]');
        const quantityInput = line.querySelector('[name$="-quantity"]');
        const lineTotalCell = line.querySelector(".item-total");

        if (!searchInput || !resultsDiv || !hiddenInput || !itemDescInput || !unitCostInput || !quantityInput || !lineTotalCell) {
            console.error("Missing required elements in the row:", line);
            return;
        }

        setupDropdownPositioning(searchInput, resultsDiv);
        setupItemSearch(searchInput, resultsDiv, hiddenInput, itemDescInput, unitCostInput, lineTotalCell);
        setupQuantityAndCostListeners(quantityInput, unitCostInput, lineTotalCell);
    }

    // Set up dynamic dropdown positioning
    function setupDropdownPositioning(searchInput, resultsDiv) {
        const positionDropdown = () => {
            const rect = searchInput.getBoundingClientRect();
            resultsDiv.style.position = "absolute";
            resultsDiv.style.top = `${rect.bottom + window.scrollY}px`;
            resultsDiv.style.left = `${rect.left + window.scrollX}px`;
            resultsDiv.style.width = `${rect.width}px`;
            resultsDiv.style.zIndex = 1000;
        };

        searchInput.addEventListener("input", () => {
            resultsDiv.style.display = searchInput.value.trim() ? "block" : "none";
            positionDropdown();
        });

        window.addEventListener("resize", positionDropdown);
        window.addEventListener("scroll", positionDropdown);
    }

    // Set up item search
    function setupItemSearch(searchInput, resultsDiv, hiddenInput, itemDescInput, unitCostInput, lineTotalCell) {
        searchInput.addEventListener("input", async function () {
            const query = searchInput.value.trim();
            if (!query) {
                resultsDiv.style.display = "none";
                return;
            }

            try {
                const response = await fetch(`/api/items/search/?q=${query}`);
                const results = await response.json();
                populateSearchResults(results, resultsDiv, searchInput, hiddenInput, itemDescInput, unitCostInput, lineTotalCell);
            } catch (error) {
                console.error("Error fetching items:", error);
            }
        });
    }

    // Populate search results
    function populateSearchResults(results, resultsDiv, searchInput, hiddenInput, itemDescInput, unitCostInput, lineTotalCell) {
        resultsDiv.innerHTML = "";
        results.forEach((item) => {
            const div = document.createElement("div");
            div.className = "dropdown-item";
            div.textContent = `${item.item_name} (Barcode: ${item.barcode})`;
            div.dataset.itemId = item.item_id;
            div.dataset.unitCost = item.unit_cost;

            div.addEventListener("click", () => {
                searchInput.value = item.item_name;
                hiddenInput.value = item.item_id;
                itemDescInput.value = `${item.item_name} (Barcode: ${item.barcode})`;
                unitCostInput.value = parseFloat(item.unit_cost).toFixed(2);
                resultsDiv.style.display = "none";
                calculateLineTotal(quantityInput, unitCostInput, lineTotalCell);
            });

            resultsDiv.appendChild(div);
        });

        resultsDiv.style.display = "block";
    }

    // Set up listeners for quantity and unit cost changes
    function setupQuantityAndCostListeners(quantityInput, unitCostInput, lineTotalCell) {
        const calculateLineTotal = () => {
            const quantity = parseFloat(quantityInput.value) || 0;
            const unitCost = parseFloat(unitCostInput.value) || 0;
            const lineTotal = quantity * unitCost;
            lineTotalCell.textContent = lineTotal.toFixed(2);
            calculateTotalCost();
        };

        [quantityInput, unitCostInput].forEach((input) => {
            input.addEventListener("input", calculateLineTotal);
        });
    }

    // Calculate total cost and quantity
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

    // Handle adding new lines
    function handleAddLines() {
        const linesToAdd = parseInt(lineCountInput.value, 10);
        if (!linesToAdd || linesToAdd <= 0) {
            alert("Please enter a valid number of lines to add.");
            return;
        }

        for (let i = 0; i < linesToAdd; i++) {
            addNewRow();
        }
    }

    // Add a new row to the formset
    function addNewRow() {
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
        });

        formsetContainer.appendChild(newRow);
        totalForms.value = formIndex + 1;
        initializeLine(newRow);
    }

    // Handle removing rows
    function handleRemoveRow(event) {
        if (event.target.classList.contains("remove-item")) {
            const row = event.target.closest("tr");
            if (formsetContainer.querySelectorAll("tr").length > 1) {
                row.remove();
                calculateTotalCost();
                totalForms.value = formsetContainer.querySelectorAll("tr").length;
            } else {
                alert("Cannot delete the last remaining row.");
            }
        }
    }

    // Initialize the form
    initializeForm();
});
