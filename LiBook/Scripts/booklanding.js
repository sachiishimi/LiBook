// @ts-check

/**
 * @typedef {Object} WindowWithReset
 * @property {() => void} resetBookingForm
 */

(function () {
    'use strict';

    // DOM Elements
    let agreeCheckbox, bookButton, userTypeModal, cancelButton, userTypeCards;
    let visitorFormModal, cancelVisitorButton, submitVisitorButton;
    let studentFormModal, cancelStudentButton, submitStudentButton;
    let adminFormModal, cancelAdminButton, submitAdminButton;
    let facultyFormModal, cancelFacultyButton, submitFacultyButton;
    let privacyPolicyLink, termsOfUseLink, privacyPolicyModal, termsOfUseModal;
    let closePrivacyPolicy, closeTermsOfUse;

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
        submitVisitorButton = document.getElementById('submitVisitorForm');

        studentFormModal = document.getElementById('studentFormModal');
        cancelStudentButton = document.getElementById('cancelStudentForm');
        submitStudentButton = document.getElementById('submitStudentForm');

        adminFormModal = document.getElementById('adminFormModal');
        cancelAdminButton = document.getElementById('cancelAdminForm');
        submitAdminButton = document.getElementById('submitAdminForm');

        facultyFormModal = document.getElementById('facultyFormModal');
        cancelFacultyButton = document.getElementById('cancelFacultyForm');
        submitFacultyButton = document.getElementById('submitFacultyForm');

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
    }

    function setupEventListeners() {
        // Book Room Button
        if (bookButton) {
            bookButton.addEventListener('click', function () {
                if (agreeCheckbox && agreeCheckbox.checked) {
                    openModal(userTypeModal);
                } else {
                    alert('Please agree to the Privacy Policy and Terms of Use before proceeding.');
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

        // Submit buttons
        if (submitVisitorButton) submitVisitorButton.addEventListener('click', submitVisitorForm);
        if (submitStudentButton) submitStudentButton.addEventListener('click', submitStudentForm);
        if (submitAdminButton) submitAdminButton.addEventListener('click', submitAdminForm);
        if (submitFacultyButton) submitFacultyButton.addEventListener('click', submitFacultyForm);

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
        // Set tomorrow's date as default
        const tomorrow = getTomorrowDate();
        const visitorDateInput = document.getElementById('visitorBookingDate');
        const visitorTimeSelect = document.getElementById('visitorBookingTime');
        const visitorMemberCount = document.getElementById('visitorMemberCount');
        const visitorDecreaseBtn = document.getElementById('visitorDecreaseMembers');
        const visitorIncreaseBtn = document.getElementById('visitorIncreaseMembers');
        const visitorMembersList = document.getElementById('visitorMembersList');

        if (visitorDateInput) {
            visitorDateInput.value = tomorrow;
            visitorDateInput.min = tomorrow;
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
        // Set tomorrow's date as default
        const tomorrow = getTomorrowDate();
        const studentDateInput = document.getElementById('studentBookingDate');
        const studentTimeSelect = document.getElementById('studentBookingTime');
        const studentMemberCount = document.getElementById('studentMemberCount');
        const studentDecreaseBtn = document.getElementById('studentDecreaseMembers');
        const studentIncreaseBtn = document.getElementById('studentIncreaseMembers');
        const studentMembersList = document.getElementById('studentMembersList');

        if (studentDateInput) {
            studentDateInput.value = tomorrow;
            studentDateInput.min = tomorrow;
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
        // Set tomorrow's date as default
        const tomorrow = getTomorrowDate();
        const adminDateInput = document.getElementById('adminBookingDate');
        const adminTimeSelect = document.getElementById('adminBookingTime');

        if (adminDateInput) {
            adminDateInput.value = tomorrow;
            adminDateInput.min = tomorrow;
        }

        // Populate time slots (7 AM to 7 PM)
        if (adminTimeSelect) {
            populateTimeSlots(adminTimeSelect);
        }
    }

    function initializeFacultyForm() {
        // Set tomorrow's date as default
        const tomorrow = getTomorrowDate();
        const facultyDateInput = document.getElementById('facultyBookingDate');
        const facultyTimeSelect = document.getElementById('facultyBookingTime');
        const facultyMemberCount = document.getElementById('facultyMemberCount');
        const facultyDecreaseBtn = document.getElementById('facultyDecreaseMembers');
        const facultyIncreaseBtn = document.getElementById('facultyIncreaseMembers');
        const facultyMembersList = document.getElementById('facultyMembersList');

        if (facultyDateInput) {
            facultyDateInput.value = tomorrow;
            facultyDateInput.min = tomorrow;
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

        // Initial member fields
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
                }
            } else {
                label.textContent = `Member ${index + 1}`;
                if (input) {
                    input.value = '';
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
        input.name = 'memberName[]';
        input.required = index <= 2; // Require at least first 2 members

        if (index === 1) {
            input.value = 'You (Main Contact)';
            input.readOnly = true;
            input.placeholder = '';
        } else {
            input.placeholder = 'Enter full name';
        }

        // Add data attribute for form type
        input.dataset.formType = formType;

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
                    openModal(visitorFormModal);
                    break;
                case 'student':
                    openModal(studentFormModal);
                    break;
                case 'admin':
                    openModal(adminFormModal);
                    break;
                case 'faculty':
                    openModal(facultyFormModal);
                    break;
            }
        }
    }

    function submitVisitorForm() {
        // Get the form
        const form = document.getElementById('visitorBookingForm');

        // Validate form
        if (!form || !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Collect form data
        const formData = new FormData(form);
        const bookingData = {
            userType: 'visitor',
            lastName: formData.get('lastName'),
            firstName: formData.get('firstName'),
            middleInitial: formData.get('middleInitial'),
            suffix: formData.get('suffix'),
            email: formData.get('email'),
            program: formData.get('program'),
            purpose: formData.get('purpose'),
            memberCount: formData.get('memberCount'),
            memberNames: [],
            bookingDate: formData.get('bookingDate'),
            bookingTime: formData.get('bookingTime'),
            termsAccepted: document.getElementById('visitorTerms').checked
        };

        // Collect member names
        const membersList = document.getElementById('visitorMembersList');
        const memberInputs = membersList.querySelectorAll('input[name="memberName[]"]');
        memberInputs.forEach((input, index) => {
            if (index > 0 || input.value !== 'You (Main Contact)') {
                bookingData.memberNames.push(input.value);
            }
        });

        // Validate member names
        const emptyMemberNames = bookingData.memberNames.filter(name => !name.trim());
        if (emptyMemberNames.length > 0) {
            alert('Please fill in all member names.');
            return;
        }

        // Disable submit button and show loading state
        submitVisitorButton.disabled = true;
        const originalText = submitVisitorButton.textContent;
        submitVisitorButton.textContent = 'Processing...';

        // Simulate API call
        setTimeout(() => {
            console.log('Visitor Booking Data:', bookingData);

            // Show success message
            alert('Booking submitted successfully! You will receive a confirmation email shortly.');

            // Reset form
            form.reset();

            // Reset date to tomorrow
            const tomorrow = getTomorrowDate();
            document.getElementById('visitorBookingDate').value = tomorrow;

            // Reset member count
            document.getElementById('visitorMemberCount').value = 1;
            updateMemberFields(
                document.getElementById('visitorMemberCount'),
                document.getElementById('visitorMembersList'),
                'visitor'
            );

            // Close modal
            closeModal(visitorFormModal);

            // Reset submit button
            submitVisitorButton.disabled = false;
            submitVisitorButton.textContent = originalText;

        }, 1500);
    }

    function submitStudentForm() {
        // Get the form
        const form = document.getElementById('studentBookingForm');

        // Validate form
        if (!form || !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Collect form data
        const formData = new FormData(form);
        const bookingData = {
            userType: 'student',
            lastName: formData.get('lastName'),
            firstName: formData.get('firstName'),
            middleInitial: formData.get('middleInitial'),
            suffix: formData.get('suffix'),
            studentId: formData.get('studentId'),
            email: formData.get('email'),
            program: formData.get('program'),
            yearLevel: formData.get('yearLevel'),
            purpose: formData.get('purpose'),
            courseCode: formData.get('courseCode'),
            memberCount: formData.get('memberCount'),
            memberNames: [],
            bookingDate: formData.get('bookingDate'),
            bookingTime: formData.get('bookingTime'),
            termsAccepted: document.getElementById('studentTerms').checked
        };

        // Collect member names
        const membersList = document.getElementById('studentMembersList');
        const memberInputs = membersList.querySelectorAll('input[name="memberName[]"]');
        memberInputs.forEach((input, index) => {
            if (index > 0 || input.value !== 'You (Main Contact)') {
                bookingData.memberNames.push(input.value);
            }
        });

        // Validate member names
        const emptyMemberNames = bookingData.memberNames.filter(name => !name.trim());
        if (emptyMemberNames.length > 0) {
            alert('Please fill in all member names.');
            return;
        }

        // Disable submit button and show loading state
        submitStudentButton.disabled = true;
        const originalText = submitStudentButton.textContent;
        submitStudentButton.textContent = 'Processing...';

        // Simulate API call
        setTimeout(() => {
            console.log('Student Booking Data:', bookingData);

            // Show success message
            alert('Booking submitted successfully! You will receive a confirmation email shortly.');

            // Reset form
            form.reset();

            // Reset date to tomorrow
            const tomorrow = getTomorrowDate();
            document.getElementById('studentBookingDate').value = tomorrow;

            // Reset member count
            document.getElementById('studentMemberCount').value = 1;
            updateMemberFields(
                document.getElementById('studentMemberCount'),
                document.getElementById('studentMembersList'),
                'student'
            );

            // Close modal
            closeModal(studentFormModal);

            // Reset submit button
            submitStudentButton.disabled = false;
            submitStudentButton.textContent = originalText;

        }, 1500);
    }

    function submitAdminForm() {
        // Get the form
        const form = document.getElementById('adminBookingForm');

        // Validate form
        if (!form || !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Collect form data
        const formData = new FormData(form);
        const bookingData = {
            userType: 'admin',
            lastName: formData.get('lastName'),
            firstName: formData.get('firstName'),
            middleInitial: formData.get('middleInitial'),
            suffix: formData.get('suffix'),
            email: formData.get('email'),
            office: formData.get('office'),
            purpose: formData.get('purpose'),
            attendees: formData.get('attendees'),
            requirements: formData.get('requirements'),
            bookingDate: formData.get('bookingDate'),
            bookingTime: formData.get('bookingTime'),
            termsAccepted: document.getElementById('adminTerms').checked
        };

        // Disable submit button and show loading state
        submitAdminButton.disabled = true;
        const originalText = submitAdminButton.textContent;
        submitAdminButton.textContent = 'Processing...';

        // Simulate API call
        setTimeout(() => {
            console.log('Admin Booking Data:', bookingData);

            // Show success message
            alert('Booking submitted successfully! You will receive a confirmation email shortly.');

            // Reset form
            form.reset();

            // Reset date to tomorrow
            const tomorrow = getTomorrowDate();
            document.getElementById('adminBookingDate').value = tomorrow;

            // Reset textareas
            document.getElementById('adminAttendees').value = '';
            document.getElementById('adminRequirements').value = '';

            // Close modal
            closeModal(adminFormModal);

            // Reset submit button
            submitAdminButton.disabled = false;
            submitAdminButton.textContent = originalText;

        }, 1500);
    }

    function submitFacultyForm() {
        // Get the form
        const form = document.getElementById('facultyBookingForm');

        // Validate form
        if (!form || !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Collect form data
        const formData = new FormData(form);
        const bookingData = {
            userType: 'faculty',
            lastName: formData.get('lastName'),
            firstName: formData.get('firstName'),
            middleInitial: formData.get('middleInitial'),
            suffix: formData.get('suffix'),
            email: formData.get('email'),
            department: formData.get('department'),
            purpose: formData.get('purpose'),
            courseCode: formData.get('courseCode'),
            memberCount: formData.get('memberCount'),
            memberNames: [],
            bookingDate: formData.get('bookingDate'),
            bookingTime: formData.get('bookingTime'),
            termsAccepted: document.getElementById('facultyTerms').checked
        };

        // Collect member names
        const membersList = document.getElementById('facultyMembersList');
        const memberInputs = membersList.querySelectorAll('input[name="memberName[]"]');
        memberInputs.forEach((input, index) => {
            if (index > 0 || input.value !== 'You (Main Contact)') {
                bookingData.memberNames.push(input.value);
            }
        });

        // Validate member names
        const emptyMemberNames = bookingData.memberNames.filter(name => !name.trim());
        if (emptyMemberNames.length > 0) {
            alert('Please fill in all member names.');
            return;
        }

        // Disable submit button and show loading state
        submitFacultyButton.disabled = true;
        const originalText = submitFacultyButton.textContent;
        submitFacultyButton.textContent = 'Processing...';

        // Simulate API call
        setTimeout(() => {
            console.log('Faculty Booking Data:', bookingData);

            // Show success message
            alert('Booking submitted successfully! You will receive a confirmation email shortly.');

            // Reset form
            form.reset();

            // Reset date to tomorrow
            const tomorrow = getTomorrowDate();
            document.getElementById('facultyBookingDate').value = tomorrow;

            // Reset member count
            document.getElementById('facultyMemberCount').value = 1;
            updateMemberFields(
                document.getElementById('facultyMemberCount'),
                document.getElementById('facultyMembersList'),
                'faculty'
            );

            // Close modal
            closeModal(facultyFormModal);

            // Reset submit button
            submitFacultyButton.disabled = false;
            submitFacultyButton.textContent = originalText;

        }, 1500);
    }
})();