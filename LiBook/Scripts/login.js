document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    // ======================
    // LOGIN VALIDATION
    // ======================
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        alert("Login clicked!\nEmail: " + email);
    });

    // ======================
    // CODE INPUT AUTO-FOCUS
    // ======================
    const codeInputs = document.querySelectorAll(".code-boxes input");
    codeInputs.forEach((input, index) => {
        input.addEventListener("input", function () {
            this.value = this.value.replace(/[^0-9]/g, "");
            if (this.value && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", function (e) {
            if (e.key === "Backspace" && !this.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });

    // ======================
    // REAL-TIME PASSWORD VALIDATION
    // ======================
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmNewPassword");
    const confirmBtn = document.querySelector("#stepNewPassword .confirm-btn");

    if (newPasswordInput) {
        newPasswordInput.addEventListener("input", validatePasswordRealTime);
    }
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener("input", validatePasswordRealTime);
    }

    function validatePasswordRealTime() {
        const password = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const requirementItems = document.querySelectorAll("#stepNewPassword .rules-list li");

        const rules = [
            { regex: /.{8,}/, index: 0 },
            { regex: /[A-Z]/, index: 1 },
            { regex: /[a-z]/, index: 2 },
            { regex: /[0-9]/, index: 3 },
            { regex: /[!@#$%^&*(),.?\":{}|<>_\-]/, index: 4 },
            { regex: /^\S*$/, index: 5 }
        ];

        let allValid = true;

        rules.forEach(rule => {
            const item = requirementItems[rule.index];
            if (rule.regex.test(password)) {
                item.classList.add("valid");
            } else {
                item.classList.remove("valid");
                allValid = false;
            }
        });

        let passwordsMatch = true;
        if (confirmPassword.length > 0) {
            passwordsMatch = password === confirmPassword;
        }

        if (allValid && password.length > 0 && passwordsMatch) {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = "1";
            confirmBtn.style.cursor = "pointer";
        } else {
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = "0.5";
            confirmBtn.style.cursor = "not-allowed";
        }
    }
});

// ======================
// MODAL FUNCTIONS
// ======================
function openForgot() {
    const forgotOverlay = document.getElementById('forgotOverlay');
    const stepEmail = document.getElementById('stepEmail');
    if (forgotOverlay && stepEmail) {
        forgotOverlay.style.display = 'flex';
        stepEmail.classList.add('active');
    }
}

function closeForgot() {
    const forgotOverlay = document.getElementById('forgotOverlay');
    const modals = document.querySelectorAll('.forgot-modal');
    if (forgotOverlay) forgotOverlay.style.display = 'none';
    modals.forEach(m => m.classList.remove('active', 'closing'));

    // Reset password fields and validation
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmNewPassword");
    if (newPasswordInput) newPasswordInput.value = "";
    if (confirmPasswordInput) confirmPasswordInput.value = "";

    const requirementItems = document.querySelectorAll("#stepNewPassword .rules-list li");
    requirementItems.forEach(item => {
        item.classList.remove("valid");
    });

    // Remove error boxes if any exist
    document.querySelectorAll(".error-text-container").forEach(e => e.remove());
}

function goToCode() {
    const emailInput = document.getElementById("emailInput");
    const emailError = document.getElementById("emailError");
    const verifyMessage = document.getElementById("verifyMessage");
    const stepEmail = document.getElementById('stepEmail');
    const stepCode = document.getElementById('stepCode');

    const emailValue = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValue || !emailRegex.test(emailValue)) {
        emailError.style.visibility = "visible";
        return;
    } else {
        emailError.style.visibility = "hidden";
    }

    stepEmail.classList.remove('active');
    verifyMessage.classList.add('active');
    verifyMessage.style.display = "block";

    setTimeout(() => {
        verifyMessage.classList.remove('active');
        verifyMessage.classList.add('closing');

        setTimeout(() => {
            verifyMessage.classList.remove('closing');
            verifyMessage.style.display = "none";
            stepCode.classList.add('active');
            const firstCodeInput = document.querySelector(".code-boxes input");
            if (firstCodeInput) firstCodeInput.focus();
            startResendTimer();
        }, 500);
    }, 2000);
}

document.getElementById("emailInput").addEventListener("input", function () {
    const emailError = document.getElementById("emailError");
    emailError.style.visibility = "hidden";
});

// ======================
// PASSWORD STEP
// ======================
function goToNewPass() {
    const stepCode = document.getElementById('stepCode');
    const stepNewPassword = document.getElementById('stepNewPassword');
    stepCode.classList.remove('active');
    stepNewPassword.classList.add('active');

    const confirmBtn = document.querySelector("#stepNewPassword .confirm-btn");
    confirmBtn.disabled = true;
    confirmBtn.style.opacity = "0.5";
    confirmBtn.style.cursor = "not-allowed";
}

function finishReset() {
    const newPass = document.getElementById("newPassword");
    const confirmPass = document.getElementById("confirmNewPassword");
    const newPassword = newPass.value.trim();
    const confirmPassword = confirmPass.value.trim();

    document.querySelectorAll(".error-text-container").forEach(e => e.remove());

    const errors = validatePasswordRules(newPassword);
    if (newPassword !== confirmPassword) {
        errors.push("Passwords do not match.");
    }

    if (errors.length > 0) {
        showErrorMessages(confirmPass, errors);
        return;
    }

    const stepNewPassword = document.getElementById('stepNewPassword');
    const resetSuccess = document.getElementById('resetSuccess');

    stepNewPassword.classList.remove('active');
    stepNewPassword.classList.add('closing');

    setTimeout(() => {
        stepNewPassword.classList.remove('closing');
        resetSuccess.classList.add('active');

        setTimeout(() => {
            resetSuccess.classList.remove('active');
            resetSuccess.classList.add('closing');

            setTimeout(() => {
                resetSuccess.classList.remove('closing');
                closeForgot();
            }, 500);
        }, 3000);
    }, 500);
}

// ✅ FIXED: Error messages now appear *below* the password field
function showErrorMessages(input, messages) {
    const existing = input.parentNode.parentNode.querySelector(".error-text-container");
    if (existing) existing.remove();

    const box = document.createElement("div");
    box.classList.add("error-text-container");

    const ul = document.createElement("ul");
    ul.classList.add("rules-list");
    messages.forEach(msg => {
        const li = document.createElement("li");
        li.textContent = msg;
        ul.appendChild(li);
    });

    box.appendChild(ul);
    input.parentNode.parentNode.appendChild(box); // ✅ append BELOW the entire container
}

function validatePasswordRules(password) {
    const rules = [
        { regex: /.{8,}/, message: "Must be at least 8 characters long." },
        { regex: /[A-Z]/, message: "Must include one uppercase letter (A–Z)." },
        { regex: /[a-z]/, message: "Must include one lowercase letter (a–z)." },
        { regex: /[0-9]/, message: "Must include one number (0–9)." },
        { regex: /[!@#$%^&*(),.?\":{}|<>_\-]/, message: "Must include one special character (e.g. @, #, $, %)." },
        { regex: /^\S*$/, message: "Must not contain spaces." }
    ];
    return rules.filter(rule => !rule.regex.test(password)).map(rule => rule.message);
}

// ======================
// TOGGLE PASSWORD
// ======================
function togglePassword(id, el) {
    const input = document.getElementById(id);
    input.type = input.type === "password" ? "text" : "password";
    el.textContent = input.type === "password" ? "👁️" : "🙈";
}

// ======================
// RESEND CODE TIMER
// ======================
function startResendTimer() {
    const resendBtn = document.getElementById("resendBtn");
    const countdownDisplay = document.getElementById("countdown");
    if (!resendBtn || !countdownDisplay) return;

    let countdown = 30;
    resendBtn.classList.remove("enabled");
    countdownDisplay.textContent = formatTime(countdown);

    const interval = setInterval(() => {
        countdown--;
        countdownDisplay.textContent = formatTime(countdown);

        if (countdown <= 0) {
            clearInterval(interval);
            resendBtn.classList.add("enabled");
            countdownDisplay.textContent = "00:00";
        }
    }, 1000);

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
}

function resendCode() {
    if (document.getElementById("resendBtn").classList.contains("enabled")) {
        alert("Verification code resent!");
        startResendTimer();
    }
}
