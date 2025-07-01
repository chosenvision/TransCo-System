// Contact information data
const contactData = {
    email: {
        title: "Email Information",
        details: [
            { label: "General Inquiries", value: "info@transco.ph" },
            { label: "IT Support", value: "itsupport@transco.ph" },
            { label: "IS Support", value: "issupport@transco.ph" },
            { label: "Customer Service", value: "customerservice@transco.ph" },
            { label: "Emergency", value: "emergency@transco.ph" }
        ]
    },
    location: {
        title: "Office Locations",
        details: [
            { label: "Head Office", value: "National Transmission Corporation, Quezon Avenue, Diliman, Quezon City 1101" },
            { label: "Regional Office - Luzon", value: "TransCo Luzon, Makati City, Metro Manila" },
            { label: "Regional Office - Visayas", value: "TransCo Visayas, Cebu City, Cebu" },
            { label: "Regional Office - Mindanao", value: "TransCo Mindanao, Davao City, Davao del Sur" },
            { label: "GPS Coordinates", value: "14.6507° N, 121.1029° E" }
        ]
    },
    phone: {
        title: "Phone Numbers",
        details: [
            { label: "Main Hotline", value: "+63 (2) 8123-4567" },
            { label: "IT Support", value: "+63 (2) 8123-4568 ext. 101" },
            { label: "IS Support", value: "+63 (2) 8123-4568 ext. 102" },
            { label: "Customer Service", value: "+63 (2) 8123-4568 ext. 103" },
            { label: "Emergency Hotline", value: "+63 (2) 8911-HELP (4357)" },
            { label: "Mobile Support", value: "+63 917-123-4567" }
        ]
    }
};

// Initialize page
window.onload = function() {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // Load user profile
    loadUserProfile();
    
    // Initialize animations
    initializeAnimations();
};

function loadUserProfile() {
    const fullName = localStorage.getItem('userFullName') || 'SAMPLE FORMAT';
    const email = localStorage.getItem('userEmail') || 'SAMPLE FORMAT';
    
    document.getElementById('profileName').textContent = fullName;
    document.getElementById('profileEmail').textContent = email;
}

function initializeAnimations() {
    // Animate contact items on load
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.6s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Animate info cards
    const infoCards = document.querySelectorAll('.info-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInLeft 0.6s ease forwards';
            }
        });
    });
    
    infoCards.forEach(card => {
        observer.observe(card);
    });
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .info-card {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);
}

// Contact modal functions
function openContactModal(type) {
    const modal = document.getElementById('contactModal');
    const modalContent = document.getElementById('modalContent');
    
    const data = contactData[type];
    if (!data) return;
    
    let detailsHTML = '';
    data.details.forEach(detail => {
        detailsHTML += `
            <div class="detail-item">
                <strong>${detail.label}:</strong>
                <span>${detail.value}</span>
            </div>
        `;
    });
    
    modalContent.innerHTML = `
        <div class="contact-details">
            <h2>${data.title}</h2>
            ${detailsHTML}
            <div style="margin-top: 20px;">
                <button onclick="copyToClipboard('${type}')" class="copy-btn">Copy All Information</button>
            </div>
        </div>
    `;
    
    // Add copy button styles
    const copyBtn = modalContent.querySelector('.copy-btn');
    if (copyBtn) {
        copyBtn.style.cssText = `
            background: #22c55e;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        `;
        
        copyBtn.addEventListener('mouseenter', function() {
            this.style.background = '#16a34a';
        });
        
        copyBtn.addEventListener('mouseleave', function() {
            this.style.background = '#22c55e';
        });
    }
    
    modal.style.display = 'block';
}

function closeContactModal() {
    document.getElementById('contactModal').style.display = 'none';
}

function copyToClipboard(type) {
    const data = contactData[type];
    let textToCopy = `${data.title}\n\n`;
    
    data.details.forEach(detail => {
        textToCopy += `${detail.label}: ${detail.value}\n`;
    });
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        showNotification('Contact information copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Contact information copied to clipboard!', 'success');
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#22c55e' : '#ef4444'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}

// Profile modal functions
function toggleProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
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
    const contactModal = document.getElementById('contactModal');
    const profileModal = document.getElementById('profileModal');
    
    if (event.target === contactModal) {
        closeContactModal();
    }
    if (event.target === profileModal) {
        closeProfileModal();
    }
}

// Add interactive hover effects
document.addEventListener('DOMContentLoaded', function() {
    const contactItems = document.querySelectorAll('.contact-item');
    
    contactItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 12px 32px rgba(34, 197, 94, 0.2)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });
});
