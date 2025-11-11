// ========================================
// SIDEBAR & DROPDOWN FUNCTIONALITY
// ========================================

class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupSidebar();
        this.setupUserDropdown();
        this.setupResponsiveMenu();
    }

    setupSidebar() {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
        const closeSidebar = document.getElementById('closeSidebar');
        const mainContent = document.querySelector('.main-content');

        // Mobile sidebar toggle
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.add('active');
            });
        }

        // Desktop sidebar toggle
        if (sidebarToggleDesktop) {
            sidebarToggleDesktop.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
            });
        }

        // Close sidebar
        if (closeSidebar) {
            closeSidebar.addEventListener('click', () => {
                sidebar.classList.remove('active');
            });
        }

        // Close sidebar when clicking on nav items (mobile)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }

    setupUserDropdown() {
        const userProfile = document.getElementById('userProfile');
        const userDropdown = document.getElementById('userDropdown');

        if (userProfile && userDropdown) {
            // Toggle dropdown on click
            userProfile.addEventListener('click', (e) => {
                e.stopPropagation();
                userProfile.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userProfile.contains(e.target)) {
                    userProfile.classList.remove('active');
                }
            });

            // Close dropdown when clicking on dropdown items
            userDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    setupResponsiveMenu() {
        // Handle window resize
        window.addEventListener('resize', () => {
            const sidebar = document.getElementById('sidebar');
            if (window.innerWidth > 768) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// ========================================
// RESERVATIONS MANAGEMENT WITH SIDE PANEL
// ========================================

class ReservationsManager {
    constructor() {
        this.data = {
            accepted: [
                { id: 1, name: "Sarah Wilson", email: "sarah.w@example.com", userType: "Student", room: "Study Room C", date: "2025-11-14", time: "1:00 PM - 3:00 PM", status: "accepted" },
                { id: 2, name: "David Brown", email: "david.b@example.com", userType: "Faculty", room: "Meeting Room", date: "2025-11-13", time: "3:00 PM - 5:00 PM", status: "accepted" },
                { id: 3, name: "Michael Chen", email: "michael.c@example.com", userType: "Student", room: "Study Room A", date: "2025-11-15", time: "9:00 AM - 11:00 AM", status: "accepted" },
                { id: 4, name: "Jennifer Lopez", email: "jennifer.l@example.com", userType: "Admin", room: "Conference Room", date: "2025-11-16", time: "2:00 PM - 4:00 PM", status: "accepted" },
            ],
            cancelled: [
                { id: 8, name: "Robert Miller", email: "robert.m@example.com", userType: "Student", room: "Conference Room", date: "2025-11-11", time: "4:00 PM - 6:00 PM", status: "cancelled" },
                { id: 9, name: "Amanda Johnson", email: "amanda.j@example.com", userType: "Admin", room: "Study Room B", date: "2025-11-09", time: "10:00 AM - 12:00 PM", status: "cancelled" },
                { id: 10, name: "Kevin Wilson", email: "kevin.w@example.com", userType: "Visitor", room: "Meeting Room", date: "2025-11-08", time: "3:00 PM - 5:00 PM", status: "cancelled" },
                { id: 11, name: "Maria Rodriguez", email: "maria.r@example.com", userType: "Faculty", room: "Study Room C", date: "2025-11-07", time: "11:00 AM - 1:00 PM", status: "cancelled" },
            ]
        };
        this.currentTab = 'accepted';
        this.currentFilter = 'all';
        this.selectedReservation = null;
        this.pendingArchiveReservation = null;
        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupSearch();
        this.setupFilter();
        this.setupModal();
        this.setupPanel();
        this.renderTable();
        this.updateTabBadges();
    }

    setupTabSwitching() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentTab = tab.dataset.tab;
                this.closePanel();
                this.renderTable();
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTable(e.target.value.toLowerCase());
            });
        }
    }

    setupFilter() {
        const filterSelect = document.getElementById('filterSelect');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderTable();
            });
        }
    }

    setupModal() {
        // Close modal when clicking cancel button
        const cancelBtn = document.getElementById('modalCancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }

        // Close modal when clicking confirm button
        const confirmBtn = document.getElementById('modalConfirm');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmArchive();
            });
        }

        // Close modal when clicking overlay
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.hideModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                this.hideModal();
            }
        });
    }

    setupPanel() {
        const closePanelBtn = document.getElementById('closePanelBtn');
        if (closePanelBtn) {
            closePanelBtn.addEventListener('click', () => {
                this.closePanel();
            });
        }
    }

    openPanel(reservation) {
        this.selectedReservation = reservation;
        const contentWrapper = document.querySelector('.content-wrapper');
        const panelBody = document.getElementById('panelBody');

        contentWrapper.classList.add('panel-open');

        // Populate panel with reservation details
        panelBody.innerHTML = this.createPanelContent(reservation);

        // Add event listeners to action buttons
        this.setupPanelActions();
    }

    closePanel() {
        const contentWrapper = document.querySelector('.content-wrapper');
        const panelBody = document.getElementById('panelBody');

        contentWrapper.classList.remove('panel-open');
        this.selectedReservation = null;

        // Clear selected row highlight
        document.querySelectorAll('.reservations-table tbody tr').forEach(row => {
            row.classList.remove('selected');
        });

        // Reset panel to empty state
        setTimeout(() => {
            panelBody.innerHTML = `
                <div class="empty-panel">
                    <i class="fas fa-hand-pointer"></i>
                    <p>Select a reservation to view details</p>
                </div>
            `;
        }, 300);
    }

    createPanelContent(reservation) {
        const statusClass = `status-${reservation.status}`;
        const statusText = reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1);

        return `
            <div class="panel-content">
                <!-- User Information -->
                <div class="user-info-panel">
                    <img class="user-avatar-large" 
                         src="https://ui-avatars.com/api/?name=${encodeURIComponent(reservation.name)}&size=128&background=random" 
                         alt="${reservation.name}">
                    <div class="user-info-details">
                        <h4>${reservation.name}</h4>
                        <p><i class="fas fa-envelope"></i> ${reservation.email}</p>
                        <p><i class="fas fa-user-tag"></i> ${reservation.userType}</p>
                    </div>
                </div>

                <!-- Status Badge -->
                <div class="status-info">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>

                <!-- Reservation Details -->
                <div class="detail-section">
                    <h5 class="section-title">Reservation Information</h5>
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-door-open"></i>
                            Room
                        </span>
                        <span class="detail-value">${reservation.room}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-calendar"></i>
                            Date
                        </span>
                        <span class="detail-value">${reservation.date}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-clock"></i>
                            Time
                        </span>
                        <span class="detail-value">${reservation.time}</span>
                    </div>
                </div>

                <!-- Additional Details -->
                <div class="detail-section">
                    <h5 class="section-title">Additional Information</h5>
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-hashtag"></i>
                            Reservation ID
                        </span>
                        <span class="detail-value">#${String(reservation.id).padStart(6, '0')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-user"></i>
                            User Type
                        </span>
                        <span class="detail-value">${reservation.userType}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-info-circle"></i>
                            Status
                        </span>
                        <span class="detail-value">${statusText}</span>
                    </div>
                </div>

                <!-- Contact Information -->
                <div class="detail-section">
                    <h5 class="section-title">Contact Details</h5>
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-user-circle"></i>
                            Full Name
                        </span>
                        <span class="detail-value">${reservation.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">
                            <i class="fas fa-at"></i>
                            Email Address
                        </span>
                        <span class="detail-value" style="font-size: 0.8125rem;">${reservation.email}</span>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            ${this.currentTab === 'cancelled' ? `
            <div class="panel-actions">
                <button class="btn btn-archive" id="archiveBtn">
                    <i class="fas fa-archive"></i>
                    Archive Reservation
                </button>
            </div>
            ` : ''}
        `;
    }

    setupPanelActions() {
        const archiveBtn = document.getElementById('archiveBtn');

        if (archiveBtn) {
            archiveBtn.addEventListener('click', () => {
                this.showArchiveModal(this.selectedReservation);
            });
        }
    }

    showArchiveModal(reservation) {
        this.pendingArchiveReservation = reservation;

        const modalOverlay = document.getElementById('modalOverlay');
        const modalMessage = document.getElementById('modalMessage');

        if (modalMessage) {
            modalMessage.textContent = `Are you sure you want to archive ${reservation.name}'s ${reservation.status} reservation for ${reservation.room} on ${reservation.date}? This action cannot be undone.`;
        }

        if (modalOverlay) {
            modalOverlay.classList.add('active');
            // Focus the cancel button for accessibility
            document.getElementById('modalCancel').focus();
        }
    }

    hideModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
        }
        this.pendingArchiveReservation = null;
    }

    confirmArchive() {
        if (!this.pendingArchiveReservation) return;

        const reservation = this.pendingArchiveReservation;

        // Remove from current data
        const index = this.data[this.currentTab].findIndex(r => r.id === reservation.id);
        if (index !== -1) {
            this.data[this.currentTab].splice(index, 1);
        }

        // Close modal and panel
        this.hideModal();
        this.closePanel();

        // Re-render table
        this.renderTable();
        this.updateTabBadges();

        // Show success notification
        this.showNotification(`Reservation archived successfully!`, 'success');
    }

    getFilteredData() {
        let data = [...this.data[this.currentTab]];

        // Apply filter
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'az') {
                data.sort((a, b) => a.name.localeCompare(b.name));
            } else if (this.currentFilter === 'za') {
                data.sort((a, b) => b.name.localeCompare(a.name));
            } else {
                data = data.filter(r => r.userType.toLowerCase() === this.currentFilter);
            }
        }

        return data;
    }

    renderTable() {
        const tableContent = document.getElementById('tableContent');
        const data = this.getFilteredData();

        if (data.length === 0) {
            tableContent.innerHTML = this.createEmptyState();
            return;
        }

        const table = document.createElement('table');
        table.className = 'reservations-table';

        // Create table header
        const thead = this.createTableHeader();
        table.appendChild(thead);

        // Create table body
        const tbody = this.createTableBody(data);
        table.appendChild(tbody);

        // Wrap in table wrapper for responsive scrolling
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        wrapper.appendChild(table);

        tableContent.innerHTML = '';
        tableContent.appendChild(wrapper);

        // Update table info
        this.updateTableInfo(data.length);
    }

    createEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No reservations found</h3>
                <p>Try adjusting your filters or search term</p>
            </div>
        `;
    }

    createTableHeader() {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const headers = ['User', 'Room', 'Date', 'Time', 'Status'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        return thead;
    }

    createTableBody(data) {
        const tbody = document.createElement('tbody');

        data.forEach(reservation => {
            const row = this.createTableRow(reservation);
            tbody.appendChild(row);
        });

        return tbody;
    }

    createTableRow(reservation) {
        const row = document.createElement('tr');
        row.dataset.reservationId = reservation.id;

        // User cell
        const userCell = this.createUserCell(reservation);
        row.appendChild(userCell);

        // Room cell
        const roomCell = document.createElement('td');
        roomCell.textContent = reservation.room;
        row.appendChild(roomCell);

        // Date cell
        const dateCell = document.createElement('td');
        dateCell.textContent = reservation.date;
        row.appendChild(dateCell);

        // Time cell
        const timeCell = document.createElement('td');
        timeCell.textContent = reservation.time;
        row.appendChild(timeCell);

        // Status cell
        const statusCell = this.createStatusCell(reservation);
        row.appendChild(statusCell);

        // Add click handler to row
        row.addEventListener('click', () => {
            // Remove selected class from all rows
            document.querySelectorAll('.reservations-table tbody tr').forEach(r => {
                r.classList.remove('selected');
            });

            // Add selected class to clicked row
            row.classList.add('selected');

            // Open panel with reservation details
            this.openPanel(reservation);
        });

        return row;
    }

    createUserCell(reservation) {
        const userCell = document.createElement('td');
        const userDiv = document.createElement('div');
        userDiv.className = 'user-cell';

        const avatar = document.createElement('img');
        avatar.className = 'user-avatar';
        avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reservation.name)}&background=random`;
        avatar.alt = reservation.name;

        const userDetails = document.createElement('div');
        userDetails.className = 'user-details';

        const name = document.createElement('strong');
        name.textContent = reservation.name;

        const email = document.createElement('small');
        email.textContent = reservation.email;

        const userType = document.createElement('span');
        userType.className = 'user-type';
        userType.textContent = reservation.userType;

        userDetails.appendChild(name);
        userDetails.appendChild(email);
        userDetails.appendChild(userType);
        userDiv.appendChild(avatar);
        userDiv.appendChild(userDetails);
        userCell.appendChild(userDiv);

        return userCell;
    }

    createStatusCell(reservation) {
        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge status-${reservation.status}`;
        statusBadge.textContent = reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1);
        statusCell.appendChild(statusBadge);
        return statusCell;
    }

    viewReservationDetails(id) {
        const reservation = this.findReservation(id);
        if (reservation) {
            alert(`Full Details for ${reservation.name}'s Reservation:\n\nUser: ${reservation.name}\nEmail: ${reservation.email}\nUser Type: ${reservation.userType}\n\nRoom: ${reservation.room}\nDate: ${reservation.date}\nTime: ${reservation.time}\nStatus: ${reservation.status}`);
        }
    }

    findReservation(id) {
        for (const category in this.data) {
            const reservation = this.data[category].find(r => r.id === id);
            if (reservation) return reservation;
        }
        return null;
    }

    filterTable(searchTerm) {
        const rows = document.querySelectorAll('.reservations-table tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    updateTabBadges() {
        document.querySelectorAll('.tab').forEach(tab => {
            const tabType = tab.dataset.tab;
            const badge = tab.querySelector('.tab-badge');
            if (badge && this.data[tabType]) {
                badge.textContent = this.data[tabType].length;
            }
        });
    }

    updateTableInfo(count) {
        const tableInfo = document.querySelector('.table-info');
        if (tableInfo) {
            const totalCount = Object.values(this.data).reduce((sum, arr) => sum + arr.length, 0);
            tableInfo.textContent = `Showing ${count} of ${totalCount} reservations`;
        }
    }

    showNotification(message, type = 'info') {
        // Simple alert for now - you can replace this with a nicer notification system
        console.log(`${type.toUpperCase()}: ${message}`);
        alert(message);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation (sidebar and dropdown)
    new NavigationManager();

    // Initialize reservations manager if on reservations page
    if (document.getElementById('tableContent')) {
        new ReservationsManager();
    }
});
