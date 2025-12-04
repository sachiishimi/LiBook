(function () {
    'use strict';

    // DOM Elements
    let agreeCheckbox, bookButton, userTypeModal, cancelButton, userTypeCards;
    let visitorFormModal, cancelVisitorButton, submitVisitorButton, visitorBookingForm;
    let studentFormModal, cancelStudentButton, submitStudentButton, studentBookingForm;
    let adminFormModal, cancelAdminButton, submitAdminButton, adminBookingForm;
    let facultyFormModal, cancelFacultyButton, submitFacultyButton, facultyBookingForm;
    let privacyPolicyLink, termsOfUseLink, privacyPolicyModal, termsOfUseModal;
    let closePrivacyPolicy, closeTermsOfUse;
    let currentFormType = null;

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // Get all elements
        agreeCheckbox = document.getElementById('agreeTerms');
        bookButton = document.getElementById('bookRoomBtn');
        userTypeModal = document.getElementById('userTypeModal');
        cancelButton = document.getElementById('cancelModal');
        userTypeCards = document.querySelectorAll('.user-type-card');

        // Form Elements
        visitorFormModal = document.getElementById('visitorFormModal');
        cancelVisitorButton = document.getElementById('cancelVisitorForm');
        visitorBookingForm = document.getElementById('visitorBookingForm');

        studentFormModal = document.getElementById('studentFormModal');
        cancelStudentButton = document.getElementById('cancelStudentForm');
        studentBookingForm = document.getElementById('studentBookingForm');

        adminFormModal = document.getElementById('adminFormModal');
        cancelAdminButton = document.getElementById('cancelAdminForm');
        adminBookingForm = document.getElementById('adminBookingForm');

        facultyFormModal = document.getElementById('facultyFormModal');
        cancelFacultyButton = document.getElementById('cancelFacultyForm');
        facultyBookingForm = document.getElementById('facultyBookingForm');

        // Policy Elements
        privacyPolicyLink = document.getElementById('privacyPolicyLink');
        termsOfUseLink = document.getElementById('termsOfUseLink');
        privacyPolicyModal = document.getElementById('privacyPolicyModal');
        termsOfUseModal = document.getElementById('termsOfUseModal');
        closePrivacyPolicy = document.getElementById('closePrivacyPolicy');
        closeTermsOfUse = document.getElementById('closeTermsOfUse');

        // Validate elements exist
        if (!agreeCheckbox || !bookButton || !userTypeModal) {
            console.error('Required elements not found in DOM');
            return;
        }

        // Setup all event listeners
        setupEventListeners();

        // Initialize forms
        initializeForms();

        // Initialize policy dates
        initializePolicyDates();

        // Setup message alert auto-hide
        setupMessageAlert();
    }

    function setupEventListeners() {
        // Book Room Button
        if (bookButton) {
            bookButton.addEventListener('click', function () {
                if (agreeCheckbox && agreeCheckbox.checked) {
                    openModal(userTypeModal);
                } else {
                    showAlert('Please agree to the Privacy Policy and Terms of Use before proceeding.', 'error');
                }
            });
        }

        // Cancel button for user type modal
        if (cancelButton) {
            cancelButton.addEventListener('click', () => closeModal(userTypeModal));
        }

        // Cancel buttons for form modals
        if (cancelVisitorButton) cancelVisitorButton.addEventListener('click', () => closeModal(visitorFormModal));
        if (cancelStudentButton) cancelStudentButton.addEventListener('click', () => closeModal(studentFormModal));
        if (cancelAdminButton) cancelAdminButton.addEventListener('click', () => closeModal(adminFormModal));
        if (cancelFacultyButton) cancelFacultyButton.addEventListener('click', () => closeModal(facultyFormModal));

        // Form submit handlers
        if (visitorBookingForm) visitorBookingForm.addEventListener('submit', submitVisitorForm);
        if (studentBookingForm) studentBookingForm.addEventListener('submit', submitStudentForm);
        if (adminBookingForm) adminBookingForm.addEventListener('submit', submitAdminForm);
        if (facultyBookingForm) facultyBookingForm.addEventListener('submit', submitFacultyForm);

        // User type cards click
        userTypeCards.forEach(card => {
            card.addEventListener('click', handleUserTypeClick);
        });

        // Privacy Policy and Terms of Use links
        if (privacyPolicyLink) {
            privacyPolicyLink.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal(userTypeModal);
                openModal(privacyPolicyModal);
            });
        }

        if (termsOfUseLink) {
            termsOfUseLink.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal(userTypeModal);
                openModal(termsOfUseModal);
            });
        }

        // Policy modal close buttons
        if (closePrivacyPolicy) {
            closePrivacyPolicy.addEventListener('click', () => closeModal(privacyPolicyModal));
        }

        if (closeTermsOfUse) {
            closeTermsOfUse.addEventListener('click', () => closeModal(termsOfUseModal));
        }

        // Also add privacy policy links from form modals
        const privacyLinks = document.querySelectorAll('.privacy-policy-link');
        privacyLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(privacyPolicyModal);
            });
        });

        // Close modals when clicking outside
        const allModals = [
            userTypeModal, visitorFormModal, studentFormModal,
            adminFormModal, facultyFormModal, privacyPolicyModal, termsOfUseModal
        ];
        allModals.forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) closeModal(modal);
                });
            }
        });

        // ESC key to close any open modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.keyCode === 27) {
                allModals.forEach(modal => {
                    if (modal && modal.classList.contains('active')) {
                        closeModal(modal);
                    }
                });
            }
        });
    }

    function initializeForms() {
        // Initialize Visitor Form
        initializeVisitorForm();

        // Initialize Student Form
        initializeStudentForm();

        // Initialize Admin Form
        initializeAdminForm();

        // Initialize Faculty Form
        initializeFacultyForm();
    }

    function initializePolicyDates() {
        // Set current date in policy modals
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const currentDateElement = document.getElementById('currentDate');
        const currentDateTermsElement = document.getElementById('currentDateTerms');

        if (currentDateElement) {
            currentDateElement.textContent = currentDate;
        }

        if (currentDateTermsElement) {
            currentDateTermsElement.textContent = currentDate;
        }
    }

    function initializeVisitorForm() {
        // Set minimum date to tomorrow
        const tomorrow = getTomorrowDate();
        const visitorDateInput = document.getElementById('visitorBookingDate');
        const visitorTimeSelect = document.getElementById('visitorBookingTime');
        const visitorMemberCount = document.getElementById('visitorMemberCount');
        const visitorDecreaseBtn = document.getElementById('visitorDecreaseMembers');
        const visitorIncreaseBtn = document.getElementById('visitorIncreaseMembers');
        const visitorMembersList = document.getElementById('visitorMembersList');

        if (visitorDateInput) {
            visitorDateInput.min = tomorrow;
            // Set default to tomorrow
            visitorDateInput.value = tomorrow;
        }

        // Populate time slots (7 AM to 7 PM)
        if (visitorTimeSelect) {
            populateTimeSlots(visitorTimeSelect);
        }

        // Initialize member count controls for visitor form
        if (visitorDecreaseBtn && visitorIncreaseBtn && visitorMemberCount && visitorMembersList) {
            setupMemberControls(
                visitorDecreaseBtn,
                visitorIncreaseBtn,
                visitorMemberCount,
                visitorMembersList,
                'visitor'
            );
        }
    }

    function initializeStudentForm() {
        // Set minimum date to tomorrow
        const tomorrow = getTomorrowDate();
        const studentDateInput = document.getElementById('studentBookingDate');
        const studentTimeSelect = document.getElementById('studentBookingTime');
        const studentMemberCount = document.getElementById('studentMemberCount');
        const studentDecreaseBtn = document.getElementById('studentDecreaseMembers');
        const studentIncreaseBtn = document.getElementById('studentIncreaseMembers');
        const studentMembersList = document.getElementById('studentMembersList');

        if (studentDateInput) {
            studentDateInput.min = tomorrow;
            studentDateInput.value = tomorrow;
        }

        // Populate time slots (7 AM to 7 PM)
        if (studentTimeSelect) {
            populateTimeSlots(studentTimeSelect);
        }

        // Initialize member count controls for student form
        if (studentDecreaseBtn && studentIncreaseBtn && studentMemberCount && studentMembersList) {
            setupMemberControls(
                studentDecreaseBtn,
                studentIncreaseBtn,
                studentMemberCount,
                studentMembersList,
                'student'
            );
        }
    }

    function initializeAdminForm() {
        // Set minimum date to tomorrow
        const tomorrow = getTomorrowDate();
        const adminDateInput = document.getElementById('adminBookingDate');
        const adminTimeSelect = document.getElementById('adminBookingTime');

        if (adminDateInput) {
            adminDateInput.min = tomorrow;
            adminDateInput.value = tomorrow;
        }

        // Populate time slots (7 AM to 7 PM)
        if (adminTimeSelect) {
            populateTimeSlots(adminTimeSelect);
        }
    }

    function initializeFacultyForm() {
        // Set minimum date to tomorrow
        const tomorrow = getTomorrowDate();
        const facultyDateInput = document.getElementById('facultyBookingDate');
        const facultyTimeSelect = document.getElementById('facultyBookingTime');
        const facultyMemberCount = document.getElementById('facultyMemberCount');
        const facultyDecreaseBtn = document.getElementById('facultyDecreaseMembers');
        const facultyIncreaseBtn = document.getElementById('facultyIncreaseMembers');
        const facultyMembersList = document.getElementById('facultyMembersList');

        if (facultyDateInput) {
            facultyDateInput.min = tomorrow;
            facultyDateInput.value = tomorrow;
        }

        // Populate time slots (7 AM to 7 PM)
        if (facultyTimeSelect) {
            populateTimeSlots(facultyTimeSelect);
        }

        // Initialize member count controls for faculty form
        if (facultyDecreaseBtn && facultyIncreaseBtn && facultyMemberCount && facultyMembersList) {
            setupMemberControls(
                facultyDecreaseBtn,
                facultyIncreaseBtn,
                facultyMemberCount,
                facultyMembersList,
                'faculty'
            );
        }
    }

    function getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }

    function populateTimeSlots(timeSelect) {
        // Clear existing options except the first one
        while (timeSelect.options.length > 1) {
            timeSelect.remove(1);
        }

        // Generate time slots from 7 AM to 7 PM
        for (let hour = 7; hour <= 19; hour++) {
            const timeString = formatHourToTime(hour);
            const option = document.createElement('option');
            option.value = `${hour.toString().padStart(2, '0')}:00`;
            option.textContent = timeString;
            timeSelect.appendChild(option);
        }

        // Set default to 9 AM
        timeSelect.value = '09:00';
    }

    function formatHourToTime(hour) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        return `${displayHour === 0 ? 12 : displayHour}:00 ${period}`;
    }

    function setupMemberControls(decreaseBtn, increaseBtn, memberCountInput, membersList, formType) {
        // Member count decrease
        decreaseBtn.addEventListener('click', () => {
            let currentValue = parseInt(memberCountInput.value);
            if (currentValue > 1) {
                memberCountInput.value = currentValue - 1;
                updateMemberFields(memberCountInput, membersList, formType);
            }
        });

        // Member count increase
        increaseBtn.addEventListener('click', () => {
            let currentValue = parseInt(memberCountInput.value);
            if (currentValue < 10) {
                memberCountInput.value = currentValue + 1;
                updateMemberFields(memberCountInput, membersList, formType);
            }
        });

        // Initialize member fields
        updateMemberFields(memberCountInput, membersList, formType);
    }

    function updateMemberFields(memberCountInput, membersList, formType) {
        const memberCount = parseInt(memberCountInput.value);
        const currentFields = membersList.querySelectorAll('.member-item').length;

        // Update member count badge
        updateMemberCountBadge(membersList, memberCount);

        // Add or remove member fields as needed
        if (memberCount > currentFields) {
            // Add new fields
            for (let i = currentFields + 1; i <= memberCount; i++) {
                const memberItem = createMemberField(i, formType);
                membersList.appendChild(memberItem);
            }
        } else if (memberCount < currentFields) {
            // Remove excess fields
            const fieldsToRemove = membersList.querySelectorAll('.member-item');
            for (let i = fieldsToRemove.length - 1; i >= memberCount; i--) {
                fieldsToRemove[i].remove();
            }
        }

        // Update labels for existing fields
        const allFields = membersList.querySelectorAll('.member-item');
        allFields.forEach((field, index) => {
            const label = field.querySelector('label');
            const input = field.querySelector('input');

            if (index === 0) {
                label.textContent = 'Member 1 (You)';
                if (input) {
                    input.value = 'You (Main Contact)';
                    input.readOnly = true;
                    input.placeholder = '';
                    input.required = false;
                }
            } else {
                label.textContent = `Member ${index + 1}`;
                if (input) {
                    input.value = input.value || '';
                    input.readOnly = false;
                    input.placeholder = 'Enter full name';
                    input.required = true;
                }
            }
        });
    }

    function updateMemberCountBadge(membersList, memberCount) {
        const membersHeader = membersList.closest('.members-section')?.querySelector('.members-header');
        if (membersHeader) {
            let countBadge = membersHeader.querySelector('.members-count');
            if (!countBadge) {
                countBadge = document.createElement('span');
                countBadge.className = 'members-count';
                membersHeader.appendChild(countBadge);
            }
            countBadge.textContent = `${memberCount} member${memberCount !== 1 ? 's' : ''}`;
        }
    }

    function createMemberField(index, formType) {
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';

        const label = document.createElement('label');
        label.textContent = index === 1 ? 'Member 1 (You)' : `Member ${index}`;

        const input = document.createElement('input');
        input.type = 'text';
        input.name = `MemberNames[${index - 1}]`;
        input.setAttribute('form', formType === 'visitor' ? 'visitorBookingForm' :
            formType === 'student' ? 'studentBookingForm' :
                formType === 'faculty' ? 'facultyBookingForm' : '');

        if (index === 1) {
            input.value = 'You (Main Contact)';
            input.readOnly = true;
            input.placeholder = '';
            input.required = false;
        } else {
            input.placeholder = 'Enter full name';
            input.required = true;
        }

        memberItem.appendChild(label);
        memberItem.appendChild(input);

        return memberItem;
    }

    function openModal(modalElement) {
        if (!modalElement) return;
        modalElement.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modalElement) {
        if (!modalElement) return;
        modalElement.classList.remove('active');
        document.body.style.overflow = '';
    }

    function handleUserTypeClick(event) {
        const card = event.currentTarget;
        const userType = card.getAttribute('data-usertype');

        if (userType) {
            closeModal(userTypeModal);

            switch (userType) {
                case 'visitor':
                    currentFormType = 'visitor';
                    openModal(visitorFormModal);
                    break;
                case 'student':
                    currentFormType = 'student';
                    openModal(studentFormModal);
                    break;
                case 'admin':
                    currentFormType = 'admin';
                    openModal(adminFormModal);
                    break;
                case 'faculty':
                    currentFormType = 'faculty';
                    openModal(facultyFormModal);
                    break;
            }
        }
    }

    function submitVisitorForm(e) {
        e.preventDefault();
        const form = e.target;

        // Validate required fields
        if (!validateForm(form)) {
            return false;
        }

        // Validate member names
        const membersList = document.getElementById('visitorMembersList');
        const memberInputs = membersList.querySelectorAll('input[name^="MemberNames"]');
        let hasEmptyMemberNames = false;

        memberInputs.forEach((input, index) => {
            if (index > 0 && !input.value.trim()) {
                hasEmptyMemberNames = true;
                input.style.borderColor = '#c62828';
                input.style.backgroundColor = '#ffebee';
            } else {
                input.style.borderColor = '';
                input.style.backgroundColor = '';
            }
        });

        if (hasEmptyMemberNames) {
            showAlert('Please fill in all member names.', 'error');
            return false;
        }

        // Validate terms agreement
        const termsCheckbox = document.getElementById('visitorTerms');
        if (termsCheckbox && !termsCheckbox.checked) {
            showAlert('You must accept the terms and conditions.', 'error');
            termsCheckbox.focus();
            return false;
        }

        // Disable submit button to prevent double submission
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }

        // Submit the form
        form.submit();
        return true;
    }

    function submitStudentForm(e) {
        e.preventDefault();
        const form = e.target;

        // Validate required fields
        if (!validateForm(form)) {
            return false;
        }

        // Validate member names
        const membersList = document.getElementById('studentMembersList');
        const memberInputs = membersList.querySelectorAll('input[name^="MemberNames"]');
        let hasEmptyMemberNames = false;

        memberInputs.forEach((input, index) => {
            if (index > 0 && !input.value.trim()) {
                hasEmptyMemberNames = true;
                input.style.borderColor = '#c62828';
                input.style.backgroundColor = '#ffebee';
            } else {
                input.style.borderColor = '';
                input.style.backgroundColor = '';
            }
        });

        if (hasEmptyMemberNames) {
            showAlert('Please fill in all member names.', 'error');
            return false;
        }

        // Validate Student ID
        const studentIdInput = document.getElementById('StudentId');
        if (studentIdInput && !studentIdInput.value.trim()) {
            showAlert('Please enter your Student ID.', 'error');
            studentIdInput.focus();
            return false;
        }

        // Validate terms agreement
        const termsCheckbox = document.getElementById('studentTerms');
        if (termsCheckbox && !termsCheckbox.checked) {
            showAlert('You must accept the terms and conditions.', 'error');
            termsCheckbox.focus();
            return false;
        }

        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }

        // Submit the form
        form.submit();
        return true;
    }

    function submitFacultyForm(e) {
        e.preventDefault();
        const form = e.target;

        // Validate required fields
        if (!validateForm(form)) {
            return false;
        }

        // Validate member names
        const membersList = document.getElementById('facultyMembersList');
        const memberInputs = membersList.querySelectorAll('input[name^="MemberNames"]');
        let hasEmptyMemberNames = false;

        memberInputs.forEach((input, index) => {
            if (index > 0 && !input.value.trim()) {
                hasEmptyMemberNames = true;
                input.style.borderColor = '#c62828';
                input.style.backgroundColor = '#ffebee';
            } else {
                input.style.borderColor = '';
                input.style.backgroundColor = '';
            }
        });

        if (hasEmptyMemberNames) {
            showAlert('Please fill in all member names.', 'error');
            return false;
        }

        // Validate terms agreement
        const termsCheckbox = document.getElementById('facultyTerms');
        if (termsCheckbox && !termsCheckbox.checked) {
            showAlert('You must accept the terms and conditions.', 'error');
            termsCheckbox.focus();
            return false;
        }

        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }

        // Submit the form
        form.submit();
        return true;
    }

    function submitAdminForm(e) {
        e.preventDefault();
        const form = e.target;

        // Validate required fields
        if (!validateForm(form)) {
            return false;
        }

        // Validate terms agreement
        const termsCheckbox = document.getElementById('adminTerms');
        if (termsCheckbox && !termsCheckbox.checked) {
            showAlert('You must accept the terms and conditions.', 'error');
            termsCheckbox.focus();
            return false;
        }

        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }

        // Submit the form
        form.submit();
        return true;
    }

    function validateForm(form) {
        // Get all required inputs
        const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        let firstInvalidInput = null;

        requiredInputs.forEach(input => {
            // Skip readonly inputs
            if (input.readOnly) return;

            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#c62828';
                input.style.backgroundColor = '#ffebee';

                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
            } else {
                input.style.borderColor = '';
                input.style.backgroundColor = '';
            }
        });

        if (!isValid) {
            showAlert('Please fill in all required fields.', 'error');
            if (firstInvalidInput) {
                firstInvalidInput.focus();
            }
        }

        return isValid;
    }

    function showAlert(message, type = 'info') {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `custom-alert ${type}`;
        alertDiv.innerHTML = `
            <span>${message}</span>
            <button type="button" class="custom-alert-close">&times;</button>
        `;

        // Style the alert
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: ${type === 'error' ? '#c62828' : type === 'success' ? '#27ae60' : '#2c3e50'};
            border-left: 4px solid ${type === 'error' ? '#8e0000' : type === 'success' ? '#1e7e34' : '#1a252f'};
        `;

        // Add to document
        document.body.appendChild(alertDiv);

        // Add close functionality
        const closeBtn = alertDiv.querySelector('.custom-alert-close');
        closeBtn.addEventListener('click', () => {
            alertDiv.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    function setupMessageAlert() {
        // Auto-hide existing message alert after 5 seconds
        setTimeout(() => {
            const alert = document.getElementById('messageAlert');
            if (alert) {
                alert.style.display = 'none';
            }
        }, 5000);

        // Close alert on button click
        const closeAlertBtn = document.querySelector('.close-alert');
        if (closeAlertBtn) {
            closeAlertBtn.addEventListener('click', () => {
                const alert = document.getElementById('messageAlert');
                if (alert) {
                    alert.style.display = 'none';
                }
            });
        }
    }

    // Add animation for custom alerts
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
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
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .custom-alert {
            animation: slideIn 0.3s ease;
        }
        
        .custom-alert-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            margin-left: 15px;
            padding: 0;
            line-height: 1;
        }
        
        .custom-alert-close:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
})();
