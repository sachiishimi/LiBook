// ============================================================================
// ROOM DETAILS MODAL
// ============================================================================
function openRoomDetailsModal(roomId) {
    console.log('📂 Opening room details for roomId:', roomId);

    if (!roomId) {
        console.error('❌ No room ID provided');
        return;
    }

    // Show loading indicator
    document.body.style.cursor = 'wait';

    // Fetch the room details modal content from server
    var url = '/Librarian/GetRoomDetailsWithReservations?roomId=' + roomId;

    fetch(url)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Failed to load room details');
            }
            return response.text();
        })
        .then(function (html) {
            document.body.style.cursor = 'default';

            // Remove any existing room details modal
            var existingModal = document.getElementById('roomDetailsModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add the new modal to the page
            var modalContainer = document.createElement('div');
            modalContainer.innerHTML = html;
            document.body.appendChild(modalContainer);

            // Prevent body scrolling
            document.body.style.overflow = 'hidden';

            console.log('✅ Room details modal loaded');
        })
        .catch(function (error) {
            document.body.style.cursor = 'default';
            console.error('❌ Error loading room details:', error);
            alert('Error loading room details. Please try again.');
        });
}

function closeRoomDetailsModal() {
    console.log('🔄 Closing room details modal');
    var modal = document.getElementById('roomDetailsModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
        console.log('✅ Room details modal closed');
    }
}

// ============================================================================
// WALK-IN MODAL
// ============================================================================
var currentRoomId = null;
var currentRoomName = null;

function createWalkIn(roomId, roomName) {
    console.log('✅ createWalkIn called - roomId:', roomId, 'roomName:', roomName);

    // Try to get room name from the room card if not provided
    if (!roomName) {
        var roomCard = document.querySelector('[data-room-id="' + roomId + '"]');
        if (roomCard) {
            var roomNameElement = roomCard.querySelector('.room-name');
            if (roomNameElement) {
                roomName = roomNameElement.textContent.trim();
            }
        }
    }

    // If still no room name, use default
    if (!roomName) {
        roomName = 'Room ' + roomId;
    }

    currentRoomId = roomId;
    currentRoomName = roomName;

    // Open the modal
    openWalkInModal();
}

function openWalkInModal() {
    console.log('📂 Opening walk-in modal');

    var modal = document.getElementById('walkInModal');

    if (!modal) {
        console.error('❌ ERROR: walkInModal element not found!');
        alert('ERROR: Walk-in modal not found in page. Make sure the HTML has id="walkInModal"');
        return;
    }

    console.log('📍 Modal found, displaying...');

    // FORCE SHOW THE MODAL with inline styles
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '999999';
    modal.style.background = 'rgba(0, 0, 0, 0.8)';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.classList.add('active');

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';

    // Set room ID in hidden field
    var roomIdField = document.getElementById('walkInRoomId');
    if (roomIdField) {
        roomIdField.value = currentRoomId;
        console.log('   Room ID field set:', currentRoomId);
    } else {
        console.warn('⚠️ walkInRoomId field not found');
    }

    // Set room name in display
    var roomNameField = document.getElementById('walkInRoomName');
    if (roomNameField) {
        roomNameField.textContent = currentRoomName;
        console.log('   Room name field set:', currentRoomName);
    } else {
        console.warn('⚠️ walkInRoomName field not found');
    }

    // Set today's date as default
    var today = new Date().toISOString().split('T')[0];
    var bookingDateField = document.getElementById('BookingDate');
    if (bookingDateField) {
        bookingDateField.value = today;
        bookingDateField.min = today;
        console.log('   Booking date set:', today);
    }

    console.log('✅ Walk-in modal opened successfully!');
}

function closeWalkInModal() {
    console.log('🔄 Closing walk-in modal');

    var modal = document.getElementById('walkInModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';

        // Reset form
        var form = document.getElementById('walkInForm');
        if (form) {
            form.reset();
        }

        console.log('✅ Walk-in modal closed');
    }
}

// Close modals when clicking outside
document.addEventListener('click', function (e) {
    // Close walk-in modal if clicking on the overlay
    if (e.target.id === 'walkInModal') {
        closeWalkInModal();
    }

    // Close room details modal if clicking on the overlay
    if (e.target.id === 'roomDetailsModal') {
        closeRoomDetailsModal();
    }
});

// Close modals with Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
        closeWalkInModal();
        closeRoomDetailsModal();
    }
});

// ============================================================================
// VERIFICATION
// ============================================================================
console.log('✅ All functions loaded:', {
    openRoomDetailsModal: typeof openRoomDetailsModal,
    closeRoomDetailsModal: typeof closeRoomDetailsModal,
    createWalkIn: typeof createWalkIn,
    openWalkInModal: typeof openWalkInModal,
    closeWalkInModal: typeof closeWalkInModal
});

console.log('✅ COMPLETE SCRIPT LOADED - All buttons should work now!');
console.log('💡 Press F12 to see console logs when clicking buttons');