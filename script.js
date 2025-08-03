async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function validPassword(pw) {
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const isLongEnough = pw.length >= 8;
  return hasUpper && hasLower && hasSpecial && isLongEnough;
}

// Handle Signup
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorMsg = document.getElementById("errorMessage");

    if (!email || !password || !confirmPassword) {
      errorMsg.textContent = "All fields are required.";
      return;
    }

    if (!validPassword(password)) {
      errorMsg.textContent = "Password must be at least 8 characters, with uppercase, lowercase, and special character.";
      return;
    }

    if (password !== confirmPassword) {
      errorMsg.textContent = "Passwords do not match.";
      return;
    }

    // ✅ Load latest users from localStorage
    const storedUsers = localStorage.getItem("users");
    const users = storedUsers ? JSON.parse(storedUsers) : {};

    if (users[email]) {
      errorMsg.textContent = "Email is already registered.";
      return;
    }

    const hashedPassword = await hashPassword(password);
    users[email] = hashedPassword;

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("username", email); // optional: used for session

    errorMsg.textContent = "";
    window.location.href = "homepage.html"; // redirect after successful signup
  });
}

// Handle Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("errorMessage");

    if (!email || !password) {
      errorMsg.textContent = "Please fill both fields.";
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "{}");

    if (!users[email]) {
      errorMsg.textContent = "Account does not exist.";
      return;
    }

    const hashedPassword = await hashPassword(password);

    if (users[email] !== hashedPassword) {
      errorMsg.textContent = "Incorrect password.";
      return;
    }

    localStorage.setItem("username", email); // optional: used for session
    errorMsg.textContent = "";
    window.location.href = "homepage.html"; // redirect after successful login
  });
}
