// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
const mainContent = document.querySelector('.main-content');
const userProfile = document.getElementById('userProfile');
const userDropdown = document.getElementById('userDropdown');
const userSearch = document.getElementById('userSearch');
const addUserBtn = document.getElementById('addUserBtn');

// Tab Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tableSections = document.querySelectorAll('.table-section');

// Current active tab
let activeTab = 'librarians';

// ============================================
// SIDEBAR FUNCTIONALITY
// ============================================

// Sidebar Toggle for Desktop (Collapse/Expand)
if (sidebarToggleDesktop) {
    sidebarToggleDesktop.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
}

// Restore sidebar state on page load
window.addEventListener('load', () => {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }

    // Initialize user management functionality
    initializeUserManagement();
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

// ============================================
// USER PROFILE DROPDOWN
// ============================================

// User Profile Dropdown Toggle
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

// Navigation Active State
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        // Only prevent default for non-logout items and actual navigation
        if (!item.classList.contains('logout') && item.getAttribute('href') !== '#') {
            // Don't prevent default - let the link work normally
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Close mobile sidebar after navigation
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
// USER MANAGEMENT FUNCTIONALITY
// ============================================

function initializeUserManagement() {
    // Initialize tab functionality
    initializeTabs();

    // Initialize search functionality
    initializeSearch();

    // Initialize action buttons
    initializeActionButtons();

    // Initialize modal functionality
    initializeModal();
}

// Tab functionality
function initializeTabs() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update active tab button
    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update active table section
    tableSections.forEach(section => {
        if (section.id === `${tabName}-section`) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });

    // Update active tab and add button text
    activeTab = tabName;
    updateAddButtonText();

    // Clear search when switching tabs
    if (userSearch) {
        userSearch.value = '';
        filterUsers('');
    }
}

function updateAddButtonText() {
    if (!addUserBtn) return;

    const buttonText = addUserBtn.querySelector('span');
    if (activeTab === 'librarians') {
        buttonText.textContent = 'Add Librarian';
    } else {
        buttonText.textContent = 'Add Admin';
    }
}

// Search functionality
function initializeSearch() {
    if (userSearch) {
        userSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            filterUsers(searchTerm);
        });
    }
}

function filterUsers(searchTerm) {
    const activeTable = document.querySelector(`#${activeTab}-section .users-table tbody`);
    if (!activeTable) return;

    const rows = activeTable.querySelectorAll('tr');

    rows.forEach(row => {
        const name = row.querySelector('.user-name').textContent.toLowerCase();
        const username = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const email = row.querySelector('.user-email').textContent.toLowerCase();

        if (searchTerm === '' ||
            name.includes(searchTerm) ||
            username.includes(searchTerm) ||
            email.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Action buttons functionality
function initializeActionButtons() {
    // Add user button
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            addNewUser();
        });
    }

    // Edit and delete buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.icon-btn.small:not(.danger)')) {
            const btn = e.target.closest('.icon-btn.small:not(.danger)');
            editUser(btn);
        } else if (e.target.closest('.icon-btn.small.danger')) {
            const btn = e.target.closest('.icon-btn.small.danger');
            deleteUser(btn);
        }
    });
}

function addNewUser() {
    const userType = activeTab === 'librarians' ? 'librarian' : 'admin';
    openModal(userType);
}

function editUser(button) {
    const row = button.closest('tr');
    const userName = row.querySelector('.user-name').textContent;
    const userType = activeTab === 'librarians' ? 'Librarian' : 'Admin';
    showNotification(`Editing ${userType}: ${userName}`, 'info');
    console.log(`Editing user: ${userName}`);
    // In a real application, this would open an edit form
}

function deleteUser(button) {
    const row = button.closest('tr');
    const userName = row.querySelector('.user-name').textContent;
    const userType = activeTab === 'librarians' ? 'Librarian' : 'Admin';

    if (confirm(`Are you sure you want to delete ${userType} ${userName}?`)) {
        showNotification(`${userType} ${userName} deleted successfully`, 'info');
        console.log(`Deleting user: ${userName}`);
        // In a real application, this would make an API call to delete the user
        // row.remove();
    }
}

// ============================================
// MODAL FUNCTIONALITY
// ============================================

let currentUserType = 'librarian';

function initializeModal() {
    const modal = document.getElementById('addUserModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const submitBtn = document.getElementById('submitBtn');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordToggles = document.querySelectorAll('.password-toggle');

    // Close modal buttons
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closeModal);
    }

    // Submit button
    if (submitBtn) {
        submitBtn.addEventListener('click', submitForm);
    }

    // Password toggle buttons
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Real-time password validation
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            updatePasswordRequirements(e.target.value);
            validatePassword();
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    }

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target.id === 'addUserModal') {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function openModal(userType) {
    currentUserType = userType;
    const modal = document.getElementById('addUserModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtnText = document.getElementById('submitBtnText');

    if (userType === 'admin') {
        modalTitle.textContent = 'Add Administrator';
        submitBtnText.textContent = 'Add Admin';
    } else {
        modalTitle.textContent = 'Add Librarian';
        submitBtnText.textContent = 'Add Librarian';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    resetForm();
}

function closeModal() {
    const modal = document.getElementById('addUserModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    resetForm();
}

function resetForm() {
    const form = document.getElementById('addUserForm');
    if (form) {
        form.reset();
    }

    document.querySelectorAll('.form-control').forEach(input => {
        input.classList.remove('error', 'success');
    });

    document.querySelectorAll('.error-message').forEach(msg => {
        msg.classList.remove('show');
    });

    updatePasswordRequirements('');

    // Reset password toggles
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        const targetId = toggle.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = toggle.querySelector('i');

        if (input) {
            input.type = 'password';
        }

        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
}

function updatePasswordRequirements(password) {
    const reqLength = document.getElementById('reqLength');
    const reqNumber = document.getElementById('reqNumber');
    const reqSymbol = document.getElementById('reqSymbol');

    if (!reqLength || !reqNumber || !reqSymbol) return;

    // Length requirement
    if (password.length >= 8) {
        reqLength.classList.add('met');
        reqLength.querySelector('i').classList.remove('fa-circle');
        reqLength.querySelector('i').classList.add('fa-check-circle');
    } else {
        reqLength.classList.remove('met');
        reqLength.querySelector('i').classList.remove('fa-check-circle');
        reqLength.querySelector('i').classList.add('fa-circle');
    }

    // Number requirement
    if (/\d/.test(password)) {
        reqNumber.classList.add('met');
        reqNumber.querySelector('i').classList.remove('fa-circle');
        reqNumber.querySelector('i').classList.add('fa-check-circle');
    } else {
        reqNumber.classList.remove('met');
        reqNumber.querySelector('i').classList.remove('fa-check-circle');
        reqNumber.querySelector('i').classList.add('fa-circle');
    }

    // Symbol requirement (@, *, &)
    if (/[@*&]/.test(password)) {
        reqSymbol.classList.add('met');
        reqSymbol.querySelector('i').classList.remove('fa-circle');
        reqSymbol.querySelector('i').classList.add('fa-check-circle');
    } else {
        reqSymbol.classList.remove('met');
        reqSymbol.querySelector('i').classList.remove('fa-check-circle');
        reqSymbol.querySelector('i').classList.add('fa-circle');
    }
}

function validatePassword() {
    const password = document.getElementById('password').value;
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('passwordError');

    const isValid = password.length >= 8 && /\d/.test(password) && /[@*&]/.test(password);

    if (password && !isValid) {
        passwordInput.classList.add('error');
        passwordInput.classList.remove('success');
        passwordError.classList.add('show');
    } else if (password && isValid) {
        passwordInput.classList.remove('error');
        passwordInput.classList.add('success');
        passwordError.classList.remove('show');
    } else {
        passwordInput.classList.remove('error', 'success');
        passwordError.classList.remove('show');
    }

    return isValid;
}

function validateConfirmPassword() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    if (confirmPassword && password !== confirmPassword) {
        confirmPasswordInput.classList.add('error');
        confirmPasswordInput.classList.remove('success');
        confirmPasswordError.classList.add('show');
        return false;
    } else if (confirmPassword && password === confirmPassword) {
        confirmPasswordInput.classList.remove('error');
        confirmPasswordInput.classList.add('success');
        confirmPasswordError.classList.remove('show');
        return true;
    } else {
        confirmPasswordInput.classList.remove('error', 'success');
        confirmPasswordError.classList.remove('show');
        return false;
    }
}

function submitForm() {
    let isValid = true;

    // Get form values
    const lastName = document.getElementById('lastName').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const middleName = document.getElementById('middleName').value.trim();
    const suffix = document.getElementById('suffix').value.trim();
    const idNumber = document.getElementById('idNumber').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate Last Name
    if (!lastName) {
        document.getElementById('lastName').classList.add('error');
        document.getElementById('lastNameError').classList.add('show');
        isValid = false;
    } else {
        document.getElementById('lastName').classList.remove('error');
        document.getElementById('lastName').classList.add('success');
        document.getElementById('lastNameError').classList.remove('show');
    }

    // Validate First Name
    if (!firstName) {
        document.getElementById('firstName').classList.add('error');
        document.getElementById('firstNameError').classList.add('show');
        isValid = false;
    } else {
        document.getElementById('firstName').classList.remove('error');
        document.getElementById('firstName').classList.add('success');
        document.getElementById('firstNameError').classList.remove('show');
    }

    // Validate ID Number
    if (!idNumber) {
        document.getElementById('idNumber').classList.add('error');
        document.getElementById('idNumberError').classList.add('show');
        isValid = false;
    } else {
        document.getElementById('idNumber').classList.remove('error');
        document.getElementById('idNumber').classList.add('success');
        document.getElementById('idNumberError').classList.remove('show');
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        document.getElementById('email').classList.add('error');
        document.getElementById('emailError').classList.add('show');
        isValid = false;
    } else {
        document.getElementById('email').classList.remove('error');
        document.getElementById('email').classList.add('success');
        document.getElementById('emailError').classList.remove('show');
    }

    // Validate Username
    if (!username) {
        document.getElementById('username').classList.add('error');
        document.getElementById('usernameError').classList.add('show');
        isValid = false;
    } else {
        document.getElementById('username').classList.remove('error');
        document.getElementById('username').classList.add('success');
        document.getElementById('usernameError').classList.remove('show');
    }

    // Validate Password
    if (!validatePassword() || !password) {
        document.getElementById('password').classList.add('error');
        document.getElementById('passwordError').classList.add('show');
        isValid = false;
    }

    // Validate Confirm Password
    if (!validateConfirmPassword() || !confirmPassword) {
        document.getElementById('confirmPassword').classList.add('error');
        document.getElementById('confirmPasswordError').classList.add('show');
        isValid = false;
    }

    if (isValid) {
        const userData = {
            lastName,
            firstName,
            middleName,
            suffix,
            idNumber,
            email,
            username,
            password,
            userType: currentUserType
        };

        console.log('User data to submit:', userData);

        // Show success notification
        const userTypeText = currentUserType === 'admin' ? 'Administrator' : 'Librarian';
        showNotification(`${userTypeText} added successfully!`, 'success');

        // Close modal after short delay
        setTimeout(() => {
            closeModal();
        }, 1500);

        // Here you would typically make an AJAX call to your server
        // Example:
        // $.ajax({
        //     url: '@Url.Action("AddUser", "AdminDashboard")',
        //     type: 'POST',
        //     data: JSON.stringify(userData),
        //     contentType: 'application/json',
        //     success: function(response) {
        //         showNotification('User added successfully!', 'success');
        //         closeModal();
        //         // Refresh the user table
        //     },
        //     error: function(error) {
        //         showNotification('Error adding user', 'error');
        //     }
        // });
    } else {
        console.log('Form validation failed');
    }
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

    let bgColor = '#2c3e50';
    if (type === 'success') bgColor = '#27ae60';
    if (type === 'error') bgColor = '#c62828';

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${bgColor};
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
// WINDOW RESIZE HANDLER
// ============================================

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

console.log('User Management page initialized successfully!');