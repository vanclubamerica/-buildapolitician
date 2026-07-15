/* =========================================================================
   builder.js — Create Politician page.
   Renders the policy chip groups + trait sliders from data.js, keeps a
   live "candidate" object in memory, mirrors it onto the preview card,
   and implements save / download / load / reset / print.
   ========================================================================= */

const TRAITS = [
  { id: "charisma", label: "Charisma" },
  { id: "integrity", label: "Integrity" },
  { id: "publicSpeaking", label: "Public Speaking" },
  { id: "debateSkill", label: "Debate Skill" },
  { id: "fundraising", label: "Fundraising Ability" },
  { id: "popularity", label: "Popularity" },
  { id: "experience", label: "Experience" },
  { id: "intelligence", label: "Intelligence" }
];

let candidate = defaultCandidate();

function defaultCandidate() {
  return {
    name: "", party: "", slogan: "", age: 45, state: "Texas",
    experience: "", occupation: "", leadership: GameData.LEADERSHIP_STYLES[0],
    speech: GameData.SPEECH_STYLES[0],
    economicFocus: "", foreignPolicyFocus: "",
    educationPosition: "", healthcarePosition: "", immigrationPosition: "",
    environmentPosition: "", crimePosition: "", taxPosition: "",
    militaryPosition: "", governmentSize: "",
    traits: { charisma: 60, integrity: 60, publicSpeaking: 60, debateSkill: 60,
      fundraising: 60, popularity: 60, experience: 60, intelligence: 60 },
    logoColor: GameData.LOGO_COLOR_PALETTE[0]
  };
}

function buildSelectOptions(select, list, selected) {
  select.innerHTML = "";
  list.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item; opt.textContent = item;
    if (item === selected) opt.selected = true;
    select.appendChild(opt);
  });
}

function renderPolicyGroups() {
  const wrap = document.getElementById("policyGroups");
  wrap.innerHTML = "";
  GameData.POLICY_QUESTIONS.forEach(q => {
    const fs = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = q.label;
    fs.appendChild(legend);
    const group = document.createElement("div");
    group.className = "choice-group";
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", q.label);
    q.options.forEach(opt => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "choice-chip";
      chip.textContent = opt.value;
      chip.setAttribute("role", "radio");
      chip.setAttribute("aria-checked", candidate[q.id] === opt.value ? "true" : "false");
      if (candidate[q.id] === opt.value) chip.classList.add("selected");
      chip.addEventListener("click", () => {
        candidate[q.id] = opt.value;
        group.querySelectorAll(".choice-chip").forEach(c => { c.classList.remove("selected"); c.setAttribute("aria-checked", "false"); });
        chip.classList.add("selected");
        chip.setAttribute("aria-checked", "true");
        playBlip(500, 0.06);
        updatePreview();
      });
      group.appendChild(chip);
    });
    fs.appendChild(group);
    wrap.appendChild(fs);
    if (!candidate[q.id]) candidate[q.id] = q.options[0].value;
  });
}

function renderTraitSliders() {
  const wrap = document.getElementById("traitSliders");
  wrap.innerHTML = "";
  TRAITS.forEach(t => {
    const field = document.createElement("div");
    field.className = "slider-field";
    field.innerHTML = `
      <label for="trait-${t.id}">${t.label}</label>
      <div class="slider-row">
        <input type="range" min="0" max="100" value="${candidate.traits[t.id]}" id="trait-${t.id}" />
        <span class="slider-value" id="trait-${t.id}-val">${candidate.traits[t.id]}</span>
      </div>`;
    wrap.appendChild(field);
    const input = field.querySelector("input");
    const val = field.querySelector(".slider-value");
    input.addEventListener("input", () => {
      candidate.traits[t.id] = Number(input.value);
      val.textContent = input.value;
      updatePreview();
    });
  });
}

function renderColorSwatches() {
  const wrap = document.getElementById("colorSwatches");
  wrap.innerHTML = "";
  GameData.LOGO_COLOR_PALETTE.forEach(color => {
    const sw = document.createElement("button");
    sw.type = "button";
    sw.className = "color-swatch";
    sw.style.background = color;
    sw.setAttribute("aria-label", "Choose logo color " + color);
    if (candidate.logoColor === color) sw.classList.add("selected");
    sw.addEventListener("click", () => {
      candidate.logoColor = color;
      wrap.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("selected"));
      sw.classList.add("selected");
      updatePreview();
    });
    wrap.appendChild(sw);
  });
}

function bindTextField(id, key, isNumber) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = candidate[key] ?? "";
  el.addEventListener("input", () => {
    candidate[key] = isNumber ? Number(el.value) : el.value;
    updatePreview();
  });
}

function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

function updatePreview() {
  const p = document.getElementById("previewCard");
  const traitsHtml = TRAITS.map(t => {
    const v = candidate.traits[t.id];
    return `<div class="stat-bar-row"><span>${t.label}</span>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${v}%"></div></div>
      <span>${v}</span></div>`;
  }).join("");

  p.innerHTML = `
    <div class="candidate-card-banner" style="background:linear-gradient(135deg, ${candidate.logoColor}, var(--navy-900));">
    </div>
    <div class="candidate-card-body">
      <div class="candidate-avatar" style="border-color:var(--card-bg); background:${candidate.logoColor}22;">${initials(candidate.name || "Your Candidate")}</div>
      <h3 class="candidate-name">${candidate.name || "Your Candidate"}</h3>
      <div class="candidate-party">${candidate.party || "Independent Party"}</div>
      <p class="candidate-slogan">"${candidate.slogan || "A slogan for the ages"}"</p>
      <dl class="candidate-meta">
        <dt>Age</dt><dd>${candidate.age || "—"}</dd>
        <dt>Home State</dt><dd>${candidate.state || "—"}</dd>
        <dt>Occupation</dt><dd>${candidate.occupation || "—"}</dd>
        <dt>Leadership</dt><dd>${candidate.leadership || "—"}</dd>
      </dl>
      <div class="stat-bars">${traitsHtml}</div>
    </div>`;
}

function validateCandidate() {
  const errors = [];
  if (!candidate.name.trim()) errors.push("Candidate Name is required.");
  if (!candidate.party.trim()) errors.push("Political Party Name is required.");
  if (!candidate.slogan.trim()) errors.push("Campaign Slogan is required.");
  if (!candidate.age || candidate.age < 35 || candidate.age > 100) errors.push("Age must be between 35 and 100.");
  return errors;
}

function showFormMessage(msg, isError) {
  const el = document.getElementById("formMessage");
  el.textContent = msg;
  el.style.color = isError ? "var(--red-400)" : "#6be089";
}

function initBuilderPage() {
  const saved = Storage.load(Storage.KEY_PLAYER);
  if (saved) candidate = Object.assign(defaultCandidate(), saved);

  document.getElementById("stateSelect") && buildSelectOptions(document.getElementById("stateSelect"), GameData.US_STATE_LIST, candidate.state);
  document.getElementById("leadershipSelect") && buildSelectOptions(document.getElementById("leadershipSelect"), GameData.LEADERSHIP_STYLES, candidate.leadership);
  document.getElementById("speechSelect") && buildSelectOptions(document.getElementById("speechSelect"), GameData.SPEECH_STYLES, candidate.speech);

  bindTextField("nameInput", "name");
  bindTextField("partyInput", "party");
  bindTextField("sloganInput", "slogan");
  bindTextField("ageInput", "age", true);
  bindTextField("experienceInput", "experience");
  bindTextField("occupationInput", "occupation");
  bindTextField("economicFocusInput", "economicFocus");
  bindTextField("foreignPolicyFocusInput", "foreignPolicyFocus");

  document.getElementById("stateSelect").addEventListener("change", e => { candidate.state = e.target.value; updatePreview(); });
  document.getElementById("leadershipSelect").addEventListener("change", e => { candidate.leadership = e.target.value; updatePreview(); });
  document.getElementById("speechSelect").addEventListener("change", e => { candidate.speech = e.target.value; updatePreview(); });

  renderPolicyGroups();
  renderTraitSliders();
  renderColorSwatches();
  updatePreview();

  document.getElementById("randomSloganBtn").addEventListener("click", () => {
    candidate.slogan = GameData.generateRandomSlogan();
    document.getElementById("sloganInput").value = candidate.slogan;
    updatePreview();
    playBlip(600, 0.08);
  });

  document.getElementById("randomCandidateBtn").addEventListener("click", () => {
    randomizeCandidate();
  });

  document.getElementById("saveBtn").addEventListener("click", () => {
    const errors = validateCandidate();
    if (errors.length) { showFormMessage(errors.join(" "), true); return; }
    Storage.save(Storage.KEY_PLAYER, candidate);
    showFormMessage("Candidate saved! Head to Choose Opponent when ready.", false);
    playBlip(700, 0.15, "triangle");
  });

  document.getElementById("downloadBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(candidate, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (candidate.name ? candidate.name.replace(/\s+/g, "-").toLowerCase() : "candidate") + ".json";
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("loadInput").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const loaded = JSON.parse(reader.result);
        candidate = Object.assign(defaultCandidate(), loaded);
        document.getElementById("stateSelect").value = candidate.state;
        document.getElementById("leadershipSelect").value = candidate.leadership;
        document.getElementById("speechSelect").value = candidate.speech;
        ["nameInput,name","partyInput,party","sloganInput,slogan","ageInput,age",
         "experienceInput,experience","occupationInput,occupation",
         "economicFocusInput,economicFocus","foreignPolicyFocusInput,foreignPolicyFocus"]
         .forEach(pair => { const [id,key] = pair.split(","); const el = document.getElementById(id); if (el) el.value = candidate[key]; });
        renderPolicyGroups();
        renderTraitSliders();
        renderColorSwatches();
        updatePreview();
        showFormMessage("Candidate loaded from file.", false);
      } catch (err) {
        showFormMessage("That file could not be read as a candidate JSON.", true);
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!confirm("Reset the builder? This clears all fields.")) return;
    candidate = defaultCandidate();
    Storage.remove(Storage.KEY_PLAYER);
    location.reload();
  });

  document.getElementById("printBtn").addEventListener("click", () => window.print());
}

function randomizeCandidate() {
  candidate.name = GameData.generateRandomName();
  candidate.party = ["Unity Party","Progress Alliance","Liberty Coalition","Common Ground Party","Forward Party"][Math.floor(Math.random()*5)];
  candidate.slogan = GameData.generateRandomSlogan();
  candidate.age = 38 + Math.floor(Math.random() * 40);
  candidate.state = GameData.US_STATE_LIST[Math.floor(Math.random() * GameData.US_STATE_LIST.length)];
  candidate.occupation = ["Attorney","Business Owner","Teacher","Veteran","Doctor","Mayor","Senator"][Math.floor(Math.random()*7)];
  candidate.experience = ["Two terms in state legislature","First-time candidate","Former city council member","Longtime community organizer"][Math.floor(Math.random()*4)];
  candidate.leadership = GameData.LEADERSHIP_STYLES[Math.floor(Math.random() * GameData.LEADERSHIP_STYLES.length)];
  candidate.speech = GameData.SPEECH_STYLES[Math.floor(Math.random() * GameData.SPEECH_STYLES.length)];
  candidate.economicFocus = ["Small business growth","Manufacturing jobs","Tech innovation","Middle-class tax relief"][Math.floor(Math.random()*4)];
  candidate.foreignPolicyFocus = ["Strengthening alliances","Trade expansion","Diplomacy first","National security"][Math.floor(Math.random()*4)];
  GameData.POLICY_QUESTIONS.forEach(q => { candidate[q.id] = q.options[Math.floor(Math.random() * q.options.length)].value; });
  Object.keys(candidate.traits).forEach(k => { candidate.traits[k] = 30 + Math.floor(Math.random() * 71); });
  candidate.logoColor = GameData.LOGO_COLOR_PALETTE[Math.floor(Math.random() * GameData.LOGO_COLOR_PALETTE.length)];

  document.getElementById("nameInput").value = candidate.name;
  document.getElementById("partyInput").value = candidate.party;
  document.getElementById("sloganInput").value = candidate.slogan;
  document.getElementById("ageInput").value = candidate.age;
  document.getElementById("stateSelect").value = candidate.state;
  document.getElementById("occupationInput").value = candidate.occupation;
  document.getElementById("experienceInput").value = candidate.experience;
  document.getElementById("leadershipSelect").value = candidate.leadership;
  document.getElementById("speechSelect").value = candidate.speech;
  document.getElementById("economicFocusInput").value = candidate.economicFocus;
  document.getElementById("foreignPolicyFocusInput").value = candidate.foreignPolicyFocus;

  renderPolicyGroups();
  renderTraitSliders();
  renderColorSwatches();
  updatePreview();
  playBlip(660, 0.12, "triangle");
}

document.addEventListener("DOMContentLoaded", initBuilderPage);
