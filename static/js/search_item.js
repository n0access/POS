document.addEventListener("DOMContentLoaded", function () {
             console.log("DOM fully loaded and parsed."); // Debug: Ensure script runs after DOM is ready
    const itemSearchInputs = document.querySelectorAll(".item-search");

    itemSearchInputs.forEach((searchInput) => {



        const resultsDiv = searchInput.nextElementSibling; // The dropdown container
        const hiddenInput = searchInput.nextElementSibling?.nextElementSibling; // Hidden input for item ID
        const itemDescInput = searchInput.closest("tr")?.querySelector('[name$="-item_desc"]'); // Item Description editable
        const unitCostInput = searchInput.closest("tr")?.querySelector('[name$="-unit_cost"]'); // Unit cost input
        const quantityInput = searchInput.closest("tr")?.querySelector('[name$="-quantity"]'); // Quantity input
        const lineTotalCell = searchInput.closest("tr")?.querySelector(".item-total"); // Line total cell

            // Debug
        // console.log("resultsDiv:", resultsDiv);
        // console.log("hiddenInput:", hiddenInput);
        // console.log("itemDescInput:", itemDescInput);
        // console.log("unitCostInput:", unitCostInput);
        // console.log("quantityInput:", quantityInput);
        // console.log("lineTotalCell:", lineTotalCell);

        // Ensure necessary elements exist
        if (!resultsDiv || !hiddenInput || !itemDescInput || !unitCostInput || !quantityInput || !lineTotalCell) {
           // console.error("Missing required DOM elements for item search functionality.");


            return;
        }

        let currentFocus = -1;
        let controller; // AbortController to manage ongoing fetch requests

        searchInput.addEventListener("input", async function () {
            const query = searchInput.value.trim();

            if (!query) {
                resultsDiv.style.display = "none";
                return;
            }

            // Cancel previous fetch request if ongoing
            if (controller) {
                controller.abort();
            }
            controller = new AbortController();
            const signal = controller.signal;

            try {
                const response = await fetch(`/api/items/search/?q=${encodeURIComponent(query)}`, { signal });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const results = await response.json();

                // Clear previous results
                resultsDiv.innerHTML = "";
                currentFocus = -1;

                // Define dropdown list as accessible dropdown
                resultsDiv.setAttribute("role", "listbox");

                // Populate the dropdown
                results.forEach((item, index) => {
                    const div = document.createElement("div");
                    div.className = "dropdown-item";
                    div.textContent = `${item.item_name} (Barcode: ${item.barcode})`;
                    div.dataset.itemId = item.item_id;
                    div.dataset.unitCost = item.unit_cost;
                    div.dataset.index = index;
                    div.setAttribute("role", "option");
                    div.setAttribute("aria-selected", "false");

                    // Add click event for selecting an item
                    div.addEventListener("click", () => {
                        selectItem(item, searchInput, hiddenInput, itemDescInput, unitCostInput, lineTotalCell);
                    });

                    resultsDiv.appendChild(div);
                });

                resultsDiv.style.display = "block"; // Show the dropdown
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Error fetching items:", error);
                    resultsDiv.innerHTML = "<div class='error'>Unable to fetch items. Please try again later.</div>";
                    resultsDiv.style.display = "block"; // Show error
                }
            }
        });



        function selectItem(item, searchInput, hiddenInput, itemDescInput, unitCostInput, lineTotalCell) {
    console.log("Selecting item:", item);

    // Update the fields
    searchInput.value = item.item_name;
    hiddenInput.value = item.item_id;
    itemDescInput.value = item.item_name; // Set description to the item's name
    console.log("Updated Item Description to:", itemDescInput.value);

    unitCostInput.value = parseFloat(item.unit_cost).toFixed(2);
    resultsDiv.style.display = "none";

    // Recalculate totals
    calculateLineTotal();
}


        // Calculate line total when quantity or unit cost changes
        [quantityInput, unitCostInput].forEach((input) =>
            input.addEventListener("input", calculateLineTotal)
        );

        function calculateLineTotal() {
            const quantity = parseFloat(quantityInput.value) || 0;
            const unitCost = parseFloat(unitCostInput.value) || 0;
            const lineTotal = quantity * unitCost;
            lineTotalCell.textContent = lineTotal.toFixed(2);
            calculateTotalCost(); // Update the overall total cost
        }

        // Close dropdown when clicking outside
        document.addEventListener("click", function (e) {
            if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
                resultsDiv.style.display = "none";
            }
        });
    });

    // Calculate overall total cost
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
});