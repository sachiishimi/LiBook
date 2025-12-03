// @ts-nocheck
// DOM Elements - using var to avoid redeclaration errors
var menuToggle = document.getElementById('menuToggle');
var sidebar = document.getElementById('sidebar');
var closeSidebar = document.getElementById('closeSidebar');
var sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
var mainContent = document.querySelector('.main-content');
var userProfile = document.getElementById('userProfile');
var userDropdown = document.getElementById('userDropdown');
var roomSearch = document.getElementById('roomSearch');
var roomsGrid = document.getElementById('roomsGrid');

// Track used users per room to avoid repetition
var usedUsers = {};

// Placeholder functions for undefined references
// These should be defined in your main application
function generateMemberNames(count, excludeName) {
    // Placeholder - replace with actual implementation
    var members = [];
    for (var i = 0; i < count; i++) {
        members.push('Member ' + (i + 1));
    }
    return members;
}

function initializeRooms() {
    // Placeholder - replace with actual implementation
    console.log('Initialize rooms function called');
}

// Placeholder data - replace with actual data from your application
var purposes = [
    'Study Session',
    'Group Project',
    'Meeting',
    'Discussion',
    'Presentation',
    'Workshop',
    'Seminar'
];

var userDatabase = {
    student: [
        { name: 'John Doe', email: 'john@example.com', studentNumber: '2021-001', program: 'Computer Science' },
        { name: 'Jane Smith', email: 'jane@example.com', studentNumber: '2021-002', program: 'Engineering' }
    ],
    faculty: [
        { name: 'Dr. Brown', email: 'brown@example.com', department: 'Computer Science' },
        { name: 'Prof. Davis', email: 'davis@example.com', department: 'Mathematics' }
    ],
    admin: [
        { name: 'Admin User', email: 'admin@example.com', department: 'Administration' }
    ],
    visitor: [
        { name: 'Guest User', email: 'guest@example.com' }
    ]
};

// Generate random bookings based on room's allowed users
function generateBookings(room) {
    var bookings = [];
    var numBookings = Math.floor(Math.random() * 8) + 5; // 5-12 bookings

    // Initialize used users for this room
    if (!usedUsers[room.id]) {
        usedUsers[room.id] = [];
    }

    for (var i = 0; i < numBookings; i++) {
        var userType = room.allowedUsers[Math.floor(Math.random() * room.allowedUsers.length)];
        var userTypeKey = userType.toLowerCase();

        // Get available users (not yet used)
        var availableUsers = userDatabase[userTypeKey].filter(function (u) {
            return !usedUsers[room.id].some(function (used) {
                return used.name === u.name;
            });
        });

        // If all users are used, reset for this room
        if (availableUsers.length === 0) {
            usedUsers[room.id] = usedUsers[room.id].filter(function (u) {
                return u.type !== userTypeKey;
            });
        }

        var finalAvailableUsers = availableUsers.length > 0 ? availableUsers : userDatabase[userTypeKey];
        var userData = finalAvailableUsers[Math.floor(Math.random() * finalAvailableUsers.length)];

        // Mark user as used
        usedUsers[room.id].push({ name: userData.name, type: userTypeKey });

        var bookingId = String(i + 1).padStart(4, '0');
        var randomDate = new Date(2025, 9, Math.floor(Math.random() * 30) + 1); // October 2025
        var hour = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
        var endHour = hour + 1;

        // Generate member names
        var numMembers = Math.floor(Math.random() * (room.capacity - 2)) + 2;
        var members = generateMemberNames(numMembers, userData.name);

        // Random purpose
        var purpose = purposes[Math.floor(Math.random() * purposes.length)];

        bookings.push({
            id: bookingId,
            userType: userType.toUpperCase(),
            user: userData,
            date: String(randomDate.getMonth() + 1).padStart(2, '0') + '/' +
                String(randomDate.getDate()).padStart(2, '0') + '/' +
                randomDate.getFullYear(),
            time: String(hour).padStart(2, '0') + ':00 - ' +
                String(endHour).padStart(2, '0') + ':00',
            members: members,
            purpose: purpose
        });
    }

    return bookings;
}

// ============================================
// SIDEBAR FUNCTIONALITY
// ============================================

if (sidebarToggleDesktop && sidebar && mainContent) {
    sidebarToggleDesktop.addEventListener('click', function (e) {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });
}

// Restore sidebar state on page load
window.addEventListener('load', function () {
    // Initialize rooms
    initializeRooms();
});

// Sidebar Toggle for Mobile
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

// Close mobile sidebar when clicking outside
document.addEventListener('click', function (e) {
    if (window.innerWidth <= 768 && sidebar && menuToggle && e.target) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// ============================================
// USER PROFILE DROPDOWN
// ============================================

if (userProfile) {
    userProfile.addEventListener('click', function (e) {
        e.stopPropagation();
        userProfile.classList.toggle('active');
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', function () {
    if (userProfile) {
        userProfile.classList.remove('active');
    }
});

// ============================================
// NAVIGATION ACTIVE STATE
// ============================================

var navItems = document.querySelectorAll('.nav-item');

navItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
        if (!item.classList.contains('logout') && item.getAttribute('href') !== '#') {
            navItems.forEach(function (nav) {
                nav.classList.remove('active');
            });
            item.classList.add('active');

            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('active');
            }
        }
    });
});

// Set active nav item based on current page
window.addEventListener('load', function () {
    var currentPath = window.location.pathname;
    navItems.forEach(function (item) {
        var href = item.getAttribute('href');
        if (href && currentPath.includes(href)) {
            item.classList.add('active');
        }
    });
});

// ============================================
// ROOMS FUNCTIONALITY
// ============================================

// Function to handle embedded room modal
function showEmbeddedRoomModal(roomElement) {
    // Get room data from HTML attributes
    var roomIdAttr = roomElement.getAttribute('data-room-id');
    var roomNameEl = roomElement.querySelector('.room-name');
    var roomTypeEl = roomElement.querySelector('.room-type');
    var capacityAttr = roomElement.getAttribute('data-room-capacity');
    var statusAttr = roomElement.getAttribute('data-status');
    var allowedUsersAttr = roomElement.getAttribute('data-allowed-users');

    var roomData = {
        id: roomIdAttr ? parseInt(roomIdAttr) : 0,
        name: roomNameEl ? roomNameEl.textContent : 'Unknown Room',
        type: roomTypeEl ? roomTypeEl.textContent : 'Unknown',
        capacity: capacityAttr ? parseInt(capacityAttr) : 0,
        status: statusAttr || 'unknown',
        allowedUsers: allowedUsersAttr ? JSON.parse(allowedUsersAttr) : []
    };

    showRoomModal(roomData);
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

if (roomSearch) {
    roomSearch.addEventListener('input', function (e) {
        var target = e.target;
        if (!target || !('value' in target)) return;

        var searchTerm = String(target.value).toLowerCase().trim();
        filterRooms(searchTerm);
    });
}

// Filter rooms based on search term
function filterRooms(searchTerm) {
    var roomCards = document.querySelectorAll('.room-card');

    roomCards.forEach(function (card) {
        var roomName = card.getAttribute('data-room-name');
        var roomType = card.getAttribute('data-room-type');

        if (searchTerm === '' ||
            (roomName && roomName.includes(searchTerm)) ||
            (roomType && roomType.includes(searchTerm))) {
            card.classList.remove('hidden');
            card.classList.add('visible');
        } else {
            card.classList.remove('visible');
            card.classList.add('hidden');
        }
    });
}

// ============================================
// NOTIFICATION FUNCTIONALITY
// ============================================

// Notification button click
var notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', function () {
        showNotification('You have 3 new notifications', 'info');
    });
}

// Simple notification system
function showNotification(message, type) {
    type = type || 'info';
    var notification = document.createElement('div');
    notification.style.cssText =
        'position: fixed;' +
        'top: 20px;' +
        'right: 20px;' +
        'padding: 1rem 1.5rem;' +
        'background: ' + (type === 'info' ? '#2c3e50' : '#c62828') + ';' +
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

// Animation styles for notifications (only once)
if (!document.getElementById('reservation-notification-styles')) {
    var notificationStyle = document.createElement('style');
    notificationStyle.id = 'reservation-notification-styles';
    notificationStyle.textContent =
        '@keyframes slideIn {' +
        '    from { transform: translateX(400px); opacity: 0; }' +
        '    to { transform: translateX(0); opacity: 1; }' +
        '}' +
        '@keyframes slideOut {' +
        '    from { transform: translateX(0); opacity: 1; }' +
        '    to { transform: translateX(400px); opacity: 0; }' +
        '}';
    document.head.appendChild(notificationStyle);
}

// ============================================
// ROOM MODAL FUNCTIONALITY
// ============================================

function showRoomModal(room) {
    // Remove existing modal if any
    var existingModal = document.getElementById('roomModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Prevent body scroll
    document.body.classList.add('modal-open');

    // Create modal overlay
    var modal = document.createElement('div');
    modal.id = 'roomModal';
    modal.className = 'modal-overlay';

    // Generate bookings for this room
    var bookings = generateBookings(room);

    modal.innerHTML =
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button class="modal-back-btn" onclick="closeRoomModal()">' +
        '<i class="fas fa-arrow-left"></i>' +
        '</button>' +
        '<h2>' + room.name.toUpperCase() + '</h2>' +
        '<div class="modal-actions">' +
        '<button class="modal-action-btn cancel-selected" onclick="cancelSelected()">' +
        '<i class="fas fa-times-circle"></i>' +
        '<span>Cancel Selected</span>' +
        '</button>' +
        '<button class="modal-action-btn cancel-all" onclick="cancelAll(\'' + room.name + '\')">' +
        '<i class="fas fa-ban"></i>' +
        '<span>Cancel All</span>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '<div class="modal-body">' +
        '<div class="bookings-table-wrapper">' +
        '<table class="bookings-table">' +
        '<thead>' +
        '<tr>' +
        '<th width="50"></th>' +
        '<th>BOOKING ID</th>' +
        '<th>USER TYPE</th>' +
        '<th>USER</th>' +
        '<th>DATE</th>' +
        '<th>TIME</th>' +
        '<th>NO. OF MEMBERS</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody id="bookingsTableBody">' +
        bookings.map(function (booking) {
            return '<tr data-booking=\'' + JSON.stringify(booking).replace(/'/g, '&#39;') + '\'>' +
                '<td><input type="checkbox" class="booking-checkbox" data-booking-id="' + booking.id + '"></td>' +
                '<td>' + booking.id + '</td>' +
                '<td><span class="user-type-badge ' + booking.userType.toLowerCase() + '">' + booking.userType + '</span></td>' +
                '<td>' + booking.user.name + '</td>' +
                '<td>' + booking.date + '</td>' +
                '<td>' + booking.time + '</td>' +
                '<td>' + booking.members.length + '</td>' +
                '</tr>';
        }).join('') +
        '</tbody>' +
        '</table>' +
        '</div>' +
        '</div>' +
        '</div>';

    document.body.appendChild(modal);

    // Add click handlers for table rows
    var tableRows = modal.querySelectorAll('tbody tr');
    tableRows.forEach(function (row) {
        row.addEventListener('click', function (e) {
            var target = e.target;
            // Don't trigger if clicking on checkbox
            if (target && target.classList && target.classList.contains('booking-checkbox')) {
                return;
            }
            var bookingDataAttr = row.getAttribute('data-booking');
            if (bookingDataAttr) {
                var bookingData = JSON.parse(bookingDataAttr);
                showUserDetailModal(bookingData);
            }
        });
    });

    // Trigger animation
    setTimeout(function () {
        modal.classList.add('active');
    }, 10);
}

function closeRoomModal() {
    var modal = document.getElementById('roomModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(function () {
            modal.remove();
        }, 300);
    }
}

function cancelSelected() {
    var checkboxes = document.querySelectorAll('.booking-checkbox:checked');
    if (checkboxes.length === 0) {
        showNotification('Please select bookings to cancel', 'info');
        return;
    }

    var count = checkboxes.length;
    showNotification('Cancelled ' + count + ' booking' + (count > 1 ? 's' : ''), 'info');

    // Remove selected rows with animation
    checkboxes.forEach(function (checkbox) {
        var row = checkbox.closest('tr');
        if (row) {
            row.style.animation = 'fadeOut 0.3s ease';
            setTimeout(function () {
                row.remove();
            }, 300);
        }
    });
}

function cancelAll(roomName) {
    if (confirm('Are you sure you want to cancel all bookings for ' + roomName + '?')) {
        showNotification('All bookings for ' + roomName + ' have been cancelled', 'info');
        closeRoomModal();
    }
}

// ============================================
// USER DETAIL MODAL FUNCTIONALITY
// ============================================

function showUserDetailModal(booking) {
    // Remove existing detail modal if any
    var existingDetailModal = document.getElementById('userDetailModal');
    if (existingDetailModal) {
        existingDetailModal.remove();
    }

    var detailModal = document.createElement('div');
    detailModal.id = 'userDetailModal';
    detailModal.className = 'user-detail-modal';

    var userType = booking.userType.toLowerCase();
    var user = booking.user;

    var gridHTML =
        '<div class="detail-grid">' +
        '<div class="detail-section">' +
        '<div class="detail-label">Full Name</div>' +
        '<div class="detail-value">' + user.name + '</div>' +
        '</div>' +
        '<div class="detail-section">' +
        '<div class="detail-label">Email Address</div>' +
        '<div class="detail-value">' + user.email + '</div>' +
        '</div>';

    // Add user type specific fields
    if (userType === 'student') {
        gridHTML +=
            '<div class="detail-section">' +
            '<div class="detail-label">Student Number</div>' +
            '<div class="detail-value">' + user.studentNumber + '</div>' +
            '</div>' +
            '<div class="detail-section">' +
            '<div class="detail-label">Program</div>' +
            '<div class="detail-value">' + user.program + '</div>' +
            '</div>';
    } else if (userType === 'faculty' || userType === 'admin') {
        gridHTML +=
            '<div class="detail-section full-width">' +
            '<div class="detail-label">Department</div>' +
            '<div class="detail-value">' + user.department + '</div>' +
            '</div>';
    }

    gridHTML +=
        '<div class="detail-section">' +
        '<div class="detail-label">Booking Date</div>' +
        '<div class="detail-value">' + booking.date + '</div>' +
        '</div>' +
        '<div class="detail-section">' +
        '<div class="detail-label">Time Slot</div>' +
        '<div class="detail-value">' + booking.time + '</div>' +
        '</div>' +
        '</div>';

    // Add full-width sections
    var fullWidthHTML =
        '<div class="detail-section full-width">' +
        '<div class="detail-label">Purpose of Reservation</div>' +
        '<div class="detail-value">' + booking.purpose + '</div>' +
        '</div>' +
        '<div class="detail-section full-width">' +
        '<div class="detail-label">Members (' + booking.members.length + ')</div>' +
        '<div class="members-list">' +
        booking.members.map(function (member) {
            return '<div class="member-item">' +
                '<i class="fas fa-user"></i>' +
                '<span>' + member + '</span>' +
                '</div>';
        }).join('') +
        '</div>' +
        '</div>';

    detailModal.innerHTML =
        '<div class="user-detail-content">' +
        '<div class="user-detail-header">' +
        '<h3>Booking Details - ' + booking.id + '</h3>' +
        '<button class="user-detail-close" onclick="closeUserDetailModal()">' +
        '<i class="fas fa-times"></i>' +
        '</button>' +
        '</div>' +
        '<div class="user-detail-body">' +
        gridHTML +
        fullWidthHTML +
        '</div>' +
        '</div>';

    document.body.appendChild(detailModal);

    // Trigger animation
    setTimeout(function () {
        detailModal.classList.add('active');
    }, 10);
}

function closeUserDetailModal() {
    var modal = document.getElementById('userDetailModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(function () {
            modal.remove();
        }, 300);
    }
}

// Close modal when clicking outside
document.addEventListener('click', function (e) {
    var modal = document.getElementById('roomModal');
    if (modal && e.target === modal) {
        closeRoomModal();
    }

    var detailModal = document.getElementById('userDetailModal');
    if (detailModal && e.target === detailModal) {
        closeUserDetailModal();
    }
});

// Close modal with ESC key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeUserDetailModal();
        closeRoomModal();
    }
});

// ============================================
// WINDOW RESIZE HANDLER
// ============================================

var resizeTimer;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
        if (window.innerWidth > 768 && sidebar) {
            sidebar.classList.remove('active');
        }
        if (userProfile) {
            userProfile.classList.remove('active');
        }
    }, 250);
});

console.log('Reservations page initialized successfully!'); 