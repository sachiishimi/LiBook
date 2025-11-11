// ========================================
// DOM ELEMENT REFERENCES - SIDEBAR
// ========================================
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
const mainContent = document.querySelector('.main-content');
const navItems = document.querySelectorAll('.nav-item');

// ========================================
// SIDEBAR FUNCTIONALITY
// ========================================

// Desktop Sidebar Toggle
if (sidebarToggleDesktop) {
    sidebarToggleDesktop.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
}

// Restore sidebar state
window.addEventListener('DOMContentLoaded', () => {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
});

// Mobile Sidebar Toggle
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebar.classList.remove('collapsed');
        mainContent.classList.remove('expanded');
        // Prevent body scroll when mobile sidebar is open
        toggleBodyScroll(false);
    });
}

if (closeSidebar) {
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
        // Restore body scroll when mobile sidebar is closed
        if (window.innerWidth <= 768) {
            toggleBodyScroll(true);
        }
    });
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (sidebar && !sidebar.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
            toggleBodyScroll(true);
        }
    }
});

// ========================================
// NAVIGATION
// ========================================
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        if (!item.classList.contains('logout') && item.getAttribute('href') !== '#') {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Close mobile sidebar
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('active');
                toggleBodyScroll(true);
            }
        }
    });
});

// ========================================
// NAVIGATION FUNCTIONS
// ========================================
function viewAllRooms() {
    window.location.href = '/LibrarianDashboard/Rooms';
}

function viewAllReservations() {
    window.location.href = '/LibrarianDashboard/Reservations';
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Prevent body scroll when mobile sidebar is open
function toggleBodyScroll(enable) {
    document.body.style.overflow = enable ? '' : 'hidden';
}

// Close sidebar and restore scroll on resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        toggleBodyScroll(true);
    }
});

// Keyboard navigation support for sidebar
document.addEventListener('keydown', (e) => {
    // Close sidebar with Escape key
    if (e.key === 'Escape') {
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            toggleBodyScroll(true);
        }
    }
});

// Performance optimization for resize events
let sidebarResizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(sidebarResizeTimeout);
    sidebarResizeTimeout = setTimeout(() => {
        if (window.innerWidth > 768 && sidebar) {
            sidebar.classList.remove('active');
            toggleBodyScroll(true);
        }
    }, 250);
});