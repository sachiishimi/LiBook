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

        // temporary action (static)
        alert("Login clicked!\nEmail: " + email);
    });
});

function openForgot() {
    document.getElementById('forgotOverlay').style.display = 'flex';
    document.getElementById('stepEmail').classList.add('active');
}

function closeForgot() {
    document.getElementById('forgotOverlay').style.display = 'none';
    document.querySelectorAll('.forgot-modal').forEach(m => m.classList.remove('active'));
}

function goToCode() {
    document.getElementById('stepEmail').classList.remove('active');
    document.getElementById('stepCode').classList.add('active');
}

function goToNewPass() {
    document.getElementById('stepCode').classList.remove('active');
    document.getElementById('stepNewPassword').classList.add('active');
}

function finishReset() {
    alert("Password reset successful!");
    closeForgot();
}

function resendCode() {
    alert("Verification code resent!");
}

function togglePassword(id, el) {
    const input = document.getElementById(id);
    input.type = input.type === "password" ? "text" : "password";
    el.textContent = input.type === "password" ? "👁️" : "🙈";
}

