const API = 'http://localhost:5000/api';

document.getElementById('itemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('itemId').value;
    const data = {
        itemName: document.getElementById('itemName').value,
        Specification: document.getElementById('Specification').value,
        unitMeasure: document.getElementById('unitMeasure').value,
        Quantity: parseInt(document.getElementById('Quantity').value) || 0,
        unitPrice: parseFloat(document.getElementById('unitPrice').value) || 0,
        TotalQuantity: parseInt(document.getElementById('TotalQuantity').value) || 0
    };
    if (id) {
        await fetch(`${API}/items/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    } else {
        await fetch(`${API}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    }
    document.getElementById('itemForm').reset();
    document.getElementById('itemSubmitBtn').textContent = 'Save Item';
    loadItems();
})

document.getElementById('saleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('saleId').value;
    const data = {
        SaleDate: document.getElementById('SaleDate').value,
        CustomerName: document.getElementById('CustomerName').value,
        TotalPrice: parseFloat(document.getElementById('TotalPrice').value) || 0
    };
    if (id) {
        await fetch(`${API}/sales/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    } else {
        await fetch(`${API}/sales`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    }
    document.getElementById('saleForm').reset();
    document.getElementById('saleSubmitBtn').textContent = 'Save Sale';
    loadSales();
})

document.getElementById('sdSaleID').addEventListener('change', recalcSubTotal);
document.getElementById('sdItemID').addEventListener('change', recalcSubTotal);
document.getElementById('QuantitySold').addEventListener('input', recalcSubTotal);

function recalcSubTotal() {
    const itemId = parseInt(document.getElementById('sdItemID').value);
    const qty = parseInt(document.getElementById('QuantitySold').value) || 0;
    if (!itemId || !qty) return;
    fetch(`${API}/items/${itemId}`).then(r => r.json()).then(item => {
        const sub = (parseFloat(item.unitPrice) * qty).toFixed(2);
        document.getElementById('SubTotalPrice').value = sub;
    });
}

document.getElementById('saleDetailForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('sdId').value;
    const SaleID = parseInt(document.getElementById('sdSaleID').value);
    const ItemID = parseInt(document.getElementById('sdItemID').value);
    const QuantitySold = parseInt(document.getElementById('QuantitySold').value) || 0;
    const SubTotalPrice = parseFloat(document.getElementById('SubTotalPrice').value) || 0;

    if (!SaleID || !ItemID || !QuantitySold) {
        alert('Please select a Sale, an Item, and enter Quantity Sold.');
        return;
    }

    const data = { SaleID, ItemID, QuantitySold, SubTotalPrice };
    if (id) {
        await fetch(`${API}/sale-details/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    } else {
        await fetch(`${API}/sale-details`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    }
    document.getElementById('saleDetailForm').reset();
    loadSaleDetails();
    loadSaleDetailSelects();
});

async function login() {
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value;
    if (!username || !password) {
        document.getElementById('loginError').textContent = 'Please enter username and password';
        return;
    }
    try {
        const res = await fetch(`${API}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('user', username);
            document.getElementById('loginPage').classList.remove('active');
            document.getElementById('dashboard').classList.add('active');
            document.getElementById('userDisplay').textContent = 'Welcome, ' + username;
            loadItems();
            loadSales();
            loadSaleDetails();
            loadSaleDetailSelects();
            loadReports();
        } else {
            document.getElementById('loginError').textContent = 'Invalid credentials';
        }
    } catch (err) {
        document.getElementById('loginError').textContent = 'Cannot connect to server. Make sure the backend is running on port 5000.';
        console.error('Login error:', err);
    }
}

function logout() {
    localStorage.removeItem('user');
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('loginPage').classList.add('active');
}

function showTab(name, e) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(name + 'Tab').classList.add('active');
    e.target.classList.add('active');
    if (name === 'reports') loadReports();
}

async function loadItems() {
    const res = await fetch(`${API}/items`);
    if (!res.ok) return;
    const items = await res.json();
    const tbody = document.querySelector('#itemsTable tbody');
    tbody.innerHTML = items.length ? items.map(item => `
        <tr>
            <td>${item.itemName}</td>
            <td>${item.Specification || '-'}</td>
            <td>${item.unitMeasure || '-'}</td>
            <td>${item.Quantity}</td>
            <td>${parseFloat(item.unitPrice).toFixed(2)}</td>
            <td>${item.TotalQuantity}</td>
            <td>
                <button class="btn-edit" onclick="editItem(${item.id})">Edit</button>
                <button class="btn-delete" onclick="deleteItem(${item.id})">Delete</button>
            </td>
        </tr>
    `).join('') : '<tr class="empty-row"><td colspan="7">No items found</td></tr>';
}

async function loadSales() {
    const res = await fetch(`${API}/sales`);
    if (!res.ok) return;
    const sales = await res.json();
    const tbody = document.querySelector('#salesTable tbody');
    tbody.innerHTML = sales.length ? sales.map(sale => `
        <tr>
            <td>${sale.SaleDate ? sale.SaleDate.split('T')[0] : '-'}</td>
            <td>${sale.CustomerName}</td>
            <td>${parseFloat(sale.TotalPrice).toFixed(2)}</td>
            <td>
                <button class="btn-edit" onclick="editSale(${sale.id})">Edit</button>
                <button class="btn-delete" onclick="deleteSale(${sale.id})">Delete</button>
            </td>
        </tr>
    `).join('') : '<tr class="empty-row"><td colspan="4">No sales found</td></tr>';
}

async function loadSaleDetails() {
    const res = await fetch(`${API}/sale-details`);
    if (!res.ok) return;
    const details = await res.json();
    const tbody = document.querySelector('#saleDetailsTable tbody');
    tbody.innerHTML = details.length ? details.map(d => `
        <tr>
            <td>#${d.SaleID}</td>
            <td>${d.itemName || d.ItemID}</td>
            <td>${d.QuantitySold}</td>
            <td>${parseFloat(d.SubTotalPrice).toFixed(2)}</td>
            <td>
                <button class="btn-delete" onclick="deleteSaleDetail(${d.id})">Delete</button>
            </td>
        </tr>
    `).join('') : '<tr class="empty-row"><td colspan="5">No sale details found</td></tr>';
}

async function loadSaleDetailSelects() {
    try {
        const [salesRes, itemsRes] = await Promise.all([
            fetch(`${API}/sales`),
            fetch(`${API}/items`)
        ]);
        if (!salesRes.ok || !itemsRes.ok) return;
        const sales = await salesRes.json();
        const items = await itemsRes.json();
        document.getElementById('sdSaleID').innerHTML = '<option value="">Select Sale</option>' +
            sales.map(s => `<option value="${s.id}">#${s.id} - ${s.CustomerName}</option>`).join('');
        document.getElementById('sdItemID').innerHTML = '<option value="">Select Item</option>' +
            items.map(i => `<option value="${i.id}">${i.itemName}</option>`).join('');
    } catch (err) {
        console.error('Failed to load selects:', err);
    }
}

function editItem(id) {
    fetch(`${API}/items/${id}`).then(r => r.json()).then(item => {
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemName').value = item.itemName;
        document.getElementById('Specification').value = item.Specification || '';
        document.getElementById('unitMeasure').value = item.unitMeasure || '';
        document.getElementById('Quantity').value = item.Quantity;
        document.getElementById('unitPrice').value = item.unitPrice;
        document.getElementById('TotalQuantity').value = item.TotalQuantity;
        document.getElementById('itemSubmitBtn').textContent = 'Update Item';
        document.getElementById('itemName').focus();
    });
}

function editSale(id) {
    fetch(`${API}/sales/${id}`).then(r => r.json()).then(sale => {
        document.getElementById('saleId').value = sale.id;
        document.getElementById('SaleDate').value = sale.SaleDate.split('T')[0];
        document.getElementById('CustomerName').value = sale.CustomerName;
        document.getElementById('TotalPrice').value = sale.TotalPrice;
        document.getElementById('saleSubmitBtn').textContent = 'Update Sale';
        document.getElementById('CustomerName').focus();
    });
}

async function deleteItem(id) {
    if (confirm('Delete this item?')) {
        await fetch(`${API}/items/${id}`, { method: 'DELETE' });
        loadItems();
        loadSaleDetailSelects();
    }
}

async function deleteSale(id) {
    if (confirm('Delete this sale?')) {
        await fetch(`${API}/sales/${id}`, { method: 'DELETE' });
        loadSales();
        loadSaleDetailSelects();
    }
}

async function deleteSaleDetail(id) {
    if (confirm('Delete this detail?')) {
        await fetch(`${API}/sale-details/${id}`, { method: 'DELETE' });
        loadSaleDetails();
    }
}

if (localStorage.getItem('user')) {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
    document.getElementById('userDisplay').textContent = 'Welcome, ' + localStorage.getItem('user');
    loadItems();
    loadSales();
    loadSaleDetails();
    loadSaleDetailSelects();
    loadReports();
}

function showReportTab(name, e) {
    document.querySelectorAll('.report-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(name + 'Report').classList.add('active');
    e.target.classList.add('active');
    loadReports();
}

async function loadReports() {
    const activeReport = document.querySelector('.report-tab.active');
    if (!activeReport) return;
    const reportType = activeReport.textContent.trim().includes('Inventory') ? 'inventory' :
                       activeReport.textContent.trim().includes('Sales Details') ? 'saleDetails' : 'sales';
    if (reportType === 'inventory') await loadInventoryReport();
    else if (reportType === 'sales') await loadSalesReport();
    else await loadSaleDetailsReport();
}

async function loadInventoryReport() {
    const res = await fetch(`${API}/reports/inventory`);
    if (!res.ok) return;
    const items = await res.json();
    const tbody = document.querySelector('#inventoryReportTable tbody');
    tbody.innerHTML = items.length ? items.map(item => `
        <tr>
            <td>${item.itemName}</td>
            <td>${item.Specification || '-'}</td>
            <td>${item.unitMeasure || '-'}</td>
            <td>${item.Quantity}</td>
            <td>${parseFloat(item.unitPrice).toFixed(2)}</td>
            <td>${item.TotalQuantity}</td>
        </tr>
    `).join('') : '<tr class="empty-row"><td colspan="6">No inventory data</td></tr>';
}

async function loadSalesReport() {
    const res = await fetch(`${API}/reports/sales`);
    if (!res.ok) return;
    const sales = await res.json();
    const tbody = document.querySelector('#salesReportTable tbody');
    tbody.innerHTML = sales.length ? sales.map(sale => `
        <tr>
            <td>${sale.SaleDate ? sale.SaleDate.split('T')[0] : '-'}</td>
            <td>${sale.CustomerName}</td>
            <td>${parseFloat(sale.TotalPrice).toFixed(2)}</td>
        </tr>
    `).join('') : '<tr class="empty-row"><td colspan="3">No sales data</td></tr>';
}

async function loadSaleDetailsReport() {
    const res = await fetch(`${API}/reports/sales-details`);
    if (!res.ok) return;
    const details = await res.json();
    const tbody = document.querySelector('#saleDetailsReportTable tbody');
    tbody.innerHTML = details.length ? details.map(d => `
        <tr>
            <td>#${d.SaleID}</td>
            <td>${d.SaleDate ? d.SaleDate.split('T')[0] : '-'}</td>
            <td>${d.CustomerName}</td>
            <td>${d.itemName}</td>
            <td>${d.QuantitySold}</td>
            <td>${parseFloat(d.SubTotalPrice).toFixed(2)}</td>
        </tr>
    `).join('') : '<tr class="empty-row"><td colspan="6">No sales details data</td></tr>';
}

function exportReport(type, filename) {
    let csv = '';
    if (type === 'inventory') {
        csv = 'Name,Specification,Unit,Quantity,Unit Price,Total Qty\n';
        document.querySelectorAll('#inventoryReportTable tbody tr').forEach(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length) csv += `${cols[0].textContent},${cols[1].textContent},${cols[2].textContent},${cols[3].textContent},${cols[4].textContent},${cols[5].textContent}\n`;
        });
    } else if (type === 'sales') {
        csv = 'Date,Customer Name,Total Price\n';
        document.querySelectorAll('#salesReportTable tbody tr').forEach(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length) csv += `${cols[0].textContent},${cols[1].textContent},${cols[2].textContent}\n`;
        });
    } else if (type === 'saleDetails') {
        csv = 'Sale ID,Date,Customer,Item,Qty Sold,Sub Total\n';
        document.querySelectorAll('#saleDetailsReportTable tbody tr').forEach(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length) csv += `${cols[0].textContent},${cols[1].textContent},${cols[2].textContent},${cols[3].textContent},${cols[4].textContent},${cols[5].textContent}\n`;
        });
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function printReport(type) {
    const tableId = type === 'inventory' ? 'inventoryReportTable' :
                    type === 'sales' ? 'salesReportTable' : 'saleDetailsReportTable';
    const table = document.getElementById(tableId);
    const win = window.open('', '', 'height=600,width=900');
    win.document.write('<html><head><title>Report</title><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f0f0f0}</style></head><body>');
    win.document.write(table.outerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
}

function printTable(tableId) {
    const table = document.getElementById(tableId);
    const win = window.open('', '', 'height=600,width=900');
    win.document.write('<html><head><title>Print</title><style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f0f0f0}</style></head><body>');
    win.document.write(table.outerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
}
