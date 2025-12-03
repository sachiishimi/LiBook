// @ts-nocheck
// ========================================
// DOM ELEMENT REFERENCES
// ========================================
var menuToggle = document.getElementById('menuToggle');
var sidebar = document.getElementById('sidebar');
var closeSidebar = document.getElementById('closeSidebar');
var sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
var mainContent = document.querySelector('.main-content');
var userProfile = document.getElementById('userProfile');
var searchInput = document.getElementById('searchRoomInput');
var roomTypeFilter = document.getElementById('roomTypeFilter');
var refreshBtn = document.getElementById('refreshRoomsBtn');
var roomsContainer = document.getElementById('roomsContainer');

// Global variables
var allRooms = [];
var currentFilter = 'all';
var currentRoomTypeFilter = 'all';
var currentSearchTerm = '';

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

    // Initialize the page
    initializePage();

    // Setup auto-refresh for rooms
    setupAutoRefresh();
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
// NOTIFICATION SYSTEM
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
// DATABASE FUNCTIONS
// ========================================

/**
 * Get all rooms from server
 */
function getAllRooms(callback) {
    fetch('/Librarian/GetAllRooms', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function (response) { return response.json(); })
        .then(function (result) {
            if (result.success) {
                allRooms = result.data;
                updateStats(result.stats);
                if (callback) {
                    callback(result.data);
                }
            } else {
                showNotification('Error: ' + result.message, 'error');
            }
        })
        .catch(function (error) {
            console.error('Error fetching rooms:', error);
            showNotification('Failed to load rooms', 'error');
        });
}

/**
 * Get room data from server
 */
function getRoomData(roomId, callback) {
    fetch('/Librarian/GetRoomData?roomId=' + roomId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function (response) { return response.json(); })
        .then(function (result) {
            if (result.success) {
                if (callback) {
                    callback(result.data);
                }
            } else {
                showNotification('Error: ' + result.message, 'error');
            }
        })
        .catch(function (error) {
            console.error('Error fetching room data:', error);
            showNotification('Failed to load room data', 'error');
        });
}

/**
 * Refresh rooms display
 */
function refreshRooms() {
    if (refreshBtn) {
        refreshBtn.disabled = true;
        var icon = refreshBtn.querySelector('i');
        if (icon) {
            icon.classList.add('fa-spin');
        }
    }

    getAllRooms(function (rooms) {
        updateRoomsDisplay();
        showNotification('Rooms refreshed successfully!', 'success');

        if (refreshBtn) {
            refreshBtn.disabled = false;
            var icon = refreshBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-spin');
            }
        }
    });
}

/**
 * Update stats display
 */
function updateStats(stats) {
    var allCountEl = document.getElementById('allCount');
    var availableCountEl = document.getElementById('availableCount');
    var unavailableCountEl = document.getElementById('unavailableCount');
    var maintenanceCountEl = document.getElementById('maintenanceCount');

    if (allCountEl) allCountEl.textContent = stats.allCount;
    if (availableCountEl) availableCountEl.textContent = stats.availableCount;
    if (unavailableCountEl) unavailableCountEl.textContent = stats.unavailableCount;
    if (maintenanceCountEl) maintenanceCountEl.textContent = stats.maintenanceCount;
}

/**
 * Filter and display rooms
 */
function updateRoomsDisplay() {
    if (!roomsContainer) return;

    // Filter rooms based on current filters
    var filteredRooms = allRooms.filter(function (room) {
        // Availability filter (from stat cards)
        var statusMatch = currentFilter === 'all' ||
            (room.status && room.status.toLowerCase() === currentFilter.toLowerCase());

        // Room type filter (Academic/Faculty/Public)
        var roomTypeMatch = currentRoomTypeFilter === 'all' ||
            (room.type && room.type.toLowerCase() === currentRoomTypeFilter.toLowerCase());

        // Search filter
        var searchMatch = true;
        if (currentSearchTerm) {
            var searchLower = currentSearchTerm.toLowerCase();
            searchMatch = (room.name && room.name.toLowerCase().includes(searchLower)) ||
                (room.type && room.type.toLowerCase().includes(searchLower));
        }

        return statusMatch && roomTypeMatch && searchMatch;
    });

    // Display rooms
    if (filteredRooms.length === 0) {
        roomsContainer.innerHTML =
            '<div class="empty-state">' +
            '<i class="fas fa-door-closed"></i>' +
            '<h3>No Rooms Found</h3>' +
            '<p>Try adjusting your search or filter criteria.</p>' +
            '</div>';
        return;
    }

    roomsContainer.innerHTML = filteredRooms.map(function (room) {
        var statusClass = (room.status || 'available').toLowerCase();
        var statusText = room.status || 'Available';
        var roomType = room.type || 'Academic';
        var roomTypeClass = roomType.toLowerCase();

        // Determine icon based on room type
        var roomTypeIcon = 'fa-graduation-cap'; // Default Academic
        if (roomTypeClass === 'faculty') {
            roomTypeIcon = 'fa-chalkboard-teacher';
        } else if (roomTypeClass === 'public') {
            roomTypeIcon = 'fa-users';
        }

        var walkInButton = statusClass === 'available' ?
            '<button class="room-btn room-btn-success btn-walkin" data-room-id="' + room.id + '">' +
            '<i class="fas fa-user-plus"></i>' +
            '<span>Walk-In</span>' +
            '</button>' : '';

        return '<div class="room-card ' + statusClass + '" data-room-id="' + room.id + '" data-status="' + statusClass + '" data-room-type="' + roomTypeClass + '" data-capacity="' + room.capacity + '">' +
            '<div class="room-card-header">' +
            '<div class="room-info">' +
            '<h3 class="room-name">' + (room.name || 'Unknown Room') + '</h3>' +
            '<p class="room-availability">' + statusText + '</p>' +
            '</div>' +
            '<span class="status-badge status-' + statusClass + '">' + statusText + '</span>' +
            '</div>' +
            '<div class="room-card-body">' +
            '<div class="room-type-tag room-type-' + roomTypeClass + '">' +
            '<i class="fas ' + roomTypeIcon + '"></i>' +
            '<span>For: ' + roomType + '</span>' +
            '</div>' +
            '<div class="room-details">' +
            '<div class="room-detail">' +
            '<i class="fas fa-users"></i>' +
            '<span>Capacity: ' + room.capacity + '</span>' +
            '</div>' +
            '<div class="room-detail">' +
            '<i class="fas fa-door-open"></i>' +
            '<span>' + statusText + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="room-actions">' +
            '<button class="room-btn room-btn-primary btn-details" data-room-id="' + room.id + '">' +
            '<i class="fas fa-info-circle"></i>' +
            '<span>Details</span>' +
            '</button>' +
            walkInButton +
            '</div>' +
            '</div>' +
            '</div>';
    }).join('');

    // Re-attach event listeners to newly created buttons
    attachButtonListeners();
}

/**
 * Attach event listeners to buttons
 */
function attachButtonListeners() {
    // Details buttons
    var detailsBtns = document.querySelectorAll('.btn-details');
    detailsBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var roomId = parseInt(this.getAttribute('data-room-id'));
            openRoomDetails(roomId);
        });
    });

    // Walk-in buttons
    var walkinBtns = document.querySelectorAll('.btn-walkin');
    walkinBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var roomId = parseInt(this.getAttribute('data-room-id'));
            createWalkIn(roomId);
        });
    });
}

/**
 * Setup auto-refresh for rooms (checks for new rooms every 30 seconds)
 */
function setupAutoRefresh() {
    // Refresh every 30 seconds
    setInterval(function () {
        getAllRooms(function (rooms) {
            updateRoomsDisplay();
        });
    }, 30000); // 30 seconds
}

// ========================================
// SEARCH AND FILTER FUNCTIONALITY
// ========================================

// Search functionality
if (searchInput) {
    searchInput.addEventListener('input', function () {
        currentSearchTerm = this.value;
        updateRoomsDisplay();
    });
}

// Room type filter (Academic/Faculty/Public)
if (roomTypeFilter) {
    roomTypeFilter.addEventListener('change', function () {
        currentRoomTypeFilter = this.value;
        updateRoomsDisplay();
    });
}

// Status filter (stat cards)
var statCards = document.querySelectorAll('.stat-card');
statCards.forEach(function (card) {
    card.addEventListener('click', function () {
        // Remove active class from all cards
        statCards.forEach(function (c) { c.classList.remove('active'); });

        // Add active class to clicked card
        this.classList.add('active');

        // Get filter value
        currentFilter = this.getAttribute('data-filter');

        // Update display
        updateRoomsDisplay();
    });
});

// Refresh button
if (refreshBtn) {
    refreshBtn.addEventListener('click', function () {
        refreshRooms();
    });
}

// ========================================
// ROOM ACTIONS (Global functions for onclick)
// ========================================

/**
 * Open room details modal
 * @param {number} roomId - The room ID
 */
function openRoomDetails(roomId) {
    if (!roomId) {
        showNotification('Invalid room ID', 'error');
        return;
    }

    getRoomData(roomId, function (roomData) {
        if (roomData) {
            // Populate modal with room data
            document.getElementById('modalRoomName').textContent = roomData.name || 'Unknown Room';
            document.getElementById('modalRoomType').textContent = roomData.type || 'Academic';

            // Enforce max capacity of 10
            var capacity = roomData.capacity || 0;
            if (capacity > 10) capacity = 10;
            document.getElementById('modalRoomCapacity').textContent = capacity + ' people';

            document.getElementById('modalUserType').textContent = roomData.type || 'Academic';

            // Set status as read-only text
            var statusElement = document.getElementById('modalRoomStatus');
            if (statusElement) {
                statusElement.textContent = roomData.status || 'Available';
            }

            // Populate reservations (mock data for now - replace with actual data)
            var reservationsList = document.getElementById('reservationsList');
            var reservations = roomData.reservations || [
                { name: 'John Doe', canCancel: true },
                { name: 'Jane Smith', canCancel: false },
                { name: 'Mike Johnson', canCancel: false }
            ];

            if (reservations.length === 0) {
                reservationsList.innerHTML = '<div class="no-reservations">No current reservations</div>';
            } else {
                reservationsList.innerHTML = reservations.map(function (reservation, index) {
                    // Always include the cancel button in the HTML structure
                    // It will be hidden by CSS and slide in on hover
                    var cancelBtn = '<button class="cancel-reservation-btn" data-reservation-index="' + index + '" data-reservation-name="' + reservation.name + '">' +
                        '<i class="fas fa-times"></i>' +
                        '<span>Cancel</span>' +
                        '</button>';

                    return '<div class="reservation-item">' +
                        '<div class="reservation-avatar">' +
                        '<i class="fas fa-user"></i>' +
                        '</div>' +
                        '<div class="reservation-info">' +
                        '<span class="reservation-name">' + reservation.name + '</span>' +
                        '</div>' +
                        cancelBtn +
                        '</div>';
                }).join('');

                // Add event listeners to cancel buttons
                setTimeout(function () {
                    var cancelBtns = document.querySelectorAll('.cancel-reservation-btn');
                    cancelBtns.forEach(function (btn) {
                        btn.addEventListener('click', function (e) {
                            e.stopPropagation();
                            var reservationName = this.getAttribute('data-reservation-name');
                            cancelReservationInModal(reservationName, roomId);
                        });
                    });
                }, 0);
            }

            // Store current room ID for action buttons
            window.currentRoomId = roomId;

            // Show modal
            var modal = document.getElementById('roomDetailsModal');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            console.log('Room Data:', roomData);
        }
    });
}

// Close modal functionality
document.addEventListener('DOMContentLoaded', function () {
    var closeModalBtn = document.getElementById('closeRoomModal');
    var modal = document.getElementById('roomDetailsModal');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function () {
            closeRoomModal();
        });
    }

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeRoomModal();
            }
        });
    }

    // Action button handlers
    var viewScheduleBtn = document.getElementById('viewScheduleBtn');
    if (viewScheduleBtn) {
        viewScheduleBtn.addEventListener('click', function () {
            if (window.currentRoomId) {
                openScheduleModal(window.currentRoomId);
            }
        });
    }

    var createWalkInModalBtn = document.getElementById('createWalkInBtn');
    if (createWalkInModalBtn) {
        createWalkInModalBtn.addEventListener('click', function () {
            if (window.currentRoomId) {
                closeRoomModal();
                createWalkIn(window.currentRoomId);
            }
        });
    }

    var reportIssueBtn = document.getElementById('reportIssueBtn');
    if (reportIssueBtn) {
        reportIssueBtn.addEventListener('click', function () {
            if (window.currentRoomId) {
                closeRoomModal();
                openReportIssueModal(window.currentRoomId);
            }
        });
    }

    // Walk-in modal handlers
    var closeWalkInModalBtn = document.getElementById('closeWalkInModal');
    if (closeWalkInModalBtn) {
        closeWalkInModalBtn.addEventListener('click', function () {
            closeWalkInModal();
        });
    }

    var cancelWalkInBtn = document.getElementById('cancelWalkInBtn');
    if (cancelWalkInBtn) {
        cancelWalkInBtn.addEventListener('click', function () {
            closeWalkInModal();
        });
    }

    // Close walk-in modal when clicking outside
    var walkInModal = document.getElementById('walkInModal');
    if (walkInModal) {
        walkInModal.addEventListener('click', function (e) {
            if (e.target === walkInModal) {
                closeWalkInModal();
            }
        });
    }

    // Show/hide member names field based on number of members
    var walkInMembers = document.getElementById('walkInMembers');
    if (walkInMembers) {
        walkInMembers.addEventListener('input', function () {
            var memberNamesGroup = document.getElementById('memberNamesGroup');
            if (memberNamesGroup) {
                if (parseInt(this.value) > 1) {
                    memberNamesGroup.style.display = 'block';
                } else {
                    memberNamesGroup.style.display = 'none';
                }
            }
        });
    }

    // Handle walk-in form submission
    var walkInForm = document.getElementById('walkInForm');
    if (walkInForm) {
        walkInForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var formData = {
                roomId: window.currentWalkInRoomId,
                name: document.getElementById('walkInName').value,
                email: document.getElementById('walkInEmail').value,
                userType: document.getElementById('walkInUserType').value,
                numberOfMembers: parseInt(document.getElementById('walkInMembers').value),
                memberNames: document.getElementById('walkInMemberNames').value
            };

            // Validate
            if (!formData.name || !formData.email || !formData.userType || !formData.numberOfMembers) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            if (formData.numberOfMembers < 1 || formData.numberOfMembers > 10) {
                showNotification('Number of members must be between 1 and 10', 'error');
                return;
            }

            // For now, just show success message
            // In production, send this to the server
            showNotification('Walk-in reservation created successfully!', 'success');
            closeWalkInModal();

            // Optional: Refresh room data
            if (window.currentRoomId) {
                // Refresh the room details modal if it's open
                refreshRooms();
            }

            // In production, uncomment and implement:
            // submitWalkInReservation(formData);
        });
    }

    // Schedule modal handlers
    var closeScheduleModalBtn = document.getElementById('closeScheduleModal');
    if (closeScheduleModalBtn) {
        closeScheduleModalBtn.addEventListener('click', function () {
            closeScheduleModal();
        });
    }

    // Close schedule modal when clicking outside
    var scheduleModal = document.getElementById('scheduleModal');
    if (scheduleModal) {
        scheduleModal.addEventListener('click', function (e) {
            if (e.target === scheduleModal) {
                closeScheduleModal();
            }
        });
    }

    // Report Issue modal handlers
    var closeReportIssueModalBtn = document.getElementById('closeReportIssueModal');
    if (closeReportIssueModalBtn) {
        closeReportIssueModalBtn.addEventListener('click', function () {
            closeReportIssueModal();
        });
    }

    var cancelReportIssueBtn = document.getElementById('cancelReportIssue');
    if (cancelReportIssueBtn) {
        cancelReportIssueBtn.addEventListener('click', function () {
            closeReportIssueModal();
        });
    }

    // Close report issue modal when clicking outside
    var reportIssueModal = document.getElementById('reportIssueModal');
    if (reportIssueModal) {
        reportIssueModal.addEventListener('click', function (e) {
            if (e.target === reportIssueModal) {
                closeReportIssueModal();
            }
        });
    }

    // Handle report issue form submission
    var reportIssueForm = document.getElementById('reportIssueForm');
    if (reportIssueForm) {
        reportIssueForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var formData = {
                reason: document.getElementById('issueReason').value,
            };

            submitIssueReport(formData);
        });
    }
});

function closeRoomModal() {
    var modal = document.getElementById('roomDetailsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Create walk-in reservation
 * @param {number} roomId - The room ID
 */
function createWalkIn(roomId) {
    if (!roomId) {
        showNotification('Invalid room ID', 'error');
        return;
    }

    // Store the room data for walk-in modal
    window.currentWalkInRoomId = roomId;
    window.currentWalkInRoomType = null;

    // Get room data to determine user type options
    getRoomData(roomId, function (roomData) {
        if (roomData) {
            window.currentWalkInRoomType = roomData.type;

            // Update room info in banner
            var roomNameEl = document.getElementById('walkInRoomName');
            var roomTypeEl = document.getElementById('walkInRoomTypeDisplay');
            if (roomNameEl) roomNameEl.textContent = roomData.name || 'Unknown';
            if (roomTypeEl) roomTypeEl.textContent = roomData.type || 'Unknown';

            // Update user type options based on room type
            updateUserTypeOptions(roomData.type);

            // Show the walk-in modal
            var modal = document.getElementById('walkInModal');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    });
}

/**
 * Update user type options based on room type
 */
function updateUserTypeOptions(roomType) {
    var userTypeSelect = document.getElementById('walkInUserType');
    if (!userTypeSelect) return;

    // Clear existing options except the first one
    userTypeSelect.innerHTML = '<option value="">Select user type</option>';

    // Add options based on room type
    if (roomType === 'Academic') {
        userTypeSelect.innerHTML += '<option value="Student">Student</option>';
        userTypeSelect.innerHTML += '<option value="Faculty">Faculty</option>';
    } else if (roomType === 'Faculty') {
        userTypeSelect.innerHTML += '<option value="Faculty">Faculty</option>';
        userTypeSelect.innerHTML += '<option value="Admin">Admin</option>';
    } else if (roomType === 'Public') {
        userTypeSelect.innerHTML += '<option value="Student">Student</option>';
        userTypeSelect.innerHTML += '<option value="Faculty">Faculty</option>';
        userTypeSelect.innerHTML += '<option value="Admin">Admin</option>';
        userTypeSelect.innerHTML += '<option value="Visitor">Visitor</option>';
    } else {
        // Default: show all options
        userTypeSelect.innerHTML += '<option value="Student">Student</option>';
        userTypeSelect.innerHTML += '<option value="Faculty">Faculty</option>';
        userTypeSelect.innerHTML += '<option value="Admin">Admin</option>';
        userTypeSelect.innerHTML += '<option value="Visitor">Visitor</option>';
    }
}

/**
 * Close walk-in modal
 */
function closeWalkInModal() {
    var modal = document.getElementById('walkInModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Reset form
    var form = document.getElementById('walkInForm');
    if (form) {
        form.reset();
    }

    // Hide member names group
    var memberNamesGroup = document.getElementById('memberNamesGroup');
    if (memberNamesGroup) {
        memberNamesGroup.style.display = 'none';
    }
}

/**
 * Open schedule modal
 */
function openScheduleModal(roomId) {
    if (!roomId) {
        showNotification('Invalid room ID', 'error');
        return;
    }

    // Get room data to populate schedule
    getRoomData(roomId, function (roomData) {
        if (roomData) {
            // Update modal title
            var modalTitle = document.getElementById('scheduleModalRoomName');
            if (modalTitle) {
                modalTitle.textContent = (roomData.name || 'Room') + ' - Full Schedule';
            }

            // Populate schedule list with mock data
            // In production, replace with actual API call
            var schedules = [
                {
                    name: 'Sarah Wilson',
                    email: 'sarah.w@example.com',
                    userType: 'Student',
                    date: '2025-11-14',
                    time: '1:00 PM - 3:00 PM',
                    status: 'Accepted',
                    canCancel: true
                },
                {
                    name: 'David Brown',
                    email: 'david.b@example.com',
                    userType: 'Faculty',
                    date: '2025-11-13',
                    time: '3:00 PM - 5:00 PM',
                    status: 'Accepted',
                    canCancel: true
                },
                {
                    name: 'Jennifer Lopez',
                    email: 'jennifer.l@example.com',
                    userType: 'Admin',
                    date: '2025-11-16',
                    time: '2:00 PM - 4:00 PM',
                    status: 'Accepted',
                    canCancel: true
                },
                {
                    name: 'Michael Chen',
                    email: 'michael.c@example.com',
                    userType: 'Visitor',
                    date: '2025-11-15',
                    time: '10:00 AM - 12:00 PM',
                    status: 'Accepted',
                    canCancel: true
                }
            ];

            populateScheduleList(schedules);

            // Show modal
            var modal = document.getElementById('scheduleModal');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    });
}

/**
 * Populate schedule list with reservation data
 */

/**
 * Close schedule modal
 */
function closeScheduleModal() {
    var modal = document.getElementById('scheduleModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Cancel a reservation from the room details modal
 */
function cancelReservationInModal(reservationName, roomId) {
    if (confirm('Are you sure you want to cancel the reservation for ' + reservationName + '?')) {
        // In production, send cancellation to server
        // Example:
        // fetch('/Librarian/CancelReservation', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ name: reservationName, roomId: roomId })
        // })

        showNotification('Reservation for ' + reservationName + ' has been cancelled', 'success');

        // Refresh the room details modal
        if (roomId) {
            openRoomDetails(roomId);
        }
    }
}

/**
 * Cancel a reservation from the schedule table
 */
function cancelReservationFromSchedule(name, email) {
    if (confirm('Are you sure you want to cancel the reservation for ' + name + '?')) {
        // In production, send cancellation to server
        // Example:
        // fetch('/Librarian/CancelReservation', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ name: name, email: email, roomId: window.currentRoomId })
        // })

        showNotification('Reservation for ' + name + ' has been cancelled', 'success');

        // Refresh the schedule modal
        if (window.currentRoomId) {
            openScheduleModal(window.currentRoomId);
        }
    }
}

// ========================================
// PAGE INITIALIZATION
// ========================================
function initializePage() {
    // Load rooms from server
    getAllRooms(function (rooms) {
        updateRoomsDisplay();
    });

    console.log('Room Management initialized with Room Type badges!');
}

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
        '.fa-spin { animation: fa-spin 1s infinite linear; }' +
        '@keyframes fa-spin {' +
        '    0% { transform: rotate(0deg); }' +
        '    100% { transform: rotate(360deg); }' +
        '}';
    document.head.appendChild(style);
} function populateScheduleList(schedules) {
    var scheduleList = document.getElementById('scheduleList');
    var emptySchedule = document.getElementById('emptySchedule');

    if (!scheduleList) return;

    if (!schedules || schedules.length === 0) {
        scheduleList.style.display = 'none';
        if (emptySchedule) {
            emptySchedule.style.display = 'block';
        }
        return;
    }

    scheduleList.style.display = 'block';
    if (emptySchedule) {
        emptySchedule.style.display = 'none';
    }

    // Create bulk action bar
    var bulkActionBar = '<div class="bulk-action-bar" id="bulkActionBar">' +
        '<div class="bulk-action-left">' +
        '<span class="bulk-count" id="bulkCount">0 selected</span>' +
        '<button class="bulk-btn bulk-select-all-btn" id="bulkSelectAllBtn">' +
        '<i class="fas fa-check-square"></i> Select All' +
        '</button>' +
        '</div>' +
        '<div class="bulk-action-right">' +
        '<button class="bulk-btn bulk-cancel-btn" id="bulkCancelBtn">' +
        '<i class="fas fa-times-circle"></i> Cancel Selected' +
        '</button>' +
        '</div>' +
        '</div>';

    // Create table
    var tableHTML = '<table class="schedule-table">' +
        '<thead>' +
        '<tr>' +
        '<th class="th-checkbox"></th>' +
        '<th>Name</th>' +
        '<th>Email</th>' +
        '<th>User Type</th>' +
        '<th>Date</th>' +
        '<th>Time</th>' +
        '<th>Status</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';

    schedules.forEach(function (schedule, index) {
        var statusClass = 'status-' + schedule.status.toLowerCase();
        var isCancellable = schedule.canCancel && schedule.status.toLowerCase() !== 'cancelled';

        // Checkbox (only for cancellable reservations)
        var checkbox = isCancellable ?
            '<input type="checkbox" class="table-checkbox reservation-checkbox" data-index="' + index + '" data-name="' + schedule.name + '" data-email="' + schedule.email + '">' :
            '';

        tableHTML += '<tr class="schedule-row">' +
            '<td class="td-checkbox" data-label="">' + checkbox + '</td>' +
            '<td class="schedule-name" data-label="Name">' + schedule.name + '</td>' +
            '<td class="schedule-email" data-label="Email">' + schedule.email + '</td>' +
            '<td data-label="User Type">' + schedule.userType + '</td>' +
            '<td data-label="Date">' + schedule.date + '</td>' +
            '<td data-label="Time">' + schedule.time + '</td>' +
            '<td data-label="Status"><span class="schedule-status ' + statusClass + '">' + schedule.status + '</span></td>' +
            '</tr>';
    });

    tableHTML += '</tbody></table>';

    scheduleList.innerHTML = bulkActionBar + tableHTML;

    // Add event listeners
    setTimeout(function () {
        setupScheduleEventListeners();
    }, 0);
}

function setupScheduleEventListeners() {
    // Individual checkboxes
    var checkboxes = document.querySelectorAll('.reservation-checkbox');
    checkboxes.forEach(function (cb) {
        cb.addEventListener('change', function () {
            updateBulkActionBar();
        });
    });

    // Select all button
    var bulkSelectAllBtn = document.getElementById('bulkSelectAllBtn');
    if (bulkSelectAllBtn) {
        bulkSelectAllBtn.addEventListener('click', function () {
            var allCheckboxes = document.querySelectorAll('.reservation-checkbox');
            var checkedCount = document.querySelectorAll('.reservation-checkbox:checked').length;

            // If all are checked, uncheck all; otherwise check all
            var shouldCheck = checkedCount !== allCheckboxes.length;

            allCheckboxes.forEach(function (cb) {
                cb.checked = shouldCheck;
            });

            // Update button text
            this.innerHTML = shouldCheck ?
                '<i class="fas fa-square"></i> Deselect All' :
                '<i class="fas fa-check-square"></i> Select All';

            updateBulkActionBar();
        });
    }

    // Bulk cancel selected button
    var bulkCancelBtn = document.getElementById('bulkCancelBtn');
    if (bulkCancelBtn) {
        bulkCancelBtn.addEventListener('click', function () {
            cancelSelectedReservations();
        });
    }
}

function updateBulkActionBar() {
    var checkboxes = document.querySelectorAll('.reservation-checkbox:checked');
    var bulkCount = document.getElementById('bulkCount');

    if (bulkCount) {
        bulkCount.textContent = checkboxes.length + ' selected';
    }
}

function cancelSelectedReservations() {
    var checkboxes = document.querySelectorAll('.reservation-checkbox:checked');

    if (checkboxes.length === 0) {
        showNotification('Please select reservations to cancel', 'warning');
        return;
    }

    var count = checkboxes.length;
    if (confirm('Are you sure you want to cancel ' + count + ' reservation(s)?')) {
        showNotification(count + ' reservation(s) cancelled successfully', 'success');

        // Refresh the schedule modal
        if (window.currentRoomId) {
            openScheduleModal(window.currentRoomId);
        }
    }
}


/**
 * Open report issue modal
 */
function openReportIssueModal(roomId) {
    if (!roomId) {
        showNotification('Invalid room ID', 'error');
        return;
    }

    // Get room data
    getRoomData(roomId, function (roomData) {
        if (roomData) {
            // Update modal with room info
            var roomNameEl = document.getElementById('reportIssueRoomName');
            var roomTypeEl = document.getElementById('reportIssueRoomType');

            if (roomNameEl) {
                roomNameEl.textContent = roomData.name || 'Room';
            }

            if (roomTypeEl) {
                var roomType = roomData.type || 'Public';
                roomTypeEl.textContent = roomType;
                roomTypeEl.className = 'room-type-badge ' + roomType.toLowerCase();
            }

            // Store room ID for submission
            window.currentReportRoomId = roomId;

            // Show modal
            var modal = document.getElementById('reportIssueModal');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    });
}

/**
 * Close report issue modal
 */
function closeReportIssueModal() {
    var modal = document.getElementById('reportIssueModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Reset form
    var form = document.getElementById('reportIssueForm');
    if (form) {
        form.reset();
    }
}

/**
 * Submit issue report
 */
function submitIssueReport(formData) {
    // In production, send to server
    // fetch('/Librarian/ReportIssue', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         roomId: window.currentReportRoomId,
    //         reason: formData.reason,
    //         // Librarian info will be automatically added from session on backend
    //     })
    // })

    showNotification('Issue report submitted successfully', 'success');
    closeReportIssueModal();
} 