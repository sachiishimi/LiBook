// reservations.js - Complete Rewrite
// ============================================
// MAIN APPLICATION
// ============================================

class ReservationsApp {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    initElements() {
        // Sidebar and Navigation
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebar = document.getElementById('sidebar');
        this.closeSidebar = document.getElementById('closeSidebar');
        this.sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
        this.mainContent = document.querySelector('.main-content');
        this.navItems = document.querySelectorAll('.nav-item');

        // User Profile
        this.userProfile = document.getElementById('userProfile');
        this.userDropdown = document.getElementById('userDropdown');

        // Search and Rooms
        this.roomSearch = document.getElementById('roomSearch');
        this.roomsGrid = document.getElementById('roomsGrid');
        this.roomCards = document.querySelectorAll('.room-card');

        // Notification
        this.notificationBtn = document.querySelector('.notification-btn');

        // Modals
        this.roomModal = null;
        this.bookingDetailModal = null;

        // State
        this.currentRoomId = null;
        this.currentRoomBookings = [];
        this.selectedBookings = new Set();
    }

    bindEvents() {
        // Sidebar Events
        if (this.sidebarToggleDesktop) {
            this.sidebarToggleDesktop.addEventListener('click', (e) => this.toggleDesktopSidebar(e));
        }
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.openMobileSidebar());
        }
        if (this.closeSidebar) {
            this.closeSidebar.addEventListener('click', () => this.closeMobileSidebar());
        }

        // User Profile Events
        if (this.userProfile) {
            this.userProfile.addEventListener('click', (e) => this.toggleUserDropdown(e));
        }

        // Search Events
        if (this.roomSearch) {
            this.roomSearch.addEventListener('input', (e) => this.filterRooms(e.target.value));
        }

        // Navigation Events
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavClick(e, item));
        });

        // Notification Events
        if (this.notificationBtn) {
            this.notificationBtn.addEventListener('click', () => this.showNotification('You have 3 new notifications', 'info'));
        }

        // Global Events
        document.addEventListener('click', (e) => this.handleDocumentClick(e));
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('load', () => this.handlePageLoad());
    }

    init() {
        this.setupNotificationStyles();
        this.setupSpinnerStyles();
        console.log('Reservations App initialized successfully!');
    }

    // ============================================
    // SIDEBAR & NAVIGATION
    // ============================================

    toggleDesktopSidebar(e) {
        e.stopPropagation();
        this.sidebar.classList.toggle('collapsed');
        this.mainContent.classList.toggle('expanded');
    }

    openMobileSidebar() {
        this.sidebar.classList.add('active');
        this.sidebar.classList.remove('collapsed');
        this.mainContent.classList.remove('expanded');
    }

    closeMobileSidebar() {
        this.sidebar.classList.remove('active');
    }

    toggleUserDropdown(e) {
        e.stopPropagation();
        this.userProfile.classList.toggle('active');
    }

    handleNavClick(e, item) {
        if (!item.classList.contains('logout') && item.getAttribute('href') !== '#') {
            this.navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            if (window.innerWidth <= 768) {
                this.closeMobileSidebar();
            }
        }
    }

    handleDocumentClick(e) {
        // Close mobile sidebar when clicking outside
        if (window.innerWidth <= 768 && this.sidebar && this.menuToggle && e.target) {
            if (!this.sidebar.contains(e.target) && !this.menuToggle.contains(e.target)) {
                this.closeMobileSidebar();
            }
        }

        // Close user dropdown when clicking outside
        if (this.userProfile && !this.userProfile.contains(e.target)) {
            this.userProfile.classList.remove('active');
        }

        // Close modals when clicking on overlay
        if (e.target.classList.contains('modal-overlay')) {
            this.closeRoomModal();
            this.closeBookingDetailModal();
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            this.closeBookingDetailModal();
            this.closeRoomModal();
        }
    }

    handleResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768 && this.sidebar) {
                this.closeMobileSidebar();
            }
            if (this.userProfile) {
                this.userProfile.classList.remove('active');
            }
        }, 250);
    }

    handlePageLoad() {
        // Set active nav item based on current page
        const currentPath = window.location.pathname;
        this.navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && currentPath.includes(href)) {
                item.classList.add('active');
            }
        });
    }

    // ============================================
    // ROOMS & SEARCH
    // ============================================

    filterRooms(searchTerm) {
        const term = searchTerm.toLowerCase().trim();

        this.roomCards.forEach(card => {
            const roomName = card.getAttribute('data-room-name') || '';
            const roomType = card.getAttribute('data-room-type') || '';

            if (term === '' || roomName.includes(term) || roomType.includes(term)) {
                card.classList.remove('hidden');
                card.classList.add('visible');
            } else {
                card.classList.remove('visible');
                card.classList.add('hidden');
            }
        });
    }

    // ============================================
    // ROOM MODAL
    // ============================================

    showEmbeddedRoomModal(roomElement) {
        const roomId = roomElement.getAttribute('data-room-id');
        const roomName = roomElement.querySelector('.room-name').textContent;

        if (!roomId) {
            this.showNotification('Room ID not found', 'error');
            return;
        }

        this.currentRoomId = roomId;
        this.selectedBookings.clear();
        this.showLoadingModal(roomName);

        this.fetchRoomBookings(roomId)
            .then(bookings => {
                this.createRoomModal(roomId, roomName, bookings);
            })
            .catch(error => {
                console.error('Error fetching bookings:', error);
                this.showNotification('Failed to load bookings. Please try again.', 'error');
                this.createRoomModal(roomId, roomName, []);
            });
    }

    showLoadingModal(roomName) {
        this.closeRoomModal();
        document.body.classList.add('modal-open');

        this.roomModal = document.createElement('div');
        this.roomModal.id = 'roomModal';
        this.roomModal.className = 'modal-overlay';

        this.roomModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <button class="modal-back-btn" onclick="app.closeRoomModal()">
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

        document.body.appendChild(this.roomModal);

        setTimeout(() => {
            this.roomModal.classList.add('active');
        }, 10);
    }

    async fetchRoomBookings(roomId) {
        const response = await fetch(`/AdminDashboard/GetRoomBookings?roomId=${roomId}`);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        return await response.json();
    }

    createRoomModal(roomId, roomName, bookings) {
        this.currentRoomBookings = bookings;

        if (!this.roomModal) {
            this.roomModal = document.createElement('div');
            this.roomModal.id = 'roomModal';
            this.roomModal.className = 'modal-overlay';
            document.body.appendChild(this.roomModal);
        }

        this.roomModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <button class="modal-back-btn" onclick="app.closeRoomModal()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2>${roomName.toUpperCase()}</h2>
                    <div class="modal-actions">
                        <button class="modal-action-btn cancel-selected" onclick="app.cancelSelectedBookings()">
                            <i class="fas fa-times-circle"></i>
                            <span>Cancel Selected</span>
                        </button>
                        <button class="modal-action-btn cancel-all" onclick="app.cancelAllBookingsForRoom('${roomName}')">
                            <i class="fas fa-ban"></i>
                            <span>Cancel All</span>
                        </button>
                    </div>
                </div>
                <div class="modal-body">
                    ${this.generateBookingsTable(bookings)}
                </div>
            </div>
        `;

        setTimeout(() => {
            this.roomModal.classList.add('active');
        }, 10);

        // Add checkbox event listeners
        setTimeout(() => {
            this.setupBookingCheckboxes();
        }, 50);
    }

    generateBookingsTable(bookings) {
        if (bookings.length === 0) {
            return '<div class="no-bookings">No bookings found for this room.</div>';
        }

        return `
            <div class="bookings-table-wrapper">
                <table class="bookings-table">
                    <thead>
                        <tr>
                            <th width="50"><input type="checkbox" id="selectAllBookings" onclick="app.toggleSelectAllBookings()"></th>
                            <th>BOOKING ID</th>
                            <th>RESERVEE NAME</th>
                            <th>STATUS</th>
                            <th>DATE</th>
                            <th>TIME</th>
                            <th>PURPOSE</th>
                        </tr>
                    </thead>
                    <tbody id="bookingsTableBody">
                        ${bookings.map(booking => this.generateBookingRow(booking)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    generateBookingRow(booking) {
        const statusClass = (booking.Status || '').toLowerCase();
        const formattedDate = this.formatDate(booking.BookingDate);

        return `
            <tr data-booking-id="${booking.Id}" onclick="app.showBookingDetail(${booking.Id})">
                <td onclick="event.stopPropagation()">
                    <input type="checkbox" 
                           class="booking-checkbox" 
                           data-booking-id="${booking.Id}"
                           ${this.selectedBookings.has(booking.Id) ? 'checked' : ''}
                           onclick="app.toggleBookingSelection(${booking.Id}, event)">
                </td>
                <td>${booking.BookingId || booking.Id.toString().padStart(4, '0')}</td>
                <td>${booking.ReserveeName || 'N/A'}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${booking.Status || 'Unknown'}
                    </span>
                </td>
                <td>${formattedDate}</td>
                <td>${booking.Schedule || 'N/A'}</td>
                <td>${booking.Purpose || 'N/A'}</td>
            </tr>
        `;
    }

    setupBookingCheckboxes() {
        const checkboxes = this.roomModal.querySelectorAll('.booking-checkbox');
        checkboxes.forEach(checkbox => {
            const bookingId = parseInt(checkbox.getAttribute('data-booking-id'));
            checkbox.checked = this.selectedBookings.has(bookingId);
        });

        const selectAll = this.roomModal.querySelector('#selectAllBookings');
        if (selectAll) {
            const allChecked = this.currentRoomBookings.every(b => this.selectedBookings.has(b.Id));
            selectAll.checked = allChecked;
        }
    }

    toggleBookingSelection(bookingId, event) {
        event.stopPropagation();

        if (this.selectedBookings.has(bookingId)) {
            this.selectedBookings.delete(bookingId);
        } else {
            this.selectedBookings.add(bookingId);
        }

        // Update select all checkbox
        const selectAll = this.roomModal?.querySelector('#selectAllBookings');
        if (selectAll && this.currentRoomBookings) {
            const allChecked = this.currentRoomBookings.every(b => this.selectedBookings.has(b.Id));
            selectAll.checked = allChecked;
        }
    }

    toggleSelectAllBookings() {
        const selectAll = this.roomModal?.querySelector('#selectAllBookings');
        if (!selectAll || !this.currentRoomBookings) return;

        if (selectAll.checked) {
            // Select all
            this.currentRoomBookings.forEach(booking => {
                this.selectedBookings.add(booking.Id);
            });
        } else {
            // Deselect all
            this.selectedBookings.clear();
        }

        // Update all checkboxes
        const checkboxes = this.roomModal?.querySelectorAll('.booking-checkbox');
        checkboxes?.forEach(checkbox => {
            checkbox.checked = selectAll.checked;
        });
    }

    closeRoomModal() {
        if (this.roomModal) {
            this.roomModal.classList.remove('active');
            setTimeout(() => {
                if (this.roomModal && this.roomModal.parentNode) {
                    this.roomModal.parentNode.removeChild(this.roomModal);
                }
                this.roomModal = null;
                document.body.classList.remove('modal-open');
                this.selectedBookings.clear();
            }, 300);
        }
    }

    // ============================================
    // BOOKING DETAIL MODAL
    // ============================================

    async showBookingDetail(bookingId) {
        if (!bookingId) {
            this.showNotification('Booking ID not found', 'error');
            return;
        }

        if (this.roomModal) {
            this.roomModal.style.opacity = '0.5';
            this.roomModal.style.pointerEvents = 'none';
        }

        try {
            const booking = await this.fetchBookingDetails(bookingId);
            this.createBookingDetailModal(booking);
        } catch (error) {
            console.error('Error fetching booking details:', error);
            this.showNotification('Failed to load booking details', 'error');
        } finally {
            if (this.roomModal) {
                this.roomModal.style.opacity = '';
                this.roomModal.style.pointerEvents = '';
            }
        }
    }

    async fetchBookingDetails(bookingId) {
        const token = this.getAntiForgeryToken();
        const response = await fetch(`/AdminDashboard/GetBookingDetails?id=${bookingId}`, {
            headers: {
                'RequestVerificationToken': token
            }
        });

        if (!response.ok) throw new Error('Failed to fetch booking details');

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        return data;
    }

    createBookingDetailModal(booking) {
        this.closeBookingDetailModal();
        document.body.classList.add('modal-open');

        this.bookingDetailModal = document.createElement('div');
        this.bookingDetailModal.id = 'bookingDetailModal';
        this.bookingDetailModal.className = 'modal-overlay';

        this.bookingDetailModal.innerHTML = this.generateBookingDetailContent(booking);
        document.body.appendChild(this.bookingDetailModal);

        setTimeout(() => {
            this.bookingDetailModal.classList.add('active');
        }, 10);
    }

    generateBookingDetailContent(booking) {
        const isCancelled = booking.Status === 'Cancelled';

        return `
            <div class="modal-content booking-detail-content">
                <div class="modal-header">
                    <h2>Booking Details - ${booking.BookingId || booking.Id.toString().padStart(4, '0')}</h2>
                    <button class="modal-close-btn" onclick="app.closeBookingDetailModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="detail-grid">
                        ${this.generateBookingDetails(booking)}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="app.closeBookingDetailModal()">Close</button>
                    ${!isCancelled ? `
                        <button class="btn btn-danger" onclick="app.cancelSingleBooking(${booking.Id})">
                            <i class="fas fa-ban"></i> Cancel Booking
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    generateBookingDetails(booking) {
        const members = booking.Members || [];

        return `
            <div class="detail-row">
                <div class="detail-label">Room</div>
                <div class="detail-value">${booking.RoomName || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Booking ID</div>
                <div class="detail-value">${booking.BookingId || booking.Id.toString().padStart(4, '0')}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status</div>
                <div class="detail-value status-value ${(booking.Status || '').toLowerCase()}">
                    ${booking.Status || 'Unknown'}
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Booking Date</div>
                <div class="detail-value">${this.formatDate(booking.BookingDate)}</div>
            </div>
            <div class="detail-row full-width">
                <div class="detail-label">Reservee Information</div>
                <div class="detail-value reservee-info">
                    <div><strong>Name:</strong> ${booking.ReserveeName || 'N/A'}</div>
                    <div><strong>Email:</strong> ${booking.ReserveeEmail || 'N/A'}</div>
                    <div><strong>Student No:</strong> ${booking.StudentNumber || 'N/A'}</div>
                    <div><strong>Program:</strong> ${booking.Program || 'N/A'}</div>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Schedule</div>
                <div class="detail-value">${booking.Schedule || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Purpose</div>
                <div class="detail-value">${booking.Purpose || 'N/A'}</div>
            </div>
            <div class="detail-row full-width">
                <div class="detail-label">Timeline</div>
                <div class="timeline">
                    ${this.generateTimeline(booking)}
                </div>
            </div>
            ${members.length > 0 ? `
                <div class="detail-row full-width">
                    <div class="detail-label">Members (${members.length})</div>
                    <div class="members-list">
                        ${members.map(member => `
                            <div class="member-item">
                                <i class="fas fa-user"></i>
                                <span>${member || 'Unnamed Member'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }

    generateTimeline(booking) {
        return `
            <div class="timeline-item ${booking.SubmittedAt ? 'completed' : ''}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-title">Submitted</div>
                    <div class="timeline-date">${this.formatDateTime(booking.SubmittedAt)}</div>
                </div>
            </div>
            <div class="timeline-item ${booking.ApprovedAt ? 'completed' : ''}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-title">Approved</div>
                    <div class="timeline-date">${this.formatDateTime(booking.ApprovedAt)}</div>
                </div>
            </div>
            <div class="timeline-item ${booking.CancelledAt ? 'completed' : ''}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-title">${booking.CancelledAt ? 'Cancelled' : 'Status'}</div>
                    <div class="timeline-date">${this.formatDateTime(booking.CancelledAt)}</div>
                </div>
            </div>
        `;
    }

    closeBookingDetailModal() {
        if (this.bookingDetailModal) {
            this.bookingDetailModal.classList.remove('active');
            setTimeout(() => {
                if (this.bookingDetailModal && this.bookingDetailModal.parentNode) {
                    this.bookingDetailModal.parentNode.removeChild(this.bookingDetailModal);
                }
                this.bookingDetailModal = null;
                document.body.classList.remove('modal-open');
            }, 300);
        }
    }

    // ============================================
    // CANCELLATION FUNCTIONS
    // ============================================

    async cancelSingleBooking(bookingId) {
        const booking = this.currentRoomBookings.find(b => b.Id === bookingId);
        const reserveeName = booking?.ReserveeName || 'this booking';

        if (!confirm(`Are you sure you want to cancel ${reserveeName}'s booking?`)) {
            return;
        }

        try {
            await this.performCancellation(bookingId, 'single');
            this.showNotification('Booking cancelled successfully', 'success');
            this.closeBookingDetailModal();
            await this.refreshRoomModal();
        } catch (error) {
            this.showNotification('Failed to cancel booking', 'error');
        }
    }

    async cancelSelectedBookings() {
        if (this.selectedBookings.size === 0) {
            this.showNotification('Please select at least one booking to cancel', 'warning');
            return;
        }

        if (!confirm(`Are you sure you want to cancel ${this.selectedBookings.size} selected booking(s)?`)) {
            return;
        }

        const bookingIds = Array.from(this.selectedBookings);

        try {
            const result = await this.performBulkCancellation(bookingIds);
            this.showNotification(`Successfully cancelled ${result.count} booking(s)`, 'success');
            await this.refreshRoomModal();
        } catch (error) {
            this.showNotification('Failed to cancel bookings', 'error');
        }
    }

    async cancelAllBookingsForRoom(roomName) {
        if (!confirm(`Are you sure you want to cancel ALL bookings for ${roomName}?`)) {
            return;
        }

        try {
            const result = await this.performRoomCancellation(this.currentRoomId);
            this.showNotification(`Successfully cancelled ${result.count} booking(s) for ${roomName}`, 'success');
            await this.refreshRoomModal();
        } catch (error) {
            this.showNotification('Failed to cancel bookings', 'error');
        }
    }

    async performCancellation(bookingId, type = 'single') {
        const token = this.getAntiForgeryToken();

        console.log('Anti-forgery token:', token ? 'Found' : 'Not found'); // Debug

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        // Add token if found
        if (token) {
            headers['RequestVerificationToken'] = token;
        }

        const url = type === 'single'
            ? `/AdminDashboard/CancelBooking?id=${bookingId}`
            : type === 'bulk'
                ? '/AdminDashboard/CancelMultipleBookings'
                : `/AdminDashboard/CancelAllBookings?roomId=${this.currentRoomId}`;

        const body = type === 'bulk'
            ? JSON.stringify(Array.from(this.selectedBookings))
            : type === 'single'
                ? JSON.stringify({ id: bookingId })
                : null;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: body,
                credentials: 'same-origin' // Important for cookie-based auth
            });

            console.log('Response status:', response.status); // Debug

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data); // Debug

            if (!data.success) {
                throw new Error(data.message || 'Cancellation failed');
            }

            return data;
        } catch (error) {
            console.error('Cancellation error:', error);
            throw error;
        }
    }

    async performBulkCancellation(bookingIds) {
        const token = this.getAntiForgeryToken();

        const response = await fetch('/AdminDashboard/CancelMultipleBookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': token
            },
            body: JSON.stringify(bookingIds)
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Bulk cancellation failed');

        return data;
    }

    async performRoomCancellation(roomId) {
        const token = this.getAntiForgeryToken();

        const response = await fetch(`/AdminDashboard/CancelAllBookings?roomId=${roomId}`, {
            method: 'POST',
            headers: {
                'RequestVerificationToken': token
            }
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Room cancellation failed');

        return data;
    }

    async refreshRoomModal() {
        if (!this.currentRoomId || !this.roomModal) return;

        const roomHeader = this.roomModal.querySelector('h2');
        const roomName = roomHeader?.textContent?.trim() || 'Room';

        this.closeRoomModal();

        // Wait a bit then reopen
        setTimeout(() => {
            const roomElement = {
                getAttribute: (attr) => this.currentRoomId,
                querySelector: (selector) => ({ textContent: roomName })
            };
            this.showEmbeddedRoomModal(roomElement);
        }, 300);
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    formatDate(dateInput) {
        if (!dateInput) return 'N/A';

        try {
            let date;

            // Handle /Date(timestamp)/ format
            if (typeof dateInput === 'string' && dateInput.startsWith('/Date(')) {
                const timestamp = parseInt(dateInput.match(/\d+/)[0]);
                date = new Date(timestamp);
            }
            // Handle ISO string format
            else if (typeof dateInput === 'string') {
                date = new Date(dateInput);
            }
            // Already a Date object
            else {
                date = dateInput;
            }

            if (isNaN(date.getTime())) {
                return dateInput; // Return original if invalid
            }

            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

        } catch (e) {
            console.error('Date formatting error:', e, 'Input:', dateInput);
            return 'Invalid Date';
        }
    }

    formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
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

    getAntiForgeryToken() {
        const token = document.querySelector('input[name="__RequestVerificationToken"]');
        return token ? token.value : '';
    }

    // ============================================
    // NOTIFICATION SYSTEM
    // ============================================

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.setAttribute('data-type', type);

        const icon = type === 'success' ? 'check-circle' :
            type === 'error' ? 'exclamation-circle' :
                type === 'warning' ? 'exclamation-triangle' : 'info-circle';

        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    setupNotificationStyles() {
        if (document.getElementById('notification-styles')) return;

        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: #2c3e50;
                color: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 10000;
                font-family: 'Kumbh Sans', sans-serif;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification[data-type="success"] { background: #2e7d32; }
            .notification[data-type="error"] { background: #c62828; }
            .notification[data-type="warning"] { background: #ef6c00; }
            .notification[data-type="info"] { background: #2c3e50; }
            
            .notification i { font-size: 1.2rem; }
        `;

        document.head.appendChild(style);
    }

    setupSpinnerStyles() {
        if (document.getElementById('spinner-styles')) return;

        const style = document.createElement('style');
        style.id = 'spinner-styles';
        style.textContent = `
            .loading-spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #c62828;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;

        document.head.appendChild(style);
    }

    // ============================================
    // HELPER FUNCTIONS (for backward compatibility)
    // ============================================

    generateMemberNames(count, excludeName) {
        const members = [];
        for (let i = 0; i < count; i++) {
            members.push(`Member ${i + 1}`);
        }
        return members;
    }

    initializeRooms() {
        console.log('Rooms initialized');
    }

    getAntiForgeryToken() {
        // Try multiple ways to get the token
        const token1 = document.querySelector('input[name="__RequestVerificationToken"]');
        const token2 = document.querySelector('[name="__RequestVerificationToken"]');
        const token3 = document.querySelector('input[type="hidden"][name="__RequestVerificationToken"]');

        return token1?.value || token2?.value || token3?.value || '';
    }

    setupDebugHelpers() {
        window.debugApp = {
            showSelectedBookings: () => console.log('Selected bookings:', Array.from(this.selectedBookings)),
            showCurrentRoom: () => console.log('Current room ID:', this.currentRoomId),
            testToken: () => {
                const token = this.getAntiForgeryToken();
                console.log('Token length:', token?.length);
                console.log('Token:', token);
            },
            testCancellation: (bookingId) => {
                console.log('Testing cancellation for booking:', bookingId);
                this.cancelSingleBooking(bookingId);
            }
        };

        // Call it in init()
        this.setupDebugHelpers();
    }
}

// ============================================
// INITIALIZE APPLICATION
// ============================================

let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new ReservationsApp();

    // Expose necessary functions to global scope for HTML onclick handlers
    window.app = app;
    window.showEmbeddedRoomModal = (element) => app.showEmbeddedRoomModal(element);
    window.closeRoomModal = () => app.closeRoomModal();
    window.closeBookingDetailModal = () => app.closeBookingDetailModal();
    window.showBookingDetail = (bookingId) => app.showBookingDetail(bookingId);

    console.log('Reservations application loaded successfully!');
});