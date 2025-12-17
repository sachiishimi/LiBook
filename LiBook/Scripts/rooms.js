// @ts-nocheck
// DOM Elements - using var to avoid redeclaration errors
var menuToggle = document.getElementById('menuToggle');
var sidebar = document.getElementById('sidebar');
var closeSidebar = document.getElementById('closeSidebar');
var sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
var mainContent = document.querySelector('.main-content');
var userProfile = document.getElementById('userProfile');
var userDropdown = document.getElementById('userDropdown');

// Room Management Elements
var addRoomModal = document.getElementById('addRoomModal');
var editRoomModal = document.getElementById('editRoomModal');
var archiveModal = document.getElementById('archiveModal');
var cancelConfirmModal = document.getElementById('cancelConfirmModal');
var addRoomBtn = document.getElementById('addRoomBtn');
var bulkArchiveBtn = document.getElementById('bulkArchiveBtn');
var closeAddModalBtn = document.getElementById('closeAddModal');
var closeEditModalBtn = document.getElementById('closeEditModal');
var closeArchiveModalBtn = document.getElementById('closeArchiveModal');
var closeCancelConfirmBtn = document.getElementById('closeCancelConfirmBtn');
var cancelAddBtn = document.getElementById('cancelAddBtn');
var cancelEditBtn = document.getElementById('cancelEditBtn');
var cancelArchiveBtn = document.getElementById('cancelArchiveBtn');
var cancelConfirmNoBtn = document.getElementById('cancelConfirmNoBtn');
var cancelConfirmYesBtn = document.getElementById('cancelConfirmYesBtn');
var confirmArchiveBtn = document.getElementById('confirmArchiveBtn');
var addRoomForm = document.getElementById('addRoomForm');
var editRoomForm = document.getElementById('editRoomForm');
var searchInput = document.getElementById('searchRooms');
var selectAllCheckbox = document.getElementById('selectAll');

// Track editing state
var editingRow = null;
var selectedRoomsForArchive = [];
var cancelConfirmCallback = null;

// ============================================
// SIDEBAR FUNCTIONALITY
// ============================================

// Sidebar Toggle for Desktop (Collapse/Expand)
if (sidebarToggleDesktop) {
    sidebarToggleDesktop.addEventListener('click', function (e) {
        e.stopPropagation();
        if (sidebar && mainContent) {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed') ? 'true' : 'false');
        }
    });
}

// Restore sidebar state on page load
var isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
if (isCollapsed && sidebar && mainContent) {
    sidebar.classList.add('collapsed');
    mainContent.classList.add('expanded');
}

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

// User Profile Dropdown Toggle
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

// Navigation Active State
var navItems = document.querySelectorAll('.nav-item');

navItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
        if (!item.classList.contains('logout') && item.getAttribute('href') !== '#') {
            navItems.forEach(function (nav) {
                nav.classList.remove('active');
            });
            item.classList.add('active');

            // Close mobile sidebar after navigation
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
// ROOM MANAGEMENT MODAL FUNCTIONALITY
// ============================================

// Open modal for adding new room
if (addRoomBtn) {
    addRoomBtn.addEventListener('click', function () {
        openAddModal();
    });
}

// Bulk archive button
if (bulkArchiveBtn) {
    bulkArchiveBtn.addEventListener('click', function () {
        openArchiveModal();
    });
}

// Close modals
if (closeAddModalBtn) {
    closeAddModalBtn.addEventListener('click', function () {
        closeAddModal();
    });
}

if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener('click', function () {
        closeEditModal();
    });
}

if (cancelAddBtn) {
    cancelAddBtn.addEventListener('click', function () {
        closeAddModal();
    });
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', function () {
        closeEditModal();
    });
}

// Archive modal handlers
if (closeArchiveModalBtn) {
    closeArchiveModalBtn.addEventListener('click', function () {
        closeArchiveModal();
    });
}

if (cancelArchiveBtn) {
    cancelArchiveBtn.addEventListener('click', function () {
        closeArchiveModal();
    });
}

if (confirmArchiveBtn) {
    confirmArchiveBtn.addEventListener('click', function () {
        confirmArchive();
    });
}

// Cancel confirmation modal handlers
if (closeCancelConfirmBtn) {
    closeCancelConfirmBtn.addEventListener('click', function () {
        closeCancelConfirm();
    });
}

if (cancelConfirmNoBtn) {
    cancelConfirmNoBtn.addEventListener('click', function () {
        closeCancelConfirm();
    });
}

if (cancelConfirmYesBtn) {
    cancelConfirmYesBtn.addEventListener('click', function () {
        confirmCancelAction();
    });
}

// Close modals when clicking outside
if (addRoomModal) {
    addRoomModal.addEventListener('click', function (e) {
        if (e.target === addRoomModal) {
            closeAddModal();
        }
    });
}

if (editRoomModal) {
    editRoomModal.addEventListener('click', function (e) {
        if (e.target === editRoomModal) {
            closeEditModal();
        }
    });
}

if (archiveModal) {
    archiveModal.addEventListener('click', function (e) {
        if (e.target === archiveModal) {
            closeArchiveModal();
        }
    });
}

if (cancelConfirmModal) {
    cancelConfirmModal.addEventListener('click', function (e) {
        if (e.target === cancelConfirmModal) {
            closeCancelConfirm();
        }
    });
}

// Close modals with Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        if (cancelConfirmModal && cancelConfirmModal.classList.contains('active')) {
            closeCancelConfirm();
        } else if (addRoomModal && addRoomModal.classList.contains('active')) {
            closeAddModal();
        } else if (editRoomModal && editRoomModal.classList.contains('active')) {
            closeEditModal();
        } else if (archiveModal && archiveModal.classList.contains('active')) {
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
        setTimeout(function () {
            var firstInput = document.getElementById('addRoomName');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

// Open edit modal function
function openEditModal(row) {
    if (editRoomModal) {
        editingRow = row;

        var roomIdEl = row.querySelector('.room-id');
        var roomNameEl = row.querySelector('.room-details h3');
        var roomUser1El = row.querySelectorAll('.user-type')[0];
        var capacityEl = row.querySelector('.capacity');
        var roomStatusElement = row.querySelector('.status-badge');

        var roomId = roomIdEl ? roomIdEl.getAttribute('data-room-id') || '' : '';
        var roomName = roomNameEl ? roomNameEl.textContent || '' : '';
        var roomUser1 = roomUser1El ? roomUser1El.textContent || '' : '';
        var capacity = capacityEl ? capacityEl.textContent || '' : '';
        var roomStatus = '';

        if (roomStatusElement) {
            if (roomStatusElement.classList.contains('available')) roomStatus = 'Available';
            else if (roomStatusElement.classList.contains('in-use')) roomStatus = 'Unavailable';
            else if (roomStatusElement.classList.contains('under-maintenance')) roomStatus = 'Under Maintenance';
        }

        console.log('Editing room:', { roomId: roomId, roomName: roomName, roomUser1: roomUser1, capacity: capacity, roomStatus: roomStatus });

        // Populate form
        var editRoomId = document.getElementById('editRoomId');
        var editRoomName = document.getElementById('editRoomName');
        var editRoomUser1 = document.getElementById('editRoomUser1');
        var editCapacity = document.getElementById('editCapacity');
        var editRoomStatus = document.getElementById('editRoomStatus');

        if (editRoomId) editRoomId.value = roomId;
        if (editRoomName) editRoomName.value = roomName;
        if (editRoomUser1) editRoomUser1.value = roomUser1;
        if (editCapacity) editCapacity.value = capacity;
        if (editRoomStatus) editRoomStatus.value = roomStatus;

        editRoomModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first input
        setTimeout(function () {
            var firstInput = document.getElementById('editRoomName');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

// Close add modal function
function closeAddModal() {
    if (addRoomModal) {
        addRoomModal.classList.remove('active');
        document.body.style.overflow = '';

        setTimeout(function () {
            if (addRoomForm && addRoomForm.reset) {
                addRoomForm.reset();
            }
        }, 300);
    }
}

// Close edit modal function
function closeEditModal() {
    if (editRoomModal) {
        editRoomModal.classList.remove('active');
        document.body.style.overflow = '';

        setTimeout(function () {
            if (editRoomForm && editRoomForm.reset) {
                editRoomForm.reset();
            }
            editingRow = null;
        }, 300);
    }
}

// Search rooms
if (searchInput) {
    searchInput.addEventListener('input', function (e) {
        var target = e.target;
        if (!target || !('value' in target)) return;

        var searchTerm = String(target.value).toLowerCase();
        var rows = document.querySelectorAll('#roomsTableBody tr');

        rows.forEach(function (row) {
            var roomNameEl = row.querySelector('.room-details h3');
            var roomName = roomNameEl && roomNameEl.textContent ? roomNameEl.textContent.toLowerCase() : '';

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
    selectAllCheckbox.addEventListener('change', function (e) {
        var target = e.target;
        if (!target || !('checked' in target)) return;

        var checkboxes = document.querySelectorAll('#roomsTableBody .custom-checkbox');
        checkboxes.forEach(function (checkbox) {
            if ('checked' in checkbox) {
                checkbox.checked = target.checked;
            }
        });
        updateArchiveButtonState();
    });
}

// Update archive button state when individual checkboxes change
document.addEventListener('change', function (e) {
    var target = e.target;
    if (!target) return;

    if (target.classList && target.classList.contains('custom-checkbox') && target.id !== 'selectAll') {
        updateArchiveButtonState();

        // Update "select all" checkbox state
        var allCheckboxes = document.querySelectorAll('#roomsTableBody .custom-checkbox');
        var checkedCheckboxes = document.querySelectorAll('#roomsTableBody .custom-checkbox:checked');

        if (selectAllCheckbox && 'checked' in selectAllCheckbox) {
            selectAllCheckbox.checked = allCheckboxes.length > 0 && allCheckboxes.length === checkedCheckboxes.length;
        }
    }
});

// Update archive button state
function updateArchiveButtonState() {
    var checkedBoxes = document.querySelectorAll('#roomsTableBody .custom-checkbox:checked');

    if (bulkArchiveBtn) {
        if (checkedBoxes.length > 0) {
            if ('disabled' in bulkArchiveBtn) {
                bulkArchiveBtn.disabled = false;
            }
            bulkArchiveBtn.innerHTML =
                '<i class="fas fa-archive"></i> Archive Selected (' + checkedBoxes.length + ')';
        } else {
            if ('disabled' in bulkArchiveBtn) {
                bulkArchiveBtn.disabled = true;
            }
            bulkArchiveBtn.innerHTML =
                '<i class="fas fa-archive"></i> Archive Selected';
        }
    }
}

// Initialize button state on page load
updateArchiveButtonState();

// ============================================
// ACTION BUTTONS (EDIT & ARCHIVE)
// ============================================

// Edit button functionality
document.querySelectorAll('.icon-btn.edit').forEach(function (btn) {
    btn.addEventListener('click', function () {
        var row = btn.closest('tr');
        if (!row) return;
        openEditModal(row);
    });
});

// Archive button functionality
document.querySelectorAll('.icon-btn.archive').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent form submission
        e.stopPropagation();

        var target = e.currentTarget; // Use currentTarget to get the button, not the icon
        if (!target) return;

        var form = target.closest('form');
        var roomName = target.getAttribute('data-room-name') || 'this room';
        var roomId = target.getAttribute('data-room-id') || '';

        showCancelConfirm(
            'Archive Room?',
            'Are you sure you want to archive "' + roomName + '"? (' + roomId + ')\n\nThis room will be moved to archives.',
            'Archive Room',
            function () {
                // Get form data
                if (!form) {
                    showNotification('Error: Form not found', 'error');
                    return;
                }

                var formData = new FormData(form);
                var actionUrl = form.getAttribute('action');

                // Show loading notification
                showNotification('Archiving room...', 'info');

                // Disable the button during submission
                target.disabled = true;
                var originalHtml = target.innerHTML;
                target.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                // Submit via AJAX
                fetch(actionUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                    .then(function (response) {
                        // Re-enable button
                        target.disabled = false;
                        target.innerHTML = originalHtml;

                        if (response.ok) {
                            // Success
                            showNotification('Room "' + roomName + '" archived successfully!', 'success');

                            // Remove the row from the table
                            var row = target.closest('tr');
                            if (row) {
                                row.style.opacity = '0.5';
                                row.style.transition = 'opacity 0.3s ease';
                                setTimeout(function () {
                                    row.remove();
                                    updateRoomCount();
                                }, 300);
                            }
                        } else {
                            // Server returned an error status
                            showNotification('Failed to archive room. Please try again.', 'error');
                        }
                    })
                    .catch(function (error) {
                        // Network or other error
                        target.disabled = false;
                        target.innerHTML = originalHtml;
                        showNotification('Error archiving room: ' + error.message, 'error');
                        console.error('Archive error:', error);
                    });
            }
        );
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

// Update room count and handle empty state
function updateRoomCount() {
    var rows = document.querySelectorAll('#roomsTableBody tr:not(#noRoomsRow)');
    var count = rows.length;
    var roomCountElement = document.getElementById('roomCount');

    if (roomCountElement) {
        roomCountElement.textContent = String(count);
    }

    // Handle empty state
    var noRoomsRow = document.getElementById('noRoomsRow');
    var tableBody = document.getElementById('roomsTableBody');

    if (count === 0 && !noRoomsRow && tableBody) {
        // Add empty state row
        var emptyRow = document.createElement('tr');
        emptyRow.id = 'noRoomsRow';
        emptyRow.innerHTML =
            '<td colspan="5" style="text-align: center; padding: 3rem;">' +
            '<div style="text-align: center; color: var(--text-light);">' +
            '<i class="fas fa-door-closed" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>' +
            '<h3 style="font-family: \'Kumbh Sans\', sans-serif; margin-bottom: 0.5rem; color: var(--text-dark);">No Rooms Available</h3>' +
            '<p style="margin-bottom: 1.5rem;">There are no rooms available at this moment.</p>' +
            '</div>' +
            '</td>';
        tableBody.appendChild(emptyRow);

        // Set up the button event listener
        setupEmptyStateButton();
    } else if (count > 0 && noRoomsRow) {
        // Remove empty state row when rooms are added
        noRoomsRow.remove();
    }

    // Update pagination
    initializePagination();
}

// Add this function to handle the empty state "Add New Room" button
function setupEmptyStateButton() {
    var addRoomFromEmptyBtn = document.getElementById('addRoomFromEmpty');
    if (addRoomFromEmptyBtn) {
        addRoomFromEmptyBtn.addEventListener('click', function () {
            openAddModal();
        });
    }
}

// ============================================
// PAGINATION FUNCTIONALITY
// ============================================

var currentPage = 1;
var rowsPerPage = 4;

// Initialize pagination
function initializePagination() {
    var roomsTableBody = document.getElementById('roomsTableBody');
    if (!roomsTableBody) return;

    var rows = roomsTableBody.querySelectorAll('tr:not(#noRoomsRow)');

    if (rows.length < 4) {
        // Hide pagination if less than 4 rooms
        var pagination = document.getElementById('roomsPagination');
        if (pagination) {
            pagination.style.display = 'none';
        }
        return;
    }

    updatePagination();
    showPage(1);
}

// Update pagination controls
function updatePagination() {
    var roomsTableBody = document.getElementById('roomsTableBody');
    if (!roomsTableBody) return;

    var rows = roomsTableBody.querySelectorAll('tr:not(#noRoomsRow)');
    var totalRows = rows.length;
    var totalPages = Math.ceil(totalRows / rowsPerPage);

    // Update pagination info
    var paginationStart = document.getElementById('paginationStart');
    var paginationEnd = document.getElementById('paginationEnd');
    var paginationTotal = document.getElementById('paginationTotal');

    if (paginationStart && paginationEnd && paginationTotal) {
        var start = (currentPage - 1) * rowsPerPage + 1;
        var end = Math.min(currentPage * rowsPerPage, totalRows);

        paginationStart.textContent = String(start);
        paginationEnd.textContent = String(end);
        paginationTotal.textContent = String(totalRows);
    }

    // Update pagination buttons
    var prevPage = document.getElementById('prevPage');
    var nextPage = document.getElementById('nextPage');

    if (prevPage && 'disabled' in prevPage) {
        prevPage.disabled = currentPage === 1;
    }

    if (nextPage && 'disabled' in nextPage) {
        nextPage.disabled = currentPage === totalPages;
    }

    // Generate page numbers
    var paginationPages = document.getElementById('paginationPages');
    if (!paginationPages) return;

    paginationPages.innerHTML = '';

    // Always show first page
    addPageNumber(paginationPages, 1);

    // Show ellipsis if needed
    if (currentPage > 3) {
        addEllipsis(paginationPages);
    }

    // Show pages around current page
    var startPage = Math.max(2, currentPage - 1);
    var endPage = Math.min(totalPages - 1, currentPage + 1);

    for (var i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
            addPageNumber(paginationPages, i);
        }
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
        addEllipsis(paginationPages);
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
        addPageNumber(paginationPages, totalPages);
    }
}

// Add page number button
function addPageNumber(container, pageNumber) {
    var pageBtn = document.createElement('button');
    pageBtn.className = 'page-number' + (pageNumber === currentPage ? ' active' : '');
    pageBtn.textContent = String(pageNumber);
    pageBtn.addEventListener('click', function () {
        showPage(pageNumber);
    });
    container.appendChild(pageBtn);
}

// Add ellipsis
function addEllipsis(container) {
    var ellipsis = document.createElement('span');
    ellipsis.className = 'page-number ellipsis';
    ellipsis.textContent = '...';
    container.appendChild(ellipsis);
}

// Show specific page
function showPage(pageNumber) {
    var roomsTableBody = document.getElementById('roomsTableBody');
    if (!roomsTableBody) return;

    var rows = roomsTableBody.querySelectorAll('tr:not(#noRoomsRow)');

    // Hide all rows
    rows.forEach(function (row) {
        row.style.display = 'none';
    });

    // Calculate range for current page
    var startIndex = (pageNumber - 1) * rowsPerPage;
    var endIndex = Math.min(startIndex + rowsPerPage, rows.length);

    // Show rows for current page
    for (var i = startIndex; i < endIndex; i++) {
        if (rows[i]) {
            rows[i].style.display = '';
        }
    }

    currentPage = pageNumber;
    updatePagination();
}

// Event listeners for pagination buttons
document.addEventListener('DOMContentLoaded', function () {
    var prevPage = document.getElementById('prevPage');
    var nextPage = document.getElementById('nextPage');

    if (prevPage) {
        prevPage.addEventListener('click', function () {
            if (currentPage > 1) {
                showPage(currentPage - 1);
            }
        });
    }

    if (nextPage) {
        nextPage.addEventListener('click', function () {
            var roomsTableBody = document.getElementById('roomsTableBody');
            if (!roomsTableBody) return;

            var rows = roomsTableBody.querySelectorAll('tr:not(#noRoomsRow)');
            var totalPages = Math.ceil(rows.length / rowsPerPage);

            if (currentPage < totalPages) {
                showPage(currentPage + 1);
            }
        });
    }

    // Initialize pagination
    initializePagination();
});

// Update the search functionality to work with pagination
if (searchInput) {
    searchInput.addEventListener('input', function (e) {
        var target = e.target;
        if (!target || !('value' in target)) return;

        var searchTerm = String(target.value).toLowerCase();
        var rows = document.querySelectorAll('#roomsTableBody tr:not(#noRoomsRow)');
        var visibleCount = 0;

        rows.forEach(function (row) {
            var roomNameEl = row.querySelector('.room-details h3');
            var roomName = roomNameEl && roomNameEl.textContent ? roomNameEl.textContent.toLowerCase() : '';

            if (roomName.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // If searching, show all matching results without pagination
        if (searchTerm) {
            currentPage = 1;
            // Temporarily hide pagination during search
            var pagination = document.getElementById('roomsPagination');
            if (pagination) {
                pagination.style.display = 'none';
            }
        } else {
            // If no search term, re-enable pagination if needed
            var pagination = document.getElementById('roomsPagination');
            if (pagination && visibleCount >= 4) {
                pagination.style.display = 'flex';
                initializePagination();
            }
        }
    });
}

// ============================================
// ARCHIVE MODAL FUNCTIONS
// ============================================

// Open archive modal
function openArchiveModal() {
    var checkedBoxes = document.querySelectorAll('#roomsTableBody .custom-checkbox:checked');

    if (checkedBoxes.length === 0) {
        showNotification('Please select at least one room to archive', 'warning');
        return;
    }

    // Collect selected rooms data
    selectedRoomsForArchive = [];
    var previewList = document.getElementById('archivePreviewList');

    if (!previewList) return;

    previewList.innerHTML = '';

    checkedBoxes.forEach(function (checkbox) {
        var row = checkbox.closest('tr');
        if (row) {
            var roomNameEl = row.querySelector('.room-details h3');
            var roomIdEl = row.querySelector('.room-id');
            var roomName = roomNameEl && roomNameEl.textContent ? roomNameEl.textContent : 'Unknown Room';
            var roomId = roomIdEl && roomIdEl.textContent ? roomIdEl.textContent : 'No ID';

            selectedRoomsForArchive.push({
                row: row,
                name: roomName,
                id: roomId
            });

            // Add to preview list
            var previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML =
                '<div class="preview-item-icon">' +
                '<i class="fas fa-door-open"></i>' +
                '</div>' +
                '<div class="preview-item-info">' +
                '<div class="preview-item-name">' + roomName + '</div>' +
                '<div class="preview-item-id">' + roomId + '</div>' +
                '</div>';
            previewList.appendChild(previewItem);
        }
    });

    // Update count
    var archiveCount = document.getElementById('archiveCount');
    if (archiveCount) {
        archiveCount.textContent = String(selectedRoomsForArchive.length);
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

        setTimeout(function () {
            selectedRoomsForArchive = [];
        }, 300);
    }
}

// Cancel confirmation modal functions
function showCancelConfirm(title, message, yesButtonText, callback) {
    if (!cancelConfirmModal) return;

    cancelConfirmCallback = callback;

    // Update modal content
    var titleEl = document.querySelector('#cancelConfirmModal .modal-title-wrapper h2');
    var messageEl = document.getElementById('cancelConfirmText');
    var yesBtn = document.getElementById('cancelConfirmYesBtn');

    if (titleEl) titleEl.textContent = title || 'Confirm Action';
    if (messageEl) messageEl.textContent = message || 'Are you sure you want to proceed?';
    if (yesBtn) {
        var yesText = yesButtonText || 'Yes, Proceed';
        yesBtn.innerHTML = '<i class="fas fa-check"></i><span>' + yesText + '</span>';
    }

    // Show modal
    cancelConfirmModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCancelConfirm() {
    if (!cancelConfirmModal) return;
    cancelConfirmModal.classList.remove('active');
    document.body.style.overflow = '';
    cancelConfirmCallback = null;
}

function confirmCancelAction() {
    if (cancelConfirmCallback) {
        cancelConfirmCallback();
    }
    closeCancelConfirm();
}

// Confirm archive
function confirmArchive() {
    if (selectedRoomsForArchive.length === 0) {
        showNotification('No rooms selected', 'error');
        return;
    }

    var confirmBtn = document.getElementById('confirmArchiveBtn');
    if (!confirmBtn) return;

    // Show loading state
    var originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Archiving...';
    if ('disabled' in confirmBtn) {
        confirmBtn.disabled = true;
    }

    // Simulate archive process
    setTimeout(function () {
        var count = selectedRoomsForArchive.length;
        var roomNames = selectedRoomsForArchive.map(function (r) { return r.name; }).join(', ');

        // Remove rows from table
        selectedRoomsForArchive.forEach(function (room) {
            if (room.row) {
                room.row.remove();
            }
        });

        // Update room count
        updateRoomCount();

        // Uncheck "select all" if it was checked
        if (selectAllCheckbox && 'checked' in selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }

        // Reset button
        confirmBtn.innerHTML = originalText;
        if ('disabled' in confirmBtn) {
            confirmBtn.disabled = false;
        }

        // Close modal
        closeArchiveModal();

        // Show success notification
        showNotification(
            count + ' room' + (count > 1 ? 's' : '') + ' archived successfully!',
            'success'
        );

        // Update pagination after archiving
        initializePagination();

        // Log for debugging (in real app, send to server)
        console.log('Archived rooms:', roomNames);
    }, 1000);
}

// Show notification
function showNotification(message, type) {
    type = type || 'info';
    var notification = document.createElement('div');

    var bgColor, icon;
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

    notification.style.cssText =
        'position: fixed;' +
        'top: 20px;' +
        'right: 20px;' +
        'padding: 1rem 1.5rem;' +
        'background: ' + bgColor + ';' +
        'color: white;' +
        'border-radius: 12px;' +
        'box-shadow: 0 4px 12px rgba(0,0,0,0.2);' +
        'z-index: 11001;' +
        'font-family: \'Kumbh Sans\', sans-serif;' +
        'animation: slideIn 0.3s ease;' +
        'display: flex;' +
        'align-items: center;' +
        'gap: 0.75rem;' +
        'max-width: 400px;';

    notification.innerHTML =
        '<i class="fas ' + icon + '" style="font-size: 1.2rem;"></i>' +
        '<span>' + message + '</span>';

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

// Add animation styles for notifications (only once)
if (!document.getElementById('room-notification-styles')) {
    var notificationStyle = document.createElement('style');
    notificationStyle.id = 'room-notification-styles';
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

// Handle window resize
var resizeTimer;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
        if (window.innerWidth > 768) {
            if (sidebar) sidebar.classList.remove('active');
        }
        if (userProfile) {
            userProfile.classList.remove('active');
        }
    }, 250);
});

console.log('Room Management with separate modals initialized successfully!');