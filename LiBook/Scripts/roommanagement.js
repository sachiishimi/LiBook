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

    // Initialize the page
    initializePage();
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
        // Close any open modal
        closeAllModals();
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
// MODAL FUNCTIONALITY
// ========================================

// Global variable to track currently selected room and schedule
let currentRoomId = null;
let currentScheduleId = null;

// ========================================
// MODAL STACKING MANAGEMENT
// ========================================

let modalStack = [];

/**
 * Open a modal by ID with stacking support
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Add to modal stack
        modalStack.push(modalId);

        // Close all modals first to reset state
        closeAllModals();

        // Reopen modals in stack order
        modalStack.forEach((stackedModalId, index) => {
            const stackedModal = document.getElementById(stackedModalId);
            if (stackedModal) {
                stackedModal.classList.add('active');
                // Lower z-index for background modals
                if (index < modalStack.length - 1) {
                    stackedModal.style.zIndex = '2000';
                    stackedModal.querySelector('.modal-content').style.transform = 'scale(0.95)';
                } else {
                    stackedModal.style.zIndex = '2001';
                    stackedModal.querySelector('.modal-content').style.transform = 'scale(1)';
                }
            }
        });

        toggleBodyScroll(false);
    }
}

/**
 * Close a modal by ID with stacking support
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Remove from modal stack
        modalStack = modalStack.filter(id => id !== modalId);

        // Close all modals
        closeAllModals();

        // Reopen remaining modals in stack
        if (modalStack.length > 0) {
            modalStack.forEach((stackedModalId, index) => {
                const stackedModal = document.getElementById(stackedModalId);
                if (stackedModal) {
                    stackedModal.classList.add('active');
                    if (index < modalStack.length - 1) {
                        stackedModal.style.zIndex = '2000';
                        stackedModal.querySelector('.modal-content').style.transform = 'scale(0.95)';
                    } else {
                        stackedModal.style.zIndex = '2001';
                        stackedModal.querySelector('.modal-content').style.transform = 'scale(1)';
                    }
                }
            });
        } else {
            toggleBodyScroll(true);
        }
    }
}

/**
 * Close all open modals and clear stack
 */
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
        modal.style.zIndex = '';
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.style.transform = '';
        }
    });
}

/**
 * Enhanced modal close when clicking outside - only close top modal
 */
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal && modalStack.length > 0) {
            const topModalId = modalStack[modalStack.length - 1];
            if (modal.id === topModalId) {
                closeModal(topModalId);
            }
        }
    });
});

// ========================================
// ROOM DETAILS MODAL - FIXED VERSION
// ========================================

/**
 * Open room details modal with room information
 */
function openRoomDetails(roomId) {
    currentRoomId = roomId;

    // In a real application, fetch room data from server
    // For now, we'll use mock data based on room ID
    const roomData = getRoomData(roomId);

    if (roomData) {
        // Populate modal with room data
        document.getElementById('detailRoomName').textContent = roomData.name;
        document.getElementById('detailStatus').value = roomData.status;
        document.getElementById('detailRoomType').textContent = roomData.type;
        document.getElementById('detailCapacity').textContent = roomData.capacity + ' people';
        document.getElementById('detailUserType').textContent = roomData.userType;

        // Populate equipment
        const equipmentContainer = document.getElementById('detailEquipment');
        equipmentContainer.innerHTML = roomData.equipment.map(eq =>
            `<span class="equipment-tag"><i class="fas fa-${eq.icon}"></i> ${eq.name}</span>`
        ).join('');

        // Populate schedule list (in real app, fetch from server)
        loadScheduleList(roomId);

        openModal('roomDetailsModal');
    }
}

/**
 * Load schedule list for a room
 */
function loadScheduleList(roomId) {
    const schedules = getScheduleData(roomId);
    const scheduleListContainer = document.getElementById('scheduleList');
    const noSchedulesContainer = document.getElementById('noSchedules');

    if (schedules && schedules.length > 0) {
        scheduleListContainer.innerHTML = schedules.map(schedule =>
            `<div class="reservation-item" data-reservation-id="${schedule.id}" onclick="openScheduleDetails(${schedule.id})">
                <div class="reservation-content">
                    <div class="reservee-name">${schedule.name}</div>
                    <div class="reservation-action-panel">
                        <button class="cancel-reservation-btn" onclick="event.stopPropagation(); confirmCancelReservation(${schedule.id}, '${schedule.name}')">
                            <i class="fas fa-times-circle"></i>
                            <span>Cancel<br>Reservation</span>
                        </button>
                    </div>
                </div>
            </div>`
        ).join('');
        scheduleListContainer.style.display = 'block';
        noSchedulesContainer.style.display = 'none';
    } else {
        scheduleListContainer.style.display = 'none';
        noSchedulesContainer.style.display = 'block';
    }
}

/**
 * Mock function to get room data - replace with actual API call
 */
function getRoomData(roomId) {
    const rooms = {
        1: {
            name: 'Study Room A',
            status: 'available',
            type: 'Study Room',
            capacity: 8,
            userType: 'Academic',
            equipment: [
                { name: 'Smart TV', icon: 'tv' },
                { name: 'Whiteboard', icon: 'chalkboard' },
                { name: 'High-Speed WiFi', icon: 'wifi' }
            ]
        },
        2: {
            name: 'Collaboration Room B',
            status: 'unavailable',
            type: 'Collaboration Room',
            capacity: 10,
            userType: 'Faculty',
            equipment: [
                { name: 'Projector', icon: 'tv' },
                { name: 'Whiteboard', icon: 'chalkboard' },
                { name: 'Conference Phone', icon: 'phone' }
            ]
        },
        3: {
            name: 'Study Room C',
            status: 'available',
            type: 'Study Room',
            capacity: 6,
            userType: 'Public',
            equipment: [
                { name: 'Whiteboard', icon: 'chalkboard' },
                { name: 'WiFi', icon: 'wifi' }
            ]
        },
        4: {
            name: 'Meeting Room D',
            status: 'maintenance',
            type: 'Meeting Room',
            capacity: 10,
            userType: 'Academic',
            equipment: [
                { name: 'Projector', icon: 'tv' },
                { name: 'Conference Phone', icon: 'phone' },
                { name: 'WiFi', icon: 'wifi' }
            ]
        }
    };

    return rooms[roomId];
}

/**
 * Mock function to get schedule data for a room
 */
function getScheduleData(roomId) {
    const schedules = {
        1: [
            { id: 1, name: 'John Doe', timeSlot: '2:00 PM - 4:00 PM', date: 'November 19, 2025', duration: '2 hours', purpose: 'Group study session for finals', userType: 'Academic' },
            { id: 2, name: 'Jane Smith', timeSlot: '4:30 PM - 6:00 PM', date: 'November 19, 2025', duration: '1.5 hours', purpose: 'Project meeting', userType: 'Academic' },
            { id: 3, name: 'Mike Johnson', timeSlot: '6:30 PM - 8:00 PM', date: 'November 19, 2025', duration: '1.5 hours', purpose: 'Research collaboration', userType: 'Faculty' }
        ],
        2: [
            { id: 4, name: 'Dr. Sarah Lee', timeSlot: '10:00 AM - 12:00 PM', date: 'November 19, 2025', duration: '2 hours', purpose: 'Department meeting', userType: 'Faculty' },
            { id: 5, name: 'Tom Brown', timeSlot: '1:00 PM - 3:00 PM', date: 'November 19, 2025', duration: '2 hours', purpose: 'Team workshop', userType: 'Faculty' }
        ],
        3: [
            { id: 6, name: 'Emily Davis', timeSlot: '3:00 PM - 5:00 PM', date: 'November 19, 2025', duration: '2 hours', purpose: 'Study session', userType: 'Public' }
        ],
        4: [] // No schedules for maintenance room
    };

    return schedules[roomId] || [];
}

// ========================================
// SCHEDULE DETAILS MODAL
// ========================================

/**
 * Open schedule details modal
 */
function openScheduleDetails(scheduleId) {
    currentScheduleId = scheduleId;

    // In a real application, fetch schedule details from server
    // For now, find the schedule in mock data
    const schedule = findScheduleById(scheduleId);

    if (schedule) {
        document.getElementById('scheduleReserveeName').textContent = schedule.name;
        document.getElementById('scheduleReserveeType').textContent = schedule.userType;
        document.getElementById('scheduleTimeSlot').textContent = schedule.timeSlot;
        document.getElementById('scheduleDate').textContent = schedule.date;
        document.getElementById('scheduleDuration').textContent = schedule.duration;
        document.getElementById('scheduleRoomName').textContent = getRoomData(currentRoomId).name;
        document.getElementById('schedulePurpose').textContent = schedule.purpose;

        openModal('scheduleDetailsModal');
    }
}

/**
 * Find schedule by ID
 */
function findScheduleById(scheduleId) {
    const allSchedules = getScheduleData(currentRoomId);
    return allSchedules.find(s => s.id === scheduleId);
}

/**
 * Cancel a specific schedule reservation
 */

// ========================================
// CONFIRMATION MODAL FOR CANCEL RESERVATION
// ========================================

/**
 * Show confirmation modal before canceling reservation
 */
function confirmCancelReservation(scheduleId, reserveeName) {
    currentScheduleId = scheduleId;

    // Update confirmation modal content
    document.getElementById('confirmReserveeName').textContent = reserveeName;

    // Open confirmation modal
    openModal('confirmCancelModal');
}

/**
 * Handle confirmed cancellation
 */
function handleConfirmedCancellation() {
    const schedule = findScheduleById(currentScheduleId);

    if (schedule) {
        console.log('Cancelling reservation:', currentScheduleId);

        // Close confirmation modal
        closeModal('confirmCancelModal');

        // Close schedule details modal if it's open
        const scheduleDetailsModal = document.getElementById('scheduleDetailsModal');
        if (scheduleDetailsModal && scheduleDetailsModal.classList.contains('active')) {
            closeModal('scheduleDetailsModal');
        }

        // Show success notification
        showQueuedNotification(`Reservation for ${schedule.name} has been cancelled`, 'success');

        // Refresh schedule list after modals are closed
        setTimeout(() => {
            loadScheduleList(currentRoomId);
        }, 300);

        // In a real application, send cancellation request to server
        // Example:
        // fetch('/api/reservations/cancel', {
        //     method: 'POST',
        //     body: JSON.stringify({ scheduleId: currentScheduleId })
        // });
    }
}

function cancelScheduleReservation() {
    const schedule = findScheduleById(currentScheduleId);

    if (schedule) {
        // Use the confirmation modal instead of browser confirm
        document.getElementById('confirmReserveeName').textContent = schedule.name;
        openModal('confirmCancelModal');
    }
}

// ========================================
// WALK-IN RESERVATION MODAL
// ========================================

/**
 * Create walk-in reservation for a room
 */
function createWalkIn(roomId) {
    currentRoomId = roomId;
    const roomData = getRoomData(roomId);

    if (roomData) {
        document.getElementById('walkInRoomName').value = roomData.name;
        openModal('walkInModal');
    }
}

// ========================================
// WALK-IN RESERVATION MODAL WITH STACKING
// ========================================

/**
 * Create walk-in from modal with stacking
 */
function createWalkInFromModal() {
    // Room Details modal should already be in stack
    createWalkIn(currentRoomId);
}

// Update walk-in form submission to handle modal stacking
if (walkInForm) {
    walkInForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const userName = document.getElementById('walkInUserName').value;
        const userType = document.getElementById('walkInUserType').value;
        const duration = document.getElementById('walkInDuration').value;
        const purpose = document.getElementById('walkInPurpose').value;

        if (!userName || !userType) {
            showQueuedNotification('Please fill in all required fields', 'error');
            return;
        }

        // In a real application, send data to server
        console.log('Walk-In Reservation Created:', {
            roomId: currentRoomId,
            userName: userName,
            userType: userType,
            duration: duration,
            purpose: purpose
        });

        showQueuedNotification('Walk-in reservation created successfully!', 'success');

        // Close only the walk-in modal, room details should remain
        closeModal('walkInModal');

        // Reset form
        walkInForm.reset();

        // Update room card status (in real app, this would come from server)
        updateRoomCardStatus(currentRoomId, 'unavailable');
    });
}

// ========================================
// REPORT ISSUE MODAL
// ========================================

/**
 * Open report issue modal
 */
function reportIssueFromModal() {
    const roomData = getRoomData(currentRoomId);
    if (roomData) {
        document.getElementById('issueRoomName').value = roomData.name;
        closeModal('roomDetailsModal');
        setTimeout(() => {
            openModal('reportIssueModal');
        }, 300);
    }
}

// Handle report issue form submission
const reportIssueForm = document.getElementById('reportIssueForm');
if (reportIssueForm) {
    reportIssueForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const issueType = document.getElementById('issueType').value;
        const issueDescription = document.getElementById('issueDescription').value;
        const issueUrgency = document.getElementById('issueUrgency').value;

        if (!issueType || !issueDescription) {
            showQueuedNotification('Please fill in all required fields', 'error');
            return;
        }

        // In a real application, send data to server
        console.log('Issue Reported:', {
            roomId: currentRoomId,
            issueType: issueType,
            description: issueDescription,
            urgency: issueUrgency
        });

        showQueuedNotification('Issue reported successfully! Maintenance team has been notified.', 'success');
        closeModal('reportIssueModal');

        // Reset form
        reportIssueForm.reset();
    });
}

// ========================================
// ROOM ACTION FUNCTIONS
// ========================================

/**
 * View reservation details
 */
function viewReservation() {
    console.log('Viewing reservation for room:', currentRoomId);
    showQueuedNotification('Opening reservation details...', 'info');
    // In a real application, navigate to reservation details page
}

/**
 * Create walk-in from modal
 */
function createWalkInFromModal() {
    // Keep Room Details modal open and open Walk-In modal on top
    createWalkIn(currentRoomId);
}

/**
 * Update room card status visually
 */
function updateRoomCardStatus(roomId, newStatus) {
    const roomCard = document.querySelector(`[data-room-id="${roomId}"]`);
    if (!roomCard) return;

    // Remove all status classes
    roomCard.classList.remove('available', 'unavailable', 'maintenance');

    // Add new status class
    roomCard.classList.add(newStatus);

    // Update status badge
    const statusBadge = roomCard.querySelector('.status-badge');
    if (statusBadge) {
        statusBadge.className = 'status-badge status-' + newStatus;

        const statusText = {
            'available': 'Available',
            'unavailable': 'Unavailable',
            'maintenance': 'Under Maintenance'
        };

        statusBadge.textContent = statusText[newStatus];
    }

    // Update stats counters
    updateStatsCounters();
}

// ========================================
// STATS COUNTER UPDATE
// ========================================

/**
 * Get the active status filter from stat cards
 */
function getActiveStatusFilter() {
    const activeCard = document.querySelector('.stat-card.active');
    return activeCard ? activeCard.getAttribute('data-filter') : 'all';
}

/**
 * Filter rooms based on active filters
 */
function filterRooms() {
    const activeStatusFilter = getActiveStatusFilter();
    const userTypeFilter = document.getElementById('userTypeFilter')?.value || 'all';
    const searchQuery = document.getElementById('searchRoomInput')?.value.toLowerCase() || '';

    const roomCards = document.querySelectorAll('.room-card');

    roomCards.forEach(card => {
        const status = card.getAttribute('data-status');
        const userType = card.getAttribute('data-user-type');
        const roomName = card.querySelector('.room-name')?.textContent.toLowerCase() || '';

        let showCard = true;

        // Status filter
        if (activeStatusFilter !== 'all' && status !== activeStatusFilter) {
            showCard = false;
        }

        // User type filter
        if (userTypeFilter !== 'all' && userType !== userTypeFilter) {
            showCard = false;
        }

        // Search query
        if (searchQuery && !roomName.includes(searchQuery)) {
            showCard = false;
        }

        // Show or hide card
        card.style.display = showCard ? 'flex' : 'none';
    });
}

// Stat card click handlers for filtering
document.querySelectorAll('.stat-card').forEach(card => {
    // Click handler
    card.addEventListener('click', () => {
        // Remove active class from all stat cards
        document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));

        // Add active class to clicked card
        card.classList.add('active');

        // Filter rooms
        filterRooms();

        // Show notification
        const filterName = card.querySelector('p').textContent;
        showQueuedNotification(`Showing ${filterName}`, 'info');
    });

    // Keyboard handler (Enter or Space)
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
        }
    });
});

// User type filter
const userTypeFilter = document.getElementById('userTypeFilter');
if (userTypeFilter) {
    userTypeFilter.addEventListener('change', filterRooms);
}

// Search input
const searchRoomInput = document.getElementById('searchRoomInput');
if (searchRoomInput) {
    searchRoomInput.addEventListener('input', filterRooms);
}

/**
 * Update the quick stats counters
 */
function updateStatsCounters() {
    const roomCards = document.querySelectorAll('.room-card');

    let allCount = roomCards.length;
    let availableCount = 0;
    let unavailableCount = 0;
    let maintenanceCount = 0;

    roomCards.forEach(card => {
        const status = card.getAttribute('data-status');
        switch (status) {
            case 'available':
                availableCount++;
                break;
            case 'unavailable':
                unavailableCount++;
                break;
            case 'maintenance':
                maintenanceCount++;
                break;
        }
    });

    // Update counter elements
    const allEl = document.getElementById('allCount');
    const availableEl = document.getElementById('availableCount');
    const unavailableEl = document.getElementById('unavailableCount');
    const maintenanceEl = document.getElementById('maintenanceCount');

    if (allEl) allEl.textContent = allCount;
    if (availableEl) availableEl.textContent = availableCount;
    if (unavailableEl) unavailableEl.textContent = unavailableCount;
    if (maintenanceEl) maintenanceEl.textContent = maintenanceCount;
}

// ========================================
// REAL-TIME UPDATES (POLLING)
// ========================================

/**
 * Simulate real-time updates by polling
 * In a real application, use SignalR or WebSockets
 */
function pollRoomUpdates() {
    // In a real application, fetch updates from server
    console.log('Polling for room updates...');

    // This would update room statuses based on server response
    // For now, this is just a placeholder
}

// Poll every 30 seconds
setInterval(pollRoomUpdates, 30000);

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize the page with all required event listeners
 */
function initializePage() {
    // Add event listeners to all "Details" buttons
    document.querySelectorAll('.room-btn-primary').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const roomCard = this.closest('.room-card');
            if (roomCard) {
                const roomId = roomCard.getAttribute('data-room-id');
                if (roomId) {
                    openRoomDetails(parseInt(roomId));
                }
            }
        });
    });

    // Add event listeners to all "Walk-In" buttons
    document.querySelectorAll('.room-btn-success').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const roomCard = this.closest('.room-card');
            if (roomCard) {
                const roomId = roomCard.getAttribute('data-room-id');
                if (roomId) {
                    createWalkIn(parseInt(roomId));
                }
            }
        });
    });

    // Initialize stats counters
    updateStatsCounters();

    console.log('✅ Room Management Page Initialized Successfully!');
    console.log('📊 Enhanced features loaded: Filters, Search, Modals, Real-time monitoring, Schedule Management');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Format time for display
 */
function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Calculate time difference
 */
function getTimeDifference(startTime, endTime) {
    const diff = new Date(endTime) - new Date(startTime);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

/**
 * Validate room availability
 */
function isRoomAvailable(roomId, startTime, endTime) {
    // In a real application, check against server data
    return true;
}

// ========================================
// DEVELOPER TOOLS (Remove in production)
// ========================================

// Log all room interactions for debugging
window.roomManagementDebug = {
    getCurrentRoomId: () => currentRoomId,
    getCurrentScheduleId: () => currentScheduleId,
    getAllRooms: () => {
        const rooms = [];
        document.querySelectorAll('.room-card').forEach(card => {
            rooms.push({
                id: card.getAttribute('data-room-id'),
                status: card.getAttribute('data-status'),
                userType: card.getAttribute('data-user-type'),
                capacity: card.getAttribute('data-capacity')
            });
        });
        return rooms;
    },
    getSchedules: (roomId) => {
        return getScheduleData(roomId || currentRoomId);
    },
    getStats: () => {
        return {
            all: document.getElementById('allCount')?.textContent,
            available: document.getElementById('availableCount')?.textContent,
            unavailable: document.getElementById('unavailableCount')?.textContent,
            maintenance: document.getElementById('maintenanceCount')?.textContent
        };
    },
    getActiveFilter: () => {
        const activeCard = document.querySelector('.stat-card.active');
        return activeCard ? activeCard.getAttribute('data-filter') : 'none';
    }
};

console.log('💡 Debug tools available at: window.roomManagementDebug');