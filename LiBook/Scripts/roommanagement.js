// @ts-nocheck
// ========================================
// ROOM MANAGEMENT - CLIENT-SIDE FUNCTIONALITY
// ========================================

// DOM ELEMENT REFERENCES
var menuToggle = document.getElementById('menuToggle');
var sidebar = document.getElementById('sidebar');
var closeSidebar = document.getElementById('closeSidebar');
var sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
var mainContent = document.querySelector('.main-content');
var userProfile = document.getElementById('userProfile');
var searchInput = document.getElementById('searchRoomInput');
var userTypeFilter = document.getElementById('userTypeFilter');
var refreshBtn = document.getElementById('refreshRoomsBtn');
var roomsContainer = document.getElementById('roomsContainer');

// ========================================
// SIDEBAR FUNCTIONALITY
// ========================================

// Desktop Sidebar Toggle
if (sidebarToggleDesktop && sidebar && mainContent) {
    sidebarToggleDesktop.addEventListener('click', function (e) {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', String(sidebar.classList.contains('collapsed')));
    });
}

// Restore sidebar state
window.addEventListener('DOMContentLoaded', function () {
    var isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed && sidebar && mainContent) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
});

// Mobile Sidebar Toggle
if (menuToggle && sidebar && mainContent) {
    menuToggle.addEventListener('click', function () {
        sidebar.classList.add('active');
        sidebar.classList.remove('collapsed');
        mainContent.classList.remove('expanded');
    });
}

if (closeSidebar && sidebar) {
    closeSidebar.addEventListener('click', function () {
        sidebar.classList.remove('active');
    });
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function (e) {
    if (window.innerWidth <= 768) {
        var target = e.target;
        if (target instanceof Node && sidebar && !sidebar.contains(target) && menuToggle && !menuToggle.contains(target)) {
            sidebar.classList.remove('active');
        }
    }
});

// ========================================
// USER PROFILE DROPDOWN
// ========================================
if (userProfile) {
    userProfile.addEventListener('click', function (e) {
        e.stopPropagation();
        userProfile.classList.toggle('active');
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
    var target = e.target;
    if (userProfile && target instanceof Node && !userProfile.contains(target)) {
        userProfile.classList.remove('active');
    }
});

// ========================================
// LOGOUT HANDLER
// ========================================
var logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', function (e) {
        e.preventDefault();
        var logoutForm = document.getElementById('logoutForm');
        if (logoutForm && 'submit' in logoutForm) {
            logoutForm.submit();
        }
    });
}

// ========================================
// CLIENT-SIDE SEARCH FUNCTIONALITY
// ========================================
if (searchInput && roomsContainer) {
    searchInput.addEventListener('input', function () {
        var searchTerm = this.value.toLowerCase().trim();
        var roomCards = roomsContainer.querySelectorAll('.room-card');
        var hasVisibleCards = false;

        roomCards.forEach(function (card) {
            var roomName = card.querySelector('.room-name').textContent.toLowerCase();
            var roomType = card.querySelector('.room-type-label').textContent.toLowerCase();

            // Check if room matches search term
            if (roomName.includes(searchTerm) || roomType.includes(searchTerm)) {
                card.style.display = 'block';
                hasVisibleCards = true;
            } else {
                card.style.display = 'none';
            }
        });

        // Show empty state if no cards visible
        showEmptyStateIfNeeded(hasVisibleCards, 'No rooms match your search.');
    });
}

// ========================================
// CLIENT-SIDE FILTERING FUNCTIONS
// ========================================

/**
 * Filter rooms by status (called from stat card onclick)
 */
function filterRooms(status) {
    var userType = document.getElementById('userTypeFilter').value;

    // Build URL with filter parameters
    var url = '/Librarian/FilterRooms?status=' + status + '&userType=' + userType;

    // Redirect to filtered page
    window.location.href = url;
}

/**
 * Handle room type filter change
 */
if (userTypeFilter) {
    userTypeFilter.addEventListener('change', function () {
        // Get current status from active stat card
        var activeCard = document.querySelector('.stat-card.active');
        var status = activeCard ? activeCard.getAttribute('data-filter') : 'all';
        var userType = this.value;

        // Build URL with filter parameters
        var url = '/Librarian/FilterRooms?status=' + status + '&userType=' + userType;

        // Redirect to filtered page
        window.location.href = url;
    });
}

/**
 * Show empty state message
 */
function showEmptyStateIfNeeded(hasVisibleCards, message) {
    var emptyState = roomsContainer.querySelector('.empty-state');

    if (!hasVisibleCards) {
        if (!emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML =
                '<i class="fas fa-door-closed"></i>' +
                '<h3>No Rooms Found</h3>' +
                '<p>' + (message || 'Try adjusting your search or filter criteria.') + '</p>';
            roomsContainer.appendChild(emptyState);
        } else {
            // Update message if empty state already exists
            var p = emptyState.querySelector('p');
            if (p) p.textContent = message || 'Try adjusting your search or filter criteria.';
        }
    } else if (emptyState && emptyState.parentNode === roomsContainer) {
        roomsContainer.removeChild(emptyState);
    }
}

// ========================================
// NOTIFICATION SYSTEM (FOR MODAL ACTIONS)
// ========================================
function showNotification(message, type) {
    type = type || 'info';
    var notification = document.createElement('div');

    var bgColor;
    switch (type) {
        case 'success': bgColor = '#27ae60'; break;
        case 'error': bgColor = '#e74c3c'; break;
        case 'warning': bgColor = '#f39c12'; break;
        default: bgColor = '#2c3e50';
    }

    notification.style.cssText =
        'position: fixed;' +
        'top: 20px;' +
        'right: 20px;' +
        'padding: 1rem 1.5rem;' +
        'background: ' + bgColor + ';' +
        'color: white;' +
        'border-radius: 12px;' +
        'box-shadow: 0 4px 12px rgba(0,0,0,0.2);' +
        'z-index: 10000;' +
        'font-family: \'Kumbh Sans\', sans-serif;' +
        'animation: slideIn 0.3s ease;';

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(function () {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(function () {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ========================================
// MODAL FUNCTIONS (FOR ROOM DETAILS & WALK-IN)
// ========================================

/**
 * Open room details modal
 */
function openRoomDetails(roomId) {
    if (!roomId) {
        showNotification('Invalid room ID', 'error');
        return;
    }

    // Use traditional form submission instead of AJAX
    window.location.href = '/Librarian/GetRoomDetails?roomId=' + roomId;
}

// ========================================
// WALK-IN MODAL FUNCTIONS
// ========================================

var currentRoomId = null;
var currentRoomName = null;

/**
 * Open walk-in modal for specific room
 */
function createWalkIn(roomId) {
    if (!roomId) {
        showNotification('Invalid room ID', 'error');
        return;
    }

    // Get room info from the clicked card
    var roomCard = document.querySelector('.room-card[data-room-id="' + roomId + '"]');
    if (!roomCard) {
        showNotification('Room not found', 'error');
        return;
    }

    currentRoomId = roomId;
    currentRoomName = roomCard.querySelector('.room-name').textContent;

    // Set room info in modal
    document.getElementById('walkInRoomId').value = roomId;
    document.getElementById('walkInRoomName').textContent = currentRoomName;

    // Show modal
    openWalkInModal();
}

/**
 * Open walk-in modal
 */
function openWalkInModal() {
    var modal = document.getElementById('walkInModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Set today's date as default
        var today = new Date().toISOString().split('T')[0];
        var bookingDate = document.getElementById('BookingDate');
        if (bookingDate) {
            bookingDate.value = today;
            bookingDate.min = today;
        }

        // Clear form (except room info)
        var form = document.getElementById('walkInForm');
        if (form) {
            form.reset();
            document.getElementById('walkInRoomId').value = currentRoomId;
            document.getElementById('walkInRoomName').textContent = currentRoomName;

            // Re-set today's date
            if (bookingDate) {
                bookingDate.value = today;
                bookingDate.min = today;
            }
        }
    }
}

/**
 * Close walk-in modal
 */
function closeWalkInModal() {
    var modal = document.getElementById('walkInModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

/**
 * Validate time selection
 */
function validateTimeSelection() {
    var startTime = document.getElementById('StartTime');
    var endTime = document.getElementById('EndTime');

    if (startTime && endTime && startTime.value && endTime.value) {
        var start = startTime.value;
        var end = endTime.value;

        // Convert HH:mm to minutes for comparison
        var startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
        var endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);

        if (endMinutes <= startMinutes) {
            showNotification('End time must be after start time', 'error');
            endTime.focus();
            endTime.style.borderColor = '#e74c3c';
            return false;
        } else {
            endTime.style.borderColor = '';
        }
    }
    return true;
}

/**
 * Initialize walk-in form validation
 */
function initializeWalkInForm() {
    var walkInForm = document.getElementById('walkInForm');
    if (walkInForm) {
        walkInForm.addEventListener('submit', function (e) {
            // Validate time selection
            if (!validateTimeSelection()) {
                e.preventDefault();
                return false;
            }

            // Validate required fields
            var requiredFields = walkInForm.querySelectorAll('[required]');
            var isValid = true;

            requiredFields.forEach(function (field) {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#e74c3c';
                } else {
                    field.style.borderColor = '';
                }
            });

            if (!isValid) {
                e.preventDefault();
                showNotification('Please fill in all required fields', 'error');
                return false;
            }

            // Show loading state
            var submitBtn = walkInForm.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                submitBtn.disabled = true;
            }

            // Allow form submission
            return true;
        });
    }

    // Time validation on change
    var startTimeSelect = document.getElementById('StartTime');
    var endTimeSelect = document.getElementById('EndTime');

    if (startTimeSelect) {
        startTimeSelect.addEventListener('change', function () {
            validateTimeSelection();
        });
    }
    if (endTimeSelect) {
        endTimeSelect.addEventListener('change', function () {
            validateTimeSelection();
        });
    }
}

// ========================================
// REFRESH BUTTON FUNCTIONALITY
// ========================================
if (refreshBtn) {
    refreshBtn.addEventListener('click', function (e) {
        // Show loading state
        var icon = this.querySelector('i');
        if (icon) {
            icon.classList.add('fa-spin');
        }

        // Remove spin class after redirect
        setTimeout(function () {
            if (icon) {
                icon.classList.remove('fa-spin');
            }
        }, 1000);
    });
}

// ========================================
// STAT CARD CLICK HANDLERS
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    var statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(function (card) {
        card.addEventListener('click', function () {
            // Remove active class from all cards
            statCards.forEach(function (c) {
                c.classList.remove('active');
            });

            // Add active class to clicked card
            this.classList.add('active');
        });
    });
});

// ========================================
// PAGE INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    // Initialize walk-in form
    initializeWalkInForm();

    // Close modal on escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeWalkInModal();
        }
    });

    // Close modal when clicking outside
    var modalOverlay = document.getElementById('walkInModal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) {
                closeWalkInModal();
            }
        });
    }

    console.log('Room Management JavaScript loaded successfully');
});

// ========================================
// NOTIFICATION STYLES
// ========================================
if (!document.getElementById('room-notification-styles')) {
    var style = document.createElement('style');
    style.id = 'room-notification-styles';
    style.textContent =
        '@keyframes slideIn {' +
        '    from { transform: translateX(400px); opacity: 0; }' +
        '    to { transform: translateX(0); opacity: 1; }' +
        '}' +
        '@keyframes slideOut {' +
        '    from { transform: translateX(0); opacity: 1; }' +
        '    to { transform: translateX(400px); opacity: 0; }' +
        '}' +
        '.fa-spin {' +
        '    animation: fa-spin 1s infinite linear;' +
        '}' +
        '@keyframes fa-spin {' +
        '    0% { transform: rotate(0deg); }' +
        '    100% { transform: rotate(360deg); }' +
        '}';
    document.head.appendChild(style);
}

// ========================================
// ROOM DETAILS MODAL FUNCTIONS
// ========================================

/**
 * Open room details modal (updated version)
 */
function openRoomDetailsModal(roomId, linkElement) {
    if (!roomId) {
        showNotification('Invalid room ID', 'error');
        return false;
    }

    // Prevent default link behavior
    if (linkElement) {
        event.preventDefault();
    }

    // Show loading overlay
    showLoadingOverlay();

    // Make request to get room details with reservations
    var url = '/Librarian/GetRoomDetailsWithReservations?roomId=' + roomId;

    // Use fetch to get the partial view
    fetch(url)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(function (html) {
            // Hide loading overlay
            hideLoadingOverlay();

            // Remove existing modal if any
            var existingModal = document.getElementById('roomDetailsModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add the modal HTML to the body
            var modalContainer = document.createElement('div');
            modalContainer.innerHTML = html;
            document.body.appendChild(modalContainer);

            // Add body styles to prevent scrolling
            document.body.style.overflow = 'hidden';

            console.log('Room details modal loaded for Room ID:', roomId);
        })
        .catch(function (error) {
            hideLoadingOverlay();
            console.error('Error loading room details:', error);
            showNotification('Error loading room details. Please try again.', 'error');
        });

    return false;
}

/**
 * Show loading overlay
 */
function showLoadingOverlay() {
    var loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.style.cssText =
        'position: fixed;' +
        'top: 0;' +
        'left: 0;' +
        'width: 100%;' +
        'height: 100%;' +
        'background: rgba(0, 0, 0, 0.5);' +
        'z-index: 9999;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;';

    var spinner = document.createElement('div');
    spinner.style.cssText =
        'width: 50px;' +
        'height: 50px;' +
        'border: 5px solid var(--light-gray);' +
        'border-top: 5px solid var(--accent-yellow);' +
        'border-radius: 50%;' +
        'animation: spin 1s linear infinite;';

    loadingOverlay.appendChild(spinner);
    document.body.appendChild(loadingOverlay);
}

/**
 * Hide loading overlay
 */
function hideLoadingOverlay() {
    var loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

/**
 * Close room details modal (for use within modal HTML)
 */
function closeRoomDetailsModal() {
    var modal = document.getElementById('roomDetailsModal');
    if (modal) {
        modal.remove();
    }

    // Restore body scrolling
    document.body.style.overflow = 'auto';
}

/**
 * Close modal on escape key
 */
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeRoomDetailsModal();
    }
});

/**
 * Close modal when clicking outside
 */
document.addEventListener('click', function (e) {
    var modal = document.getElementById('roomDetailsModal');
    if (modal && e.target === modal) {
        closeRoomDetailsModal();
    }
});

// Add CSS for spinner animation if not already present
if (!document.getElementById('modal-spinner-styles')) {
    var style = document.createElement('style');
    style.id = 'modal-spinner-styles';
    style.textContent =
        '@keyframes spin {' +
        '    0% { transform: rotate(0deg); }' +
        '    100% { transform: rotate(360deg); }' +
        '}';
    document.head.appendChild(style);
}

// ========================================
// ROOM DETAILS MODAL FUNCTIONS
// ========================================

function openRoomDetailsModal(roomId) {
    if (!roomId) {
        showNotification('Invalid room ID', 'error');
        return;
    }

    // Show loading
    showLoadingOverlay();

    // Fetch modal content from server
    var url = '/Librarian/GetRoomDetailsWithReservations?roomId=' + roomId;

    fetch(url)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(function (html) {
            hideLoadingOverlay();

            // Remove existing modal
            var existingModal = document.getElementById('roomDetailsModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add new modal
            var modalContainer = document.createElement('div');
            modalContainer.innerHTML = html;
            document.body.appendChild(modalContainer);

            // Prevent body scrolling
            document.body.style.overflow = 'hidden';
        })
        .catch(function (error) {
            hideLoadingOverlay();
            console.error('Error loading room details:', error);
            showNotification('Error loading room details', 'error');
        });
}

function showLoadingOverlay() {
    var loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.style.cssText =
        'position: fixed;' +
        'top: 0;' +
        'left: 0;' +
        'width: 100%;' +
        'height: 100%;' +
        'background: rgba(0,0,0,0.5);' +
        'z-index: 9999;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;';

    var spinner = document.createElement('div');
    spinner.style.cssText =
        'width: 50px;' +
        'height: 50px;' +
        'border: 5px solid #f5f7fa;' +
        'border-top: 5px solid #ffc107;' +
        'border-radius: 50%;' +
        'animation: spin 1s linear infinite;';

    loadingOverlay.appendChild(spinner);
    document.body.appendChild(loadingOverlay);
}

function hideLoadingOverlay() {
    var loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Add CSS for spinner if not exists
if (!document.getElementById('spinner-styles')) {
    var style = document.createElement('style');
    style.id = 'spinner-styles';
    style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
    document.head.appendChild(style);
}// ========================================
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