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
