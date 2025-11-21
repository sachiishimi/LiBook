// ========================================
// DOM ELEMENT REFERENCES
// ========================================
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
const mainContent = document.querySelector('.main-content');
const userProfile = document.getElementById('userProfile');

// ========================================
// SIDEBAR FUNCTIONALITY
// ========================================

// Desktop Sidebar Toggle
if (sidebarToggleDesktop && sidebar && mainContent) {
    sidebarToggleDesktop.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', String(sidebar.classList.contains('collapsed')));
    });
}

// Restore sidebar state
window.addEventListener('DOMContentLoaded', () => {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed && sidebar && mainContent) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
});

// Mobile Sidebar Toggle
if (menuToggle && sidebar && mainContent) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebar.classList.remove('collapsed');
        mainContent.classList.remove('expanded');
    });
}

if (closeSidebar && sidebar) {
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        const target = e.target;
        if (target instanceof Node && sidebar && !sidebar.contains(target) && menuToggle && !menuToggle.contains(target)) {
            sidebar.classList.remove('active');
        }
    }
});

// ========================================
// USER PROFILE DROPDOWN
// ========================================
if (userProfile) {
    userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        userProfile.classList.toggle('active');
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const target = e.target;
    if (userProfile && target instanceof Node && !userProfile.contains(target)) {
        userProfile.classList.remove('active');
    }
});

// ========================================
// NAVIGATION
// ========================================
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        if (!item.classList.contains('logout') && item.getAttribute('href') !== '#') {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Close mobile sidebar
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('active');
            }
        }
    });
});

// Handle logout button
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        const logoutForm = document.getElementById('logoutForm');
        if (logoutForm && logoutForm instanceof HTMLFormElement) {
            logoutForm.submit();
        }
    });
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================
function showNotification(message, type) {
    type = type || 'info';

    var notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(function () {
        notification.classList.add('notification-exit');
        setTimeout(function () {
            notification.remove();
        }, 300);
    }, 3000);
}

// ========================================
// NOTIFICATION BUTTON
// ========================================
const notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
        showNotification('You have 3 new notifications', 'info');
    });
}

// ========================================
// WINDOW RESIZE HANDLER
// ========================================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && sidebar) {
            sidebar.classList.remove('active');
        }
        if (userProfile) {
            userProfile.classList.remove('active');
        }
    }, 250);
});

// ========================================
// KEYBOARD NAVIGATION SUPPORT
// ========================================
document.addEventListener('keydown', (e) => {
    // Close sidebar with Escape key
    if (e.key === 'Escape') {
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
        if (userProfile && userProfile.classList.contains('active')) {
            userProfile.classList.remove('active');
        }
    }
});

// ========================================
// PREVENT BODY SCROLL WHEN MOBILE SIDEBAR IS OPEN
// ========================================
function toggleBodyScroll(enable) {
    document.body.style.overflow = enable ? '' : 'hidden';
}

// Enhanced sidebar toggle with body scroll control
if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
        const isOpening = !sidebar.classList.contains('active');
        if (isOpening && window.innerWidth <= 768) {
            toggleBodyScroll(false);
        }
    });
}

if (closeSidebar && sidebar) {
    closeSidebar.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            toggleBodyScroll(true);
        }
    });
}

// Close sidebar and restore scroll on resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        toggleBodyScroll(true);
    }
});

// ========================================
// ENHANCED NOTIFICATION SYSTEM WITH QUEUE
// ========================================
var notificationQueue = [];
var isShowingNotification = false;

function showQueuedNotification(message, type) {
    type = type || 'info';

    if (isShowingNotification) {
        notificationQueue.push({ message: message, type: type });
        return;
    }

    isShowingNotification = true;
    showNotification(message, type);

    setTimeout(function () {
        isShowingNotification = false;
        if (notificationQueue.length > 0) {
            var nextNotification = notificationQueue.shift();
            if (nextNotification) {
                showQueuedNotification(nextNotification.message, nextNotification.type);
            }
        }
    }, 3300);
}

// Update notification button to use queued system
if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
        showQueuedNotification('You have 3 new notifications', 'info');
    });
}

// ========================================
// TAB FUNCTIONALITY
// ========================================
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

if (tabButtons.length > 0 && tabContents.length > 0) {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Add active class to corresponding content
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // Save active tab to localStorage
            localStorage.setItem('activeArchiveTab', targetTab);

            // Show notification
            const tabName = targetTab === 'successful' ? 'Successful Reservations' : 'Cancelled Reservations';
            showQueuedNotification(`Switched to ${tabName}`, 'info');
        });
    });

    // Restore active tab from localStorage
    const savedTab = localStorage.getItem('activeArchiveTab');
    if (savedTab) {
        const savedButton = document.querySelector(`.tab-btn[data-tab="${savedTab}"]`);
        const savedContent = document.getElementById(`${savedTab}-tab`);

        if (savedButton && savedContent) {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            savedButton.classList.add('active');
            savedContent.classList.add('active');
        }
    }
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================
const successfulSearch = document.getElementById('successfulSearch');
const cancelledSearch = document.getElementById('cancelledSearch');

function setupSearchFunctionality(searchInput, tableId) {
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const table = document.querySelector(`#${tableId} .data-table tbody`);

        if (!table) return;

        const rows = table.querySelectorAll('tr');
        let visibleCount = 0;

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Show notification if no results found
        if (visibleCount === 0 && searchTerm !== '') {
            showQueuedNotification('No results found', 'info');
        }
    });
}

setupSearchFunctionality(successfulSearch, 'successful-tab');
setupSearchFunctionality(cancelledSearch, 'cancelled-tab');

// ========================================
// DATE PARSING AND FILTERING FUNCTIONALITY
// ========================================
function parseDate(dateString) {
    // Parse dates in format "Nov 15, 2024"
    const months = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    const parts = dateString.trim().split(' ');
    if (parts.length !== 3) return null;

    const month = months[parts[0]];
    const day = parseInt(parts[1].replace(',', ''));
    const year = parseInt(parts[2]);

    if (month === undefined || isNaN(day) || isNaN(year)) return null;

    return new Date(year, month, day);
}

function isDateInRange(dateString, filterValue) {
    const date = parseDate(dateString);
    if (!date) return true; // Show if we can't parse

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filterValue) {
        case 'today':
            const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            return itemDate.getTime() === today.getTime();

        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return date >= weekAgo && date <= now;

        case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return date >= monthAgo && date <= now;

        case 'all':
        default:
            return true;
    }
}

function setupFilterFunctionality(filterSelect, tableId) {
    if (!filterSelect) return;

    filterSelect.addEventListener('change', (e) => {
        const filterValue = e.target.value;
        const table = document.querySelector(`#${tableId} .data-table tbody`);

        if (!table) return;

        const rows = table.querySelectorAll('tr');
        let visibleCount = 0;

        rows.forEach(row => {
            // Get the date column (4th column for both tables - index 3)
            const cells = row.querySelectorAll('td');
            if (cells.length > 3) {
                const dateString = cells[3].textContent; // Reserved Date or Reserved Date column

                if (isDateInRange(dateString, filterValue)) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            }
        });

        // Show notification
        const filterNames = {
            'all': 'All Time',
            'today': 'Today',
            'week': 'This Week',
            'month': 'This Month'
        };

        showQueuedNotification(`Filter applied: ${filterNames[filterValue]} (${visibleCount} results)`, 'success');
    });
}

// ========================================
// FILTER FUNCTIONALITY
// ========================================
const successfulFilter = document.getElementById('successfulFilter');
const cancelledFilter = document.getElementById('cancelledFilter');

setupFilterFunctionality(successfulFilter, 'successful-tab');
setupFilterFunctionality(cancelledFilter, 'cancelled-tab');

// ========================================
// PAGINATION FUNCTIONALITY
// ========================================
const paginationButtons = document.querySelectorAll('.pagination-btn');

paginationButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.disabled) return;

        // Remove active class from all pagination buttons in the same container
        const container = button.closest('.pagination');
        if (container) {
            container.querySelectorAll('.pagination-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        }

        // Add active class to clicked button if it's a number
        if (!button.querySelector('i')) {
            button.classList.add('active');
            showQueuedNotification(`Page ${button.textContent} loaded`, 'info');
        }
    });
});

// ========================================
// INITIALIZATION
// ========================================
console.log('✅ Librarian Archives Page Initialized Successfully!');
console.log('📊 Tab System Ready');
console.log('🔍 Search & Filter Systems Active');