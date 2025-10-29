// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
const mainContent = document.querySelector('.main-content');
const userProfile = document.getElementById('userProfile');
const userDropdown = document.getElementById('userDropdown');

// Sidebar Toggle for Desktop (Collapse/Expand)
if (sidebarToggleDesktop) {
    sidebarToggleDesktop.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
}

// Restore sidebar state
window.addEventListener('load', () => {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
});

// Sidebar Toggle for Mobile
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        // Remove collapsed state when opening mobile sidebar
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

// User Profile Dropdown
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

// Navigation Active State
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        // Only prevent default for non-logout items and actual navigation
        if (!item.classList.contains('logout') && item.getAttribute('href') !== '#') {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const page = item.getAttribute('data-page');
            updatePageContent(page);

            // Close mobile sidebar after navigation
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }

            // If it's a real navigation, follow the link after a brief delay
            const href = item.getAttribute('href');
            if (href && href !== '#') {
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            }
        }
    });
});

// Update Page Content
function updatePageContent(page) {
    const contentHeader = document.querySelector('.content-header h1');
    const contentSubtext = document.querySelector('.content-header p');

    const pageContent = {
        'dashboard': {
            title: 'Dashboard',
            subtitle: 'Welcome back, Administrator! Here\'s an overview of your library system.'
        },
        'reservations': {
            title: 'Reservations Management',
            subtitle: 'Manage and monitor all room reservation requests and schedules.'
        },
        'librarian': {
            title: 'Librarian Management',
            subtitle: 'Manage librarian accounts, permissions, and schedules.'
        },
        'rooms': {
            title: 'Room Management',
            subtitle: 'Configure and manage collaboration rooms and their availability.'
        },
        'archives': {
            title: 'Archives',
            subtitle: 'Access historical data and archived reservation records.'
        }
    };

    if (pageContent[page] && contentHeader && contentSubtext) {
        contentHeader.textContent = pageContent[page].title;
        contentSubtext.textContent = pageContent[page].subtitle;
    }
}

// Initialize Dashboard Data
function initializeDashboard() {
    setTimeout(() => {
        // Only update if we're on the dashboard page
        if (document.querySelector('.content-header h1').textContent === 'Dashboard') {
            document.getElementById('totalReservations').textContent = '47';
            document.getElementById('availableRooms').textContent = '12';
            document.getElementById('pendingApprovals').textContent = '5';
            document.getElementById('reservationsChange').textContent = '12%';
            document.getElementById('roomsChange').textContent = '3%';
            document.getElementById('approvalsChange').textContent = '25%';
            initializeCharts();
        }
    }, 500);
}

// Chart.js Configuration
let reservationsChart;
let roomUtilizationChart;

function initializeCharts() {
    // Only initialize charts if we're on the dashboard
    if (document.querySelector('.content-header h1').textContent !== 'Dashboard') {
        return;
    }

    // Reservations Trend Line Chart
    const reservationsCtx = document.getElementById('reservationsChart');
    if (reservationsCtx) {
        reservationsChart = new Chart(reservationsCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Reservations',
                    data: [12, 19, 15, 25, 22, 18, 24],
                    borderColor: '#2c3e50',
                    backgroundColor: 'rgba(44, 62, 80, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#2c3e50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
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

    // Room Utilization Pie Chart
    const roomUtilizationCtx = document.getElementById('roomUtilizationChart');
    if (roomUtilizationCtx) {
        roomUtilizationChart = new Chart(roomUtilizationCtx, {
            type: 'doughnut',
            data: {
                labels: ['Available', 'Occupied', 'Maintenance', 'Reserved'],
                datasets: [{
                    data: [35, 25, 10, 30],
                    backgroundColor: [
                        '#27ae60',
                        '#e74c3c',
                        '#f39c12',
                        '#2c3e50'
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
                                let percentage = ((value / total) * 100).toFixed(1);
                                return label + ': ' + percentage + '%';
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }
}

// Chart period selector
const chartPeriod = document.getElementById('chartPeriod');
if (chartPeriod) {
    chartPeriod.addEventListener('change', (e) => {
        const period = e.target.value;
        updateReservationsChart(period);
    });
}

function updateReservationsChart(period) {
    let labels, data;

    switch (period) {
        case 'week':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data = [12, 19, 15, 25, 22, 18, 24];
            break;
        case 'month':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            data = [65, 78, 82, 71];
            break;
        case 'year':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            data = [245, 289, 312, 267, 298, 275, 256, 241, 289, 312, 298, 276];
            break;
    }

    if (reservationsChart) {
        reservationsChart.data.labels = labels;
        reservationsChart.data.datasets[0].data = data;
        reservationsChart.update();
    }
}

// Navigation Functions
function viewAllReservations() {
    showNotification('Viewing All Reservations...', 'info');
    // Actual navigation would go here
    // window.location.href = '/AdminDashboard/Reservations';
}

function viewAllRooms() {
    showNotification('Viewing All Rooms...', 'info');
    // Actual navigation would go here
    // window.location.href = '/AdminDashboard/Rooms';
}

// Simple notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'info' ? '#2c3e50' : '#c62828'};
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

// Animation styles
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

// Animate stats on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(20px)';

            setTimeout(() => {
                entry.target.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);

            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe stat cards only on dashboard
if (document.querySelector('.content-header h1').textContent === 'Dashboard') {
    document.querySelectorAll('.stat-card').forEach((card, index) => {
        setTimeout(() => {
            observer.observe(card);
        }, index * 100);
    });
}

// Search functionality
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
        // Implement actual search functionality here
    });
}

// Notification button click
const notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
        showNotification('You have 3 new notifications', 'info');
    });
}

// Smooth scroll for cards - only on dashboard
if (document.querySelector('.content-header h1').textContent === 'Dashboard') {
    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
    });
}

window.addEventListener('load', () => {
    // Animate cards only on dashboard
    if (document.querySelector('.content-header h1').textContent === 'Dashboard') {
        document.querySelectorAll('.card').forEach((card, index) => {
            setTimeout(() => {
                card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150 + 500);
        });
    }

    initializeDashboard();
});

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
        if (userProfile) {
            userProfile.classList.remove('active');
        }
    }, 250);
});

console.log('Improved Dashboard initialized successfully!');