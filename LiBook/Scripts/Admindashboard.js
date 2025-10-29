// Sidebar Toggle for Mobile
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
    });
}

if (closeSidebar) {
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// Navigation Active State
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        // Don't prevent default for logout link
        if (!item.classList.contains('logout')) {
            e.preventDefault();

            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));

            // Add active class to clicked item
            item.classList.add('active');

            // Get the page name
            const page = item.getAttribute('data-page');

            // Update content header
            updatePageContent(page);

            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        }
    });
});

// Update Page Content
function updatePageContent(page) {
    const contentHeader = document.querySelector('.content-header h1');
    const contentSubtext = document.querySelector('.content-header p');

    const pageContent = {
        'dashboard': {
            title: 'Dashboard',
            subtitle: 'Welcome back, Administrator! Here\'s an overview of your library system.'
        },
        'reservations': {
            title: 'Reservations Management',
            subtitle: 'Manage and monitor all room reservation requests and schedules.'
        },
        'librarian': {
            title: 'Librarian Management',
            subtitle: 'Manage librarian accounts, permissions, and schedules.'
        },
        'rooms': {
            title: 'Room Management',
            subtitle: 'Configure and manage collaboration rooms and their availability.'
        },
        'archives': {
            title: 'Archives',
            subtitle: 'Access historical data and archived reservation records.'
        }
    };

    if (pageContent[page]) {
        contentHeader.textContent = pageContent[page].title;
        contentSubtext.textContent = pageContent[page].subtitle;
    }
}

// Initialize Dashboard Data
function initializeDashboard() {
    // Simulate loading real data
    setTimeout(() => {
        // Update stats with realistic data
        document.getElementById('totalReservations').textContent = '47';
        document.getElementById('activeLibrarians').textContent = '8';
        document.getElementById('availableRooms').textContent = '12';
        document.getElementById('pendingApprovals').textContent = '5';

        // Update percentage changes
        document.getElementById('reservationsChange').textContent = '12%';
        document.getElementById('librariansChange').textContent = '0%';
        document.getElementById('roomsChange').textContent = '3%';
        document.getElementById('approvalsChange').textContent = '25%';
    }, 1000);
}

// Quick Action Functions
function manageReservations() {
    alert('Opening Reservations Management...\n\nThis would navigate to the reservations management page.');
}

function manageLibrarians() {
    alert('Opening Librarian Management...\n\nThis would navigate to the librarian management page.');
}

function manageRooms() {
    alert('Opening Room Management...\n\nThis would navigate to the room management page.');
}

function viewReports() {
    alert('Opening Reports...\n\nThis would navigate to the reports page.');
}

function viewAllReservations() {
    alert('Viewing All Reservations...\n\nThis would show all reservation records.');
}

function viewAllRooms() {
    alert('Viewing All Rooms...\n\nThis would show complete room availability and details.');
}

// Animate stats on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(20px)';

            setTimeout(() => {
                entry.target.style.transition = 'all 0.5s ease';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);

            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe stat cards
document.querySelectorAll('.stat-card').forEach((card, index) => {
    setTimeout(() => {
        observer.observe(card);
    }, index * 100);
});

// Search functionality
const searchInput = document.querySelector('.search-bar input');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
        // Implement search logic here
    });
}

// Notification button click
const notificationBtn = document.querySelector('.notification-btn');

if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
        alert('You have 3 new notifications:\n\n1. New reservation request pending\n2. Room maintenance scheduled\n3. System update available');
    });
}

// User profile click
const userProfile = document.querySelector('.user-profile');

if (userProfile) {
    userProfile.addEventListener('click', () => {
        // Toggle dropdown or navigate to profile
        console.log('User profile clicked');
    });
}

// Quick action buttons
const actionButtons = document.querySelectorAll('.action-btn');

actionButtons.forEach(button => {
    button.addEventListener('click', createRipple);
});

// Activity items hover effect
const activityItems = document.querySelectorAll('.activity-item');

activityItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#f8f9fa';
        item.style.transition = 'background-color 0.3s ease';
    });

    item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'transparent';
    });
});

// Book items hover effect
const bookItems = document.querySelectorAll('.book-item');

bookItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#f8f9fa';
        item.style.transition = 'background-color 0.3s ease';
    });

    item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'transparent';
    });
});

// Auto-update stats (simulated)
function updateStats() {
    const statValues = document.querySelectorAll('.stat-details h3');

    statValues.forEach(stat => {
        const currentValue = parseInt(stat.textContent.replace(/,/g, ''));
        const change = Math.floor(Math.random() * 5) - 2; // Random change between -2 and +2
        const newValue = Math.max(0, currentValue + change);

        if (change !== 0) {
            animateValue(stat, currentValue, newValue, 1000);
        }
    });
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;

        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }

        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Update stats every 30 seconds (optional - comment out if not needed)
// setInterval(updateStats, 30000);

// Smooth scroll for cards
document.querySelectorAll('.card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
});

window.addEventListener('load', () => {
    document.querySelectorAll('.card').forEach((card, index) => {
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });

    // Initialize dashboard data
    initializeDashboard();
});

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    }, 250);
});

// Add ripple effect to buttons
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');

    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    ripple.style.top = `${event.clientY - button.offsetTop - radius}px`;
    ripple.classList.add('ripple');

    const rippleElement = button.getElementsByClassName('ripple')[0];
    if (rippleElement) {
        rippleElement.remove();
    }

    button.appendChild(ripple);
}

console.log('Dashboard initialized successfully!');