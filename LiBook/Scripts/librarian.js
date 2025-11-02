// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
const mainContent = document.querySelector('.main-content');
const userProfile = document.getElementById('userProfile');
const userDropdown = document.getElementById('userDropdown');
const userSearch = document.getElementById('userSearch');
const addUserBtn = document.getElementById('addUserBtn');

// Tab Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tableSections = document.querySelectorAll('.table-section');

// Current active tab
let activeTab = 'librarians';

// ============================================
// SIDEBAR FUNCTIONALITY
// ============================================

// Sidebar Toggle for Desktop (Collapse/Expand)
if (sidebarToggleDesktop) {
    sidebarToggleDesktop.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
}

// Restore sidebar state on page load
window.addEventListener('load', () => {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }

    // Initialize user management functionality
    initializeUserManagement();
});

// Sidebar Toggle for Mobile
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        // Remove collapsed state when opening mobile sidebar
        sidebar.classList.remove('collapsed');
        mainContent.classList.remove('expanded');
    });
}

if (closeSidebar) {
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
}

// Close mobile sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// ============================================
// USER PROFILE DROPDOWN
// ============================================

// User Profile Dropdown Toggle
if (userProfile) {
    userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        userProfile.classList.toggle('active');
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    if (userProfile) {
        userProfile.classList.remove('active');
    }
});

// ============================================
// NAVIGATION ACTIVE STATE
// ============================================

// Navigation Active State
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        // Only prevent default for non-logout items and actual navigation
        if (!item.classList.contains('logout') && item.getAttribute('href') !== '#') {
            // Don't prevent default - let the link work normally
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Close mobile sidebar after navigation
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        }
    });
});

// Set active nav item based on current page
window.addEventListener('load', () => {
    const currentPath = window.location.pathname;
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href)) {
            item.classList.add('active');
        }
    });
});

// ============================================
// USER MANAGEMENT FUNCTIONALITY
// ============================================

function initializeUserManagement() {
    // Initialize tab functionality
    initializeTabs();

    // Initialize search functionality
    initializeSearch();

    // Initialize action buttons
    initializeActionButtons();
}

// Tab functionality
function initializeTabs() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update active tab button
    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update active table section
    tableSections.forEach(section => {
        if (section.id === `${tabName}-section`) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });

    // Update active tab and add button text
    activeTab = tabName;
    updateAddButtonText();

    // Clear search when switching tabs
    if (userSearch) {
        userSearch.value = '';
        filterUsers('');
    }
}

function updateAddButtonText() {
    if (!addUserBtn) return;

    const buttonText = addUserBtn.querySelector('span');
    if (activeTab === 'librarians') {
        buttonText.textContent = 'Add Librarian';
    } else {
        buttonText.textContent = 'Add Admin';
    }
}

// Search functionality
function initializeSearch() {
    if (userSearch) {
        userSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            filterUsers(searchTerm);
        });
    }
}

function filterUsers(searchTerm) {
    const activeTable = document.querySelector(`#${activeTab}-section .users-table tbody`);
    if (!activeTable) return;

    const rows = activeTable.querySelectorAll('tr');

    rows.forEach(row => {
        const name = row.querySelector('.user-name').textContent.toLowerCase();
        const username = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const email = row.querySelector('.user-email').textContent.toLowerCase();

        if (searchTerm === '' ||
            name.includes(searchTerm) ||
            username.includes(searchTerm) ||
            email.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Action buttons functionality
function initializeActionButtons() {
    // Add user button
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            addNewUser();
        });
    }

    // Edit and delete buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.icon-btn.small:not(.danger)')) {
            const btn = e.target.closest('.icon-btn.small:not(.danger)');
            editUser(btn);
        } else if (e.target.closest('.icon-btn.small.danger')) {
            const btn = e.target.closest('.icon-btn.small.danger');
            deleteUser(btn);
        }
    });
}

function addNewUser() {
    const userType = activeTab === 'librarians' ? 'Librarian' : 'Admin';
    showNotification(`Add ${userType} functionality would open here`, 'info');
    console.log(`Adding new ${userType}`);
    // In a real application, this would open a modal or form
}

function editUser(button) {
    const row = button.closest('tr');
    const userName = row.querySelector('.user-name').textContent;
    const userType = activeTab === 'librarians' ? 'Librarian' : 'Admin';
    showNotification(`Editing ${userType}: ${userName}`, 'info');
    console.log(`Editing user: ${userName}`);
    // In a real application, this would open an edit form
}

function deleteUser(button) {
    const row = button.closest('tr');
    const userName = row.querySelector('.user-name').textContent;
    const userType = activeTab === 'librarians' ? 'Librarian' : 'Admin';

    if (confirm(`Are you sure you want to delete ${userType} ${userName}?`)) {
        showNotification(`${userType} ${userName} deleted successfully`, 'info');
        console.log(`Deleting user: ${userName}`);
        // In a real application, this would make an API call to delete the user
        // row.remove();
    }
}

// ============================================
// NOTIFICATION FUNCTIONALITY
// ============================================

// Notification button click
const notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
        showNotification('You have 3 new notifications', 'info');
    });
}

// Simple notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'info' ? '#2c3e50' : '#c62828'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: 'Kumbh Sans', sans-serif;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animation styles for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// WINDOW RESIZE HANDLER
// ============================================

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
        if (userProfile) {
            userProfile.classList.remove('active');
        }
    }, 250);
});

console.log('User Management page initialized successfully!');