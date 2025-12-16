// ========================================
// DOM ELEMENT REFERENCES
// ========================================
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
const mainContent = document.querySelector('.main-content');
const userProfile = document.getElementById('userProfile');

// ========================================
// SIDEBAR FUNCTIONALITY
// ========================================

// Desktop Sidebar Toggle
if (sidebarToggleDesktop) {
    sidebarToggleDesktop.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
}

// Restore sidebar state
window.addEventListener('DOMContentLoaded', () => {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
});

// Mobile Sidebar Toggle
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

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (sidebar && !sidebar.contains(e.target) && menuToggle && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// ========================================
// USER PROFILE DROPDOWN
// ========================================
if (userProfile) {
    userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        userProfile.classList.toggle('active');
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (userProfile && !userProfile.contains(e.target)) {
        userProfile.classList.remove('active');
    }
});

// ========================================
// NAVIGATION
// ========================================
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        if (!item.classList.contains('logout') && item.getAttribute('href') !== '#') {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Close mobile sidebar
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('active');
            }
        }
    });
});

// ========================================
// DASHBOARD DATA INITIALIZATION
// ========================================
function initializeDashboardData() {
    // Check if we're on the dashboard page
    const isDashboard = document.getElementById('totalReservations') !== null;

    if (isDashboard) {
        // Initialize charts
        initializeCharts();

        // If we have recent reservations data, update the UI
        if (window.recentReservations && window.recentReservations.length > 0) {
            updateRecentReservationsUI(window.recentReservations);
        }

        // If we have room availability data, update the UI
        if (window.roomAvailabilityToday && window.roomAvailabilityToday.length > 0) {
            updateRoomAvailabilityUI(window.roomAvailabilityToday);
        }
    }
}

function updateRecentReservationsUI(reservations) {
    const container = document.getElementById('recentReservationsContainer');
    if (!container) return;

    // Clear existing content except the first child (which might be empty state)
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    if (reservations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times empty-icon"></i>
                <p>No Recent Reservations for now.</p>
            </div>
        `;
        return;
    }

    reservations.forEach(reservation => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';

        // Determine icon and color based on status
        let iconClass, iconColor, statusText;
        switch (reservation.Status) {
            case 'Pending':
                iconClass = 'fas fa-clock';
                iconColor = 'yellow';
                statusText = 'New reservation request';
                break;
            case 'Approved':
                iconClass = 'fas fa-user-check';
                iconColor = 'blue';
                statusText = 'Reservation approved';
                break;
            case 'Cancelled':
                iconClass = 'fas fa-times-circle';
                iconColor = 'dark';
                statusText = 'Reservation cancelled';
                break;
            default:
                iconClass = 'fas fa-calendar-plus';
                iconColor = 'blue';
                statusText = 'Reservation request';
        }

        // Format time
        const timeAgo = getTimeAgo(reservation.SubmittedAt);

        activityItem.innerHTML = `
            <div class="activity-icon ${iconColor}">
                <i class="${iconClass}"></i>
            </div>
            <div class="activity-details">
                <p><strong>${statusText}</strong></p>
                <span>${reservation.RoomName} - ${reservation.ReserveeName}</span>
                <small>${formatDate(reservation.BookingDate)}, ${formatTime(reservation.StartTime)} - ${formatTime(reservation.EndTime)}</small>
            </div>
            <span class="activity-time">${timeAgo}</span>
        `;

        container.appendChild(activityItem);
    });
}

function updateRoomAvailabilityUI(rooms) {
    const container = document.getElementById('roomAvailabilityContainer');
    if (!container) return;

    // Clear existing content
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    if (rooms.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-door-closed empty-icon"></i>
                <p>No available rooms for now.</p>
            </div>
        `;
        return;
    }

    rooms.forEach(room => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';

        // Determine status and class
        let statusClass, statusText;
        if (room.Availability === 'Available' && !room.HasBookingToday) {
            statusClass = 'available';
            statusText = 'Available';
        } else if (room.Availability === 'Under Maintenance') {
            statusClass = 'maintenance';
            statusText = 'Maintenance';
        } else if (room.HasBookingToday) {
            statusClass = 'occupied';
            statusText = 'Occupied';
        } else {
            statusClass = 'unknown';
            statusText = room.Availability;
        }

        // Get first letter of room name for rank
        const rankLetter = room.RoomName && room.RoomName.length > 0 ? room.RoomName[0] : 'A';

        bookItem.innerHTML = `
            <div class="book-rank ${statusClass}">${rankLetter}</div>
            <div class="book-info">
                <h4>${room.RoomName}</h4>
                <p>Capacity: ${room.Capacity} people</p>
            </div>
            <span class="book-borrows ${statusClass}">${statusText}</span>
        `;

        container.appendChild(bookItem);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeString) {
    // If timeString is already a TimeSpan object with hours/minutes
    if (typeof timeString === 'object' && timeString.hours !== undefined) {
        const hours = timeString.hours.toString().padStart(2, '0');
        const minutes = timeString.minutes.toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // If it's a string
    if (typeof timeString === 'string') {
        return timeString;
    }

    return '00:00';
}

function getTimeAgo(dateString) {
    if (!dateString) return 'Recently';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ========================================
// CHART.JS CONFIGURATION
// ========================================
let reservationsChart = null;
let roomUtilizationChart = null;

function initializeCharts() {
    // Wait for Chart.js to be available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded!');
        return;
    }

    // Use week data by default for initial chart
    const trendLabels = window.reservationTrendsWeek ?
        window.reservationTrendsWeek.map(item => item.Period) :
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const trendData = window.reservationTrendsWeek ?
        window.reservationTrendsWeek.map(item => item.Count) :
        [0, 0, 0, 0, 0, 0, 0];

    // Process room utilization data
    const roomLabels = window.roomUtilization ?
        window.roomUtilization.map(item => item.Status) :
        ['Available', 'Occupied', 'Maintenance', 'Reserved'];
    const roomData = window.roomUtilization ?
        window.roomUtilization.map(item => item.Count) :
        [0, 0, 0, 0];

    // Reservations Chart
    const reservationsCanvas = document.getElementById('reservationsChart');
    if (reservationsCanvas) {
        const ctx = reservationsCanvas.getContext('2d');

        // Destroy existing chart if it exists
        if (reservationsChart) {
            reservationsChart.destroy();
        }

        reservationsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendLabels,
                datasets: [{
                    label: 'Reservations',
                    data: trendData,
                    borderColor: '#2c3e50',
                    backgroundColor: 'rgba(44, 62, 80, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#2c3e50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#2c3e50',
                        padding: 12,
                        borderRadius: 8,
                        titleFont: {
                            size: 14,
                            family: 'Kumbh Sans'
                        },
                        bodyFont: {
                            size: 13,
                            family: 'Kumbh Sans'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                family: 'Kumbh Sans',
                                size: 12
                            },
                            color: '#7f8c8d'
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                family: 'Kumbh Sans',
                                size: 12
                            },
                            color: '#7f8c8d'
                        }
                    }
                }
            }
        });
    }

    // Room Utilization Chart
    const roomCanvas = document.getElementById('roomUtilizationChart');
    if (roomCanvas) {
        const ctx = roomCanvas.getContext('2d');

        // Destroy existing chart if it exists
        if (roomUtilizationChart) {
            roomUtilizationChart.destroy();
        }

        roomUtilizationChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: roomLabels,
                datasets: [{
                    data: roomData,
                    backgroundColor: [
                        '#27ae60', // Available - Green
                        '#e74c3c', // Occupied - Red
                        '#f39c12', // Maintenance - Orange
                        '#2c3e50', // Reserved - Dark
                        '#3498db', // Other - Blue
                        '#9b59b6'  // Other - Purple
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                family: 'Kumbh Sans',
                                size: 13
                            },
                            color: '#2c3e50',
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#2c3e50',
                        padding: 12,
                        borderRadius: 8,
                        titleFont: {
                            size: 14,
                            family: 'Kumbh Sans'
                        },
                        bodyFont: {
                            size: 13,
                            family: 'Kumbh Sans'
                        },
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                let value = context.parsed || 0;
                                let total = context.dataset.data.reduce((a, b) => a + b, 0);
                                let percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return label + ': ' + value + ' (' + percentage + '%)';
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }
}

// ========================================
// CHART PERIOD SELECTOR
// ========================================
const chartPeriod = document.getElementById('chartPeriod');
if (chartPeriod) {
    chartPeriod.addEventListener('change', (e) => {
        updateReservationsChart(e.target.value);
    });
}

function updateReservationsChart(period) {
    if (!reservationsChart) return;

    let labels, data;

    switch (period) {
        case 'week':
            // Use server-side data
            labels = window.reservationTrendsWeek ?
                window.reservationTrendsWeek.map(item => item.Period) :
                ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data = window.reservationTrendsWeek ?
                window.reservationTrendsWeek.map(item => item.Count) :
                [0, 0, 0, 0, 0, 0, 0];
            break;
        case 'month':
            labels = window.reservationTrendsMonth ?
                window.reservationTrendsMonth.map(item => item.Period) :
                ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            data = window.reservationTrendsMonth ?
                window.reservationTrendsMonth.map(item => item.Count) :
                [0, 0, 0, 0];
            break;
        case 'year':
            labels = window.reservationTrendsYear ?
                window.reservationTrendsYear.map(item => item.Period) :
                ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            data = window.reservationTrendsYear ?
                window.reservationTrendsYear.map(item => item.Count) :
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            break;
        default:
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data = [0, 0, 0, 0, 0, 0, 0];
    }

    // Smooth transition
    reservationsChart.data.labels = labels;
    reservationsChart.data.datasets[0].data = data;
    reservationsChart.update();
}

// ========================================
// NAVIGATION FUNCTIONS
// ========================================
function viewAllReservations() {
    window.location.href = '/AdminDashboard/Reservations';
}

function viewAllRooms() {
    window.location.href = '/AdminDashboard/Rooms';
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'info' ? '#2c3e50' : type === 'success' ? '#27ae60' : '#c62828'};
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

// Add animation styles
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
    .empty-state {
        text-align: center;
        padding: 2rem;
        color: #7f8c8d;
    }
    .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #bdc3c7;
    }
`;
document.head.appendChild(style);

// ========================================
// NOTIFICATION BUTTON
// ========================================
const notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
        showNotification('You have 3 new notifications', 'info');
    });
}

// ========================================
// WINDOW RESIZE HANDLER
// ========================================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && sidebar) {
            sidebar.classList.remove('active');
        }
        if (userProfile) {
            userProfile.classList.remove('active');
        }
    }, 250);
});

// ========================================
// INITIALIZATION
// ========================================
window.addEventListener('load', () => {
    console.log('✅ Dashboard Loading...');

    // Initialize dashboard with a small delay to ensure Chart.js is loaded
    setTimeout(() => {
        initializeDashboardData();
        console.log('✅ Dashboard Initialized Successfully!');
    }, 100);
});

// Alternative: Use DOMContentLoaded as backup
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM Content Loaded');
});