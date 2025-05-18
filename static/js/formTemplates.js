// Template for Inventory App
export const inventoryFieldsTemplate = (idx) => `
    <tr class="inventory-row">
        <td><input type="text" name="form-${idx}-item_name" class="form-control" required></td>
        <td><input type="text" name="form-${idx}-barcode" class="form-control"></td>
        <td><input type="number" name="form-${idx}-unit_cost" class="form-control" required min="0.01" step="0.01"></td>
        <td><input type="number" name="form-${idx}-unit_price" class="form-control" required min="0.01" step="0.01"></td>
        <td class="margin-cell">N/A</td>
        <td><input type="number" name="form-${idx}-quantity" class="form-control" value="1" required min="1" step="1"></td>
        <td><input type="number" name="form-${idx}-min_stock_level" class="form-control" value="1"></td>
        <td><input type="number" name="form-${idx}-max_stock_level" class="form-control" value="100"></td>
        <td><input type="text" name="form-${idx}-product_category" class="form-control" value="system"></td>
        <td><button type="button" class="btn btn-danger remove-row-btn">Remove</button></td>
    </tr>
`;

// Template for Vendor App
export const vendorFieldsTemplate = (idx) => `
    <tr class="vendor-row">
        <td><input type="text" name="form-${idx}-vendor_name" class="form-control" required></td>
        <td><input type="email" name="form-${idx}-vendor_email" class="form-control" required></td>
        <td><input type="text" name="form-${idx}-vendor_phone" class="form-control"></td>
        <td><button type="button" class="btn btn-danger remove-row-btn">Remove</button></td>
    </tr>
`;

// Add more templates as needed
