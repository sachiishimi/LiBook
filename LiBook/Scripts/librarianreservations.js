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
        this.setupLogout();
    }

    setupSidebar() {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
        const closeSidebar = document.getElementById('closeSidebar');
        const mainContent = document.querySelector('.main-content');

        // Mobile sidebar toggle
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.add('active');
            });
        }

        // Desktop sidebar toggle
        if (sidebarToggleDesktop && sidebar && mainContent) {
            sidebarToggleDesktop.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
            });
        }

        // Close sidebar
        if (closeSidebar && sidebar) {
            closeSidebar.addEventListener('click', () => {
                sidebar.classList.remove('active');
            });
        }

        // Close sidebar when clicking on nav items (mobile)
        if (sidebar) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('active');
                    }
                });
            });
        }
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
                const target = e.target;
                if (target && target instanceof Node && !userProfile.contains(target)) {
                    userProfile.classList.remove('active');
                }
            });

            // Prevent dropdown from closing when clicking inside it
            userDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    setupLogout() {
        const logoutLink = document.getElementById('logoutLink');
        const logoutForm = document.getElementById('logoutForm');

        if (logoutLink && logoutForm) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (logoutForm instanceof HTMLFormElement) {
                    logoutForm.submit();
                }
            });
        }
    }

    setupResponsiveMenu() {
        // Handle window resize
        window.addEventListener('resize', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && window.innerWidth > 768) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// ========================================
// RESERVATIONS MANAGEMENT WITH SIDE PANEL
// ========================================

class ReservationsManager {
    // Declare all properties at class level (TypeScript requirement)
    data;
    currentTab;
    currentFilter;
    selectedReservation;
    reservationToArchive;

    constructor() {
        // Initialize properties
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
        this.reservationToArchive = null;
        
        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupSearch();
        this.setupFilter();
        this.setupPanel();
        this.setupArchiveModal();
        this.renderTable();
        this.updateTabBadges();
    }

    setupTabSwitching() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                if (tab instanceof HTMLElement && tab.dataset.tab) {
                    this.currentTab = tab.dataset.tab;
                }
                this.closePanel();
                this.renderTable();
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput instanceof HTMLInputElement) {
            searchInput.addEventListener('input', (e) => {
                const target = e.target;
                if (target instanceof HTMLInputElement) {
                    this.filterTable(target.value.toLowerCase());
                }
            });
        }
    }

    setupFilter() {
        const filterSelect = document.getElementById('filterSelect');
        if (filterSelect instanceof HTMLSelectElement) {
            filterSelect.addEventListener('change', (e) => {
                const target = e.target;
                if (target instanceof HTMLSelectElement) {
                    this.currentFilter = target.value;
                    this.renderTable();
                }
            });
        }
    }

    setupArchiveModal() {
        const modal = document.getElementById('archiveModal');
        const cancelBtn = document.getElementById('cancelArchiveBtn');
        const confirmBtn = document.getElementById('confirmArchiveBtn');

        // Close modal when clicking cancel
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeArchiveModal();
            });
        }

        // Archive when clicking confirm
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (this.reservationToArchive) {
                    this.archiveReservation(this.reservationToArchive);
                }
            });
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeArchiveModal();
                }
            });
        }
    }

    openArchiveModal(reservation) {
        this.reservationToArchive = reservation;
        const modal = document.getElementById('archiveModal');
        const message = document.getElementById('archiveModalMessage');
        
        if (message) {
            message.textContent = `Are you sure you want to archive the reservation for ${reservation.name}? This action will move the reservation to the archives.`;
        }
        
        if (modal) {
            // Force display and active class
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        }
    }

    closeArchiveModal() {
        const modal = document.getElementById('archiveModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300); // Wait for transition to complete
        }
        this.reservationToArchive = null;
    }

    setupPanel() {
        const closePanelBtn = document.getElementById('closePanelBtn');
        const panelBackdrop = document.getElementById('panelBackdrop');

        if (closePanelBtn) {
            closePanelBtn.addEventListener('click', () => {
                // Don't close panel if archive modal is open
                const archiveModal = document.getElementById('archiveModal');
                if (archiveModal && archiveModal.classList.contains('active')) {
                    return;
                }
                this.closePanel();
            });
        }

        if (panelBackdrop) {
            panelBackdrop.addEventListener('click', () => {
                // Don't close panel if archive modal is open
                const archiveModal = document.getElementById('archiveModal');
                if (archiveModal && archiveModal.classList.contains('active')) {
                    return;
                }
                this.closePanel();
            });
        }
    }

    openPanel(reservation) {
        this.selectedReservation = reservation;
        const contentWrapper = document.querySelector('.content-wrapper');
        const panelBody = document.getElementById('panelBody');

        if (contentWrapper) {
            contentWrapper.classList.add('panel-open');
        }

        // Populate panel with reservation details
        if (panelBody) {
            panelBody.innerHTML = `
                <div class="details-section user-section">
                    <div class="user-header">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(reservation.name)}&background=random" 
                             alt="${reservation.name}" 
                             class="user-avatar-large">
                        <div class="user-info-large">
                            <h4>${reservation.name}</h4>
                            <p>${reservation.email}</p>
                            <span class="user-type-badge">${reservation.userType}</span>
                        </div>
                    </div>
                </div>

                <div class="details-section">
                    <h5 class="section-title">Reservation Information</h5>
                    <div class="detail-row">
                        <div class="detail-label">
                            <i class="fas fa-door-open"></i>
                            Room
                        </div>
                        <div class="detail-value">${reservation.room}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">
                            <i class="fas fa-calendar"></i>
                            Date
                        </div>
                        <div class="detail-value">${reservation.date}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">
                            <i class="fas fa-clock"></i>
                            Time
                        </div>
                        <div class="detail-value">${reservation.time}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">
                            <i class="fas fa-info-circle"></i>
                            Status
                        </div>
                        <div class="detail-value">
                            <span class="status-badge status-${reservation.status}">
                                ${reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="panel-actions">
                    <button class="btn btn-archive" id="archiveBtn">
                        <i class="fas fa-archive"></i>
                        Archive Reservation
                    </button>
                </div>
            `;

            this.setupPanelActions();
        }
    }

    closePanel() {
        const contentWrapper = document.querySelector('.content-wrapper');
        const panelBody = document.getElementById('panelBody');

        if (contentWrapper) {
            contentWrapper.classList.remove('panel-open');
        }

        if (panelBody) {
            setTimeout(() => {
                panelBody.innerHTML = `
                    <div class="empty-panel">
                        <i class="fas fa-hand-pointer"></i>
                        <p>Select a reservation to view details</p>
                    </div>
                `;
            }, 300);
        }

        document.querySelectorAll('.reservations-table tbody tr').forEach(row => {
            row.classList.remove('selected');
        });

        this.selectedReservation = null;
    }

    archiveReservation(reservation) {
        // Find and remove from current tab
        const currentData = this.data[this.currentTab];
        if (!currentData) return;

        const index = currentData.findIndex(r => r.id === reservation.id);
        if (index !== -1) {
            currentData.splice(index, 1);
        }

        // Close both the modal and the panel after archiving
        this.closeArchiveModal();
        this.closePanel();
        this.renderTable();
        this.updateTabBadges();
        this.showNotification(`Reservation for ${reservation.name} archived successfully!`, "success");
    }

    setupPanelActions() {
        setTimeout(() => {
            const archiveBtn = document.getElementById("archiveBtn");

            if (archiveBtn) {
                archiveBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.selectedReservation) {
                        this.openArchiveModal(this.selectedReservation);
                    }
                });
            }
        }, 100);
    }


    getFilteredData() {
        const currentData = this.data[this.currentTab];
        if (!currentData) return [];
        
        let data = [...currentData];

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
        if (!tableContent) return;

        const data = this.getFilteredData();

        if (data.length === 0) {
            tableContent.innerHTML = this.createEmptyState();
            return;
        }

        const table = document.createElement('table');
        table.className = 'reservations-table';
        table.appendChild(this.createTableHeader());
        table.appendChild(this.createTableBody(data));

        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        wrapper.appendChild(table);

        tableContent.innerHTML = '';
        tableContent.appendChild(wrapper);
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
        ['User', 'Room', 'Date', 'Time', 'Status'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        return thead;
    }

    createTableBody(data) {
        const tbody = document.createElement('tbody');
        data.forEach(reservation => {
            tbody.appendChild(this.createTableRow(reservation));
        });
        return tbody;
    }

    createTableRow(reservation) {
        const row = document.createElement('tr');
        
        if (row instanceof HTMLElement) {
            row.dataset.reservationId = String(reservation.id);
        }

        row.appendChild(this.createUserCell(reservation));
        
        ['room', 'date', 'time'].forEach(field => {
            const cell = document.createElement('td');
            cell.textContent = reservation[field];
            row.appendChild(cell);
        });
        
        row.appendChild(this.createStatusCell(reservation));

        row.addEventListener('click', () => {
            document.querySelectorAll('.reservations-table tbody tr').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
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

    filterTable(searchTerm) {
        document.querySelectorAll('.reservations-table tbody tr').forEach(row => {
            if (row instanceof HTMLElement) {
                const text = (row.textContent || '').toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            }
        });
    }

    updateTabBadges() {
        document.querySelectorAll('.tab').forEach(tab => {
            if (tab instanceof HTMLElement && tab.dataset.tab) {
                const badge = tab.querySelector('.tab-badge');
                const tabData = this.data[tab.dataset.tab];
                if (badge && tabData) {
                    badge.textContent = String(tabData.length);
                }
            }
        });
    }

    updateTableInfo(count) {
        const tableInfo = document.querySelector('.table-info');
        if (tableInfo) {
            tableInfo.textContent = `Showing ${count} of ${count} reservations`;
        }
    }

    showNotification(message, type) {
        type = type || 'success';
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
            type === 'error' ? 'fa-times-circle' : 
                type === 'warning' ? 'fa-exclamation-triangle' : 
                    'fa-info-circle';
        
        notification.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('notification-exit');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager();
    if (document.getElementById('tableContent')) {
        new ReservationsManager();
    }
});
