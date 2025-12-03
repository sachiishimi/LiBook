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
        // Update stats
        const totalReservations = document.getElementById('totalReservations');
        const availableRooms = document.getElementById('availableRooms');
        const userCount = document.getElementById('userCount');
        const reservationsChange = document.getElementById('reservationsChange');
        const roomsChange = document.getElementById('roomsChange');
        const userChange = document.getElementById('userChange');

        //if (totalReservations) totalReservations.textContent = '47';
        //if (availableRooms) availableRooms.textContent = '12';
        //if (userCount) userCount.textContent = '125';
        //if (reservationsChange) reservationsChange.textContent = '12%';
        //if (roomsChange) roomsChange.textContent = '3%';
        //if (userChange) userChange.textContent = '8%';
        // Initialize charts
        initializeCharts();
    }
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
    showNotification('Viewing all rooms...', 'info');
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
`;
document.head.appendChild(style);

// ========================================
// SEARCH FUNCTIONALITY
// ========================================
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
    });
}

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