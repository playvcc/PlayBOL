// ===============================
// SECTOR 7 — GLOBAL APP SCRIPT
// ===============================

// Initialize Supabase
const supabaseUrl = "https://absqahnhiydzoztddlzl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFic3FhaG5oaXlkem96dGRkbHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNDc3NTMsImV4cCI6MjA5NzcyMzc1M30.q9QLWIu4bSbs7Zr98K4l-AiCNzbNcLo4nAUyXVaYsSg";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// ===============================
// NOTIFICATION SYSTEM
// ===============================
function notify(message) {
  const box = document.getElementById("notification");
  if (!box) return;

  box.textContent = message;
  box.style.opacity = 1;

  setTimeout(() => {
    box.style.opacity = 0;
  }, 2500);
}

// ===============================
// AUTH BUTTON HANDLING
// ===============================
async function updateAuthButtons() {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  const { data } = await supabase.auth.getUser();

  if (data.user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

updateAuthButtons();

// ===============================
// LOGOUT BUTTON
// ===============================
async function logoutUser() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) logoutBtn.onclick = logoutUser;

// ===============================
// AUTH STATE LISTENER
// ===============================
supabase.auth.onAuthStateChange(() => {
  updateAuthButtons();
});
// ===============================
// LOGIN FUNCTION
// ===============================
async function loginUser() {
  const email = document.getElementById("login-email")?.value;
  const password = document.getElementById("login-password")?.value;

  if (!email || !password) {
    notify("Please enter email and password.");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    notify(error.message);
    return;
  }

  notify("Logged in successfully!");
  window.location.href = "index.html";
}

const loginSubmit = document.getElementById("login-submit");
if (loginSubmit) loginSubmit.onclick = loginUser;


// ===============================
// SIGNUP FUNCTION
// ===============================
async function signupUser() {
  const username = document.getElementById("signup-username")?.value;
  const email = document.getElementById("signup-email")?.value;
  const password = document.getElementById("signup-password")?.value;

  if (!username || !email || !password) {
    notify("Please fill out all fields.");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        username: username
      }
    }
  });

  if (error) {
    notify(error.message);
    return;
  }

  notify("Account created! You can now log in.");
  window.location.href = "login.html";
}

const signupSubmit = document.getElementById("signup-submit");
if (signupSubmit) signupSubmit.onclick = signupUser;
