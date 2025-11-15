// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
const mainContent = document.querySelector('.main-content');
const userProfile = document.getElementById('userProfile');
const userDropdown = document.getElementById('userDropdown');

// Room Management Elements
const addRoomModal = document.getElementById('addRoomModal');
const editRoomModal = document.getElementById('editRoomModal');
const archiveModal = document.getElementById('archiveModal');
const addRoomBtn = document.getElementById('addRoomBtn');
const bulkArchiveBtn = document.getElementById('bulkArchiveBtn');
const closeAddModalBtn = document.getElementById('closeAddModal');
const closeEditModalBtn = document.getElementById('closeEditModal');
const closeArchiveModalBtn = document.getElementById('closeArchiveModal');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const cancelArchiveBtn = document.getElementById('cancelArchiveBtn');
const confirmArchiveBtn = document.getElementById('confirmArchiveBtn');
const addRoomForm = document.getElementById('addRoomForm');
const editRoomForm = document.getElementById('editRoomForm');
const searchInput = document.getElementById('searchRooms');
const selectAllCheckbox = document.getElementById('selectAll');

// Track editing state
let editingRow = null;
let selectedRoomsForArchive = [];

// ============================================
// SIDEBAR FUNCTIONALITY
// ============================================

// Sidebar Toggle for Desktop (Collapse/Expand)
if (sidebarToggleDesktop) {
    sidebarToggleDesktop.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
}

// Restore sidebar state on page load
const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
if (isCollapsed) {
    sidebar.classList.add('collapsed');
    mainContent.classList.add('expanded');
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
        openAddModal();
    });
}

// Bulk archive button
if (bulkArchiveBtn) {
    bulkArchiveBtn.addEventListener('click', () => {
        openArchiveModal();
    });
}

// Close modals
if (closeAddModalBtn) {
    closeAddModalBtn.addEventListener('click', () => {
        closeAddModal();
    });
}

if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener('click', () => {
        closeEditModal();
    });
}

if (cancelAddBtn) {
    cancelAddBtn.addEventListener('click', () => {
        closeAddModal();
    });
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
        closeEditModal();
    });
}

// Archive modal handlers
if (closeArchiveModalBtn) {
    closeArchiveModalBtn.addEventListener('click', () => {
        closeArchiveModal();
    });
}

if (cancelArchiveBtn) {
    cancelArchiveBtn.addEventListener('click', () => {
        closeArchiveModal();
    });
}

if (confirmArchiveBtn) {
    confirmArchiveBtn.addEventListener('click', () => {
        confirmArchive();
    });
}

// Close modals when clicking outside
if (addRoomModal) {
    addRoomModal.addEventListener('click', (e) => {
        if (e.target === addRoomModal) {
            closeAddModal();
        }
    });
}

if (editRoomModal) {
    editRoomModal.addEventListener('click', (e) => {
        if (e.target === editRoomModal) {
            closeEditModal();
        }
    });
}

if (archiveModal) {
    archiveModal.addEventListener('click', (e) => {
        if (e.target === archiveModal) {
            closeArchiveModal();
        }
    });
}

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (addRoomModal && addRoomModal.classList.contains('active')) {
            closeAddModal();
        }
        if (editRoomModal && editRoomModal.classList.contains('active')) {
            closeEditModal();
        }
        if (archiveModal && archiveModal.classList.contains('active')) {
            closeArchiveModal();
        }
    }
});

// Open add modal function
function openAddModal() {
    if (addRoomModal) {
        addRoomModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first input
        setTimeout(() => {
            const firstInput = document.getElementById('addRoomName');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

// Open edit modal function
function openEditModal(row) {
    if (editRoomModal) {
        editingRow = row;

        const roomName = row.querySelector('.room-details h3')?.textContent || '';
        const roomUser1 = row.querySelectorAll('.user-type')[0]?.textContent.toLowerCase() || '';
        const capacity = row.querySelector('.capacity')?.textContent || '';
        const roomStatusElement = row.querySelector('.status-badge');
        let roomStatus = '';

        if (roomStatusElement) {
            if (roomStatusElement.classList.contains('available')) roomStatus = 'available';
            else if (roomStatusElement.classList.contains('in-use')) roomStatus = 'unavailable';
            else if (roomStatusElement.classList.contains('under-maintenance')) roomStatus = 'under-maintenance';
        }

        console.log('Editing room:', { roomName, roomUser1, capacity, roomStatus });

        // Populate form
        document.getElementById('editRoomName').value = roomName;
        document.getElementById('editRoomUser1').value = roomUser1;
        document.getElementById('editCapacity').value = capacity;
        document.getElementById('editRoomStatus').value = roomStatus;

        editRoomModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first input
        setTimeout(() => {
            const firstInput = document.getElementById('editRoomName');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

// Close add modal function
function closeAddModal() {
    if (addRoomModal) {
        addRoomModal.classList.remove('active');
        document.body.style.overflow = '';

        setTimeout(() => {
            addRoomForm.reset();
        }, 300);
    }
}

// Close edit modal function
function closeEditModal() {
    if (editRoomModal) {
        editRoomModal.classList.remove('active');
        document.body.style.overflow = '';

        setTimeout(() => {
            editRoomForm.reset();
            editingRow = null;
        }, 300);
    }
}

//// Add Room Form submission
//if (addRoomForm) {
//    addRoomForm.addEventListener('submit', (e) => {
//        e.preventDefault();

//        // Get form values
//        const roomName = document.getElementById('addRoomName').value;
//        const roomUser1 = document.getElementById('addRoomUser1').value;
//        const capacity = document.getElementById('addCapacity').value;
//        const roomStatus = document.getElementById('addRoomStatus').value;

//        // Validate form
//        if (!roomName || !roomUser1 || !capacity || !roomStatus) {
//            showNotification('Please fill in all required fields', 'error');
//            return;
//        }

//        // Handle adding new room (in real app, would send to server)
//        console.log('Adding new room:', { roomName, roomUser1, capacity, roomStatus });

//        // Here you would typically send the data to your server
//        // For now, we'll just show a success message
//        showNotification('Room added successfully!', 'success');

//        // Close modal
//        closeAddModal();

//        // In a real application, you would refresh the table or add the new row dynamically
//        // For now, we'll just log the action
//    });
//}

// Edit Room Form submission
if (editRoomForm) {
    editRoomForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form values
        const roomName = document.getElementById('editRoomName').value;
        const roomUser1 = document.getElementById('editRoomUser1').value;
        const capacity = document.getElementById('editCapacity').value;
        const roomStatus = document.getElementById('editRoomStatus').value;

        // Validate form
        if (!roomName || !roomUser1 || !capacity || !roomStatus) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // If editing existing room
        if (editingRow) {
            editingRow.querySelector('.room-details h3').textContent = roomName;
            editingRow.querySelectorAll('.user-type')[0].textContent = capitalize(roomUser1);

            // Update capacity
            const capacityCell = editingRow.querySelector('.capacity');
            if (capacityCell) {
                capacityCell.textContent = capacity;
            }

            const statusBadge = editingRow.querySelector('.status-badge');
            statusBadge.textContent = formatStatusText(roomStatus);
            statusBadge.className = 'status-badge ' + getStatusClass(roomStatus);

            showNotification('Room updated successfully!', 'success');
        }

        // Close modal
        closeEditModal();
    });
}

// Search rooms
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#roomsTableBody tr');

        rows.forEach(row => {
            const roomName = row.querySelector('.room-details h3')?.textContent.toLowerCase() || '';
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
        updateArchiveButtonState();
    });
}

// Update archive button state when individual checkboxes change
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('custom-checkbox') && !e.target.id === 'selectAll') {
        updateArchiveButtonState();

        // Update "select all" checkbox state
        const allCheckboxes = document.querySelectorAll('#roomsTableBody .custom-checkbox');
        const checkedCheckboxes = document.querySelectorAll('#roomsTableBody .custom-checkbox:checked');

        if (selectAllCheckbox) {
            selectAllCheckbox.checked = allCheckboxes.length > 0 && allCheckboxes.length === checkedCheckboxes.length;
        }
    }
});

// Update archive button state
function updateArchiveButtonState() {
    const checkedBoxes = document.querySelectorAll('#roomsTableBody .custom-checkbox:checked');

    if (bulkArchiveBtn) {
        if (checkedBoxes.length > 0) {
            bulkArchiveBtn.disabled = false;
            bulkArchiveBtn.innerHTML = `
                <i class="fas fa-archive"></i>
                Archive Selected (${checkedBoxes.length})
            `;
        } else {
            bulkArchiveBtn.disabled = true;
            bulkArchiveBtn.innerHTML = `
                <i class="fas fa-archive"></i>
                Archive Selected
            `;
        }
    }
}

// Initialize button state on page load
updateArchiveButtonState();

// ============================================
// ACTION BUTTONS (EDIT & ARCHIVE)
// ============================================

// Edit button functionality
document.querySelectorAll('.icon-btn.edit').forEach(btn => {
    btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        if (!row) return;

        openEditModal(row);
    });
});

// Archive button functionality
document.querySelectorAll('.icon-btn.archive').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        const roomName = row.querySelector('.room-details h3')?.textContent || 'this room';
        const roomId = row.querySelector('.room-id')?.textContent || '';

        if (confirm(`Are you sure you want to archive "${roomName}"?\n${roomId}\n\nThis room will be moved to archives.`)) {
            // Show loading notification
            showNotification('Archiving room...', 'info');

            setTimeout(() => {
                row.remove();
                updateRoomCount();
                showNotification(`"${roomName}" archived successfully!`, 'success');

                // In real app, send to server
                console.log('Archived room:', roomName, roomId);
            }, 500);
        }
    });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Capitalize first letter
function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Convert value to readable status text
function formatStatusText(value) {
    switch (value) {
        case 'available': return 'Available';
        case 'unavailable': return 'Unavailable';
        case 'under-maintenance': return 'Under Maintenance';
        default: return value;
    }
}

// Map value to class
function getStatusClass(value) {
    switch (value) {
        case 'available': return 'available';
        case 'unavailable': return 'in-use';
        case 'under-maintenance': return 'under-maintenance';
        default: return '';
    }
}

// Update room count
function updateRoomCount() {
    const count = document.querySelectorAll('#roomsTableBody tr').length;
    const roomCountElement = document.getElementById('roomCount');
    if (roomCountElement) {
        roomCountElement.textContent = count;
    }
}

// ============================================
// ARCHIVE MODAL FUNCTIONS
// ============================================

// Open archive modal
function openArchiveModal() {
    const checkedBoxes = document.querySelectorAll('#roomsTableBody .custom-checkbox:checked');

    if (checkedBoxes.length === 0) {
        showNotification('Please select at least one room to archive', 'warning');
        return;
    }

    // Collect selected rooms data
    selectedRoomsForArchive = [];
    const previewList = document.getElementById('archivePreviewList');

    if (!previewList) return;

    previewList.innerHTML = '';

    checkedBoxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (row) {
            const roomName = row.querySelector('.room-details h3')?.textContent || 'Unknown Room';
            const roomId = row.querySelector('.room-id')?.textContent || 'No ID';

            selectedRoomsForArchive.push({
                row: row,
                name: roomName,
                id: roomId
            });

            // Add to preview list
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <div class="preview-item-icon">
                    <i class="fas fa-door-open"></i>
                </div>
                <div class="preview-item-info">
                    <div class="preview-item-name">${roomName}</div>
                    <div class="preview-item-id">${roomId}</div>
                </div>
            `;
            previewList.appendChild(previewItem);
        }
    });

    // Update count
    const archiveCount = document.getElementById('archiveCount');
    if (archiveCount) {
        archiveCount.textContent = selectedRoomsForArchive.length;
    }

    // Open modal
    if (archiveModal) {
        archiveModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close archive modal
function closeArchiveModal() {
    if (archiveModal) {
        archiveModal.classList.remove('active');
        document.body.style.overflow = '';

        setTimeout(() => {
            selectedRoomsForArchive = [];
        }, 300);
    }
}

// Confirm archive
function confirmArchive() {
    if (selectedRoomsForArchive.length === 0) {
        showNotification('No rooms selected', 'error');
        return;
    }

    const confirmBtn = document.getElementById('confirmArchiveBtn');
    if (!confirmBtn) return;

    // Show loading state
    const originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Archiving...';
    confirmBtn.disabled = true;

    // Simulate archive process
    setTimeout(() => {
        const count = selectedRoomsForArchive.length;
        const roomNames = selectedRoomsForArchive.map(r => r.name).join(', ');

        // Remove rows from table
        selectedRoomsForArchive.forEach(room => {
            if (room.row) {
                room.row.remove();
            }
        });

        // Update room count
        updateRoomCount();

        // Uncheck "select all" if it was checked
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }

        // Reset button
        confirmBtn.innerHTML = originalText;
        confirmBtn.disabled = false;

        // Close modal
        closeArchiveModal();

        // Show success notification
        showNotification(
            `${count} room${count > 1 ? 's' : ''} archived successfully!`,
            'success'
        );

        // Log for debugging (in real app, send to server)
        console.log('Archived rooms:', roomNames);
    }, 1000);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');

    let bgColor, icon;
    switch (type) {
        case 'success':
            bgColor = '#27ae60';
            icon = 'fa-check-circle';
            break;
        case 'error':
            bgColor = '#e74c3c';
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            bgColor = '#ffc107';
            icon = 'fa-exclamation-triangle';
            break;
        default:
            bgColor = '#2c3e50';
            icon = 'fa-info-circle';
    }

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${bgColor};
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10001;
        font-family: 'Kumbh Sans', sans-serif;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        max-width: 400px;
    `;

    notification.innerHTML = `
        <i class="fas ${icon}" style="font-size: 1.2rem;"></i>
        <span>${message}</span>
    `;

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
            if (sidebar) sidebar.classList.remove('active');
        }
        if (userProfile) {
            userProfile.classList.remove('active');
        }
    }, 250);
});

console.log('Room Management with separate modals initialized successfully!');