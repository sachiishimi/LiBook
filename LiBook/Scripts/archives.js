// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
const mainContent = document.querySelector('.main-content');
const userProfile = document.getElementById('userProfile');
const userDropdown = document.getElementById('userDropdown');

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
// SEARCH FUNCTIONALITY
// ============================================

// Search functionality
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
        // Implement actual search functionality here
    });
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

// ==================== TOAST NOTIFICATION =====================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;

    const icon = type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-circle' :
            type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="toast-content">${message}</div>
    `;

    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
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

console.log('Sidebar and Topbar initialized successfully!');

// ==================== TAB SWITCHING =====================
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        // remove all active states
        tabs.forEach(t => t.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));

        // activate selected
        tab.classList.add("active");
        document.getElementById(tab.dataset.target).classList.add("active");
    });
});

// ==================== FILTER SEARCH FUNCTIONALITY =====================
const filterSearchInputs = document.querySelectorAll('.filter-search');

filterSearchInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const tabContent = e.target.closest('.tab-content');
        const table = tabContent.querySelector('table tbody');
        const rows = table.querySelectorAll('tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
});

// ==================== TIME FILTER FUNCTIONALITY =====================
const timeFilters = document.querySelectorAll('.time-filter');

timeFilters.forEach(filter => {
    filter.addEventListener('change', (e) => {
        const filterValue = e.target.value;
        console.log('Filter by:', filterValue);
        // Implement time-based filtering here
        // This would typically filter the table rows based on date columns
    });
});

// ==================== TABLE SEARCH FUNCTIONALITY =====================
const tableSearchInputs = document.querySelectorAll('.table-search');

tableSearchInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const tableId = e.target.getAttribute('data-table');
        const table = document.getElementById(tableId);
        const rows = table.querySelectorAll('tbody tr');
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

        // Update record count in card header
        const cardHeader = table.closest('.card').querySelector('.card-header-content span');
        if (cardHeader) {
            if (searchTerm === '') {
                // Reset to original count when search is cleared
                const originalCount = getOriginalRecordCount(tableId);
                cardHeader.textContent = originalCount + ' Records';
            } else {
                cardHeader.textContent = visibleCount + ' of ' + rows.length + ' Records';
            }
        }

        // Show empty state if no results
        showEmptyState(table, visibleCount);
    });
});

// Helper function to get original record count for each table
function getOriginalRecordCount(tableId) {
    const counts = {
        'rooms-table': 3,
        'reservations-table': 4,
        'users-table': 3
    };
    return counts[tableId] || 0;
}

// Helper function to show empty state message
function showEmptyState(table, visibleCount) {
    const tbody = table.querySelector('tbody');
    const existingEmptyRow = tbody.querySelector('.no-results-row');

    if (visibleCount === 0 && !existingEmptyRow) {
        const emptyRow = document.createElement('tr');
        emptyRow.className = 'no-results-row';
        const colCount = table.querySelectorAll('thead th').length;
        emptyRow.innerHTML = `<td colspan="${colCount}" style="text-align: center; padding: 2rem; color: var(--text-light); font-style: italic;">No matching records found</td>`;
        tbody.appendChild(emptyRow);
    } else if (visibleCount > 0 && existingEmptyRow) {
        existingEmptyRow.remove();
    }
}

// Clear search when switching tabs
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Clear all search inputs
        tableSearchInputs.forEach(input => {
            input.value = '';
            const tableId = input.getAttribute('data-table');
            const table = document.getElementById(tableId);
            const rows = table.querySelectorAll('tbody tr');

            // Show all rows
            rows.forEach(row => {
                row.style.display = '';
            });

            // Reset record count
            const cardHeader = table.closest('.card').querySelector('.card-header-content span');
            if (cardHeader) {
                const originalCount = getOriginalRecordCount(tableId);
                cardHeader.textContent = originalCount + ' Records';
            }

            // Remove empty state if exists
            const existingEmptyRow = table.querySelector('.no-results-row');
            if (existingEmptyRow) {
                existingEmptyRow.remove();
            }
        });
    });
});

// ==================== UNARCHIVE BUTTONS =====================
// ==================== UNARCHIVE BUTTONS =====================
// Note: This JavaScript is now just for UI effects since we're using form submissions
// You might want to disable the old handler or modify it

// Remove or comment out the old unarchive button handler and replace with:
document.querySelectorAll(".unarchive-btn").forEach(button => {
    button.addEventListener("click", function (e) {
        // Optional: Add loading state to button
        this.textContent = "Processing...";
        this.disabled = true;
        this.style.opacity = "0.7";

        // The form will handle the actual submission
        // We'll just show a visual feedback
        const form = this.closest('form');
        if (form) {
            // Optional: Add a small delay before submitting for visual feedback
            setTimeout(() => {
                form.submit();
            }, 300);
        }
    });
});
// ==================== UPDATE METRICS HELPER =====================
function updateMetrics(tabContent, change) {
    const metricCards = tabContent.querySelectorAll('.metric-card');
    if (metricCards.length > 0) {
        // Update first metric card (Total Archived)
        const totalMetric = metricCards[0].querySelector('h3');
        if (totalMetric) {
            const currentValue = parseInt(totalMetric.textContent);
            if (!isNaN(currentValue)) {
                totalMetric.textContent = currentValue + change;
            }
        }

        // Update second metric card (This Month) - assuming unarchive affects current month
        const monthMetric = metricCards[1].querySelector('h3');
        if (monthMetric) {
            const currentValue = parseInt(monthMetric.textContent);
            if (!isNaN(currentValue) && currentValue > 0) {
                monthMetric.textContent = currentValue + change;
            }
        }
    }
}

// ==================== PAGINATION =====================
const paginationButtons = document.querySelectorAll('.page-btn');

paginationButtons.forEach(button => {
    button.addEventListener('click', function () {
        if (this.disabled) return;

        const pagination = this.closest('.pagination');
        const pageButtons = pagination.querySelectorAll('.page-btn:not(:first-child):not(:last-child)');

        // Remove active class from all page buttons
        pageButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button if it's a number
        if (!this.querySelector('i')) {
            this.classList.add('active');
        }

        console.log('Page changed to:', this.textContent.trim());
        // Implement pagination logic here
    });
});

console.log('Archives page initialized successfully!');