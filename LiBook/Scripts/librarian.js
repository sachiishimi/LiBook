// DOM Elements
let menuToggle, sidebar, closeSidebar, sidebarToggleDesktop, mainContent;
let userProfile, userDropdown, userSearch, addUserBtn;
let tabBtns, tableSections, navItems;

// Modal Elements
let addUserModal, editUserModal, confirmationModal;
let editUserForm, confirmationForm;

// Current active tab
let activeTab = 'librarians';
let currentUserType = 'librarian';
let currentEditUserData = null;
let pendingEditData = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    initializeDOMElements();
    initializeSidebar();
    initializeUserProfile();
    initializeNavigation();
    initializeUserManagement();
    initializeModals();
    initializeNotifications();

    console.log('User Management page initialized successfully!');
});

function initializeDOMElements() {
    // Sidebar elements
    menuToggle = document.getElementById('menuToggle');
    sidebar = document.getElementById('sidebar');
    closeSidebar = document.getElementById('closeSidebar');
    sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
    mainContent = document.querySelector('.main-content');

    // User profile elements
    userProfile = document.getElementById('userProfile');
    userDropdown = document.getElementById('userDropdown');
    userSearch = document.getElementById('userSearch');
    addUserBtn = document.getElementById('addUserBtn');

    // Tab elements
    tabBtns = document.querySelectorAll('.tab-btn');
    tableSections = document.querySelectorAll('.table-section');

    // Navigation elements
    navItems = document.querySelectorAll('.nav-item');

    // Modal elements
    addUserModal = document.getElementById('addUserModal');
    editUserModal = document.getElementById('editUserModal');
    confirmationModal = document.getElementById('confirmationModal');
    editUserForm = document.getElementById('editUserForm');
    confirmationForm = document.getElementById('confirmationForm');
}

// ============================================
// SIDEBAR FUNCTIONALITY
// ============================================

function initializeSidebar() {
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
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }

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
}

// ============================================
// USER PROFILE DROPDOWN
// ============================================

function initializeUserProfile() {
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
}

// ============================================
// NAVIGATION ACTIVE STATE
// ============================================

function initializeNavigation() {
    // Navigation Active State
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
    const currentPath = window.location.pathname;
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href.split('/').pop())) {
            item.classList.add('active');
        }
    });
}

// ============================================
// USER MANAGEMENT FUNCTIONALITY
// ============================================

function initializeUserManagement() {
    initializeTabs();
    initializeSearch();
    initializeActionButtons();
}

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
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // Update active table section
    tableSections.forEach(section => {
        section.classList.toggle('active', section.id === `${tabName}-section`);
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
    buttonText.textContent = activeTab === 'librarians' ? 'Add Librarian' : 'Add Admin';
}

function initializeSearch() {
    if (userSearch) {
        userSearch.addEventListener('input', (e) => {
            filterUsers(e.target.value.toLowerCase().trim());
        });
    }
}

function filterUsers(searchTerm) {
    const activeTable = document.querySelector(`#${activeTab}-section .users-table tbody`);
    if (!activeTable) return;

    const rows = activeTable.querySelectorAll('tr');
    rows.forEach(row => {
        const name = row.querySelector('.user-name')?.textContent.toLowerCase() || '';
        const username = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        const email = row.querySelector('.user-email')?.textContent.toLowerCase() || '';

        const shouldShow = searchTerm === '' ||
            name.includes(searchTerm) ||
            username.includes(searchTerm) ||
            email.includes(searchTerm);

        row.style.display = shouldShow ? '' : 'none';
    });
}

function initializeActionButtons() {
    // Add user button
    if (addUserBtn) {
        addUserBtn.addEventListener('click', addNewUser);
    }

    // Edit and delete buttons - Use event delegation
    document.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.icon-btn.small:not(.danger)');
        const deleteBtn = e.target.closest('.icon-btn.small.danger');

        if (editBtn) {
            e.preventDefault();
            e.stopPropagation();
            editUser(editBtn);
        } else if (deleteBtn) {
            e.preventDefault();
            e.stopPropagation();
            deleteUser(deleteBtn);
        }
    });
}

function addNewUser() {
    currentUserType = activeTab === 'librarians' ? 'librarian' : 'admin';
    openAddModal(currentUserType);
}

function editUser(button) {
    const row = button.closest('tr');
    if (!row) return;

    const userNameElement = row.querySelector('.user-name');
    const userEmailElement = row.querySelector('.user-email');
    const usernameElement = row.querySelector('td:nth-child(2)');

    // Parse full name
    const fullName = userNameElement?.textContent.trim() || '';
    const nameParts = fullName.split(' ');

    // Prepare user data
    const userData = {
        id: row.dataset.userId || generateId(),
        firstName: nameParts[0] || '',
        middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '',
        lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
        suffix: '',
        email: userEmailElement?.textContent.trim() || '',
        username: usernameElement?.textContent.trim() || '',
        userType: activeTab === 'admins' ? 'admin' : 'librarian'
    };

    openEditModal(userData);
}

function generateId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

function deleteUser(button) {
    const row = button.closest('tr');
    const userName = row.querySelector('.user-name')?.textContent || 'User';
    const userType = activeTab === 'librarians' ? 'Librarian' : 'Admin';

    if (confirm(`Are you sure you want to delete ${userType} "${userName}"?\n\nThis action cannot be undone.`)) {
        showNotification(`${userType} "${userName}" deleted successfully`, 'success');
        console.log(`Deleting user: ${userName}`);
        // In a real application: 
        // - Send delete request to server
        // - row.remove();
    }
}

// ============================================
// MODAL FUNCTIONALITY
// ============================================

function initializeModals() {
    initializeAddUserModal();
    initializeEditUserModal();
    initializeConfirmationModal();
    initializePasswordToggles();
    initializeModalEvents();
}

// ============================================
// ADD USER MODAL
// ============================================

function initializeAddUserModal() {
    const closeModalBtn = document.getElementById('closeAddModalBtn');
    const cancelModalBtn = document.getElementById('cancelAddModalBtn');
    const submitBtn = document.getElementById('submitAddBtn');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (closeModalBtn) closeModalBtn.addEventListener('click', () => closeModal('addUserModal'));
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', () => closeModal('addUserModal'));
    if (submitBtn) submitBtn.addEventListener('click', submitAddForm);

    if (passwordInput) {
        passwordInput.addEventListener('focus', () => {
            const reqBox = document.getElementById('passwordRequirements');
            if (reqBox) reqBox.style.display = 'block';
        });
        passwordInput.addEventListener('input', (e) => {
            const reqBox = document.getElementById('passwordRequirements');
            if (reqBox) reqBox.style.display = 'block';
            updatePasswordRequirements(e.target.value, 'add');
            validatePassword();
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    }

    // Real-time validation for all fields
    const addFormInputs = ['lastName', 'firstName', 'idNumber', 'email', 'username'];
    addFormInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('blur', () => validateAddField(inputId));
            input.addEventListener('input', () => {
                // Clear error when user starts typing
                const errorElement = document.getElementById(`${inputId}Error`);
                if (errorElement && input.value.trim()) {
                    input.classList.remove('error');
                    errorElement.classList.remove('show');
                }
            });
        }
    });
}

function validateAddField(fieldId) {
    const input = document.getElementById(fieldId);
    const value = input?.value.trim();
    let isValid = true;

    if (fieldId === 'email') {
        isValid = value && isValidEmail(value);
    } else {
        isValid = !!value;
    }

    toggleValidation(fieldId, `${fieldId}Error`, isValid, !!value);
    return isValid;
}

function openAddModal(userType) {
    const modal = document.getElementById('addUserModal');

    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        resetAddForm();

        // Focus first input
        setTimeout(() => {
            const firstInput = document.getElementById('firstName');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function resetAddForm() {
    const form = document.getElementById('addUserForm');
    if (form) form.reset();

    document.querySelectorAll('#addUserModal .form-control').forEach(input => {
        input.classList.remove('error', 'success');
    });

    document.querySelectorAll('#addUserModal .error-message').forEach(msg => {
        msg.classList.remove('show');
    });

    updatePasswordRequirements('', 'add');
    resetPasswordToggles(['password', 'confirmPassword']);
}

//function submitAddForm(e) {
//    e.preventDefault();

//    // Validate all fields
//    const isValid = validateAddForm();

//    if (!isValid) {
//        showNotification('Please fill in all required fields correctly', 'error');
//        // Focus first error field
//        const firstError = document.querySelector('#addUserModal .form-control.error');
//        if (firstError) firstError.focus();
//        return;
//    }

//    // Collect form data
//    const formData = {
//        lastName: document.getElementById('lastName')?.value.trim(),
//        firstName: document.getElementById('firstName')?.value.trim(),
//        middleName: document.getElementById('middleName')?.value.trim(),
//        suffix: document.getElementById('suffix')?.value.trim(),
//        idNumber: document.getElementById('idNumber')?.value.trim(),
//        email: document.getElementById('email')?.value.trim(),
//        username: document.getElementById('username')?.value.trim(),
//        password: document.getElementById('password')?.value,
//        userType: currentUserType
//    };

//    console.log('Adding new user:', formData);

//    // Show loading state
//    const submitBtn = document.getElementById('submitAddBtn');
//    const originalText = submitBtn.innerHTML;
//    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
//    submitBtn.disabled = true;

//    // Simulate API call
//    setTimeout(() => {
//        submitBtn.innerHTML = originalText;
//        submitBtn.disabled = false;

//        showNotification(`${currentUserType === 'admin' ? 'Administrator' : 'Librarian'} added successfully!`, 'success');
//        setTimeout(() => closeModal('addUserModal'), 1500);
//    }, 1000);
//}

function validateAddForm() {
    const fields = [
        { id: 'lastName', validator: (v) => !!v },
        { id: 'firstName', validator: (v) => !!v },
        { id: 'idNumber', validator: (v) => !!v },
        { id: 'email', validator: (v) => v && isValidEmail(v) },
        { id: 'username', validator: (v) => !!v }
    ];

    let isValid = true;

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const value = input?.value.trim() || '';
        const fieldValid = field.validator(value);

        toggleValidation(field.id, `${field.id}Error`, fieldValid, !!value);

        if (!fieldValid) isValid = false;
    });

    if (!validatePassword()) isValid = false;
    if (!validateConfirmPassword()) isValid = false;

    return isValid;
}

// ============================================
// EDIT USER MODAL
// ============================================

function initializeEditUserModal() {
    const closeEditModalBtn = document.getElementById('closeEditModalBtn');
    const cancelEditModalBtn = document.getElementById('cancelEditModalBtn');
    const submitEditBtn = document.getElementById('submitEditBtn');
    const editPasswordInput = document.getElementById('editNewPassword');
    const editConfirmPasswordInput = document.getElementById('editConfirmPassword');

    if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', () => closeModal('editUserModal'));
    if (cancelEditModalBtn) cancelEditModalBtn.addEventListener('click', () => closeModal('editUserModal'));
    if (submitEditBtn) submitEditBtn.addEventListener('click', submitEditForm);

    if (editPasswordInput) {
        editPasswordInput.addEventListener('input', (e) => {
            const value = e.target.value;
            updatePasswordRequirements(value, 'edit');
            validateEditPassword();

            // Show/hide requirements section
            const requirementsSection = document.getElementById('editPasswordRequirements');
            if (requirementsSection) {
                requirementsSection.style.display = value.length > 0 ? 'block' : 'none';
            }
        });
    }

    if (editConfirmPasswordInput) {
        editConfirmPasswordInput.addEventListener('input', validateEditConfirmPassword);
    }

    // Real-time validation for edit fields
    const editFormInputs = ['editLastName', 'editFirstName', 'editEmail', 'editUsername'];
    editFormInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('blur', () => {
                const value = input.value.trim();
                let isValid = true;

                if (inputId === 'editEmail') {
                    isValid = value && isValidEmail(value);
                } else {
                    isValid = !!value;
                }

                toggleValidation(inputId, `${inputId}Error`, isValid, !!value);
            });

            input.addEventListener('input', () => {
                const errorElement = document.getElementById(`${inputId}Error`);
                if (errorElement && input.value.trim()) {
                    input.classList.remove('error');
                    errorElement.classList.remove('show');
                }
            });
        }
    });
}

function openEditModal(userData) {
    currentEditUserData = userData;
    const modal = document.getElementById('editUserModal');

    if (modal) {  // ✅ Remove the modalTitle check
        // Populate form fields
        document.getElementById('editFirstName').value = userData.firstName;
        document.getElementById('editLastName').value = userData.lastName;
        document.getElementById('editMiddleName').value = userData.middleName;
        document.getElementById('editSuffix').value = userData.suffix;
        document.getElementById('editEmail').value = userData.email;
        document.getElementById('editUsername').value = userData.username;

        // Clear password fields
        document.getElementById('editNewPassword').value = '';
        document.getElementById('editConfirmPassword').value = '';

        // Hide password requirements
        const requirementsSection = document.getElementById('editPasswordRequirements');
        if (requirementsSection) {
            requirementsSection.style.display = 'none';
        }

        // Clear all validation states
        document.querySelectorAll('#editUserModal .form-control').forEach(input => {
            input.classList.remove('error', 'success');
        });

        document.querySelectorAll('#editUserModal .error-message').forEach(msg => {
            msg.classList.remove('show');
        });

        updatePasswordRequirements('', 'edit');
        resetPasswordToggles(['editNewPassword', 'editConfirmPassword']);

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first input
        setTimeout(() => {
            const firstInput = document.getElementById('editFirstName');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function submitEditForm(e) {
    e.preventDefault();

    // Validate edit form
    const isValid = validateEditForm();

    if (!isValid) {
        showNotification('Please fill in all required fields correctly', 'error');
        const firstError = document.querySelector('#editUserModal .form-control.error');
        if (firstError) firstError.focus();
        return;
    }

    // Collect form data
    const userId = document.getElementById('editUserId')?.value;
    const newPassword = document.getElementById('editNewPassword')?.value;

    pendingEditData = {
        id: userId,
        lastName: document.getElementById('editLastName')?.value.trim(),
        firstName: document.getElementById('editFirstName')?.value.trim(),
        middleName: document.getElementById('editMiddleName')?.value.trim(),
        suffix: document.getElementById('editSuffix')?.value.trim(),
        email: document.getElementById('editEmail')?.value.trim(),
        username: document.getElementById('editUsername')?.value.trim(),
        newPassword: newPassword || null,
        userType: currentEditUserData?.userType
    };

    // Close edit modal and open confirmation modal
    closeModal('editUserModal');
    setTimeout(() => {
        openConfirmationModal();
    }, 300);
}

function validateEditForm() {
    const fields = [
        { id: 'editLastName', validator: (v) => !!v },
        { id: 'editFirstName', validator: (v) => !!v },
        { id: 'editEmail', validator: (v) => v && isValidEmail(v) },
        { id: 'editUsername', validator: (v) => !!v }
    ];

    let isValid = true;

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const value = input?.value.trim() || '';
        const fieldValid = field.validator(value);

        toggleValidation(field.id, `${field.id}Error`, fieldValid, !!value);

        if (!fieldValid) isValid = false;
    });

    // Validate password only if provided
    const newPassword = document.getElementById('editNewPassword')?.value;
    if (newPassword) {
        if (!validateEditPassword()) isValid = false;
        if (!validateEditConfirmPassword()) isValid = false;
    }

    return isValid;
}

// ============================================
// CONFIRMATION MODAL
// ============================================

function initializeConfirmationModal() {
    const closeConfirmModalBtn = document.getElementById('closeConfirmModalBtn');
    const backToEditBtn = document.getElementById('backToEditBtn');
    const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');
    const adminPasswordInput = document.getElementById('adminPassword');

    if (closeConfirmModalBtn) closeConfirmModalBtn.addEventListener('click', handleCloseConfirmation);
    if (backToEditBtn) backToEditBtn.addEventListener('click', backToEdit);
    if (confirmSubmitBtn) confirmSubmitBtn.addEventListener('click', confirmEditSubmit);

    // Clear error when typing
    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('input', () => {
            const errorElement = document.getElementById('adminPasswordError');
            if (errorElement) {
                errorElement.classList.remove('show');
            }
            adminPasswordInput.classList.remove('error');
        });
    }

    // Handle Enter key in confirmation modal
    if (confirmationForm) {
        confirmationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            confirmEditSubmit();
        });
    }
}

function openConfirmationModal() {
    if (confirmationModal) {
        // Clear previous password
        const adminPasswordInput = document.getElementById('adminPassword');
        if (adminPasswordInput) {
            adminPasswordInput.value = '';
            adminPasswordInput.classList.remove('error', 'success');
        }

        const errorElement = document.getElementById('adminPasswordError');
        if (errorElement) {
            errorElement.classList.remove('show');
        }

        resetPasswordToggles(['adminPassword']);

        confirmationModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus on password input
        setTimeout(() => {
            if (adminPasswordInput) {
                adminPasswordInput.focus();
            }
        }, 100);
    }
}

function handleCloseConfirmation() {
    if (confirm('Are you sure you want to cancel? Your changes will not be saved.')) {
        closeModal('confirmationModal');
        pendingEditData = null;
    }
}

function backToEdit() {
    closeModal('confirmationModal');

    // Reopen edit modal with current data
    setTimeout(() => {
        if (currentEditUserData && pendingEditData) {
            // Restore the pending edit data to the form
            document.getElementById('editUserId').value = pendingEditData.id;
            document.getElementById('editLastName').value = pendingEditData.lastName;
            document.getElementById('editFirstName').value = pendingEditData.firstName;
            document.getElementById('editMiddleName').value = pendingEditData.middleName;
            document.getElementById('editSuffix').value = pendingEditData.suffix;
            document.getElementById('editEmail').value = pendingEditData.email;
            document.getElementById('editUsername').value = pendingEditData.username;

            if (pendingEditData.newPassword) {
                document.getElementById('editNewPassword').value = pendingEditData.newPassword;
                document.getElementById('editConfirmPassword').value = pendingEditData.newPassword;
                updatePasswordRequirements(pendingEditData.newPassword, 'edit');
                const requirementsSection = document.getElementById('editPasswordRequirements');
                if (requirementsSection) {
                    requirementsSection.style.display = 'block';
                }
            }

            editUserModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }, 300);
}

function confirmEditSubmit() {
    const adminPassword = document.getElementById('adminPassword')?.value;
    const adminPasswordInput = document.getElementById('adminPassword');
    const errorElement = document.getElementById('adminPasswordError');
    const confirmBtn = document.getElementById('confirmSubmitBtn');

    if (!adminPassword) {
        if (errorElement) errorElement.classList.add('show');
        if (adminPasswordInput) adminPasswordInput.classList.add('error');
        showNotification('Administrator password is required', 'error');
        return;
    }

    // Show loading state
    const originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    confirmBtn.disabled = true;

    // Simulate server request
    setTimeout(() => {
        // Success
        confirmBtn.innerHTML = originalText;
        confirmBtn.disabled = false;

        const userType = pendingEditData?.userType === 'admin' ? 'Administrator' : 'Librarian';
        const userName = `${pendingEditData?.firstName} ${pendingEditData?.lastName}`;

        showNotification(`${userType} "${userName}" updated successfully!`, 'success');

        closeModal('confirmationModal');

        // Clear pending data
        pendingEditData = null;
        currentEditUserData = null;

        // In a real application, refresh the user list
        // refreshUserList();
    }, 1000);
}

// ============================================
// PASSWORD TOGGLE FUNCTIONALITY
// ============================================

function initializePasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');

    passwordToggles.forEach(toggle => {
        // Remove any existing listeners
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);

        newToggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');

            if (input && icon) {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    });
}

function resetPasswordToggles(inputIds) {
    inputIds.forEach(inputId => {
        const input = document.getElementById(inputId);
        const toggle = document.querySelector(`.password-toggle[data-target="${inputId}"]`);
        const icon = toggle?.querySelector('i');

        if (input) input.type = 'password';
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
}

// ============================================
// MODAL EVENTS
// ============================================

function initializeModalEvents() {
    // Close modals when clicking outside
    const modals = ['addUserModal', 'editUserModal', 'confirmationModal'];

    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modalId === 'confirmationModal') {
                        handleCloseConfirmation();
                    } else {
                        closeModal(modalId);
                    }
                }
            });
        }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (confirmationModal?.classList.contains('active')) {
                handleCloseConfirmation();
            } else if (editUserModal?.classList.contains('active')) {
                closeModal('editUserModal');
            } else if (addUserModal?.classList.contains('active')) {
                closeModal('addUserModal');
            }
        }
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        if (modalId === 'addUserModal') {
            setTimeout(() => resetAddForm(), 300);
        } else if (modalId === 'editUserModal') {
            setTimeout(() => {
                currentEditUserData = null;
                pendingEditData = null;
            }, 300);
        } else if (modalId === 'confirmationModal') {
            setTimeout(() => {
                const adminPasswordInput = document.getElementById('adminPassword');
                if (adminPasswordInput) {
                    adminPasswordInput.value = '';
                    adminPasswordInput.classList.remove('error', 'success');
                }
                const errorElement = document.getElementById('adminPasswordError');
                if (errorElement) errorElement.classList.remove('show');
            }, 300);
        }
    }
}

// ============================================
// PASSWORD VALIDATION
// ============================================

function updatePasswordRequirements(password, type = 'add') {
    const prefix = type === 'edit' ? 'edit' : '';
    const reqLength = prefix ? `${prefix}ReqLength` : 'reqLength';
    const reqNumber = prefix ? `${prefix}ReqNumber` : 'reqNumber';
    const reqSymbol = prefix ? `${prefix}ReqSymbol` : 'reqSymbol';

    updateRequirement(reqLength, password.length >= 8);
    updateRequirement(reqNumber, /\d/.test(password));
    updateRequirement(reqSymbol, /[@*&]/.test(password));
}

function updateRequirement(elementId, isMet) {
    const element = document.getElementById(elementId);
    if (element) {
        const icon = element.querySelector('i');
        element.classList.toggle('met', isMet);
        if (icon) {
            if (isMet) {
                icon.classList.remove('fa-circle');
                icon.classList.add('fa-check-circle');
            } else {
                icon.classList.remove('fa-check-circle');
                icon.classList.add('fa-circle');
            }
        }
    }
}

function validatePassword() {
    const password = document.getElementById('password')?.value || '';
    const hasLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[@*&]/.test(password);
    const isValid = hasLength && hasNumber && hasSymbol;

    toggleValidation('password', 'passwordError', isValid, password.length > 0);
    return isValid;
}

function validateEditPassword() {
    const password = document.getElementById('editNewPassword')?.value || '';

    // If password is empty, it's valid (optional field)
    if (!password) {
        toggleValidation('editNewPassword', 'editPasswordError', true, false);
        return true;
    }

    const hasLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[@*&]/.test(password);
    const isValid = hasLength && hasNumber && hasSymbol;

    toggleValidation('editNewPassword', 'editPasswordError', isValid, true);
    return isValid;
}

function validateConfirmPassword() {
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    const isValid = confirmPassword === password;

    toggleValidation('confirmPassword', 'confirmPasswordError', isValid, confirmPassword.length > 0);
    return isValid;
}

function validateEditConfirmPassword() {
    const password = document.getElementById('editNewPassword')?.value || '';
    const confirmPassword = document.getElementById('editConfirmPassword')?.value || '';

    // If no password is being set, confirm is valid
    if (!password && !confirmPassword) {
        toggleValidation('editConfirmPassword', 'editConfirmPasswordError', true, false);
        return true;
    }

    const isValid = confirmPassword === password;
    toggleValidation('editConfirmPassword', 'editConfirmPasswordError', isValid, confirmPassword.length > 0);
    return isValid;
}

function toggleValidation(inputId, errorId, isValid, hasValue) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    if (input && error) {
        input.classList.toggle('error', !isValid && hasValue);
        input.classList.toggle('success', isValid && hasValue);
        error.classList.toggle('show', !isValid && hasValue);
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================
// NOTIFICATION FUNCTIONALITY
// ============================================

function initializeNotifications() {
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            showNotification('You have 3 new notifications', 'info');
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');

    let bgColor, icon;
    switch (type) {
        case 'success':
            bgColor = '#27ae60';
            icon = 'fa-check-circle';
            break;
        case 'error':
            bgColor = '#c62828';
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            bgColor = '#ffc107';
            icon = 'fa-exclamation-triangle';
            break;
        default:
            bgColor = '#2c3e50';
            icon = 'fa-info-circle';
    }

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
        display: flex;
        align-items: center;
        gap: 0.75rem;
        max-width: 400px;
    `;

    notification.innerHTML = `
        <i class="fas ${icon}" style="font-size: 1.2rem;"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ============================================
// WINDOW RESIZE HANDLER
// ============================================

window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768) {
            if (sidebar) sidebar.classList.remove('active');
            if (userProfile) userProfile.classList.remove('active');
        }
    }, 250);
});