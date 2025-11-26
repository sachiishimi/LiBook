// @ts-nocheck
/* 
   IMPORTANT: This comment above MUST be the first line of the file
   It tells Visual Studio to skip TypeScript checking for this file
*/

// DOM Elements
var menuToggle, sidebar, closeSidebar, sidebarToggleDesktop, mainContent;
var userProfile, userDropdown, userSearch, addUserBtn;
var tabBtns, tableSections, navItems;

// Modal Elements
var addUserModal, editUserModal, confirmationModal;
var editUserForm, confirmationForm;

// Current active tab
var activeTab = 'librarians';
var currentUserType = 'librarian';
var currentEditUserData = null;
var pendingEditData = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeDOMElements();
    initializeSidebar();
    initializeUserProfile();
    initializeNavigation();
    initializeUserManagement();
    initializeModals();
    initializeNotifications();
});

function initializeDOMElements() {
    menuToggle = document.getElementById('menuToggle');
    sidebar = document.getElementById('sidebar');
    closeSidebar = document.getElementById('closeSidebar');
    sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
    mainContent = document.querySelector('.main-content');
    userProfile = document.getElementById('userProfile');
    userDropdown = document.getElementById('userDropdown');
    userSearch = document.getElementById('userSearch');
    addUserBtn = document.getElementById('addUserBtn');
    tabBtns = document.querySelectorAll('.tab-btn');
    tableSections = document.querySelectorAll('.table-section');
    navItems = document.querySelectorAll('.nav-item');
    addUserModal = document.getElementById('addUserModal');
    editUserModal = document.getElementById('editUserModal');
    confirmationModal = document.getElementById('confirmationModal');
    editUserForm = document.getElementById('editUserForm');
    confirmationForm = document.getElementById('confirmationForm');
}

function initializeSidebar() {
    if (!sidebar || !mainContent) return;
    if (sidebarToggleDesktop) {
        sidebarToggleDesktop.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed') ? 'true' : 'false');
        });
    }
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.add('active');
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
        });
    }
    if (closeSidebar) {
        closeSidebar.addEventListener('click', function() {
            sidebar.classList.remove('active');
        });
    }
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && sidebar && menuToggle) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

function initializeUserProfile() {
    if (userProfile) {
        userProfile.addEventListener('click', function(e) {
            e.stopPropagation();
            userProfile.classList.toggle('active');
        });
    }
    document.addEventListener('click', function() {
        if (userProfile) userProfile.classList.remove('active');
    });
}

function initializeNavigation() {
    if (!navItems) return;
    navItems.forEach(function(item) {
        item.addEventListener('click', function() {
            if (!item.classList.contains('logout') && item.getAttribute('href') !== '#') {
                navItems.forEach(function(nav) { nav.classList.remove('active'); });
                item.classList.add('active');
                if (window.innerWidth <= 768 && sidebar) sidebar.classList.remove('active');
            }
        });
    });
}

function initializeUserManagement() {
    initializeTabs();
    initializeSearch();
    initializeActionButtons();
}

function initializeTabs() {
    if (!tabBtns) return;
    tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var tabName = btn.getAttribute('data-tab');
            if (tabName) switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    if (!tabBtns || !tableSections) return;
    tabBtns.forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });
    tableSections.forEach(function(section) {
        section.classList.toggle('active', section.id === tabName + '-section');
    });
    activeTab = tabName;
    updateAddButtonText();
    if (userSearch) {
        userSearch.value = '';
        filterUsers('');
    }
}

function updateAddButtonText() {
    if (!addUserBtn) return;
    var buttonText = addUserBtn.querySelector('span');
    if (buttonText) {
        buttonText.textContent = activeTab === 'librarians' ? 'Add Librarian' : 'Add Admin';
    }
}

function initializeSearch() {
    if (userSearch) {
        userSearch.addEventListener('input', function(e) {
            filterUsers(e.target.value.toLowerCase().trim());
        });
    }
}

function filterUsers(searchTerm) {
    var activeTable = document.querySelector('#' + activeTab + '-section .users-table tbody');
    if (!activeTable) return;
    activeTable.querySelectorAll('tr').forEach(function(row) {
        var nameEl = row.querySelector('.user-name');
        var usernameEl = row.querySelector('td:nth-child(2)');
        var emailEl = row.querySelector('.user-email');
        var name = nameEl ? nameEl.textContent.toLowerCase() : '';
        var username = usernameEl ? usernameEl.textContent.toLowerCase() : '';
        var email = emailEl ? emailEl.textContent.toLowerCase() : '';
        row.style.display = (searchTerm === '' || name.includes(searchTerm) || 
            username.includes(searchTerm) || email.includes(searchTerm)) ? '' : 'none';
    });
}

function initializeActionButtons() {
    if (addUserBtn) addUserBtn.addEventListener('click', addNewUser);
    document.addEventListener('click', function(e) {
        var editBtn = e.target.closest('.icon-btn.small:not(.danger)');
        var deleteBtn = e.target.closest('.icon-btn.small.danger');
        if (editBtn) { e.preventDefault(); e.stopPropagation(); editUser(editBtn); }
        else if (deleteBtn) { e.preventDefault(); e.stopPropagation(); deleteUser(deleteBtn); }
    });
}

function addNewUser() {
    currentUserType = activeTab === 'librarians' ? 'librarian' : 'admin';
    openAddModal(currentUserType);
}

function editUser(button) {
    var row = button.closest('tr');
    if (!row) return;
    var userData = {
        userId: row.dataset.userId || '',
        firstName: row.dataset.firstName || '',
        lastName: row.dataset.lastName || '',
        middleName: row.dataset.middleName || '',
        suffix: row.dataset.suffix || '',
        email: row.dataset.email || '',
        userType: activeTab === 'librarians' ? 'librarian' : 'admin'
    };
    openEditModal(userData);
}

function deleteUser(button) {
    var row = button.closest('tr');
    if (!row) return;
    var nameEl = row.querySelector('.user-name');
    var userName = nameEl ? nameEl.textContent : 'User';
    var userType = activeTab === 'librarians' ? 'Librarian' : 'Admin';
    if (confirm('Are you sure you want to delete ' + userType + ' "' + userName + '"?\n\nThis action cannot be undone.')) {
        showNotification(userType + ' "' + userName + '" deleted successfully', 'success');
    }
}

function initializeModals() {
    initializeAddUserModal();
    initializeEditUserModal();
    initializeConfirmationModal();
    initializePasswordToggles();
    initializeModalEvents();
}

function initializeAddUserModal() {
    var closeBtn = document.getElementById('closeAddModalBtn');
    var cancelBtn = document.getElementById('cancelAddModalBtn');
    var pwdInput = document.getElementById('password');
    var confirmPwdInput = document.getElementById('confirmPassword');
    if (closeBtn) closeBtn.addEventListener('click', function() { closeModal('addUserModal'); });
    if (cancelBtn) cancelBtn.addEventListener('click', function() { closeModal('addUserModal'); });
    if (pwdInput) {
        pwdInput.addEventListener('focus', function() {
            var reqBox = document.getElementById('passwordRequirements');
            if (reqBox) reqBox.style.display = 'block';
        });
        pwdInput.addEventListener('input', function(e) {
            var reqBox = document.getElementById('passwordRequirements');
            if (reqBox) reqBox.style.display = 'block';
            updatePasswordRequirements(e.target.value, 'add');
            validatePassword();
        });
    }
    if (confirmPwdInput) confirmPwdInput.addEventListener('input', validateConfirmPassword);
}

function openAddModal() {
    var modal = document.getElementById('addUserModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        resetAddForm();
        setTimeout(function() {
            var firstInput = document.getElementById('firstName');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function resetAddForm() {
    var form = document.getElementById('addUserForm');
    if (form && form.reset) form.reset();
    document.querySelectorAll('#addUserModal .form-control').forEach(function(input) {
        input.classList.remove('error', 'success');
    });
    document.querySelectorAll('#addUserModal .error-message').forEach(function(msg) {
        msg.classList.remove('show');
    });
    updatePasswordRequirements('', 'add');
    resetPasswordToggles(['password', 'confirmPassword']);
}

function initializeEditUserModal() {
    var closeBtn = document.getElementById('closeEditModalBtn');
    var cancelBtn = document.getElementById('cancelEditModalBtn');
    var submitBtn = document.getElementById('submitEditBtn');
    if (closeBtn) closeBtn.addEventListener('click', function() { closeModal('editUserModal'); });
    if (cancelBtn) cancelBtn.addEventListener('click', function() { closeModal('editUserModal'); });
    if (submitBtn) submitBtn.addEventListener('click', submitEditForm);
}

function openEditModal(userData) {
    currentEditUserData = userData;
    var modal = document.getElementById('editUserModal');
    if (modal) {
        var fields = ['editUserId', 'editFirstName', 'editLastName', 'editMiddleName', 'editSuffix', 'editEmail'];
        var values = [userData.userId, userData.firstName, userData.lastName, userData.middleName, userData.suffix, userData.email];
        for (var i = 0; i < fields.length; i++) {
            var el = document.getElementById(fields[i]);
            if (el) el.value = values[i] || '';
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(function() {
            var firstInput = document.getElementById('editFirstName');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function submitEditForm(e) {
    e.preventDefault();
    if (!validateEditForm()) {
        showNotification('Please fill in all required fields correctly', 'error');
        return;
    }
    pendingEditData = {
        id: getValue('editUserId'),
        lastName: getValue('editLastName'),
        firstName: getValue('editFirstName'),
        middleName: getValue('editMiddleName'),
        suffix: getValue('editSuffix'),
        email: getValue('editEmail'),
        userType: currentEditUserData ? currentEditUserData.userType : 'librarian'
    };
    closeModal('editUserModal');
    setTimeout(function() { openConfirmationModal(); }, 300);
}

function getValue(id) {
    var el = document.getElementById(id);
    return el && el.value ? el.value.trim() : '';
}

function validateEditForm() {
    var fields = ['editLastName', 'editFirstName', 'editEmail'];
    var isValid = true;
    for (var i = 0; i < fields.length; i++) {
        var val = getValue(fields[i]);
        var valid = val !== '' && (fields[i] !== 'editEmail' || isValidEmail(val));
        toggleValidation(fields[i], fields[i] + 'Error', valid, val !== '');
        if (!valid) isValid = false;
    }
    return isValid;
}

function initializeConfirmationModal() {
    var closeBtn = document.getElementById('closeConfirmModalBtn');
    var backBtn = document.getElementById('backToEditBtn');
    var confirmBtn = document.getElementById('confirmSubmitBtn');
    if (closeBtn) closeBtn.addEventListener('click', handleCloseConfirmation);
    if (backBtn) backBtn.addEventListener('click', backToEdit);
    if (confirmBtn) confirmBtn.addEventListener('click', confirmEditSubmit);
}

function openConfirmationModal() {
    if (confirmationModal) {
        var pwdInput = document.getElementById('adminPassword');
        if (pwdInput) {
            pwdInput.value = '';
            pwdInput.classList.remove('error', 'success');
        }
        resetPasswordToggles(['adminPassword']);
        confirmationModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(function() { if (pwdInput) pwdInput.focus(); }, 100);
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
    setTimeout(function() {
        if (pendingEditData && editUserModal) {
            openEditModal(pendingEditData);
            editUserModal.classList.add('active');
        }
    }, 300);
}

function confirmEditSubmit() {
    var pwdInput = document.getElementById('adminPassword');
    var pwd = pwdInput ? pwdInput.value : '';
    var confirmBtn = document.getElementById('confirmSubmitBtn');
    if (!pwd) {
        showNotification('Administrator password is required', 'error');
        return;
    }
    if (confirmBtn) {
        var originalText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        confirmBtn.disabled = true;
        setTimeout(function() {
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
            var userType = pendingEditData && pendingEditData.userType === 'admin' ? 'Administrator' : 'Librarian';
            var userName = pendingEditData ? (pendingEditData.firstName + ' ' + pendingEditData.lastName) : '';
            showNotification(userType + ' "' + userName + '" updated successfully!', 'success');
            closeModal('confirmationModal');
            pendingEditData = null;
            currentEditUserData = null;
        }, 1000);
    }
}

function initializePasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(function(toggle) {
        var newToggle = toggle.cloneNode(true);
        if (toggle.parentNode) toggle.parentNode.replaceChild(newToggle, toggle);
        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            var targetId = this.getAttribute('data-target');
            if (!targetId) return;
            var input = document.getElementById(targetId);
            var icon = this.querySelector('i');
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
    inputIds.forEach(function(inputId) {
        var input = document.getElementById(inputId);
        var toggle = document.querySelector('.password-toggle[data-target="' + inputId + '"]');
        var icon = toggle ? toggle.querySelector('i') : null;
        if (input) input.type = 'password';
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
}

function initializeModalEvents() {
    ['addUserModal', 'editUserModal', 'confirmationModal'].forEach(function(modalId) {
        var modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    if (modalId === 'confirmationModal') handleCloseConfirmation();
                    else closeModal(modalId);
                }
            });
        }
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (confirmationModal && confirmationModal.classList.contains('active')) handleCloseConfirmation();
            else if (editUserModal && editUserModal.classList.contains('active')) closeModal('editUserModal');
            else if (addUserModal && addUserModal.classList.contains('active')) closeModal('addUserModal');
        }
    });
}

function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (modalId === 'addUserModal') setTimeout(function() { resetAddForm(); }, 300);
        else if (modalId === 'editUserModal') setTimeout(function() { currentEditUserData = null; pendingEditData = null; }, 300);
    }
}

function updatePasswordRequirements(password, type) {
    var prefix = type === 'edit' ? 'edit' : '';
    updateRequirement(prefix + 'ReqLength' || 'reqLength', password.length >= 8);
    updateRequirement(prefix + 'ReqNumber' || 'reqNumber', /\d/.test(password));
    updateRequirement(prefix + 'ReqSymbol' || 'reqSymbol', /[@*&]/.test(password));
}

function updateRequirement(elementId, isMet) {
    var element = document.getElementById(elementId);
    if (element) {
        var icon = element.querySelector('i');
        element.classList.toggle('met', isMet);
        if (icon) {
            icon.classList.toggle('fa-check-circle', isMet);
            icon.classList.toggle('fa-circle', !isMet);
        }
    }
}

function validatePassword() {
    var pwdInput = document.getElementById('password');
    var pwd = pwdInput ? pwdInput.value : '';
    var isValid = pwd.length >= 8 && /\d/.test(pwd) && /[@*&]/.test(pwd);
    toggleValidation('password', 'passwordError', isValid, pwd.length > 0);
    return isValid;
}

function validateConfirmPassword() {
    var pwdInput = document.getElementById('password');
    var confirmInput = document.getElementById('confirmPassword');
    var pwd = pwdInput ? pwdInput.value : '';
    var confirm = confirmInput ? confirmInput.value : '';
    var isValid = confirm === pwd;
    toggleValidation('confirmPassword', 'confirmPasswordError', isValid, confirm.length > 0);
    return isValid;
}

function toggleValidation(inputId, errorId, isValid, hasValue) {
    var input = document.getElementById(inputId);
    var error = document.getElementById(errorId);
    if (input && error) {
        input.classList.toggle('error', !isValid && hasValue);
        input.classList.toggle('success', isValid && hasValue);
        error.classList.toggle('show', !isValid && hasValue);
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initializeNotifications() {
    var notifBtn = document.querySelector('.notification-btn');
    if (notifBtn) notifBtn.addEventListener('click', function() { showNotification('You have 3 new notifications', 'info'); });
}

function showNotification(message, type) {
    var colors = { success: '#27ae60', error: '#c62828', warning: '#ffc107', info: '#2c3e50' };
    var icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    var notif = document.createElement('div');
    notif.style.cssText = 'position:fixed;top:20px;right:20px;padding:1rem 1.5rem;background:' + (colors[type] || colors.info) + 
        ';color:white;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:10000;animation:slideIn 0.3s ease;display:flex;align-items:center;gap:0.75rem;max-width:400px';
    notif.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i><span>' + message + '</span>';
    document.body.appendChild(notif);
    setTimeout(function() {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(function() { if (notif.parentNode) notif.parentNode.removeChild(notif); }, 300);
    }, 3000);
}

if (!document.getElementById('notification-styles')) {
    var style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = '@keyframes slideIn{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(400px);opacity:0}}';
    document.head.appendChild(style);
}

var resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        if (window.innerWidth > 768) {
            if (sidebar) sidebar.classList.remove('active');
            if (userProfile) userProfile.classList.remove('active');
        }
    }, 250);
}); 