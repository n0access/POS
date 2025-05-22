
document.addEventListener("DOMContentLoaded", function () {
    const vendorSearchInput = document.getElementById("vendor-search");
    const vendorResultsDiv = document.getElementById("vendor-results");
    const vendorIdInput = document.getElementById("vendor-id");
    const termsDropdown = document.getElementById("id_terms"); // Payment Terms dropdown
    const paymentMethodDropdown = document.getElementById("id_payment_method"); // Payment Method dropdown
     const vendorId = vendorIdInput.value; // Get pre-filled vendor ID
    if (vendorId) {
        fetchVendorDetails(vendorId); // Fetch and populate payment details
    }
    let debounceTimeout;

    // Function to fetch and display vendor results
    async function fetchVendors(query) {
        vendorResultsDiv.innerHTML = "<div class='dropdown-item text-muted'>Loading...</div>";
        vendorResultsDiv.style.display = "block";

        try {
            const response = await fetch(`/api/vendors/search/?q=${query}`);
            const results = await response.json();

            vendorResultsDiv.innerHTML = ""; // Clear previous results

            if (results.length === 0) {
                const noResultsDiv = document.createElement("div");
                noResultsDiv.className = "dropdown-item text-muted";
                noResultsDiv.textContent = "No results found";
                vendorResultsDiv.appendChild(noResultsDiv);
            } else {
                results.forEach(vendor => {
                    const div = document.createElement("div");
                    div.className = "dropdown-item";
                    div.textContent = `${vendor.company_name} (${vendor.contact_name || "N/A"})`;
                    div.dataset.vendorId = vendor.vendor_id;

                    div.addEventListener("click", () => {
                        vendorSearchInput.value = vendor.company_name;
                        vendorIdInput.value = vendor.vendor_id;
                        vendorResultsDiv.style.display = "none";

                        // Fetch and populate payment details
                        fetchVendorDetails(vendor.vendor_id);
                    });

                    vendorResultsDiv.appendChild(div);
                });
            }
        } catch (error) {
            vendorResultsDiv.innerHTML = "<div class='dropdown-item text-danger'>Error fetching results</div>";
            console.error("Error fetching vendors:", error);
        }
    }

    // Function to fetch and populate payment terms and method
    async function fetchVendorDetails(vendorId) {
        console.log("Fetching details for vendor:", vendorId);
        try {
            const response = await fetch(`/api/vendors/${vendorId}/`);
            const vendorDetails = await response.json();
            console.log("Vendor details:", vendorDetails);

            // Populate payment terms and method
            setDropdownValue(termsDropdown, vendorDetails.payment_terms);
            setDropdownValue(paymentMethodDropdown, vendorDetails.payment_method);
        } catch (error) {
            console.error("Error fetching vendor details:", error);
        }
    }

    // Function to set dropdown value, adding it if it doesn't exist
    function setDropdownValue(dropdown, value) {
        let optionExists = false;
        Array.from(dropdown.options).forEach(option => {
            if (option.value === value) {
                optionExists = true;
            }
        });

        if (!optionExists) {
            const opt = document.createElement("option");
            opt.value = value;
            opt.textContent = value;
            dropdown.appendChild(opt);
        }

        dropdown.value = value; // Set the selected value
    }

    // Event listener for input with debounce
    vendorSearchInput.addEventListener("input", function () {
        const query = vendorSearchInput.value.trim();

        if (!query) {
            vendorResultsDiv.style.display = "none";
            return;
        }

        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            fetchVendors(query);
        }, 300); // Debounce delay of 300ms
    });

    // Close dropdown on outside click
    document.addEventListener("click", function (e) {
        if (!vendorSearchInput.contains(e.target) && !vendorResultsDiv.contains(e.target)) {
            vendorResultsDiv.style.display = "none";
        }
    });

    // Keyboard navigation for dropdown
    vendorSearchInput.addEventListener("keydown", function (e) {
        const items = vendorResultsDiv.querySelectorAll(".dropdown-item");
        let activeItem = vendorResultsDiv.querySelector(".active");
        let activeIndex = Array.from(items).indexOf(activeItem);

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (activeIndex >= 0) items[activeIndex].classList.remove("active");
            activeIndex = (activeIndex + 1) % items.length;
            items[activeIndex].classList.add("active");
            items[activeIndex].scrollIntoView({ block: "nearest" });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (activeIndex >= 0) items[activeIndex].classList.remove("active");
            activeIndex = (activeIndex - 1 + items.length) % items.length;
            items[activeIndex].classList.add("active");
            items[activeIndex].scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter" && activeItem) {
            e.preventDefault();
            activeItem.click();
        }
    });
});
