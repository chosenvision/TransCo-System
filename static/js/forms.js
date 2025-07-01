// Initialize page
window.onload = function() {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // Load user profile
    loadUserProfile();
    
    // Initialize expandable textareas
    initializeExpandableTextareas();
    
    // Set current date and time
    setCurrentDateTime();
};

function loadUserProfile() {
    const fullName = localStorage.getItem('userFullName') || 'SAMPLE FORMAT';
    const email = localStorage.getItem('userEmail') || 'SAMPLE FORMAT';
    
    document.getElementById('profileName').textContent = fullName;
    document.getElementById('profileEmail').textContent = email;
}

function setCurrentDateTime() {
    const now = new Date();
    const dateString = now.toISOString().split('T')[0];
    const timeString = now.toTimeString().split(' ')[0].substring(0, 5);
    
    document.getElementById('requestDate').value = dateString;
    document.getElementById('requestTime').value = timeString;
}

function initializeExpandableTextareas() {
    const textareas = document.querySelectorAll('.expandable-textarea');
    
    textareas.forEach(textarea => {
        // Auto-resize function
        function autoResize() {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(45, textarea.scrollHeight) + 'px';
        }
        
        // Expand on click
        textarea.addEventListener('click', function() {
            this.classList.add('expanded');
            autoResize();
        });
        
        // Auto-resize on input
        textarea.addEventListener('input', autoResize);
        
        // Expand on focus
        textarea.addEventListener('focus', function() {
            this.classList.add('expanded');
            autoResize();
        });
        
        // Optional: Collapse when empty and loses focus
        textarea.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.classList.remove('expanded');
                this.style.height = '45px';
            }
        });
    });
}

// Form submission
document.getElementById('requestForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = {
        id: Date.now(),
        requestor: document.getElementById('requestor').value,
        requestDate: document.getElementById('requestDate').value,
        requestTime: document.getElementById('requestTime').value,
        subject: document.getElementById('subject').value,
        details: document.getElementById('details').value,
        category: document.getElementById('category').value,
        dateAcknowledge: document.getElementById('dateAcknowledge').value,
        actionTaken: document.getElementById('actionTaken').value,
        dateAcknowledge2: document.getElementById('dateAcknowledge2').value,
        timeAcknowledge: document.getElementById('timeAcknowledge').value,
        agent: document.getElementById('agent').value,
        submittedAt: new Date().toISOString(),
        status: 'Pending'
    };
    
    // Validate required fields
    if (!formData.requestor || !formData.requestDate || !formData.requestTime || 
        !formData.subject || !formData.details || !formData.category) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }
    
    // Save to localStorage
    saveFormData(formData);
    
    // Show success modal
    document.getElementById('successModal').style.display = 'block';
    
    // Reset form
    document.getElementById('requestForm').reset();
    setCurrentDateTime();
    
    // Reset textareas
    const textareas = document.querySelectorAll('.expandable-textarea');
    textareas.forEach(textarea => {
        textarea.classList.remove('expanded');
        textarea.style.height = '45px';
    });
});

function saveFormData(formData) {
    // Get existing requests
    let requests = JSON.parse(localStorage.getItem('requests') || '[]');
    
    // Add new request
    requests.push({
        id: formData.id,
        requestor: formData.requestor,
        costCenter: 'CC' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
        dateRequest: formData.requestDate,
        timeRequest: formData.requestTime,
        supportDesk: formData.category.includes('Hardware') || formData.category.includes('Network') ? 'IT Support' : 'IS Support',
        dateAcknowledge: formData.dateAcknowledge ? formData.dateAcknowledge + ' - ' + (formData.agent || 'System') : '',
        dateClosed: '',
        techSupport: formData.agent || '',
        remarks: formData.subject + ' - ' + formData.details
    });
    
    // Save back to localStorage
    localStorage.setItem('requests', JSON.stringify(requests));
    
    // Also save detailed form data
    let detailedForms = JSON.parse(localStorage.getItem('detailedForms') || '[]');
    detailedForms.push(formData);
    localStorage.setItem('detailedForms', JSON.stringify(detailedForms));
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        ${type === 'success' ? 'background: #22c55e;' : 'background: #ef4444;'}
    `;
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#alert-styles')) {
        const style = document.createElement('style');
        style.id = 'alert-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Navigation functions
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Profile modal functions
function toggleProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
}

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userFullName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userData');
        window.location.href = 'index.html';
    }
}

// Event listeners
document.addEventListener('click', function(event) {
    if (!event.target.matches('.profile-icon') && !event.target.closest('#profileModal')) {
        closeProfileModal();
    }
});

window.onclick = function(event) {
    const profileModal = document.getElementById('profileModal');
    const successModal = document.getElementById('successModal');
    
    if (event.target === profileModal) {
        closeProfileModal();
    }
    if (event.target === successModal) {
        closeSuccessModal();
    }
}

// Add smooth scrolling for form navigation
document.addEventListener('DOMContentLoaded', function() {
    // Add focus indicators for better UX
    const formInputs = document.querySelectorAll('input, select, textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateX(5px)';
            this.parentElement.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateX(0)';
        });
    });
    
    // Add loading animation to submit button
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    document.getElementById('requestForm').addEventListener('submit', function() {
        submitBtn.textContent = 'SUBMITTING...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('requestForm').dispatchEvent(new Event('submit'));
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closeProfileModal();
        closeSuccessModal();
    }
});
