// Scripts/librarianreservations.js
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

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => sidebar.classList.add('active'));
        }

        if (sidebarToggleDesktop && sidebar && mainContent) {
            sidebarToggleDesktop.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
            });
        }

        if (closeSidebar && sidebar) {
            closeSidebar.addEventListener('click', () => sidebar.classList.remove('active'));
        }

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
            userProfile.addEventListener('click', (e) => {
                e.stopPropagation();
                userProfile.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!userProfile.contains(e.target)) {
                    userProfile.classList.remove('active');
                }
            });

            userDropdown.addEventListener('click', (e) => e.stopPropagation());
        }
    }

    setupLogout() {
        const logoutLink = document.getElementById('logoutLink');
        const logoutForm = document.getElementById('logoutForm');

        if (logoutLink && logoutForm) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                logoutForm.submit();
            });
        }
    }

    setupResponsiveMenu() {
        window.addEventListener('resize', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && window.innerWidth > 768) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// ========================================
// RESERVATIONS MANAGEMENT
// ========================================

class ReservationsManager {
    constructor() {
        this.currentTab = 'accepted';
        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupSearch();
        this.setupFilter();
        this.setupPanel();
        this.setupModals();
        this.setupTableRowClick();
        this.updateTableInfo();
    }

    setupTabSwitching() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                if (tab.dataset.tab) {
                    this.currentTab = tab.dataset.tab;
                    this.showTableForTab(this.currentTab);
                }
                this.closePanel();
            });
        });
    }

    showTableForTab(tabName) {
        const acceptedTable = document.getElementById('acceptedTable');
        const cancelledTable = document.getElementById('cancelledTable');
        const tableInfo = document.getElementById('tableInfo');

        if (tabName === 'accepted') {
            if (acceptedTable) acceptedTable.style.display = 'block';
            if (cancelledTable) cancelledTable.style.display = 'none';
            const rows = acceptedTable ? acceptedTable.querySelectorAll('tbody tr').length : 0;
            if (tableInfo) tableInfo.textContent = `Showing 1-${rows} of ${rows} reservations`;
        } else {
            if (acceptedTable) acceptedTable.style.display = 'none';
            if (cancelledTable) cancelledTable.style.display = 'block';
            const rows = cancelledTable ? cancelledTable.querySelectorAll('tbody tr').length : 0;
            if (tableInfo) tableInfo.textContent = `Showing 1-${rows} of ${rows} reservations`;
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTable(e.target.value.toLowerCase());
            });
        }
    }

    filterTable(searchTerm) {
        const visibleTable = this.currentTab === 'accepted' ? 'acceptedTable' : 'cancelledTable';
        const table = document.getElementById(visibleTable);
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        let visibleCount = 0;

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const isVisible = text.includes(searchTerm);
            row.style.display = isVisible ? '' : 'none';
            if (isVisible) visibleCount++;
        });

        this.updateTableCount(visibleCount);
    }

    setupFilter() {
        const filterSelect = document.getElementById('filterSelect');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.applyFilter(e.target.value);
            });
        }
    }

    applyFilter(filterValue) {
        const visibleTable = this.currentTab === 'accepted' ? 'acceptedTable' : 'cancelledTable';
        const table = document.getElementById(visibleTable);
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        let visibleCount = 0;

        rows.forEach(row => {
            const userType = row.dataset.userType?.toLowerCase() || '';
            let shouldShow = true;

            switch (filterValue) {
                case 'student':
                    shouldShow = userType.includes('student');
                    break;
                case 'faculty':
                    shouldShow = userType.includes('faculty');
                    break;
                case 'admin':
                    shouldShow = userType.includes('admin');
                    break;
                case 'visitor':
                    shouldShow = userType.includes('visitor');
                    break;
                case 'az':
                    // For sorting, we would need to sort the table
                    break;
                case 'za':
                    // For sorting, we would need to sort the table
                    break;
            }

            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });

        this.updateTableCount(visibleCount);
    }

    setupTableRowClick() {
        document.addEventListener('click', (e) => {
            const row = e.target.closest('tr[data-reservation-id]');
            if (row) {
                const table = row.closest('table');
                if (table) {
                    table.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
                }
                row.classList.add('selected');
                this.showReservationDetails(row);
            }
        });
    }

    showReservationDetails(row) {
        const reservationId = row.dataset.reservationId;
        const userName = row.dataset.name || '';
        const userEmail = row.dataset.email || '';
        const userType = row.dataset.userType || '';
        const roomName = row.dataset.room || '';
        const date = row.dataset.date || '';
        const time = row.dataset.time || '';
        const purpose = row.dataset.purpose || '';
        const program = row.dataset.program || '';
        const studentNumber = row.dataset.studentNumber || '';

        const panelBody = document.getElementById('panelBody');
        if (!panelBody) return;

        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
            contentWrapper.classList.add('panel-open');
        }

        panelBody.innerHTML = `
            <div class="details-section user-section">
                <div class="user-header">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random" 
                         alt="${userName}" 
                         class="user-avatar-large">
                    <div class="user-info-large">
                        <h4>${userName}</h4>
                        <p>${userEmail}</p>
                        <span class="user-type-badge">${userType}</span>
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
                    <div class="detail-value">${roomName}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-calendar"></i>
                        Date
                    </div>
                    <div class="detail-value">${date}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-clock"></i>
                        Time
                    </div>
                    <div class="detail-value">${time}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-info-circle"></i>
                        Purpose
                    </div>
                    <div class="detail-value">${purpose}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-graduation-cap"></i>
                        Program
                    </div>
                    <div class="detail-value">${program}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">
                        <i class="fas fa-id-card"></i>
                        Student Number
                    </div>
                    <div class="detail-value">${studentNumber}</div>
                </div>
            </div>

            <div class="panel-actions">
                ${this.currentTab === 'accepted' ?
                `<button class="btn btn-cancel" id="cancelBtn" data-reservation-id="${reservationId}">
                        <i class="fas fa-ban"></i>
                        Cancel Reservation
                    </button>` :
                `<button class="btn btn-archive" id="archiveBtn" data-reservation-id="${reservationId}">
                        <i class="fas fa-archive"></i>
                        Archive Reservation
                    </button>`
            }
            </div>
        `;

        this.setupPanelActions();
    }

    setupPanelActions() {
        setTimeout(() => {
            const archiveBtn = document.getElementById("archiveBtn");
            const cancelBtn = document.getElementById("cancelBtn");

            if (archiveBtn) {
                archiveBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const reservationId = archiveBtn.dataset.reservationId;
                    const userName = archiveBtn.closest('.panel-actions')?.previousElementSibling?.querySelector('h4')?.textContent || '';
                    this.openArchiveModal(reservationId, userName);
                });
            }

            if (cancelBtn) {
                cancelBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const reservationId = cancelBtn.dataset.reservationId;
                    const userName = cancelBtn.closest('.panel-actions')?.previousElementSibling?.querySelector('h4')?.textContent || '';
                    this.openCancelModal(reservationId, userName);
                });
            }
        }, 100);
    }

    setupModals() {
        // Archive modal
        const archiveOverlay = document.getElementById('archiveModalOverlay');
        const archiveCancelBtn = document.getElementById('cancelArchiveBtn');

        if (archiveCancelBtn) {
            archiveCancelBtn.addEventListener('click', () => this.closeArchiveModal());
        }

        if (archiveOverlay) {
            archiveOverlay.addEventListener('click', () => this.closeArchiveModal());
        }

        // Cancel modal
        const cancelOverlay = document.getElementById('cancelModalOverlay');
        const cancelCancelBtn = document.getElementById('cancelCancelBtn');

        if (cancelCancelBtn) {
            cancelCancelBtn.addEventListener('click', () => this.closeCancelModal());
        }

        if (cancelOverlay) {
            cancelOverlay.addEventListener('click', () => this.closeCancelModal());
        }
    }

    openArchiveModal(reservationId, userName) {
        const overlay = document.getElementById('archiveModalOverlay');
        const modal = document.getElementById('archiveModal');
        const message = document.getElementById('archiveModalMessage');
        const reservationIdInput = document.getElementById('archiveReservationId');

        if (message) {
            message.textContent = `Are you sure you want to archive the reservation for ${userName}?`;
        }

        if (reservationIdInput) {
            reservationIdInput.value = reservationId;
        }

        if (overlay) overlay.classList.add('active');
        if (modal) modal.classList.add('active');
    }

    closeArchiveModal() {
        const overlay = document.getElementById('archiveModalOverlay');
        const modal = document.getElementById('archiveModal');

        if (overlay) overlay.classList.remove('active');
        if (modal) modal.classList.remove('active');
    }

    openCancelModal(reservationId, userName) {
        const overlay = document.getElementById('cancelModalOverlay');
        const modal = document.getElementById('cancelModal');
        const message = document.getElementById('cancelModalMessage');
        const reservationIdInput = document.getElementById('cancelReservationId');

        if (message) {
            message.textContent = `Are you sure you want to cancel the reservation for ${userName}?`;
        }

        if (reservationIdInput) {
            reservationIdInput.value = reservationId;
        }

        if (overlay) overlay.classList.add('active');
        if (modal) modal.classList.add('active');
    }

    closeCancelModal() {
        const overlay = document.getElementById('cancelModalOverlay');
        const modal = document.getElementById('cancelModal');

        if (overlay) overlay.classList.remove('active');
        if (modal) modal.classList.remove('active');
    }

    setupPanel() {
        const closePanelBtn = document.getElementById('closePanelBtn');
        const panelBackdrop = document.getElementById('panelBackdrop');

        if (closePanelBtn) {
            closePanelBtn.addEventListener('click', () => this.closePanel());
        }

        if (panelBackdrop) {
            panelBackdrop.addEventListener('click', () => this.closePanel());
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
    }

    updateTableInfo() {
        const visibleTable = this.currentTab === 'accepted' ? 'acceptedTable' : 'cancelledTable';
        const table = document.getElementById(visibleTable);
        const tableInfo = document.getElementById('tableInfo');

        if (table && tableInfo) {
            const rows = table.querySelectorAll('tbody tr');
            const visibleRows = Array.from(rows).filter(r => r.style.display !== 'none').length;
            tableInfo.textContent = `Showing 1-${visibleRows} of ${visibleRows} reservations`;
        }
    }

    updateTableCount(visibleCount) {
        const tableInfo = document.getElementById('tableInfo');
        if (tableInfo) {
            tableInfo.textContent = `Showing 1-${visibleCount} of ${visibleCount} reservations`;
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager();
    if (document.getElementById('tableContent')) {
        new ReservationsManager();
    }
});