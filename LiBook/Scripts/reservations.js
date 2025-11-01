// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
const mainContent = document.querySelector('.main-content');
const userProfile = document.getElementById('userProfile');
const userDropdown = document.getElementById('userDropdown');
const roomSearch = document.getElementById('roomSearch');
const roomsGrid = document.getElementById('roomsGrid');

// Sample room data - 6 rooms total
const roomsData = [
    {
        id: 1,
        name: "Study Room A",
        type: "Study",
        capacity: 8,
        status: "available",
        allowedUsers: ["Student"]
    },
    {
        id: 2,
        name: "Collaboration Room B",
        type: "Collaboration",
        capacity: 10,
        status: "occupied",
        allowedUsers: ["Student"]
    },
    {
        id: 3,
        name: "Study Room C",
        type: "Study",
        capacity: 6,
        status: "available",
        allowedUsers: ["Student"]
    },
    {
        id: 4,
        name: "Meeting Room D",
        type: "Meeting",
        capacity: 12,
        status: "reserved",
        allowedUsers: ["Student"]
    },
    {
        id: 5,
        name: "Conference Room E",
        type: "Conference",
        capacity: 20,
        status: "available",
        allowedUsers: ["Faculty", "Admin", "Visitor"]
    },
    {
        id: 6,
        name: "Executive Room F",
        type: "Executive",
        capacity: 15,
        status: "available",
        allowedUsers: ["Faculty", "Admin", "Visitor"]
    }
];

// Expanded user database with unique names
const userDatabase = {
    student: [
        { name: 'Pedillaga, Sarah S.', email: 'sarah.pedillaga@university.edu', studentNumber: '2021-00145', program: 'BS Computer Science' },
        { name: 'Maglipon, Denmarc', email: 'denmarc.maglipon@university.edu', studentNumber: '2021-00278', program: 'BS Information Technology' },
        { name: 'Salgado, Julia H.', email: 'julia.salgado@university.edu', studentNumber: '2020-01032', program: 'BS Computer Engineering' },
        { name: 'Falsis, Adessa Isabel', email: 'adessa.falsis@university.edu', studentNumber: '2021-00564', program: 'BS Software Engineering' },
        { name: 'Burbos, Chelsey Moira G.', email: 'chelsey.burbos@university.edu', studentNumber: '2020-00892', program: 'BS Data Science' },
        { name: 'Reyes, Marco Antonio', email: 'marco.reyes@university.edu', studentNumber: '2021-01147', program: 'BS Information Systems' },
        { name: 'Santos, Patricia Lynn', email: 'patricia.santos@university.edu', studentNumber: '2020-01389', program: 'BS Computer Science' },
        { name: 'Cruz, Miguel Angelo', email: 'miguel.cruz@university.edu', studentNumber: '2021-00756', program: 'BS Cybersecurity' },
        { name: 'Garcia, Isabella Marie', email: 'isabella.garcia@university.edu', studentNumber: '2020-00421', program: 'BS Information Technology' },
        { name: 'Torres, Rafael Jr.', email: 'rafael.torres@university.edu', studentNumber: '2021-01298', program: 'BS Computer Science' },
        { name: 'Mendoza, Carlos Miguel', email: 'carlos.mendoza@university.edu', studentNumber: '2020-01567', program: 'BS Software Engineering' },
        { name: 'Villanueva, Sofia Grace', email: 'sofia.villanueva@university.edu', studentNumber: '2021-00834', program: 'BS Data Science' },
        { name: 'Fernandez, Leonardo', email: 'leonardo.fernandez@university.edu', studentNumber: '2020-00245', program: 'BS Information Systems' },
        { name: 'Ramirez, Angelica Rose', email: 'angelica.ramirez@university.edu', studentNumber: '2021-01456', program: 'BS Computer Engineering' },
        { name: 'Morales, Diego Alfonso', email: 'diego.morales@university.edu', studentNumber: '2020-01678', program: 'BS Cybersecurity' },
        { name: 'Castro, Valentina Mae', email: 'valentina.castro@university.edu', studentNumber: '2021-00923', program: 'BS Computer Science' },
        { name: 'Jimenez, Sebastian Paul', email: 'sebastian.jimenez@university.edu', studentNumber: '2020-00534', program: 'BS Information Technology' },
        { name: 'Hernandez, Camila Joy', email: 'camila.hernandez@university.edu', studentNumber: '2021-01589', program: 'BS Data Science' },
        { name: 'Lopez, Adrian James', email: 'adrian.lopez@university.edu', studentNumber: '2020-01234', program: 'BS Software Engineering' },
        { name: 'Gomez, Natasha Claire', email: 'natasha.gomez@university.edu', studentNumber: '2021-00667', program: 'BS Computer Engineering' }
    ],
    faculty: [
        { name: 'Dostoyevsky, Fyodor', email: 'f.dostoyevsky@university.edu', department: 'Computer Science Department' },
        { name: 'Orwell, George', email: 'g.orwell@university.edu', department: 'Information Technology Department' },
        { name: 'Machiavelli, Niccolò', email: 'n.machiavelli@university.edu', department: 'Software Engineering Department' },
        { name: 'Poe, Edgar Allan', email: 'e.poe@university.edu', department: 'Data Science Department' },
        { name: 'Wilde, Oscar', email: 'o.wilde@university.edu', department: 'Cybersecurity Department' },
        { name: 'Aurelius, Marcus', email: 'm.aurelius@university.edu', department: 'Computer Engineering Department' },
        { name: 'Hemingway, Ernest', email: 'e.hemingway@university.edu', department: 'Computer Science Department' },
        { name: 'Fitzgerald, Scott', email: 's.fitzgerald@university.edu', department: 'Information Systems Department' },
        { name: 'Tolkien, J.R.R.', email: 'j.tolkien@university.edu', department: 'Software Engineering Department' },
        { name: 'Austen, Jane', email: 'j.austen@university.edu', department: 'Data Science Department' }
    ],
    visitor: [
        { name: 'Shelby, Thomas', email: 'thomas.shelby@external.com' },
        { name: 'Shelby, Arthur', email: 'arthur.shelby@external.com' },
        { name: 'Shelby, John', email: 'john.shelby@external.com' },
        { name: 'Gray, Polly', email: 'polly.gray@external.com' },
        { name: 'Thorne, Alfie', email: 'alfie.thorne@external.com' },
        { name: 'Changretta, Luca', email: 'luca.changretta@external.com' },
        { name: 'Nelson, Michael', email: 'michael.nelson@external.com' },
        { name: 'Hughes, Sarah', email: 'sarah.hughes@external.com' },
        { name: 'Thompson, David', email: 'david.thompson@external.com' },
        { name: 'Williams, Rebecca', email: 'rebecca.williams@external.com' }
    ],
    admin: [
        { name: 'Specter, Harvey', email: 'harvey.specter@university.edu', department: 'Administrative Office' },
        { name: 'Ross, Mike', email: 'mike.ross@university.edu', department: 'Library Administration' },
        { name: 'Pearson, Jessica', email: 'jessica.pearson@university.edu', department: 'Facility Management' },
        { name: 'Litt, Louis', email: 'louis.litt@university.edu', department: 'Operations Office' },
        { name: 'Paulsen, Donna', email: 'donna.paulsen@university.edu', department: 'Student Services' },
        { name: 'Zane, Robert', email: 'robert.zane@university.edu', department: 'Administrative Office' },
        { name: 'Williams, Rachel', email: 'rachel.williams@university.edu', department: 'Library Administration' },
        { name: 'Tanner, Travis', email: 'travis.tanner@university.edu', department: 'Facility Management' },
        { name: 'Soloff, Jack', email: 'jack.soloff@university.edu', department: 'Operations Office' },
        { name: 'Wheeler, Katrina', email: 'katrina.wheeler@university.edu', department: 'Student Services' }
    ]
};

// Purposes for bookings
const purposes = [
    'Group study session',
    'Research collaboration',
    'Project meeting',
    'Thesis discussion',
    'Exam preparation',
    'Presentation practice',
    'Team brainstorming',
    'Course review',
    'Workshop preparation',
    'Study group meeting',
    'Academic discussion',
    'Laboratory preparation',
    'Class project work',
    'Seminar preparation',
    'Research presentation'
];

// Track used users per room to avoid repetition
const usedUsers = {};

// Generate random bookings based on room's allowed users
function generateBookings(room) {
    const bookings = [];
    const numBookings = Math.floor(Math.random() * 8) + 5; // 5-12 bookings

    // Initialize used users for this room
    if (!usedUsers[room.id]) {
        usedUsers[room.id] = [];
    }

    for (let i = 0; i < numBookings; i++) {
        const userType = room.allowedUsers[Math.floor(Math.random() * room.allowedUsers.length)];
        const userTypeKey = userType.toLowerCase();

        // Get available users (not yet used)
        const availableUsers = userDatabase[userTypeKey].filter(u =>
            !usedUsers[room.id].some(used => used.name === u.name)
        );

        // If all users are used, reset for this room
        if (availableUsers.length === 0) {
            usedUsers[room.id] = usedUsers[room.id].filter(u => u.type !== userTypeKey);
        }

        const finalAvailableUsers = availableUsers.length > 0 ? availableUsers : userDatabase[userTypeKey];
        const userData = finalAvailableUsers[Math.floor(Math.random() * finalAvailableUsers.length)];

        // Mark user as used
        usedUsers[room.id].push({ name: userData.name, type: userTypeKey });

        const bookingId = String(i + 1).padStart(4, '0');
        const randomDate = new Date(2025, 9, Math.floor(Math.random() * 30) + 1); // October 2025
        const hour = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
        const endHour = hour + 1;

        // Generate member names
        const numMembers = Math.floor(Math.random() * (room.capacity - 2)) + 2;
        const members = generateMemberNames(numMembers, userData.name);

        // Random purpose
        const purpose = purposes[Math.floor(Math.random() * purposes.length)];

        bookings.push({
            id: bookingId,
            userType: userType.toUpperCase(),
            user: userData,
            date: `${String(randomDate.getMonth() + 1).padStart(2, '0')}/${String(randomDate.getDate()).padStart(2, '0')}/${randomDate.getFullYear()}`,
            time: `${String(hour).padStart(2, '0')}:00 - ${String(endHour).padStart(2, '0')}:00`,
            members: members,
            purpose: purpose
        });
    }

    return bookings;
}

// Generate member names
function generateMemberNames(count, excludeName) {
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
        'William', 'Elizabeth', 'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Sarah',
        'Thomas', 'Karen', 'Charles', 'Nancy', 'Christopher', 'Lisa', 'Daniel', 'Betty',
        'Matthew', 'Margaret', 'Anthony', 'Sandra', 'Mark', 'Ashley', 'Donald', 'Kimberly'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
        'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
        'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'];

    const members = [];
    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${lastName}, ${firstName}`;

        if (fullName !== excludeName && !members.includes(fullName)) {
            members.push(fullName);
        }
    }
    return members;
}

// ============================================
// SIDEBAR FUNCTIONALITY
// ============================================

if (sidebarToggleDesktop) {
    sidebarToggleDesktop.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });
}

// Restore sidebar state on page load
window.addEventListener('load', () => {
    // Initialize rooms
    initializeRooms();
});

// Sidebar Toggle for Mobile
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

// Close mobile sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// ============================================
// USER PROFILE DROPDOWN
// ============================================

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

// ============================================
// NAVIGATION ACTIVE STATE
// ============================================

const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        if (!item.classList.contains('logout') && item.getAttribute('href') !== '#') {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        }
    });
});

// Set active nav item based on current page
window.addEventListener('load', () => {
    const currentPath = window.location.pathname;
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href)) {
            item.classList.add('active');
        }
    });
});

// ============================================
// ROOMS FUNCTIONALITY
// ============================================

// Initialize rooms grid
function initializeRooms() {
    if (!roomsGrid) return;

    roomsGrid.innerHTML = '';

    roomsData.forEach(room => {
        const roomCard = createRoomCard(room);
        roomsGrid.appendChild(roomCard);
    });
}

// Create room card element
function createRoomCard(room) {
    const card = document.createElement('div');
    card.className = 'room-card visible';
    card.setAttribute('data-room-name', room.name.toLowerCase());
    card.setAttribute('data-room-type', room.type.toLowerCase());
    card.setAttribute('data-status', room.status);

    // Status badge text
    let statusText = room.status.charAt(0).toUpperCase() + room.status.slice(1);

    // Create allowed users text
    const allowedUsersText = room.allowedUsers.length > 1
        ? room.allowedUsers.join(', ')
        : room.allowedUsers[0];

    card.innerHTML = `
        <div class="room-header">
            <h3 class="room-name">${room.name}</h3>
            <p class="room-type">${room.type}</p>
        </div>
        <span class="room-status ${room.status}">${statusText}</span>
        <div class="room-allowed-users">
            <i class="fas fa-users"></i>
            <span>For: ${allowedUsersText}</span>
        </div>
        <div class="room-details">
            <div class="room-capacity">
                <i class="fas fa-user-friends"></i>
                <span>${room.capacity} people</span>
            </div>
            <div class="room-price">
                <i class="fas fa-door-open"></i>
                <span>${room.type} Room</span>
            </div>
        </div>
    `;

    // Add click event to the entire card
    card.addEventListener('click', () => {
        showRoomModal(room);
    });
    card.style.cursor = 'pointer';

    return card;
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

if (roomSearch) {
    roomSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterRooms(searchTerm);
    });
}

// Filter rooms based on search term
function filterRooms(searchTerm) {
    const roomCards = document.querySelectorAll('.room-card');

    roomCards.forEach(card => {
        const roomName = card.getAttribute('data-room-name');
        const roomType = card.getAttribute('data-room-type');

        if (searchTerm === '' ||
            roomName.includes(searchTerm) ||
            roomType.includes(searchTerm)) {
            card.classList.remove('hidden');
            card.classList.add('visible');
        } else {
            card.classList.remove('visible');
            card.classList.add('hidden');
        }
    });
}

// ============================================
// NOTIFICATION FUNCTIONALITY
// ============================================

// Notification button click
const notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
        showNotification('You have 3 new notifications', 'info');
    });
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

// Animation styles for notifications
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

// ============================================
// ROOM MODAL FUNCTIONALITY
// ============================================

function showRoomModal(room) {
    // Remove existing modal if any
    const existingModal = document.getElementById('roomModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Prevent body scroll
    document.body.classList.add('modal-open');

    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'roomModal';
    modal.className = 'modal-overlay';

    // Generate bookings for this room
    const bookings = generateBookings(room);

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <button class="modal-back-btn" onclick="closeRoomModal()">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2>${room.name.toUpperCase()}</h2>
                <div class="modal-actions">
                    <button class="modal-action-btn cancel-selected" onclick="cancelSelected()">
                        <i class="fas fa-times-circle"></i>
                        <span>Cancel Selected</span>
                    </button>
                    <button class="modal-action-btn cancel-all" onclick="cancelAll('${room.name}')">
                        <i class="fas fa-ban"></i>
                        <span>Cancel All</span>
                    </button>
                </div>
            </div>
            
            <div class="modal-body">
                <div class="bookings-table-wrapper">
                    <table class="bookings-table">
                        <thead>
                            <tr>
                                <th width="50"></th>
                                <th>BOOKING ID</th>
                                <th>USER TYPE</th>
                                <th>USER</th>
                                <th>DATE</th>
                                <th>TIME</th>
                                <th>NO. OF MEMBERS</th>
                            </tr>
                        </thead>
                        <tbody id="bookingsTableBody">
                            ${bookings.map(booking => `
                                <tr data-booking='${JSON.stringify(booking).replace(/'/g, "&#39;")}'>
                                    <td>
                                        <input type="checkbox" class="booking-checkbox" data-booking-id="${booking.id}">
                                    </td>
                                    <td>${booking.id}</td>
                                    <td><span class="user-type-badge ${booking.userType.toLowerCase()}">${booking.userType}</span></td>
                                    <td>${booking.user.name}</td>
                                    <td>${booking.date}</td>
                                    <td>${booking.time}</td>
                                    <td>${booking.members.length}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add click handlers for table rows
    const tableRows = modal.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', (e) => {
            // Don't trigger if clicking on checkbox
            if (e.target.classList.contains('booking-checkbox')) {
                return;
            }
            const bookingData = JSON.parse(row.getAttribute('data-booking'));
            showUserDetailModal(bookingData);
        });
    });

    // Trigger animation
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeRoomModal() {
    const modal = document.getElementById('roomModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function cancelSelected() {
    const checkboxes = document.querySelectorAll('.booking-checkbox:checked');
    if (checkboxes.length === 0) {
        showNotification('Please select bookings to cancel', 'info');
        return;
    }

    const count = checkboxes.length;
    showNotification(`Cancelled ${count} booking${count > 1 ? 's' : ''}`, 'info');

    // Remove selected rows with animation
    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        row.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => row.remove(), 300);
    });
}

function cancelAll(roomName) {
    if (confirm(`Are you sure you want to cancel all bookings for ${roomName}?`)) {
        showNotification(`All bookings for ${roomName} have been cancelled`, 'info');
        closeRoomModal();
    }
}

// ============================================
// USER DETAIL MODAL FUNCTIONALITY
// ============================================

function showUserDetailModal(booking) {
    // Remove existing detail modal if any
    const existingDetailModal = document.getElementById('userDetailModal');
    if (existingDetailModal) {
        existingDetailModal.remove();
    }

    const detailModal = document.createElement('div');
    detailModal.id = 'userDetailModal';
    detailModal.className = 'user-detail-modal';

    const userType = booking.userType.toLowerCase();
    const user = booking.user;

    let gridHTML = `
        <div class="detail-grid">
            <div class="detail-section">
                <div class="detail-label">Full Name</div>
                <div class="detail-value">${user.name}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">Email Address</div>
                <div class="detail-value">${user.email}</div>
            </div>
    `;

    // Add user type specific fields
    if (userType === 'student') {
        gridHTML += `
            <div class="detail-section">
                <div class="detail-label">Student Number</div>
                <div class="detail-value">${user.studentNumber}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">Program</div>
                <div class="detail-value">${user.program}</div>
            </div>
        `;
    } else if (userType === 'faculty' || userType === 'admin') {
        gridHTML += `
            <div class="detail-section full-width">
                <div class="detail-label">Department</div>
                <div class="detail-value">${user.department}</div>
            </div>
        `;
    }

    gridHTML += `
            <div class="detail-section">
                <div class="detail-label">Booking Date</div>
                <div class="detail-value">${booking.date}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">Time Slot</div>
                <div class="detail-value">${booking.time}</div>
            </div>
        </div>
    `;

    // Add full-width sections
    let fullWidthHTML = `
        <div class="detail-section full-width">
            <div class="detail-label">Purpose of Reservation</div>
            <div class="detail-value">${booking.purpose}</div>
        </div>
        <div class="detail-section full-width">
            <div class="detail-label">Members (${booking.members.length})</div>
            <div class="members-list">
                ${booking.members.map(member => `
                    <div class="member-item">
                        <i class="fas fa-user"></i>
                        <span>${member}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    detailModal.innerHTML = `
        <div class="user-detail-content">
            <div class="user-detail-header">
                <h3>Booking Details - ${booking.id}</h3>
                <button class="user-detail-close" onclick="closeUserDetailModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="user-detail-body">
                ${gridHTML}
                ${fullWidthHTML}
            </div>
        </div>
    `;

    document.body.appendChild(detailModal);

    // Trigger animation
    setTimeout(() => detailModal.classList.add('active'), 10);
}

function closeUserDetailModal() {
    const modal = document.getElementById('userDetailModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('roomModal');
    if (modal && e.target === modal) {
        closeRoomModal();
    }

    const detailModal = document.getElementById('userDetailModal');
    if (detailModal && e.target === detailModal) {
        closeUserDetailModal();
    }
});

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeUserDetailModal();
        closeRoomModal();
    }
});

// ============================================
// WINDOW RESIZE HANDLER
// ============================================

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

console.log('Reservations page initialized successfully!');