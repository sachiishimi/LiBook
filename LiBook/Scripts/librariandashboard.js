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
// NOTIFICATION SYSTEM
// ========================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('notification-exit');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
        // Add actual search functionality here
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
    console.log('✅ Librarian Dashboard Loading...');

    // Initialize charts with a small delay to ensure Chart.js is loaded
    setTimeout(() => {
        initializeCharts();
        console.log('✅ Librarian Dashboard Initialized Successfully!');
    }, 100);
});

// Alternative: Use DOMContentLoaded as backup
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM Content Loaded');
});

// ========================================
// CHART.JS CONFIGURATION
// ========================================
let bookingHoursChart = null;
let userTypeChart = null;

function initializeCharts() {
    // Wait for Chart.js to be available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded!');
        return;
    }

    // Peak Booking Hours Chart
    const bookingHoursCanvas = document.getElementById('bookingHoursChart');
    if (bookingHoursCanvas) {
        const ctx = bookingHoursCanvas.getContext('2d');

        // Destroy existing chart if it exists
        if (bookingHoursChart) {
            bookingHoursChart.destroy();
        }

        bookingHoursChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
                datasets: [{
                    label: 'Bookings',
                    data: [3, 5, 8, 6, 4, 7, 9, 6, 5, 3],
                    borderColor: '#2c3e50',
                    backgroundColor: 'rgba(44, 62, 80, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#2c3e50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#c62828',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 3
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
                        },
                        callbacks: {
                            label: function (context) {
                                return 'Bookings: ' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 2,
                            font: {
                                family: 'Kumbh Sans',
                                size: 12
                            },
                            color: '#7f8c8d'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        title: {
                            display: true,
                            text: 'Number of Bookings',
                            font: {
                                family: 'Kumbh Sans',
                                size: 13,
                                weight: '600'
                            },
                            color: '#2c3e50'
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
                                size: 11
                            },
                            color: '#7f8c8d',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        title: {
                            display: true,
                            text: 'Time Slot',
                            font: {
                                family: 'Kumbh Sans',
                                size: 13,
                                weight: '600'
                            },
                            color: '#2c3e50'
                        }
                    }
                }
            }
        });
    }

    // User Type Distribution Chart
    const userTypeCanvas = document.getElementById('userTypeChart');
    if (userTypeCanvas) {
        const ctx = userTypeCanvas.getContext('2d');

        // Destroy existing chart if it exists
        if (userTypeChart) {
            userTypeChart.destroy();
        }

        userTypeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Students', 'Faculty', 'Admin', 'Visitors'],
                datasets: [{
                    data: [45, 25, 15, 15],
                    backgroundColor: [
                        '#2c3e50',
                        '#ffc107',
                        '#c62828',
                        '#27ae60'
                    ],
                    borderWidth: 0,
                    hoverOffset: 15
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
                                let percentage = ((value / total) * 100).toFixed(1);
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
        updateBookingHoursChart(e.target.value);
    });
}

function updateBookingHoursChart(period) {
    if (!bookingHoursChart) return;

    let data;

    switch (period) {
        case 'today':
            data = [3, 5, 8, 6, 4, 7, 9, 6, 5, 3];
            break;
        case 'week':
            data = [25, 32, 45, 38, 28, 42, 48, 35, 30, 22];
            break;
        case 'month':
            data = [95, 125, 165, 142, 108, 155, 178, 138, 115, 85];
            break;
        default:
            data = [3, 5, 8, 6, 4, 7, 9, 6, 5, 3];
    }

    bookingHoursChart.data.datasets[0].data = data;
    bookingHoursChart.update();
}

// ========================================
// NAVIGATION FUNCTIONS
// ========================================
function viewAllRooms() {
    window.location.href = '/LibrarianDashboard/Rooms';
}

function viewAllReservations() {
    window.location.href = '/LibrarianDashboard/Reservations';
}

// ========================================
// ADDITIONAL ENHANCEMENTS
// ========================================

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Close sidebar with Escape key
    if (e.key === 'Escape') {
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
        if (userProfile && userProfile.classList.contains('active')) {
            userProfile.classList.remove('active');
        }
    }
});

// Prevent body scroll when mobile sidebar is open
function toggleBodyScroll(enable) {
    document.body.style.overflow = enable ? 'hidden' : '';
}

// Enhanced sidebar toggle with body scroll control
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        const isOpening = !sidebar.classList.contains('active');
        if (isOpening && window.innerWidth <= 768) {
            toggleBodyScroll(false);
        }
    });
}

if (closeSidebar) {
    closeSidebar.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            toggleBodyScroll(true);
        }
    });
}

// Close sidebar and restore scroll on resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        toggleBodyScroll(true);
    }
});

// Enhanced notification system with queue
const notificationQueue = [];
let isShowingNotification = false;

function showQueuedNotification(message, type = 'info') {
    if (isShowingNotification) {
        notificationQueue.push({ message, type });
        return;
    }

    isShowingNotification = true;
    showNotification(message, type);

    setTimeout(() => {
        isShowingNotification = false;
        if (notificationQueue.length > 0) {
            const nextNotification = notificationQueue.shift();
            showQueuedNotification(nextNotification.message, nextNotification.type);
        }
    }, 3300); // Slightly longer than notification duration to account for animations
}

// Update notification button to use queued system
if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
        showQueuedNotification('You have 3 new notifications', 'info');
    });
}

// Performance optimization for resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Reinitialize charts on resize for better responsiveness
        if (bookingHoursChart || userTypeChart) {
            setTimeout(initializeCharts, 100);
        }
    }, 250);
});