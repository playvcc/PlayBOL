// assets/app.js

const SUPABASE_URL = "https://absqahnhiydzoztddlzl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFic3FhaG5oaXlkem96dGRkbHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNDc3NTMsImV4cCI6MjA5NzcyMzc1M30.q9QLWIu4bSbs7Zr98K4l-AiCNzbNcLo4nAUyXVaYsSg";

const supabase = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");

  switch (page) {
    case "home":
      loadHome();
      break;
    case "ladders":
      loadLadders();
      break;
    case "teams":
      loadTeams();
      initTeamCreation();
      break;
    case "players":
      loadPlayers();
      break;
    case "divisions":
      loadDivisions();
      break;
    case "matches":
      loadMatches();
      break;
    case "rankings":
      loadRankings();
      break;
    case "tournaments":
      loadTournaments();
      break;
    case "recruitment":
      initRecruitmentForm();
      break;
    case "support":
      initSupportForm();
      break;
    case "hall-of-fame":
      loadHallOfFame();
      break;
    case "admin":
      initAdmin();
      loadPendingTeams();
      break;
    default:
      break;
  }
});

// HOME
async function loadHome() {
  if (!supabase) return;

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("xp", { ascending: false })
    .limit(5);

  const list = document.getElementById("top-teams-list");
  if (list && teams) {
    list.innerHTML = "";
    teams.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = `${t.name} — ${t.xp} XP`;
      list.appendChild(li);
    });
  }

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("xp", { ascending: false })
    .limit(5);

  const playersList = document.getElementById("top-players-list");
  if (playersList && players) {
    playersList.innerHTML = "";
    players.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = `${p.gamertag} — ${p.xp} XP`;
      list.appendChild(li);
    });
  }

  const { data: matches } = await supabase
    .from("matches")
    .select(
      "*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)"
    )
    .eq("status", "live")
    .limit(5);

  const liveList = document.getElementById("live-matches-list");
  if (liveList && matches) {
    liveList.innerHTML = "";
    matches.forEach((m) => {
      const li = document.createElement("li");
      li.textContent = `${m.home_team.name} vs ${m.away_team.name} — ${
        m.mode || ""
      }: ${m.map_name || ""} (LIVE)`;
      liveList.appendChild(li);
    });
  }
}

// LADDERS
async function loadLadders() {
  if (!supabase) return;
  const { data } = await supabase.from("ladders").select("*");
  const tbody = document.querySelector("#ladders-table tbody");
  if (!tbody || !data) return;
  tbody.innerHTML = "";
  data.forEach((l) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${l.name}</td>
      <td>${l.mode}</td>
      <td>${l.team_size}v${l.team_size}</td>
      <td>${l.season_label}</td>
    `;
    tbody.appendChild(tr);
  });
}

// TEAMS
async function loadTeams() {
  if (!supabase) return;
  const { data } = await supabase
    .from("teams")
    .select("*, division:divisions(name)")
    .order("xp", { ascending: false });

  const tbody = document.querySelector("#teams-table tbody");
  if (!tbody || !data) return;
  tbody.innerHTML = "";
  data.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.name}</td>
      <td>${t.division ? t.division.name : "—"}</td>
      <td>${t.xp}</td>
      <td>${t.record_wins}-${t.record_losses}</td>
    `;
    tbody.appendChild(tr);
  });
}

// DIVISIONS
async function loadDivisions() {
  if (!supabase) return;
  const { data } = await supabase.from("divisions").select("*");
  const list = document.getElementById("divisions-list");
  if (!list || !data) return;
  list.innerHTML = "";
  data.forEach((d) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${d.name}:</strong> ${d.description || ""}`;
    list.appendChild(li);
  });
}

// PLAYERS
async function loadPlayers() {
  if (!supabase) return;
  const { data } = await supabase
    .from("players")
    .select("*, team:teams(name)")
    .order("xp", { ascending: false });

  const tbody = document.querySelector("#players-table tbody");
  if (!tbody || !data) return;
  tbody.innerHTML = "";
  data.forEach((p, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.gamertag}</td>
      <td>${p.team ? p.team.name : "Free Agent"}</td>
      <td>${p.xp}</td>
      <td>${index + 1}</td>
    `;
    tbody.appendChild(tr);
  });
}

// MATCHES
async function loadMatches() {
  if (!supabase) return;
  const { data } = await supabase
    .from("matches")
    .select(
      "*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)"
    )
    .order("created_at", { ascending: false })
    .limit(20);

  const tbody = document.querySelector("#matches-table tbody");
  if (!tbody || !data) return;
  tbody.innerHTML = "";
  data.forEach((m) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.home_team.name}</td>
      <td>${m.away_team.name}</td>
      <td>${m.mode || ""}</td>
      <td>${m.map_name || ""}</td>
      <td>${m.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

// RANKINGS
async function loadRankings() {
  if (!supabase) return;
  const { data } = await supabase
    .from("teams")
    .select("*")
    .order("xp", { ascending: false });

  const tbody = document.querySelector("#rankings-table tbody");
  if (!tbody || !data) return;
  tbody.innerHTML = "";
  data.forEach((t, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${t.name}</td>
      <td>${t.xp}</td>
      <td>${t.record_wins}-${t.record_losses}</td>
    `;
    tbody.appendChild(tr);
  });
}

// TOURNAMENTS
async function loadTournaments() {
  if (!supabase) return;
  const { data } = await supabase.from("tournaments").select("*");
  const list = document.getElementById("tournaments-list");
  if (!list || !data) return;
  list.innerHTML = "";
  data.forEach((t) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${t.name}</strong> — ${t.status} — ${
      t.start_date || ""
    }`;
    list.appendChild(li);
  });
}

// RECRUITMENT
function initRecruitmentForm() {
  const form = document.getElementById("recruitment-form");
  const msg = document.getElementById("recruitment-message");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!supabase) {
      msg.textContent = "Backend not configured.";
      return;
    }

    const formData = new FormData(form);
    const payload = {
      gamertag: formData.get("gamertag"),
      division_preference: formData.get("division"),
      role: formData.get("role"),
      reason: formData.get("reason"),
    };

    const { error } = await supabase
      .from("recruitment_applications")
      .insert(payload);
    msg.textContent = error
      ? "Error submitting application."
      : "Application submitted. Staff will review soon.";

    if (!error) form.reset();
  });
}

// SUPPORT
function initSupportForm() {
  const form = document.getElementById("support-form");
  const msg = document.getElementById("support-message");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!supabase) {
      msg.textContent = "Backend not configured.";
      return;
    }

    const formData = new FormData(form);
    const payload = {
      email: formData.get("email"),
      category: formData.get("category"),
      details: formData.get("details"),
    };

    const { error } = await supabase
      .from("support_tickets")
      .insert(payload);
    msg.textContent = error
      ? "Error submitting ticket."
      : "Ticket submitted. Staff will respond soon.";

    if (!error) form.reset();
  });
}

// HALL OF FAME
async function loadHallOfFame() {
  if (!supabase) return;
  const { data } = await supabase
    .from("hall_of_fame")
    .select("*")
    .order("year", { ascending: false });

  const list = document.getElementById("hof-list");
  if (!list || !data) return;
  list.innerHTML = "";
  data.forEach((entry) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${entry.name}</strong> (${entry.year}) — ${
      entry.description
    }`;
    list.appendChild(li);
  });
}

// DIVISION SELECT FOR TEAM CREATION
async function loadDivisionsIntoSelect() {
  if (!supabase) return;
  const { data } = await supabase.from("divisions").select("*");
  const select = document.getElementById("division-select");
  if (!select || !data) return;

  select.innerHTML = "";
  data.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.name;
    select.appendChild(opt);
  });
}

// TEAM CREATION (CAPTAIN)
async function initTeamCreation() {
  const form = document.getElementById("create-team-form");
  const msg = document.getElementById("team-create-message");
  if (!form || !supabase) return;

  await loadDivisionsIntoSelect();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData || !userData.user) {
      msg.textContent = "You must be logged in as a captain.";
      return;
    }

    const formData = new FormData(form);
    const payload = {
      captain_id: userData.user.id,
      team_name: formData.get("team_name"),
      division_id: formData.get("division_id"),
    };

    const { error } = await supabase
      .from("team_creation_requests")
      .insert(payload);

    msg.textContent = error
      ? "Error submitting team request."
      : "Team submitted for approval.";

    if (!error) form.reset();
  });
}

// ADMIN
function initAdmin() {
  const form = document.getElementById("admin-login-form");
  const msg = document.getElementById("admin-login-message");
  const dashboard = document.getElementById("admin-dashboard");
  const refreshBtn = document.getElementById("refresh-data");

  if (!form || !supabase) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const email = formData.get("email");
    const password = formData.get("password");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      msg.textContent = "Login failed.";
    } else {
      msg.textContent = "Logged in.";
      form.style.display = "none";
      if (dashboard) dashboard.style.display = "block";
      loadPendingTeams();
    }
  });

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadPendingTeams();
    });
  }
}

// PENDING TEAM REQUESTS
async function loadPendingTeams() {
  if (!supabase) return;

  const { data } = await supabase
    .from("team_creation_requests")
    .select("*, divisions(name)")
    .eq("approved", false);

  const list = document.getElementById("pending-team-list");
  if (!list || !data) return;

  list.innerHTML = "";
  data.forEach((req) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${req.team_name}</strong> (${req.divisions.name})
      <button onclick="approveTeam('${req.id}', '${req.team_name}', '${req.division_id}', '${req.captain_id}')">
        Approve
      </button>
    `;
    list.appendChild(li);
  });
}

// APPROVE TEAM
async function approveTeam(id, name, division_id, captain_id) {
  if (!supabase) return;

  await supabase.from("teams").insert({
    name,
    division_id,
    created_by: captain_id,
  });

  await supabase
    .from("team_creation_requests")
    .update({ approved: true })
    .eq("id", id);

  loadPendingTeams();
  loadTeams();
}
