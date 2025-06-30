// Sample data storage
let requests = [
    {
        id: 0,
        requestor: "SAMPLE REQUESTOR CARD",
        costCenter: "CC001",
        dateRequest: "2024-01-15",
        timeRequest: "09:30",
        supportDesk: "IT Support",
        dateAcknowledge: "2024-01-15 - John Doe",
        dateClosed: "2024-01-16",
        techSupport: "Jane Smith",
        remarks: "Resolved successfully"
    }
];

let editingIndex = -1;

// Initialize dashboard
window.onload = function() {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // Load user profile
    loadUserProfile();
    
    // Load requests from localStorage if available
    const savedRequests = localStorage.getItem('requests');
    if (savedRequests) {
        requests = JSON.parse(savedRequests);
    }
    
    renderTable();
};

function loadUserProfile() {
    const fullName = localStorage.getItem('userFullName') || 'SAMPLE FORMAT';
    const email = localStorage.getItem('userEmail') || 'SAMPLE FORMAT';
    
    document.getElementById('profileName').textContent = fullName;
    document.getElementById('profileEmail').textContent = email;
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    requests.forEach((request, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.requestor}</td>
            <td>${request.costCenter}</td>
            <td>${request.dateRequest}</td>
            <td>${formatTime(request.timeRequest)}</td>
            <td>${request.supportDesk}</td>
            <td>${request.dateAcknowledge}</td>
            <td>${request.dateClosed || 'Pending'}</td>
            <td>${request.techSupport || 'Not Assigned'}</td>
            <td>${request.remarks || 'No remarks'}</td>
            <td>
                <button class="edit-btn" onclick="editRequest(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteRequest(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Print functionality
function togglePrintDropdown() {
    const dropdown = document.getElementById('printDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function printReport(type) {
    const filteredRequests = requests.filter(request => {
        if (type === 'support') return request.supportDesk === 'IS Support';
        if (type === 'it-support') return request.supportDesk === 'IT Support';
        return true;
    });
    
    // Create print window
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent(filteredRequests, type);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    // Close dropdown
    document.getElementById('printDropdown').style.display = 'none';
}

function generatePrintContent(data, type) {
    const title = type === 'support' ? 'IS Support Report' : 'IT Support Report';
    
    let tableRows = '';
    data.forEach(request => {
        tableRows += `
            <tr>
                <td>${request.requestor}</td>
                <td>${request.costCenter}</td>
                <td>${request.dateRequest}</td>
                <td>${formatTime(request.timeRequest)}</td>
                <td>${request.supportDesk}</td>
                <td>${request.dateAcknowledge}</td>
                <td>${request.dateClosed || 'Pending'}</td>
                <td>${request.techSupport || 'Not Assigned'}</td>
                <td>${request.remarks || 'No remarks'}</td>
            </tr>
        `;
    });
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #22c55e; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .header { text-align: center; margin-bottom: 20px; }
                .date { text-align: right; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>TransCo - ${title}</h1>
                <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Requestor</th>
                        <th>Cost Center</th>
                        <th>Date Request</th>
                        <th>Time</th>
                        <th>Support Desk</th>
                        <th>Date Acknowledge</th>
                        <th>Date Closed</th>
                        <th>Tech Support</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </body>
        </html>
    `;
}

// Profile modal functions
function toggleProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

// Request modal functions
function openAddModal() {
    editingIndex = -1;
    document.getElementById('modalTitle').textContent = 'Add New Request';
    document.getElementById('requestForm').reset();
    document.getElementById('requestModal').style.display = 'block';
}

function editRequest(index) {
    editingIndex = index;
    const request = requests[index];
    
    document.getElementById('modalTitle').textContent = 'Edit Request';
    document.getElementById('requestor').value = request.requestor;
    document.getElementById('costCenter').value = request.costCenter;
    document.getElementById('dateRequest').value = request.dateRequest;
    document.getElementById('timeRequest').value = request.timeRequest;
    document.getElementById('supportDesk').value = request.supportDesk;
    document.getElementById('dateAcknowledge').value = request.dateAcknowledge.split(' - ')[0] || '';
    document.getElementById('dateClosed').value = request.dateClosed;
    document.getElementById('techSupport').value = request.techSupport;
    document.getElementById('remarks').value = request.remarks;
    
    document.getElementById('requestModal').style.display = 'block';
}

function closeRequestModal() {
    document.getElementById('requestModal').style.display = 'none';
}

function deleteRequest(index) {
    if (confirm('Are you sure you want to delete this request?')) {
        requests.splice(index, 1);
        saveRequests();
        renderTable();
    }
}

// Form submission
document.getElementById('requestForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        requestor: document.getElementById('requestor').value,
        costCenter: document.getElementById('costCenter').value,
        dateRequest: document.getElementById('dateRequest').value,
        timeRequest: document.getElementById('timeRequest').value,
        supportDesk: document.getElementById('supportDesk').value,
        dateAcknowledge: document.getElementById('dateAcknowledge').value,
        dateClosed: document.getElementById('dateClosed').value,
        techSupport: document.getElementById('techSupport').value,
        remarks: document.getElementById('remarks').value
    };
    
    if (editingIndex >= 0) {
        // Update existing request
        requests[editingIndex] = { ...requests[editingIndex], ...formData };
    } else {
        // Add new request
        formData.id = Date.now();
        requests.push(formData);
    }
    
    saveRequests();
    renderTable();
    closeRequestModal();
});

function saveRequests() {
    localStorage.setItem('requests', JSON.stringify(requests));
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.matches('.print-btn')) {
        document.getElementById('printDropdown').style.display = 'none';
    }
    
    if (!event.target.matches('.profile-icon') && !event.target.closest('#profileModal')) {
        closeProfileModal();
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const requestModal = document.getElementById('requestModal');
    const profileModal = document.getElementById('profileModal');
    
    if (event.target === requestModal) {
        closeRequestModal();
    }
    if (event.target === profileModal) {
        closeProfileModal();
    }
}
