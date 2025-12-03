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

// Placeholder functions for undefined references
function generateMemberNames(count, excludeName) {
    var members = [];
    for (var i = 0; i < count; i++) {
        members.push('Member ' + (i + 1));
    }
    return members;
}

function initializeRooms() {
    console.log('Initialize rooms function called');
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
    var roomId = roomElement.getAttribute('data-room-id');
    var roomName = roomElement.querySelector('.room-name').textContent;
    var roomType = roomElement.querySelector('.room-type').textContent;
    var capacity = roomElement.getAttribute('data-room-capacity') || 0;

    if (!roomId) {
        showNotification('Room ID not found', 'error');
        return;
    }

    // Show loading state
    showLoadingModal(roomName);

    // Fetch actual bookings from server
    fetch(`/AdminDashboard/GetRoomBookings?roomId=${roomId}`)
        .then(response => response.json())
        .then(bookings => {
            createRoomModal(roomId, roomName, roomType, capacity, bookings);
        })
        .catch(error => {
            console.error('Error fetching bookings:', error);
            showNotification('Failed to load bookings. Please try again.', 'error');
            // Fallback to empty modal
            createRoomModal(roomId, roomName, roomType, capacity, []);
        });
}

function showLoadingModal(roomName) {
    // Remove existing modal if any
    var existingModal = document.getElementById('roomModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.classList.add('modal-open');

    var modal = document.createElement('div');
    modal.id = 'roomModal';
    modal.className = 'modal-overlay';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <button class="modal-back-btn" onclick="closeRoomModal()">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2>${roomName.toUpperCase()}</h2>
            </div>
            <div class="modal-body" style="text-align: center; padding: 3rem;">
                <div class="loading-spinner"></div>
                <p>Loading bookings...</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(function () {
        modal.classList.add('active');
    }, 10);
}

function createRoomModal(roomId, roomName, roomType, capacity, bookings) {
    // Update existing modal or create new one
    var modal = document.getElementById('roomModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'roomModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    // Format date for display
    function formatDate(dateString) {
        try {
            var date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }

    // Format status badge
    function getStatusBadge(status) {
        var badgeClass = '';
        var statusLower = (status || '').toLowerCase();
        switch (statusLower) {
            case 'approved': badgeClass = 'approved'; break;
            case 'pending': badgeClass = 'pending'; break;
            case 'cancelled': badgeClass = 'cancelled'; break;
            default: badgeClass = 'draft';
        }
        return `<span class="status-badge ${badgeClass}">${status || 'Unknown'}</span>`;
    }

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <button class="modal-back-btn" onclick="closeRoomModal()">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2>${roomName.toUpperCase()}</h2>
                <div class="modal-actions">
                    <button class="modal-action-btn cancel-selected" onclick="cancelSelected()">
                        <i class="fas fa-times-circle"></i>
                        <span>Cancel Selected</span>
                    </button>
                    <button class="modal-action-btn cancel-all" onclick="cancelAll('${roomName}')">
                        <i class="fas fa-ban"></i>
                        <span>Cancel All</span>
                    </button>
                </div>
            </div>
            <div class="modal-body">
                ${bookings.length === 0 ?
            '<div class="no-bookings">No bookings found for this room.</div>' :
            `<div class="bookings-table-wrapper">
                        <table class="bookings-table">
                            <thead>
                                <tr>
                                    <th width="50"></th>
                                    <th>BOOKING ID</th>
                                    <th>RESERVEE NAME</th>
                                    <th>STATUS</th>
                                    <th>DATE</th>
                                    <th>TIME</th>
                                    <th>PURPOSE</th>
                                </tr>
                            </thead>
                            <tbody id="bookingsTableBody">
                                ${bookings.map(booking => `
                                    <tr data-booking-id="${booking.Id}" onclick="showBookingDetailModalFromRow(this)">
                                        <td><input type="checkbox" class="booking-checkbox" data-booking-id="${booking.Id}" onclick="event.stopPropagation()"></td>
                                        <td>${booking.BookingId || booking.Id.toString().padStart(4, '0')}</td>
                                        <td>${booking.ReserveeName || 'N/A'}</td>
                                        <td>${getStatusBadge(booking.Status)}</td>
                                        <td>${formatDate(booking.BookingDate)}</td>
                                        <td>${booking.Schedule || 'N/A'}</td>
                                        <td>${booking.Purpose || 'N/A'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>`
        }
            </div>
        </div>
    `;

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
            document.body.classList.remove('modal-open');
        }, 300);
    }
}

function showBookingDetailModalFromRow(row) {
    var bookingId = row.getAttribute('data-booking-id');
    // Get the booking data by making an API call
    fetch(`/AdminDashboard/GetBookingDetails?id=${bookingId}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(booking => {
            showBookingDetailModal(booking);
        })
        .catch(error => {
            console.error('Error fetching booking details:', error);
            showNotification('Failed to load booking details', 'error');
        });
}

// ============================================
// BOOKING DETAIL MODAL FUNCTIONALITY
// ============================================

function showBookingDetailModal(booking) {
    // Remove existing detail modal if any
    var existingDetailModal = document.getElementById('bookingDetailModal');
    if (existingDetailModal) {
        existingDetailModal.remove();
    }

    var detailModal = document.createElement('div');
    detailModal.id = 'bookingDetailModal';
    detailModal.className = 'booking-detail-modal';

    // Format dates
    function formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        try {
            var date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }

    detailModal.innerHTML = `
        <div class="booking-detail-content">
            <div class="booking-detail-header">
                <h3>Booking Details - ${booking.BookingId || booking.Id.toString().padStart(4, '0')}</h3>
                <button class="booking-detail-close" onclick="closeBookingDetailModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="booking-detail-body">
                <div class="detail-grid">
                    <div class="detail-section">
                        <div class="detail-label">Room</div>
                        <div class="detail-value">${booking.RoomName || 'N/A'}</div>
                    </div>
                    <div class="detail-section">
                        <div class="detail-label">Booking ID</div>
                        <div class="detail-value">${booking.BookingId || booking.Id.toString().padStart(4, '0')}</div>
                    </div>
                    <div class="detail-section">
                        <div class="detail-label">Status</div>
                        <div class="detail-value status-value ${(booking.Status || '').toLowerCase()}">${booking.Status || 'Unknown'}</div>
                    </div>
                    <div class="detail-section">
                        <div class="detail-label">Booking Date</div>
                        <div class="detail-value">${formatDateTime(booking.BookingDate)}</div>
                    </div>
                    <div class="detail-section full-width">
                        <div class="detail-label">Reservee Information</div>
                        <div class="detail-value">
                            <div><strong>Name:</strong> ${booking.ReserveeName || 'N/A'}</div>
                            <div><strong>Email:</strong> ${booking.ReserveeEmail || 'N/A'}</div>
                            <div><strong>Student No:</strong> ${booking.StudentNumber || 'N/A'}</div>
                            <div><strong>Program:</strong> ${booking.Program || 'N/A'}</div>
                        </div>
                    </div>
                    <div class="detail-section">
                        <div class="detail-label">Schedule</div>
                        <div class="detail-value">${booking.Schedule || 'N/A'}</div>
                    </div>
                    <div class="detail-section">
                        <div class="detail-label">Purpose</div>
                        <div class="detail-value">${booking.Purpose || 'N/A'}</div>
                    </div>
                    <div class="detail-section full-width">
                        <div class="detail-label">Timeline</div>
                        <div class="timeline">
                            <div class="timeline-item ${booking.SubmittedAt ? 'completed' : ''}">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <div class="timeline-title">Submitted</div>
                                    <div class="timeline-date">${formatDateTime(booking.SubmittedAt)}</div>
                                </div>
                            </div>
                            <div class="timeline-item ${booking.ApprovedAt ? 'completed' : ''}">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <div class="timeline-title">Approved</div>
                                    <div class="timeline-date">${formatDateTime(booking.ApprovedAt)}</div>
                                </div>
                            </div>
                            <div class="timeline-item ${booking.CancelledAt ? 'completed' : ''}">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <div class="timeline-title">${booking.CancelledAt ? 'Cancelled' : 'Status'}</div>
                                    <div class="timeline-date">${formatDateTime(booking.CancelledAt)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${booking.Members && booking.Members.length > 0 ? `
                    <div class="detail-section full-width">
                        <div class="detail-label">Members (${booking.Members.length})</div>
                        <div class="members-list">
                            ${booking.Members.map(member => `
                                <div class="member-item">
                                    <i class="fas fa-user"></i>
                                    <span>${member}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            <div class="booking-detail-footer">
                <button class="btn btn-secondary" onclick="closeBookingDetailModal()">Close</button>
                ${booking.Status !== 'Cancelled' ? `
                <button class="btn btn-danger" onclick="cancelBooking(${booking.Id})">
                    <i class="fas fa-ban"></i> Cancel Booking
                </button>
                ` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(detailModal);
    document.body.classList.add('modal-open');

    setTimeout(function () {
        detailModal.classList.add('active');
    }, 10);
}

function closeBookingDetailModal() {
    var modal = document.getElementById('bookingDetailModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(function () {
            modal.remove();
            document.body.classList.remove('modal-open');
        }, 300);
    }
}

// Function to cancel a single booking
function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        // Get anti-forgery token
        var token = document.querySelector('input[name="__RequestVerificationToken"]');
        var tokenValue = token ? token.value : '';

        // Send request to server to cancel booking
        fetch(`/AdminDashboard/CancelBooking?id=${bookingId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': tokenValue
            },
            body: JSON.stringify({ id: bookingId })
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok');
            })
            .then(data => {
                if (data.success) {
                    showNotification('Booking cancelled successfully', 'success');
                    closeBookingDetailModal();
                    // Refresh the modal if open
                    var currentModal = document.getElementById('roomModal');
                    if (currentModal) {
                        var roomName = currentModal.querySelector('h2').textContent;
                        var roomId = currentModal.getAttribute('data-room-id');
                        showEmbeddedRoomModal({
                            getAttribute: (attr) => roomId,
                            querySelector: (selector) => ({ textContent: roomName })
                        });
                    }
                } else {
                    showNotification(data.message || 'Failed to cancel booking', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Failed to cancel booking', 'error');
            });
    }
}

// ============================================
// CANCEL FUNCTIONALITY
// ============================================

function cancelSelected() {
    var checkboxes = document.querySelectorAll('.booking-checkbox:checked');
    if (checkboxes.length === 0) {
        showNotification('Please select bookings to cancel', 'info');
        return;
    }

    if (confirm(`Are you sure you want to cancel ${checkboxes.length} booking(s)?`)) {
        var bookingIds = Array.from(checkboxes).map(cb => cb.getAttribute('data-booking-id'));

        // Get anti-forgery token
        var token = document.querySelector('input[name="__RequestVerificationToken"]');
        var tokenValue = token ? token.value : '';

        fetch('/AdminDashboard/CancelMultipleBookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': tokenValue
            },
            body: JSON.stringify({ ids: bookingIds })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(`Cancelled ${data.count} booking(s) successfully`, 'success');
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
                } else {
                    showNotification(data.message || 'Failed to cancel bookings', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Failed to cancel bookings', 'error');
            });
    }
}

function cancelAll(roomName) {
    if (confirm(`Are you sure you want to cancel ALL bookings for ${roomName}?`)) {
        // Get room ID from current modal
        var modal = document.getElementById('roomModal');
        var roomId = modal ? modal.getAttribute('data-room-id') : null;

        if (!roomId) {
            showNotification('Room ID not found', 'error');
            return;
        }

        // Get anti-forgery token
        var token = document.querySelector('input[name="__RequestVerificationToken"]');
        var tokenValue = token ? token.value : '';

        fetch(`/AdminDashboard/CancelAllBookings?roomId=${roomId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': tokenValue
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(`Cancelled all bookings for ${roomName}`, 'success');
                    closeRoomModal();
                } else {
                    showNotification(data.message || 'Failed to cancel bookings', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Failed to cancel bookings', 'error');
            });
    }
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
        'background: ' + (type === 'info' ? '#2c3e50' : type === 'success' ? '#2e7d32' : '#c62828') + ';' +
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
        '}' +
        '@keyframes fadeOut {' +
        '    from { opacity: 1; }' +
        '    to { opacity: 0; }' +
        '}';
    document.head.appendChild(notificationStyle);
}

// Add loading spinner styles
if (!document.getElementById('reservation-spinner-styles')) {
    var spinnerStyle = document.createElement('style');
    spinnerStyle.id = 'reservation-spinner-styles';
    spinnerStyle.textContent =
        '.loading-spinner {' +
        '    border: 4px solid #f3f3f3;' +
        '    border-top: 4px solid #c62828;' +
        '    border-radius: 50%;' +
        '    width: 40px;' +
        '    height: 40px;' +
        '    animation: spin 1s linear infinite;' +
        '    margin: 0 auto 1rem;' +
        '}' +
        '@keyframes spin {' +
        '    0% { transform: rotate(0deg); }' +
        '    100% { transform: rotate(360deg); }' +
        '}';
    document.head.appendChild(spinnerStyle);
}

// ============================================
// MODAL EVENT HANDLERS
// ============================================

// Close modal when clicking outside
document.addEventListener('click', function (e) {
    var modal = document.getElementById('roomModal');
    if (modal && e.target === modal) {
        closeRoomModal();
    }

    var detailModal = document.getElementById('bookingDetailModal');
    if (detailModal && e.target === detailModal) {
        closeBookingDetailModal();
    }
});

// Close modal with ESC key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeBookingDetailModal();
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