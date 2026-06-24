console.log("Sector 7 front-end loaded");

// 1) Supabase config (replace with your real values)
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_PUBLIC_ANON_KEY";

// If you include supabase-js via CDN in <head>:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
let supabaseClient = null;
if (typeof supabase !== "undefined") {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 2) Example: load 4v4 ladder into ladders.html
async function loadLadder4v4() {
  if (!supabaseClient) return;

  const { data, error } = await supabaseClient
    .from("teams")
    .select("id, name, xp, wins, losses")
    .eq("ladder_type", "4v4_mlg")
    .order("xp", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error loading 4v4 ladder:", error);
    return;
  }

  const tbody = document.querySelector("#ladder-4v4 tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  data.forEach((team, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${team.name}</td>
      <td>${team.wins}-${team.losses}</td>
      <td>${team.xp}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 3) Example: handle match report form (matches.html)
async function handleReportMatch(event) {
  event.preventDefault();
  if (!supabaseClient) return;

  const form = event.target;
  const statusEl = document.getElementById("report-match-status");

  const payload = {
    reporting_team: form.reporting_team.value,
    opponent_team: form.opponent_team.value,
    ladder: form.ladder.value,
    mode: form.mode.value,
    score: form.score.value,
    winner: form.winner.value,
  };

  const { data, error } = await supabaseClient
    .from("matches")
    .insert([payload])
    .select();

  if (error) {
    console.error("Error reporting match:", error);
    if (statusEl) statusEl.textContent = "Error reporting match.";
    return;
  }

  if (statusEl) statusEl.textContent = "Match submitted for review.";
  form.reset();
}

// 4) Init on page load
document.addEventListener("DOMContentLoaded", () => {
  const ladder4v4Table = document.getElementById("ladder-4v4");
  if (ladder4v4Table) {
    loadLadder4v4();
  }

  const reportForm = document.getElementById("report-match-form");
  if (reportForm) {
    reportForm.addEventListener("submit", handleReportMatch);
  }
});
