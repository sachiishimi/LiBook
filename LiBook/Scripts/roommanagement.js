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

    // Use AJAX to get room data from server
    fetch('/Librarian/GetRoomData?roomId=' + roomId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(function (result) {
            if (result.success) {
                // Populate modal with room data
                console.log('Room data loaded:', result.data);

                // TODO: Implement modal population logic here
                // For now, show success notification
                showNotification('Room details loaded successfully', 'success');
            } else {
                showNotification('Error: ' + result.message, 'error');
            }
        })
        .catch(function (error) {
            console.error('Error fetching room data:', error);
            showNotification('Failed to load room data. Please try again.', 'error');
        });
}

/**
 * Create walk-in reservation
 */
function createWalkIn(roomId) {
    if (!roomId) {
        showNotification('Invalid room ID', 'error');
        return;
    }

    // TODO: Implement walk-in modal logic here
    // For now, show info notification
    showNotification('Walk-in reservation feature for room ID: ' + roomId, 'info');

    // You can implement modal opening logic here
    // Example: openWalkInModal(roomId);
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

        // Note: The actual refresh is handled by the href link
        // This is just for visual feedback
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
// PAGE INITIALIZATION
// ========================================
console.log('Room Management JavaScript loaded successfully');