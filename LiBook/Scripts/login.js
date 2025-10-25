document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault(); // prevents reload

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
    modals.forEach(m => {
        m.classList.remove('active', 'closing');
    });
}

function goToCode() {
    const emailInput = document.getElementById("emailInput");
    const emailError = document.getElementById("emailError");
    const verifyMessage = document.getElementById("verifyMessage");
    const stepEmail = document.getElementById('stepEmail');
    const stepCode = document.getElementById('stepCode');

    // Make sure we only check when user clicked the button
    const emailValue = emailInput.value.trim();

    if (!emailValue || !emailValue.includes("@")) {
        if (emailError) emailError.style.visibility = "visible";
        return; // Stop execution if invalid
    } else {
        if (emailError) emailError.style.visibility = "hidden";
    }

    // Hide email step
    if (stepEmail) stepEmail.classList.remove('active');

    // Show verification message
    if (verifyMessage) {
        verifyMessage.classList.add('active');
        verifyMessage.style.display = "block";
        verifyMessage.style.opacity = 1;

        setTimeout(() => {
            verifyMessage.classList.remove('active');
            verifyMessage.classList.add('closing');

            setTimeout(() => {
                verifyMessage.classList.remove('closing');
                verifyMessage.style.display = "none";

                // Show code input step
                if (stepCode) stepCode.classList.add('active');

                // Focus first code input
                const firstCodeInput = document.querySelector(".code-boxes input");
                if (firstCodeInput) firstCodeInput.focus();

                startResendTimer();
            }, 500);
        }, 2000);
    }
}

// Optional: hide error when typing
document.getElementById("emailInput").addEventListener("input", function () {
    const emailError = document.getElementById("emailError");
    if (emailError) emailError.style.visibility = "hidden";
});


function goToNewPass() {
    const stepCode = document.getElementById('stepCode');
    const stepNewPassword = document.getElementById('stepNewPassword');
    if (stepCode) stepCode.classList.remove('active');
    if (stepNewPassword) stepNewPassword.classList.add('active');
}

function finishReset() {
    alert("Password reset successful!");
    closeForgot();
}

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
    alert("Verification code resent!");
    startResendTimer();
}
