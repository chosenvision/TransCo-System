// Initialize page
window.onload = function() {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // Load user profile
    loadUserProfile();
    
    // Add smooth scrolling and animations
    initializeAnimations();
};

function loadUserProfile() {
    const fullName = localStorage.getItem('userFullName') || 'SAMPLE FORMAT';
    const email = localStorage.getItem('userEmail') || 'SAMPLE FORMAT';
    
    document.getElementById('profileName').textContent = fullName;
    document.getElementById('profileEmail').textContent = email;
}

function initializeAnimations() {
    // Animate stats on scroll
    const statCards = document.querySelectorAll('.stat-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    });
    
    statCards.forEach(card => {
        observer.observe(card);
    });
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .stat-card {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);
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

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.matches('.profile-icon') && !event.target.closest('#profileModal')) {
        closeProfileModal();
    }
});

window.onclick = function(event) {
    const profileModal = document.getElementById('profileModal');
    if (event.target === profileModal) {
        closeProfileModal();
    }
}

// Add interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to info sections
    const infoSections = document.querySelectorAll('.info-card h3');
    infoSections.forEach(section => {
        section.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        section.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
});
