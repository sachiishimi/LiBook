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
// TAB FUNCTIONALITY - UPDATED FOR FORM SUBMISSION
// ========================================
const tabButtons = document.querySelectorAll('.tab-btn');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        // Show notification
        showNotification(`Loading ${button.textContent.trim()}...`, 'info');
    });
});

// ========================================
// CLIENT-SIDE SEARCH FUNCTIONALITY - UPDATED
// ========================================
const successfulSearch = document.getElementById('successfulSearch');
const cancelledSearch = document.getElementById('cancelledSearch');

function setupSearchFunctionality(searchInput, tabType) {
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const table = document.querySelector(`#${tabType}-tab .data-table tbody`);

        // If no table (empty state), show notification
        if (!table) {
            showNotification('Searching archived reservations...', 'info');
            return;
        }

        // Filter table rows
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
}

// Initialize search for both tabs
if (successfulSearch) {
    setupSearchFunctionality(successfulSearch, 'successful');
}
if (cancelledSearch) {
    setupSearchFunctionality(cancelledSearch, 'cancelled');
}

// ========================================
// STAT CARD CLICK FUNCTIONALITY
// ========================================
const clickableStats = document.querySelectorAll('.clickable-stat');

clickableStats.forEach(statCard => {
    statCard.addEventListener('click', () => {
        const dateFilter = statCard.getAttribute('data-filter');
        const tabType = statCard.getAttribute('data-tab');

        // Get the appropriate form and update date filter
        const form = document.getElementById(`${tabType}Form`);
        if (form) {
            const dateFilterInput = form.querySelector('select[name="dateFilter"]');
            if (dateFilterInput) {
                dateFilterInput.value = dateFilter;
                form.submit();
            }
        }
    });
});

// ========================================
// INITIALIZATION
// ========================================
console.log('✅ Librarian Archives Page Initialized Successfully!');
console.log('📊 Database-driven archives system active');
console.log('🔍 Client-side search filtering enabled');
console.log('📝 Form-based server-side filtering implemented');// ========================================
// LIBRARIAN NOTIFICATION SYSTEM
// ========================================

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.notificationBtn = document.querySelector('.notification-btn');
        this.notificationPanel = null;
        this.badge = document.querySelector('.notification-btn .badge');
        this.isOpen = false;

        this.init();
    }

    init() {
        // Create notification panel
        this.createNotificationPanel();

        // Bind events
        this.bindEvents();

        // Load notifications
        this.loadNotifications();

        // Refresh notifications every 30 seconds
        setInterval(() => this.loadNotifications(), 30000);
    }

    createNotificationPanel() {
        const panel = document.createElement('div');
        panel.className = 'notification-panel';
        panel.id = 'notificationPanel';
        panel.innerHTML = `
            <div class="notification-header">
                <h3>
                    <i class="fas fa-bell"></i>
                    Notifications
                </h3>
                <button class="mark-all-read" onclick="notificationSystem.markAllAsRead()">
                    <i class="fas fa-check-double"></i>
                    Mark all as read
                </button>
            </div>
            <div class="notification-tabs">
                <button class="notification-tab active" data-type="all">
                    <i class="fas fa-list"></i>
                    All
                </button>
                <button class="notification-tab" data-type="booking">
                    <i class="fas fa-calendar-check"></i>
                    Bookings
                </button>
                <button class="notification-tab" data-type="decline">
                    <i class="fas fa-times-circle"></i>
                    Declines
                </button>
                <button class="notification-tab" data-type="room">
                    <i class="fas fa-door-open"></i>
                    Rooms
                </button>
            </div>
            <div class="notification-list" id="notificationList">
                <div class="notification-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading notifications...</p>
                </div>
            </div>
            <div class="notification-footer">
                <a href="/Librarian/ViewAllNotifications" class="view-all-link">
                    View All Notifications
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

        document.body.appendChild(panel);
        this.notificationPanel = panel;
    }

    bindEvents() {
        // Toggle notification panel
        if (this.notificationBtn) {
            this.notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePanel();
            });
        }

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.notificationPanel.contains(e.target) && !this.notificationBtn.contains(e.target)) {
                this.closePanel();
            }
        });

        // Tab switching
        const tabs = this.notificationPanel.querySelectorAll('.notification-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const type = tab.getAttribute('data-type');
                this.filterNotifications(type);
            });
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closePanel();
            }
        });
    }

    togglePanel() {
        if (this.isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    openPanel() {
        this.notificationPanel.classList.add('active');
        this.isOpen = true;

        // Mark notifications as seen (not read, just seen)
        this.updateBadge(0);
    }

    closePanel() {
        this.notificationPanel.classList.remove('active');
        this.isOpen = false;
    }

    async loadNotifications() {
        try {
            // Simulate API call - Replace this with your actual API endpoint
            const response = await this.fetchNotifications();

            this.notifications = response.notifications || [];
            this.unreadCount = response.unreadCount || 0;

            this.updateBadge(this.unreadCount);
            this.renderNotifications();
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.showError();
        }
    }

    async fetchNotifications() {
        // REPLACE THIS WITH YOUR ACTUAL API CALL
        // Example: const response = await fetch('/Librarian/GetNotifications');
        // return await response.json();

        // Simulated data for demonstration
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    unreadCount: 5,
                    notifications: [
                        {
                            id: 1,
                            type: 'booking',
                            title: 'New Reservation',
                            message: 'John Doe booked Study Room 101',
                            time: '2 minutes ago',
                            isRead: false,
                            icon: 'fa-calendar-check',
                            color: '#27ae60',
                            actionUrl: '/Librarian/LibrarianReservations'
                        },
                        {
                            id: 2,
                            type: 'booking',
                            title: 'New Reservation',
                            message: 'Jane Smith booked Conference Room A',
                            time: '5 minutes ago',
                            isRead: false,
                            icon: 'fa-calendar-check',
                            color: '#27ae60',
                            actionUrl: '/Librarian/LibrarianReservations'
                        },
                        {
                            id: 3,
                            type: 'decline',
                            title: 'Reservation Declined',
                            message: 'Bob Johnson cancelled Study Room 202',
                            time: '15 minutes ago',
                            isRead: false,
                            icon: 'fa-times-circle',
                            color: '#e74c3c',
                            actionUrl: '/Librarian/LibrarianArchives'
                        },
                        {
                            id: 4,
                            type: 'room',
                            title: 'New Room Added',
                            message: 'Study Room 305 has been added to the system',
                            time: '1 hour ago',
                            isRead: true,
                            icon: 'fa-door-open',
                            color: '#3498db',
                            actionUrl: '/Librarian/RoomManagement'
                        },
                        {
                            id: 5,
                            type: 'booking',
                            title: 'Walk-in Reservation',
                            message: 'Walk-in guest reserved Meeting Room B',
                            time: '2 hours ago',
                            isRead: true,
                            icon: 'fa-walking',
                            color: '#f39c12',
                            actionUrl: '/Librarian/LibrarianReservations'
                        }
                    ]
                });
            }, 500);
        });
    }

    renderNotifications(filteredNotifications = null) {
        const notificationList = document.getElementById('notificationList');
        const notifications = filteredNotifications || this.notifications;

        if (notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }

        notificationList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.isRead ? 'read' : 'unread'}" 
                 data-id="${notification.id}" 
                 data-type="${notification.type}"
                 onclick="notificationSystem.handleNotificationClick(${notification.id}, '${notification.actionUrl}')">
                <div class="notification-icon" style="background: ${notification.color};">
                    <i class="fas ${notification.icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">
                        <i class="fas fa-clock"></i>
                        ${notification.time}
                    </div>
                </div>
                ${!notification.isRead ? '<div class="notification-dot"></div>' : ''}
            </div>
        `).join('');
    }

    filterNotifications(type) {
        if (type === 'all') {
            this.renderNotifications();
        } else {
            const filtered = this.notifications.filter(n => n.type === type);
            this.renderNotifications(filtered);
        }
    }

    handleNotificationClick(notificationId, actionUrl) {
        // Mark as read
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.updateBadge(this.unreadCount);

            // Update UI
            const notificationElement = document.querySelector(`[data-id="${notificationId}"]`);
            if (notificationElement) {
                notificationElement.classList.remove('unread');
                notificationElement.classList.add('read');
                const dot = notificationElement.querySelector('.notification-dot');
                if (dot) dot.remove();
            }
        }

        // Navigate to action URL
        if (actionUrl) {
            window.location.href = actionUrl;
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
        this.updateBadge(0);
        this.renderNotifications();

        // Show success message
        this.showToast('All notifications marked as read', 'success');
    }

    updateBadge(count) {
        if (this.badge) {
            if (count > 0) {
                this.badge.textContent = count > 99 ? '99+' : count;
                this.badge.style.display = 'flex';
            } else {
                this.badge.style.display = 'none';
            }
        }
    }

    showError() {
        const notificationList = document.getElementById('notificationList');
        notificationList.innerHTML = `
            <div class="notification-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load notifications</p>
                <button onclick="notificationSystem.loadNotifications()" class="retry-btn">
                    <i class="fas fa-redo"></i>
                    Retry
                </button>
            </div>
        `;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `notification-toast notification-toast-${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize notification system when DOM is ready
let notificationSystem;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        notificationSystem = new NotificationSystem();
    });
} else {
    notificationSystem = new NotificationSystem();
}