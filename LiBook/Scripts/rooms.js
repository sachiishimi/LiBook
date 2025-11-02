// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
const mainContent = document.querySelector('.main-content');
const userProfile = document.getElementById('userProfile');
const userDropdown = document.getElementById('userDropdown');

// Room Management Elements
const modal = document.getElementById('roomModal');
const addRoomBtn = document.getElementById('addRoomBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const roomForm = document.getElementById('roomForm');
const searchInput = document.getElementById('searchRooms');
const selectAllCheckbox = document.getElementById('selectAll');

// ============================================
// SIDEBAR FUNCTIONALITY
// ============================================

// Sidebar Toggle for Desktop (Collapse/Expand)
if (sidebarToggleDesktop) {
    sidebarToggleDesktop.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });
}

// Sidebar Toggle for Mobile
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
        if (!item.classList.contains('logout') && item.getAttribute('href') !== '#') {
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
// ROOM MANAGEMENT MODAL FUNCTIONALITY
// ============================================

// Open modal for adding new room
if (addRoomBtn) {
    addRoomBtn.addEventListener('click', () => {
        modal.classList.add('active');
        document.getElementById('modalTitle').textContent = 'Add New Room';
        roomForm.reset();
    });
}

// Close modal
if (closeModal) {
    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

// Close modal when clicking outside
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Form submission
if (roomForm) {
    roomForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form values
        const roomName = document.getElementById('roomName').value;
        const roomUser1 = document.getElementById('roomUser1').value;
        const roomUser2 = document.getElementById('roomUser2').value;
        const roomStatus = document.getElementById('roomStatus').value;


        // Here you would typically send this data to your server
        console.log('Room Data:', { roomName, roomUser1, roomUser2, roomStatus });


        // Close modal and show success message
        modal.classList.remove('active');
        showNotification('Room added successfully!', 'success');

        // Optionally add the room to the table dynamically
        // addRoomToTable(roomName, roomUser1, roomUser2);
    });
}


// Search rooms
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#roomsTableBody tr');

        rows.forEach(row => {
            const roomName = row.querySelector('.room-details h3').textContent.toLowerCase();
            if (roomName.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}


// Select all checkboxes
if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('#roomsTableBody .custom-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });
}

// ============================================
// ACTION BUTTONS (EDIT & ARCHIVE)
// ============================================

// Edit button functionality
// Edit button functionality (with status)
let editingRow = null; // track the current row being edited

// Edit button functionality (with status)
document.querySelectorAll('.icon-btn.edit').forEach(btn => {
    btn.addEventListener('click', () => {
        modal.classList.add('active');
        document.getElementById('modalTitle').textContent = 'Edit Room';

        const row = btn.closest('tr');
        editingRow = row; // store row reference for updating later

        const roomName = row.querySelector('.room-details h3').textContent;
        const roomUser1 = row.querySelectorAll('.user-type')[0].textContent.toLowerCase();
        const roomUser2 = row.querySelectorAll('.user-type')[1].textContent.toLowerCase();
        const roomStatusElement = row.querySelector('.status-badge');
        let roomStatus = '';

        if (roomStatusElement.classList.contains('available')) roomStatus = 'available';
        else if (roomStatusElement.classList.contains('in-use') || roomStatusElement.classList.contains('unavailable')) roomStatus = 'unavailable';
        else if (roomStatusElement.classList.contains('under-maintenance')) roomStatus = 'under-maintenance';

        document.getElementById('roomName').value = roomName;
        document.getElementById('roomUser1').value = roomUser1;
        document.getElementById('roomUser2').value = roomUser2;
        document.getElementById('roomStatus').value = roomStatus;
    });
});

// Update badge when "Confirm" is clicked in modal
if (roomForm) {
    roomForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const roomName = document.getElementById('roomName').value;
        const roomUser1 = document.getElementById('roomUser1').value;
        const roomUser2 = document.getElementById('roomUser2').value;
        const roomStatus = document.getElementById('roomStatus').value;

        // If editing existing room
        if (editingRow) {
            editingRow.querySelector('.room-details h3').textContent = roomName;
            editingRow.querySelectorAll('.user-type')[0].textContent = capitalize(roomUser1);
            editingRow.querySelectorAll('.user-type')[1].textContent = capitalize(roomUser2);

            const statusBadge = editingRow.querySelector('.status-badge');
            statusBadge.textContent = formatStatusText(roomStatus);
            statusBadge.className = 'status-badge ' + getStatusClass(roomStatus);

            showNotification('Room updated successfully!', 'success');
            editingRow = null;
        } else {
            // (optional) handle adding new room logic here
            showNotification('Room added successfully!', 'success');
        }

        modal.classList.remove('active');
    });
}

// Archive button functionality
document.querySelectorAll('.icon-btn.archive').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (confirm('Are you sure you want to archive this room?')) {
            const row = e.target.closest('tr');
            row.remove();
            updateRoomCount();
            showNotification('Room archived successfully!', 'success');
        }
    });
});

// Helper: capitalize first letter
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Helper: convert value to readable status text
function formatStatusText(value) {
    switch (value) {
        case 'available': return 'Available';
        case 'unavailable': return 'Unavailable';
        case 'under-maintenance': return 'Under Maintenance';
        default: return value;
    }
}

// Helper: map value to class
function getStatusClass(value) {
    switch (value) {
        case 'available': return 'available';
        case 'unavailable': return 'in-use'; // matches your yellow badge style
        case 'under-maintenance': return 'under-maintenance';
        default: return '';
    }
}


// Update room count
function updateRoomCount() {
    const count = document.querySelectorAll('#roomsTableBody tr').length;
    document.getElementById('roomCount').textContent = count;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#2c3e50'};
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

// Add animation styles for notifications
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

console.log('Room Management initialized successfully!');