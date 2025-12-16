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
        if (sidebar && !sidebar.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
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
    if (userProfile && !userProfile.contains(e.target)) {
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

// ========================================
// NOTIFICATION SYSTEM
// ========================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('notification-exit');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
        // Add actual search functionality here
    });
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
// INITIALIZATION
// ========================================
window.addEventListener('load', () => {
    console.log('✅ Librarian Dashboard Loading...');

    // Initialize charts with a small delay to ensure Chart.js is loaded
    setTimeout(() => {
        initializeCharts();
        console.log('✅ Librarian Dashboard Initialized Successfully!');
    }, 100);
});

// Alternative: Use DOMContentLoaded as backup
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM Content Loaded');
});

// ========================================
// CHART.JS CONFIGURATION WITH REAL DATA
// ========================================
let bookingHoursChart = null;
let userTypeChart = null;

function initializeCharts() {
    // Wait for Chart.js to be available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded!');
        return;
    }

    // Peak Booking Hours Chart - USING REAL DATABASE DATA
    const bookingHoursCanvas = document.getElementById('bookingHoursChart');
    if (bookingHoursCanvas) {
        const ctx = bookingHoursCanvas.getContext('2d');

        // Destroy existing chart if it exists
        if (bookingHoursChart) {
            bookingHoursChart.destroy();
        }

        bookingHoursChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: bookingHoursLabels || ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
                datasets: [{
                    label: 'Bookings',
                    data: bookingHoursData || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#2c3e50',
                    backgroundColor: 'rgba(44, 62, 80, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#2c3e50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#c62828',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#2c3e50',
                        padding: 12,
                        borderRadius: 8,
                        titleFont: {
                            size: 14,
                            family: 'Kumbh Sans'
                        },
                        bodyFont: {
                            size: 13,
                            family: 'Kumbh Sans'
                        },
                        callbacks: {
                            label: function (context) {
                                return 'Bookings: ' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                family: 'Kumbh Sans',
                                size: 12
                            },
                            color: '#7f8c8d',
                            callback: function (value) {
                                return Number.isInteger(value) ? value : '';
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        title: {
                            display: true,
                            text: 'Number of Bookings',
                            font: {
                                family: 'Kumbh Sans',
                                size: 13,
                                weight: '600'
                            },
                            color: '#2c3e50'
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                family: 'Kumbh Sans',
                                size: 11
                            },
                            color: '#7f8c8d',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        title: {
                            display: true,
                            text: 'Time Slot',
                            font: {
                                family: 'Kumbh Sans',
                                size: 13,
                                weight: '600'
                            },
                            color: '#2c3e50'
                        }
                    }
                }
            }
        });
    }

    // User Type Distribution Chart - USING REAL DATABASE DATA
    const userTypeCanvas = document.getElementById('userTypeChart');
    if (userTypeCanvas) {
        const ctx = userTypeCanvas.getContext('2d');

        // Destroy existing chart if it exists
        if (userTypeChart) {
            userTypeChart.destroy();
        }

        userTypeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: userTypeLabels && userTypeLabels.length > 0 ? userTypeLabels : ['No Data'],
                datasets: [{
                    data: userTypeData && userTypeData.length > 0 ? userTypeData : [1],
                    backgroundColor: userTypeColors && userTypeColors.length > 0 ? userTypeColors : ['#95a5a6'],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                family: 'Kumbh Sans',
                                size: 13
                            },
                            color: '#2c3e50',
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#2c3e50',
                        padding: 12,
                        borderRadius: 8,
                        titleFont: {
                            size: 14,
                            family: 'Kumbh Sans'
                        },
                        bodyFont: {
                            size: 13,
                            family: 'Kumbh Sans'
                        },
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                let value = context.parsed || 0;
                                let total = context.dataset.data.reduce((a, b) => a + b, 0);
                                let percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return label + ': ' + value + ' (' + percentage + '%)';
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }
}

// ========================================
// CHART PERIOD SELECTOR
// ========================================
const chartPeriod = document.getElementById('chartPeriod');
if (chartPeriod) {
    chartPeriod.addEventListener('change', (e) => {
        updateBookingHoursChart(e.target.value);
    });
}

function updateBookingHoursChart(period) {
    // Reload page with period parameter for non-AJAX approach
    showQueuedNotification(`Loading ${period} data...`, 'info');

    // Build URL with period parameter
    const currentUrl = window.location.href.split('?')[0];
    const newUrl = `${currentUrl}?period=${period}`;

    // Reload page after short delay to show notification
    setTimeout(() => {
        window.location.href = newUrl;
    }, 500);
}

// ========================================
// NAVIGATION FUNCTIONS
// ========================================
function viewAllRooms() {
    window.location.href = '/Librarian/RoomManagement';
}

function viewAllReservations() {
    window.location.href = '/Librarian/LibrarianReservations';
}

// ========================================
// ADDITIONAL ENHANCEMENTS
// ========================================

// Keyboard navigation support
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

// Prevent body scroll when mobile sidebar is open
function toggleBodyScroll(enable) {
    document.body.style.overflow = enable ? 'hidden' : '';
}

// Enhanced sidebar toggle with body scroll control
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        const isOpening = !sidebar.classList.contains('active');
        if (isOpening && window.innerWidth <= 768) {
            toggleBodyScroll(false);
        }
    });
}

if (closeSidebar) {
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

// Enhanced notification system with queue
const notificationQueue = [];
let isShowingNotification = false;

function showQueuedNotification(message, type = 'info') {
    if (isShowingNotification) {
        notificationQueue.push({ message, type });
        return;
    }

    isShowingNotification = true;
    showNotification(message, type);

    setTimeout(() => {
        isShowingNotification = false;
        if (notificationQueue.length > 0) {
            const nextNotification = notificationQueue.shift();
            showQueuedNotification(nextNotification.message, nextNotification.type);
        }
    }, 3300); // Slightly longer than notification duration to account for animations
}

// Update notification button to use queued system
if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
        showQueuedNotification('You have 3 new notifications', 'info');
    });
}

// Performance optimization for resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Reinitialize charts on resize for better responsiveness
        if (bookingHoursChart || userTypeChart) {
            setTimeout(initializeCharts, 100);
        }
    }, 250);
});

// ========================================
// AUTO-REFRESH DASHBOARD DATA (OPTIONAL)
// ========================================
// Uncomment this if you want to auto-refresh dashboard data every 5 minutes
/*
setInterval(() => {
    console.log('Auto-refreshing dashboard data...');
    showQueuedNotification('Refreshing dashboard data...', 'info');
    
    // Reload the page to get fresh data
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}, 5 * 60 * 1000); // 5 minutes
*/

// ========================================
// ERROR HANDLING FOR MISSING DATA
// ========================================
window.addEventListener('error', (e) => {
    console.error('Dashboard error:', e.error);

    // Check if chart data variables are defined
    if (!window.bookingHoursLabels || !window.bookingHoursData) {
        console.warn('Chart data variables not found. Using fallback data.');
        showQueuedNotification('Loading chart data...', 'info');
    }
});

// ========================================
// DASHBOARD DATA VALIDATION
// ========================================
function validateDashboardData() {
    const stats = {
        todayBookings: document.getElementById('todayBookings'),
        roomsAvailable: document.getElementById('roomsAvailable'),
        pendingApprovals: document.getElementById('pendingApprovals'),
        totalBookings: document.getElementById('totalBookings')
    };

    let allValid = true;

    Object.values(stats).forEach(statElement => {
        if (statElement && statElement.textContent === '0') {
            console.warn(`Statistic ${statElement.id} has zero value`);
        }
    });

    return allValid;
}

// Run validation after page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        validateDashboardData();
    }, 2000);
});
// ========================================
// NOTIFICATION SYSTEM
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
        this.createNotificationPanel();
        this.bindEvents();
        this.loadNotifications();
        setInterval(() => this.loadNotifications(), 30000);
    }

    createNotificationPanel() {
        const panel = document.createElement('div');
        panel.className = 'notification-panel';
        panel.id = 'notificationPanel';
        panel.innerHTML = `
            <div class="notification-header">
                <h3><i class="fas fa-bell"></i> Notifications</h3>
                <button class="mark-all-read" onclick="notificationSystem.markAllAsRead()">
                    <i class="fas fa-check-double"></i> Mark all as read
                </button>
            </div>
            <div class="notification-tabs">
                <button class="notification-tab active" data-type="all"><i class="fas fa-list"></i> All</button>
                <button class="notification-tab" data-type="booking"><i class="fas fa-calendar-check"></i> Bookings</button>
                <button class="notification-tab" data-type="decline"><i class="fas fa-times-circle"></i> Declines</button>
                <button class="notification-tab" data-type="room"><i class="fas fa-door-open"></i> Rooms</button>
            </div>
            <div class="notification-list" id="notificationList">
                <div class="notification-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading notifications...</p>
                </div>
            </div>
            <div class="notification-footer">
                <a href="/Librarian/ViewAllNotifications" class="view-all-link">
                    View All Notifications <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

        document.body.appendChild(panel);
        this.notificationPanel = panel;
    }

    bindEvents() {
        if (this.notificationBtn) {
            this.notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePanel();
            });
        }

        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.notificationPanel.contains(e.target) && !this.notificationBtn.contains(e.target)) {
                this.closePanel();
            }
        });

        const tabs = this.notificationPanel.querySelectorAll('.notification-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const type = tab.getAttribute('data-type');
                this.filterNotifications(type);
            });
        });

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
        this.updateBadge(0);
    }

    closePanel() {
        this.notificationPanel.classList.remove('active');
        this.isOpen = false;
    }

    async loadNotifications() {
        try {
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
        // REPLACE WITH YOUR API ENDPOINT: /Notifications/GetNotifications
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    unreadCount: 3,
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
                            type: 'decline',
                            title: 'Reservation Cancelled',
                            message: 'Bob Johnson cancelled Study Room 202',
                            time: '15 minutes ago',
                            isRead: false,
                            icon: 'fa-times-circle',
                            color: '#e74c3c',
                            actionUrl: '/Librarian/LibrarianArchives'
                        },
                        {
                            id: 3,
                            type: 'room',
                            title: 'New Room Added',
                            message: 'Study Room 305 has been added',
                            time: '1 hour ago',
                            isRead: false,
                            icon: 'fa-door-open',
                            color: '#3498db',
                            actionUrl: '/Librarian/RoomManagement'
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
                        <i class="fas fa-clock"></i> ${notification.time}
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
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.updateBadge(this.unreadCount);

            const notificationElement = document.querySelector(`[data-id="${notificationId}"]`);
            if (notificationElement) {
                notificationElement.classList.remove('unread');
                notificationElement.classList.add('read');
                const dot = notificationElement.querySelector('.notification-dot');
                if (dot) dot.remove();
            }
        }

        if (actionUrl) {
            window.location.href = actionUrl;
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
        this.updateBadge(0);
        this.renderNotifications();
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
                    <i class="fas fa-redo"></i> Retry
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
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize notification system
let notificationSystem;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        notificationSystem = new NotificationSystem();
    });
} else {
    notificationSystem = new NotificationSystem();
}

console.log('✅ Notification System Initialized');