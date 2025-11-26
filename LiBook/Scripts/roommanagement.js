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
    sidebarToggleDesktop.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', String(sidebar.classList.contains('collapsed')));
    });
}

// Restore sidebar state
window.addEventListener('DOMContentLoaded', function() {
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
    menuToggle.addEventListener('click', function() {
        sidebar.classList.add('active');
        sidebar.classList.remove('collapsed');
        mainContent.classList.remove('expanded');
    });
}

if (closeSidebar && sidebar) {
    closeSidebar.addEventListener('click', function() {
        sidebar.classList.remove('active');
    });
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
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
    userProfile.addEventListener('click', function(e) {
        e.stopPropagation();
        userProfile.classList.toggle('active');
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
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
    logoutButton.addEventListener('click', function(e) {
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

    setTimeout(function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(function() { 
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
        .then(function(response) { return response.json(); })
        .then(function(result) {
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
        .catch(function(error) {
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
        .then(function(response) { return response.json(); })
        .then(function(result) {
            if (result.success) {
                if (callback) {
                    callback(result.data);
                }
            } else {
                showNotification('Error: ' + result.message, 'error');
            }
        })
        .catch(function(error) {
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

    getAllRooms(function(rooms) {
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
    var filteredRooms = allRooms.filter(function(room) {
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

    roomsContainer.innerHTML = filteredRooms.map(function(room) {
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
    detailsBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var roomId = parseInt(this.getAttribute('data-room-id'));
            openRoomDetails(roomId);
        });
    });

    // Walk-in buttons
    var walkinBtns = document.querySelectorAll('.btn-walkin');
    walkinBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
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
    setInterval(function() {
        getAllRooms(function(rooms) {
            updateRoomsDisplay();
        });
    }, 30000); // 30 seconds
}

// ========================================
// SEARCH AND FILTER FUNCTIONALITY
// ========================================

// Search functionality
if (searchInput) {
    searchInput.addEventListener('input', function() {
        currentSearchTerm = this.value;
        updateRoomsDisplay();
    });
}

// Room type filter (Academic/Faculty/Public)
if (roomTypeFilter) {
    roomTypeFilter.addEventListener('change', function() {
        currentRoomTypeFilter = this.value;
        updateRoomsDisplay();
    });
}

// Status filter (stat cards)
var statCards = document.querySelectorAll('.stat-card');
statCards.forEach(function(card) {
    card.addEventListener('click', function() {
        // Remove active class from all cards
        statCards.forEach(function(c) { c.classList.remove('active'); });
        
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
    refreshBtn.addEventListener('click', function() {
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
    
    getRoomData(roomId, function(roomData) {
        if (roomData) {
            var detailsMessage = 'Room: ' + roomData.name + '\n' +
                'Type: ' + roomData.type + '\n' +
                'Capacity: ' + roomData.capacity + '\n' +
                'Status: ' + roomData.status;
            
            alert(detailsMessage);
            console.log('Room Data:', roomData);
        }
    });
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
    
    var userName = prompt('Enter user name for walk-in:');
    if (!userName) return;
    
    var purpose = prompt('Enter purpose:');
    if (!purpose) return;

    // For now, just show a success message
    // In production, you'd send this to the server
    showNotification('Walk-in created for room ' + roomId + ' by ' + userName, 'success');
    
    // Optionally update the room status on the server
    // fetch('/Librarian/CreateWalkIn', { ... })
}

// ========================================
// PAGE INITIALIZATION
// ========================================
function initializePage() {
    // Load rooms from server
    getAllRooms(function(rooms) {
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
} 