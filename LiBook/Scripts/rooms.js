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
const archiveModal = document.getElementById('archiveModal');
const addRoomBtn = document.getElementById('addRoomBtn');
const bulkArchiveBtn = document.getElementById('bulkArchiveBtn');
const closeModalBtn = document.getElementById('closeModal');
const closeArchiveModalBtn = document.getElementById('closeArchiveModal');
const cancelBtn = document.getElementById('cancelBtn');
const cancelArchiveBtn = document.getElementById('cancelArchiveBtn');
const confirmArchiveBtn = document.getElementById('confirmArchiveBtn');
const roomForm = document.getElementById('roomForm');
const searchInput = document.getElementById('searchRooms');
const selectAllCheckbox = document.getElementById('selectAll');

// Track editing state
let editingRow = null;
let isEditMode = false;
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
        openModal(false);
    });
}

// Bulk archive button
if (bulkArchiveBtn) {
    bulkArchiveBtn.addEventListener('click', () => {
        openArchiveModal();
    });
}

// Close modal
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        closeModal();
    });
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        closeModal();
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

// Close modal when clicking outside
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
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

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (modal && modal.classList.contains('active')) {
            closeModal();
        }
        if (archiveModal && archiveModal.classList.contains('active')) {
            closeArchiveModal();
        }
    }
});

// Open modal function
function openModal(isEdit = false) {
    if (modal) {
        isEditMode = isEdit;
        const modalTitle = document.getElementById('modalTitle');

        if (modalTitle) {
            modalTitle.textContent = isEdit ? 'Edit Room' : 'Add New Room';
        }

        if (!isEdit) {
            roomForm.reset();
            editingRow = null;
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first input
        setTimeout(() => {
            const firstInput = document.getElementById('roomName');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

// Close modal function
function closeModal() {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        setTimeout(() => {
            roomForm.reset();
            editingRow = null;
            isEditMode = false;
        }, 300);
    }
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

        // Validate form
        if (!roomName || !roomUser1 || !roomUser2 || !roomStatus) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // If editing existing room
        if (isEditMode && editingRow) {
            editingRow.querySelector('.room-details h3').textContent = roomName;
            editingRow.querySelectorAll('.user-type')[0].textContent = capitalize(roomUser1);
            editingRow.querySelectorAll('.user-type')[1].textContent = capitalize(roomUser2);

            const statusBadge = editingRow.querySelector('.status-badge');
            statusBadge.textContent = formatStatusText(roomStatus);
            statusBadge.className = 'status-badge ' + getStatusClass(roomStatus);

            showNotification('Room updated successfully!', 'success');
        } else {
            // Adding new room (in real app, would send to server)
            console.log('Adding new room:', { roomName, roomUser1, roomUser2, roomStatus });
            showNotification('Room added successfully!', 'success');
        }

        // Close modal
        closeModal();
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

        editingRow = row;

        const roomName = row.querySelector('.room-details h3')?.textContent || '';
        const roomUser1 = row.querySelectorAll('.user-type')[0]?.textContent.toLowerCase() || '';
        const roomUser2 = row.querySelectorAll('.user-type')[1]?.textContent.toLowerCase() || '';
        const roomStatusElement = row.querySelector('.status-badge');
        let roomStatus = '';

        if (roomStatusElement) {
            if (roomStatusElement.classList.contains('available')) roomStatus = 'available';
            else if (roomStatusElement.classList.contains('in-use') || roomStatusElement.classList.contains('unavailable')) roomStatus = 'unavailable';
            else if (roomStatusElement.classList.contains('under-maintenance')) roomStatus = 'under-maintenance';
        }

        // Populate form
        document.getElementById('roomName').value = roomName;
        document.getElementById('roomUser1').value = roomUser1;
        document.getElementById('roomUser2').value = roomUser2;
        document.getElementById('roomStatus').value = roomStatus;

        // Open modal in edit mode
        openModal(true);
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

console.log('Room Management initialized successfully!');
