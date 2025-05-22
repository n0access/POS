   // formUtils.js
   /**
    * Fetch data from the given URL with error handling.
    */

   async function fetchData(url, signal) {
       try {
           const response = await fetch(url, { signal });
           if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
           return await response.json();
       } catch (error) {
           if (error.name !== "AbortError") console.error("Error fetching data:", error);
           throw error;
       }
   }

   /**
    * Render dropdown results dynamically.
    */
   function renderDropdown(items, resultsDiv, onClickCallback) {
       resultsDiv.innerHTML = ""; // Clear old results
       items.forEach((item, index) => {
           const div = document.createElement("div");
           div.className = "dropdown-item";
           div.textContent = `${item.item_name} (Barcode: ${item.barcode})`;
           div.dataset.itemId = item.item_id;
           div.dataset.unitCost = item.unit_cost;
           div.dataset.index = index;

           // Add click handler for dropdown item
           div.addEventListener("click", () => onClickCallback(item));
           resultsDiv.appendChild(div);
       });

       resultsDiv.style.display = "block"; // Make dropdown visible
   }

   /**
    * Highlight the active dropdown item.
    */
   function highlightItem(items, currentFocus) {
       items.forEach((item, index) => {
           if (index === currentFocus) {
               item.classList.add("active");
               item.scrollIntoView({ block: "nearest" });
           } else {
               item.classList.remove("active");
           }
       });
   }

   /**
    * Update the line's total cost.
    */
   function calculateLineTotal(quantityInput, unitCostInput, lineTotalCell) {
       const quantity = parseFloat(quantityInput.value) || 0;
       const unitCost = parseFloat(unitCostInput.value) || 0;
       const lineTotal = quantity * unitCost;
       lineTotalCell.textContent = lineTotal.toFixed(2);
       calculateTotalCost(); // Recalculate overall totals
   }

   /**
    * Calculate the total cost and quantity for all rows.
    */
   function calculateTotalCost() {
       const lineTotalCells = document.querySelectorAll(".item-total");
       const totalCostSpan = document.getElementById("total-cost");
       const totalQuantitySpan = document.getElementById("total-quantity");

       let totalCost = 0;
       let totalQuantity = 0;

       lineTotalCells.forEach((cell) => {
           totalCost += parseFloat(cell.textContent) || 0;
       });

       document.querySelectorAll('[name$="-quantity"]').forEach((input) => {
           totalQuantity += parseFloat(input.value) || 0;
       });

       totalCostSpan.textContent = totalCost.toFixed(2);
       totalQuantitySpan.textContent = totalQuantity;
   }