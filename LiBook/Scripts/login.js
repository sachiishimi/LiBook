document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    // ======================
    // LOGIN VALIDATION
    // ======================
    loginForm.addEventListener("submit", function (e) {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            e.preventDefault();
            showToast("Please enter both email and password.", "error");
            return;
        }

        // Show loading state
        const loginBtn = this.querySelector('.login-btn');
        loginBtn.textContent = "LOGGING IN...";
        loginBtn.disabled = true;

        // Let the form submit naturally to the server
    });

    // ======================
    // CODE INPUT AUTO-FOCUS & PASTE SUPPORT
    // ======================
    const codeInputs = document.querySelectorAll(".code-boxes input");

    // Handle paste event for verification code
    codeInputs[0]?.addEventListener("paste", function (e) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");

        codeInputs.forEach((input, index) => {
            if (pastedData[index]) {
                input.value = pastedData[index];
            }
        });

        // Focus last filled input or first empty
        const lastIndex = Math.min(pastedData.length - 1, codeInputs.length - 1);
        codeInputs[lastIndex]?.focus();

        // Auto-validate if all filled
        if (pastedData.length >= 6) {
            setTimeout(() => validateCode(), 100);
        }
    });

    codeInputs.forEach((input, index) => {
        input.addEventListener("input", function () {
            this.value = this.value.replace(/[^0-9]/g, "");

            if (this.value && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }

            // Auto-validate when all fields are filled
            const allFilled = Array.from(codeInputs).every(inp => inp.value);
            if (allFilled) {
                setTimeout(() => validateCode(), 300);
            }
        });

        input.addEventListener("keydown", function (e) {
            if (e.key === "Backspace" && !this.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });

        // Select all on focus for easier correction
        input.addEventListener("focus", function () {
            this.select();
        });
    });

    // ======================
    // REAL-TIME PASSWORD VALIDATION WITH VISUAL FEEDBACK
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

        // Get requirement elements by ID
        const rules = [
            { regex: /.{8,}/, element: document.getElementById('rule-length') },
            { regex: /[A-Z]/, element: document.getElementById('rule-uppercase') },
            { regex: /[a-z]/, element: document.getElementById('rule-lowercase') },
            { regex: /[0-9]/, element: document.getElementById('rule-number') },
            { regex: /[!@#$%^&*(),.?":{}|<>_\-]/, element: document.getElementById('rule-special') },
            { regex: /^\S*$/, element: document.getElementById('rule-space') }
        ];

        let allValid = true;

        rules.forEach(rule => {
            const item = rule.element;
            if (!item) return;

            if (password.length === 0) {
                // No input yet - neutral state
                item.classList.remove("valid", "invalid");
            } else if (rule.regex.test(password)) {
                // Valid - green checkmark
                item.classList.add("valid");
                item.classList.remove("invalid");
            } else {
                // Invalid - red X
                item.classList.remove("valid");
                item.classList.add("invalid");
                allValid = false;
            }
        });

        // Real-time password match indicator - DYNAMIC
        let matchIndicator = document.querySelector(".password-match-indicator");

        if (!matchIndicator) {
            matchIndicator = document.createElement("div");
            matchIndicator.classList.add("password-match-indicator", "password-indicator");
            // Insert after confirm password container
            confirmPasswordInput.parentElement.after(matchIndicator);
        }

        if (confirmPassword.length > 0) {
            const passwordsMatch = password === confirmPassword;

            if (passwordsMatch) {
                matchIndicator.textContent = "✓ Passwords match";
                matchIndicator.style.color = "#27ae60";
            } else {
                matchIndicator.textContent = "✗ Passwords do not match";
                matchIndicator.style.color = "#e74c3c";
            }

            // Show with animation
            setTimeout(() => {
                matchIndicator.classList.add("show");
            }, 10);
        } else {
            matchIndicator.classList.remove("show");
        }

        const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

        // Update button state with smooth transition
        if (allValid && password.length > 0 && passwordsMatch && confirmPassword.length > 0) {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = "1";
            confirmBtn.style.cursor = "pointer";
            confirmBtn.classList.add("enabled");
        } else {
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = "0.5";
            confirmBtn.style.cursor = "not-allowed";
            confirmBtn.classList.remove("enabled");
        }
    }

    // ======================
    // PASSWORD STRENGTH METER - DYNAMIC POSITIONING
    // ======================
    function calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) strength += 20;
        return strength;
    }

    if (newPasswordInput) {
        newPasswordInput.addEventListener("input", function () {
            const strength = calculatePasswordStrength(this.value);
            let strengthMeter = document.querySelector(".strength-meter");

            if (!strengthMeter && this.value.length > 0) {
                strengthMeter = document.createElement("div");
                strengthMeter.classList.add("strength-meter", "password-indicator");
                strengthMeter.innerHTML = `
                    <div class="strength-bar">
                        <div class="strength-fill"></div>
                    </div>
                    <span class="strength-text">Password Strength: <strong>Weak</strong></span>
                `;
                // Insert after new password container
                this.parentElement.after(strengthMeter);
            }

            if (strengthMeter) {
                const fill = strengthMeter.querySelector(".strength-fill");
                const text = strengthMeter.querySelector(".strength-text strong");

                if (this.value.length === 0) {
                    strengthMeter.remove();
                    return;
                }

                fill.style.width = strength + "%";

                if (strength < 40) {
                    fill.style.background = "#e74c3c";
                    text.textContent = "Weak";
                    text.style.color = "#e74c3c";
                } else if (strength < 70) {
                    fill.style.background = "#f39c12";
                    text.textContent = "Medium";
                    text.style.color = "#f39c12";
                } else {
                    fill.style.background = "#27ae60";
                    text.textContent = "Strong";
                    text.style.color = "#27ae60";
                }

                setTimeout(() => {
                    strengthMeter.classList.add("show");
                }, 10);
            }
        });
    }
});

// ======================
// FORGOT PASSWORD MODAL SYSTEM
// ======================
function openForgot() {
    const overlay = document.getElementById('forgotOverlay');
    const stepEmail = document.getElementById('stepEmail');

    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.classList.add('active');
        stepEmail.classList.add('active');
    }, 10);

    document.getElementById('emailInput')?.focus();
}

function closeForgot() {
    const overlay = document.getElementById('forgotOverlay');
    const modals = document.querySelectorAll('.forgot-modal');

    overlay.classList.remove('active');

    setTimeout(() => {
        overlay.style.display = 'none';
        modals.forEach(modal => {
            modal.classList.remove('active', 'closing');
        });

        // Reset to first step
        document.getElementById('stepEmail').classList.add('active');

        // Clear inputs
        document.getElementById('emailInput').value = '';
        document.querySelectorAll('.code-boxes input').forEach(input => {
            input.value = '';
            input.style.borderColor = '';
            input.style.backgroundColor = '';
        });
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';

        // Remove dynamic indicators
        document.querySelectorAll('.password-indicator').forEach(el => el.remove());
    }, 300);
}

function goToCode() {
    const emailInput = document.getElementById('emailInput');
    const email = emailInput.value.trim();
    const emailError = document.getElementById('emailError');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailError.style.display = 'block';
        emailInput.style.borderColor = '#e74c3c';

        // Shake animation
        emailInput.classList.add('error-shake');
        setTimeout(() => emailInput.classList.remove('error-shake'), 500);
        return;
    }

    emailError.style.display = 'none';
    emailInput.style.borderColor = '';

    // Show verification message
    const stepEmail = document.getElementById('stepEmail');
    const verifyMessage = document.getElementById('verifyMessage');
    const stepCode = document.getElementById('stepCode');

    stepEmail.classList.remove('active');
    stepEmail.classList.add('closing');

    setTimeout(() => {
        stepEmail.classList.remove('closing');
        verifyMessage.classList.add('active');

        setTimeout(() => {
            verifyMessage.classList.remove('active');
            verifyMessage.classList.add('closing');

            setTimeout(() => {
                verifyMessage.classList.remove('closing');
                stepCode.classList.add('active');
                startResendTimer();
                document.querySelector('.code-boxes input')?.focus();
            }, 500);
        }, 2000);
    }, 500);
}

function validateCode() {
    const inputs = document.querySelectorAll('.code-boxes input');
    const code = Array.from(inputs).map(input => input.value).join('');

    if (code.length !== 6) {
        showToast("Please enter the complete 6-digit code.", "error");
        return;
    }

    // Simulate code validation (replace with actual backend call)
    const isValid = code === "123456"; // Demo: accept 123-456

    inputs.forEach(input => {
        if (isValid) {
            input.style.borderColor = "#27ae60";
            input.style.backgroundColor = "#d5f4e6";
        } else {
            input.style.borderColor = "#e74c3c";
            input.style.backgroundColor = "#fadbd8";
        }
    });

    if (isValid) {
        setTimeout(() => {
            showToast("Code verified successfully!", "success");
            goToNewPass();
        }, 500);
    } else {
        showToast("Invalid verification code. Please try again.", "error");

        // Shake animation
        const codeBoxes = document.querySelector('.code-boxes');
        codeBoxes.classList.add('error-shake');
        setTimeout(() => codeBoxes.classList.remove('error-shake'), 500);

        // Clear inputs after a delay
        setTimeout(() => {
            inputs.forEach(input => {
                input.value = '';
                input.style.borderColor = '';
                input.style.backgroundColor = '';
            });
            inputs[0]?.focus();
        }, 1000);
    }
}

function goToNewPass() {
    const stepCode = document.getElementById('stepCode');
    const stepNewPassword = document.getElementById('stepNewPassword');

    stepCode.classList.remove('active');
    stepCode.classList.add('closing');

    setTimeout(() => {
        stepCode.classList.remove('closing');
        stepNewPassword.classList.add('active');
        document.getElementById('newPassword')?.focus();
    }, 500);
}

function finishReset() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    const confirmPass = document.getElementById('confirmNewPassword');
    const confirmBtn = document.querySelector("#stepNewPassword .confirm-btn");

    document.querySelectorAll(".error-text-container").forEach(e => e.remove());

    const errors = validatePasswordRules(newPassword);
    if (newPassword !== confirmPassword) {
        errors.push("Passwords do not match.");
    }

    if (errors.length > 0) {
        showErrorMessages(confirmPass, errors);

        // Shake animation for error
        const modal = document.getElementById('stepNewPassword');
        modal.classList.add('error-shake');
        setTimeout(() => modal.classList.remove('error-shake'), 500);
        return;
    }

    // Show loading state
    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = "RESETTING...";
    confirmBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        confirmBtn.textContent = originalText;

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
                    showToast("Password reset successful! You can now log in.", "success");
                }, 500);
            }, 3000);
        }, 500);
    }, 1500);
}

function showErrorMessages(input, messages) {
    const existing = input.parentNode.parentNode.querySelector(".error-text-container");
    if (existing) existing.remove();

    const box = document.createElement("div");
    box.classList.add("error-text-container");

    const ul = document.createElement("ul");
    ul.classList.add("rules-list");
    messages.forEach(msg => {
        const li = document.createElement("li");
        li.innerHTML = `<span style="color: #e74c3c;">✗</span> ${msg}`;
        ul.appendChild(li);
    });

    box.appendChild(ul);
    input.parentNode.parentNode.appendChild(box);
}

function validatePasswordRules(password) {
    const rules = [
        { regex: /.{8,}/, message: "Must be at least 8 characters long" },
        { regex: /[A-Z]/, message: "Must include one uppercase letter (A–Z)" },
        { regex: /[a-z]/, message: "Must include one lowercase letter (a–z)" },
        { regex: /[0-9]/, message: "Must include one number (0–9)" },
        { regex: /[!@#$%^&*(),.?":{}|<>_\-]/, message: "Must include one special character" },
        { regex: /^\S*$/, message: "Must not contain spaces" }
    ];
    return rules.filter(rule => !rule.regex.test(password)).map(rule => rule.message);
}

// ======================
// TOGGLE PASSWORD WITH SMOOTH ANIMATION
// ======================
function togglePassword(id, el) {
    const input = document.getElementById(id);
    const isPassword = input.type === "password";

    input.type = isPassword ? "text" : "password";

    // Toggle eye icon
    const eyeIcon = el.querySelector('.eye-icon');
    if (isPassword) {
        // Show closed eye (visible state)
        eyeIcon.innerHTML = `<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"></path>`;
    } else {
        // Show open eye (hidden state)
        eyeIcon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
    }

    // Add animation class
    el.classList.add("toggle-animation");
    setTimeout(() => el.classList.remove("toggle-animation"), 300);
}

// ======================
// RESEND CODE TIMER WITH BETTER UX
// ======================
function startResendTimer() {
    const resendBtn = document.getElementById("resendBtn");
    const countdownDisplay = document.getElementById("countdown");
    if (!resendBtn || !countdownDisplay) return;

    let countdown = 30;
    resendBtn.classList.remove("enabled");
    resendBtn.style.pointerEvents = "none";
    countdownDisplay.textContent = formatTime(countdown);

    const interval = setInterval(() => {
        countdown--;
        countdownDisplay.textContent = formatTime(countdown);

        if (countdown <= 0) {
            clearInterval(interval);
            resendBtn.classList.add("enabled");
            resendBtn.style.pointerEvents = "auto";
            countdownDisplay.textContent = "00:00";
            showToast("You can now resend the code", "info");
        }
    }, 1000);

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
}

function resendCode() {
    const resendBtn = document.getElementById("resendBtn");
    if (resendBtn.classList.contains("enabled")) {
        resendBtn.textContent = "Sending...";

        setTimeout(() => {
            showToast("Verification code resent successfully!", "success");
            resendBtn.textContent = "Resend code";
            startResendTimer();

            // Clear code inputs
            document.querySelectorAll(".code-boxes input").forEach(input => {
                input.value = "";
                input.style.borderColor = "";
                input.style.backgroundColor = "";
            });
            document.querySelector(".code-boxes input")?.focus();
        }, 1000);
    }
}

// ======================
// TOAST NOTIFICATION SYSTEM
// ======================
function showToast(message, type = "info") {
    const existingToast = document.querySelector(".toast-notification");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.classList.add("toast-notification", `toast-${type}`);

    const icons = {
        success: "✓",
        error: "✗",
        info: "ℹ",
        warning: "⚠"
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ======================
// KEYBOARD SHORTCUTS
// ======================
document.addEventListener("keydown", function (e) {
    // ESC to close modal
    if (e.key === "Escape") {
        const overlay = document.getElementById('forgotOverlay');
        if (overlay && overlay.style.display === 'flex') {
            closeForgot();
        }
    }
});

// Close modal when clicking outside
document.getElementById('forgotOverlay')?.addEventListener('click', function (e) {
    if (e.target === this) {
        closeForgot();
    }
});