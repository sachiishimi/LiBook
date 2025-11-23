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

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');

        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        const activeContent = document.getElementById(`${targetTab}-tab`);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        // Reset filters when switching tabs
        const dateFilterSelect = document.getElementById(`${targetTab}DateFilter`);
        const userTypeFilterSelect = document.getElementById(`${targetTab}UserTypeFilter`);

        if (dateFilterSelect) dateFilterSelect.value = 'all';
        if (userTypeFilterSelect) userTypeFilterSelect.value = 'all';

        applyFilters(targetTab, 'all', 'all');

        showQueuedNotification(`Switched to ${targetTab} reservations`, 'info');
    });
});

// ========================================
// DATE PARSING AND RANGE CHECKING
// ========================================
function parseDate(dateString) {
    return new Date(dateString);
}

function isDateInRange(dateString, filterType) {
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filterType) {
        case 'today':
            const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            return checkDate.getTime() === today.getTime();

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

// ========================================
// USER TYPE FILTERING
// ========================================
function matchesUserType(userType, filterType) {
    if (filterType === 'all') return true;

    // Handle "Admin/Faculty" option - matches both Admin and Faculty
    if (filterType === 'Faculty') {
        return userType === 'Faculty' || userType === 'Admin';
    }

    return userType === filterType;
}

// ========================================
// CORE FILTER FUNCTION - DUAL FILTERING
// ========================================
function applyFilters(tabType, dateFilter, userTypeFilter) {
    const tableId = `${tabType}-tab`;
    const table = document.querySelector(`#${tableId} .data-table tbody`);

    if (!table) return;

    // Filter the table with BOTH filters
    const rows = table.querySelectorAll('tr');
    let visibleCount = 0;
    let todayCount = 0;

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowUserType = row.getAttribute('data-user-type');

        if (cells.length > 3 && rowUserType) {
            const dateString = cells[3].textContent; // Date column

            // Check both date and user type filters
            const dateMatch = isDateInRange(dateString, dateFilter);
            const userTypeMatch = matchesUserType(rowUserType, userTypeFilter);

            // Show row only if BOTH filters match
            if (dateMatch && userTypeMatch) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }

            // Always count today's entries for the static right card
            if (isDateInRange(dateString, 'today')) {
                todayCount++;
            }
        }
    });

    // Update stat cards with new logic
    updateStatCards(tabType, dateFilter, visibleCount, rows.length, todayCount);

    // Update active stat card highlighting
    highlightActiveStatCard(tabType, dateFilter);

    // Update filter dropdowns
    const dateFilterSelect = document.getElementById(`${tabType}DateFilter`);
    const userTypeFilterSelect = document.getElementById(`${tabType}UserTypeFilter`);

    if (dateFilterSelect) dateFilterSelect.value = dateFilter;
    if (userTypeFilterSelect) userTypeFilterSelect.value = userTypeFilter;

    // Show notification
    const dateFilterNames = {
        'all': 'All Time',
        'today': 'Today',
        'week': 'This Week',
        'month': 'This Month'
    };

    const userTypeNames = {
        'all': 'All Users',
        'Student': 'Students',
        'Faculty': 'Admin/Faculty',
        'Admin': 'Admin/Faculty',
        'Visitor': 'Visitors'
    };

    showQueuedNotification(
        `Filters: ${dateFilterNames[dateFilter]} | ${userTypeNames[userTypeFilter]} (${visibleCount} results)`,
        'success'
    );
}

// ========================================
// UPDATE STAT CARDS WITH 3-CARD LAYOUT
// Left: Total (Static)
// Middle: Dynamic (changes based on DATE filter only)
// Right: Today Count (Static)
// ========================================
function updateStatCards(tabType, dateFilter, filteredCount, totalCount, todayCount) {
    // Get stat card elements
    const totalCountElement = document.getElementById(`${tabType}-total-count`);
    const filteredCountElement = document.getElementById(`${tabType}-filtered-count`);
    const filteredLabelElement = document.getElementById(`${tabType}-filtered-label`);
    const todayCountElement = document.getElementById(`${tabType}-today-count`);

    // LEFT CARD: Always show total count (Static)
    if (totalCountElement) {
        totalCountElement.textContent = totalCount;
    }

    // MIDDLE CARD: Dynamic - updates based on DATE filter
    if (filteredCountElement && filteredLabelElement) {
        filteredCountElement.textContent = filteredCount;

        switch (dateFilter) {
            case 'today':
                filteredLabelElement.textContent = 'Today';
                break;
            case 'week':
                filteredLabelElement.textContent = 'This Week';
                break;
            case 'month':
                filteredLabelElement.textContent = 'This Month';
                break;
            case 'all':
            default:
                filteredLabelElement.textContent = 'All Time';
                break;
        }
    }

    // RIGHT CARD: Always show today's count (Static)
    if (todayCountElement) {
        todayCountElement.textContent = todayCount;
    }
}

// ========================================
// HIGHLIGHT ACTIVE STAT CARD
// ========================================
function highlightActiveStatCard(tabType, dateFilter) {
    // Get all stat cards for this tab
    const tabContent = document.getElementById(`${tabType}-tab`);
    if (!tabContent) return;

    const statCards = tabContent.querySelectorAll('.clickable-stat');

    // Remove active class from all cards
    statCards.forEach(card => card.classList.remove('active-filter'));

    // Add active class to the matching card (middle card only)
    statCards.forEach(card => {
        if (card.getAttribute('data-filter') === dateFilter) {
            card.classList.add('active-filter');
        }
    });
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================
const successfulSearch = document.getElementById('successfulSearch');
const cancelledSearch = document.getElementById('cancelledSearch');

function setupSearchFunctionality(searchInput, tableId, tabType) {
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

        if (visibleCount === 0 && searchTerm !== '') {
            showQueuedNotification('No results found', 'info');
        }

        // Update stats after search with current filters
        const dateFilterSelect = document.getElementById(`${tabType}DateFilter`);
        const currentDateFilter = dateFilterSelect ? dateFilterSelect.value : 'all';

        // Recalculate counts for stat cards
        let todayCount = 0;
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 3) {
                const dateString = cells[3].textContent;
                if (isDateInRange(dateString, 'today')) {
                    todayCount++;
                }
            }
        });

        updateStatCards(tabType, currentDateFilter, visibleCount, rows.length, todayCount);
    });
}

setupSearchFunctionality(successfulSearch, 'successful-tab', 'successful');
setupSearchFunctionality(cancelledSearch, 'cancelled-tab', 'cancelled');

// ========================================
// FILTER DROPDOWN FUNCTIONALITY - DUAL FILTERS
// ========================================
function setupFilterFunctionality(tabType) {
    const dateFilterSelect = document.getElementById(`${tabType}DateFilter`);
    const userTypeFilterSelect = document.getElementById(`${tabType}UserTypeFilter`);

    // Date filter change
    if (dateFilterSelect) {
        dateFilterSelect.addEventListener('change', (e) => {
            const dateFilter = e.target.value;
            const userTypeFilter = userTypeFilterSelect ? userTypeFilterSelect.value : 'all';
            applyFilters(tabType, dateFilter, userTypeFilter);
        });
    }

    // User type filter change
    if (userTypeFilterSelect) {
        userTypeFilterSelect.addEventListener('change', (e) => {
            const userTypeFilter = e.target.value;
            const dateFilter = dateFilterSelect ? dateFilterSelect.value : 'all';
            applyFilters(tabType, dateFilter, userTypeFilter);
        });
    }
}

setupFilterFunctionality('successful');
setupFilterFunctionality('cancelled');

// ========================================
// STAT CARD CLICK FUNCTIONALITY
// Note: Only the middle card is clickable and updates the DATE filter
// ========================================
const clickableStats = document.querySelectorAll('.clickable-stat');

clickableStats.forEach(statCard => {
    statCard.addEventListener('click', () => {
        const dateFilter = statCard.getAttribute('data-filter');
        const tabType = statCard.getAttribute('data-tab');

        // Get current user type filter
        const userTypeFilterSelect = document.getElementById(`${tabType}UserTypeFilter`);
        const userTypeFilter = userTypeFilterSelect ? userTypeFilterSelect.value : 'all';

        // Apply both filters
        applyFilters(tabType, dateFilter, userTypeFilter);
    });
});

// ========================================
// PAGINATION FUNCTIONALITY
// ========================================
const paginationButtons = document.querySelectorAll('.pagination-btn');

paginationButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.disabled) return;

        const container = button.closest('.pagination');
        if (container) {
            container.querySelectorAll('.pagination-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        }

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
console.log('📊 3-Card Stat System Active (Left: Total, Middle: Dynamic, Right: Today)');
console.log('🔍 Dual Filter System Active (Date + User Type)');
console.log('🎯 Dynamic Label Updates Enabled');

// Initialize with "all" filters on page load
window.addEventListener('load', () => {
    applyFilters('successful', 'all', 'all');
    applyFilters('cancelled', 'all', 'all');
});