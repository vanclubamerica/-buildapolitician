/* =========================================================================
   results.js — reads the last simulation stored by simulator.js and
   renders the full post-election breakdown.
   ========================================================================= */

function initResultsPage() {
  const result = Storage.load(Storage.KEY_RESULT);
  const missing = document.getElementById("resultsMissing");
  const wrap = document.getElementById("resultsWrap");

  if (!result) {
    missing.style.display = "block";
    wrap.style.display = "none";
    return;
  }
  missing.style.display = "none";
  wrap.style.display = "block";

  const winnerIsPlayer = result.winnerKey === "player";
  const winner = result.winnerCandidate;
  const loser = result.loserCandidate;

  document.getElementById("winnerBannerText").textContent = `${winner.name} Wins the Election`;
  document.getElementById("winnerBannerSub").textContent =
    `${winner.party} • ${result.rating} • ${winnerIsPlayer ? result.electorsA : result.electorsB} electoral votes to ${winnerIsPlayer ? result.electorsB : result.electorsA}`;

  document.getElementById("popularSummary").innerHTML = `
    <div class="stat-tile card"><span class="big-num">${result.popVoteA.toFixed(1)}%</span><span class="tile-label">${result.player.name}</span></div>
    <div class="stat-tile card"><span class="big-num">${result.popVoteB.toFixed(1)}%</span><span class="tile-label">${result.opponent.name}</span></div>
    <div class="stat-tile card"><span class="big-num">${result.otherShare.toFixed(1)}%</span><span class="tile-label">Other / Undecided</span></div>
    <div class="stat-tile card"><span class="big-num">${result.electorsA} – ${result.electorsB}</span><span class="tile-label">Electoral Vote</span></div>
  `;

  document.getElementById("strengthsList").innerHTML = result.strengths.map(s => `<li>${s}</li>`).join("");
  document.getElementById("weaknessesList").innerHTML = result.weaknesses.map(s => `<li>${s}</li>`).join("");
  document.getElementById("decidingIssues").innerHTML = result.decidingIssues.map(i => `<span class="badge">${i}</span>`).join(" ");
  document.getElementById("influentialEvent").textContent =
    `${result.mostInfluentialEvent.label} — ${(result.mostInfluentialEvent.target === "player" ? result.player.name : result.opponent.name)} ${result.mostInfluentialEvent.text}`;

  document.getElementById("explanationText").innerHTML = buildExplanation(result);

  document.getElementById("funStats").innerHTML = `
    <div class="stat-tile card"><span class="big-num">${result.statesWonA}</span><span class="tile-label">States Won — ${result.player.name}</span></div>
    <div class="stat-tile card"><span class="big-num">${result.statesWonB}</span><span class="tile-label">States Won — ${result.opponent.name}</span></div>
    <div class="stat-tile card"><span class="big-num">${result.swingStatesWon}</span><span class="tile-label">Swing States Won by Winner</span></div>
    <div class="stat-tile card"><span class="big-num">${result.events.length}</span><span class="tile-label">Campaign Events</span></div>
  `;

  document.getElementById("ratingBadge").textContent = result.rating;

  launchConfetti(document.getElementById("confettiLayer"), 80);
}

function buildExplanation(result) {
  const winner = result.winnerCandidate;
  const strongestTrait = result.strengths[0];
  const topIssue = result.decidingIssues[0];
  return `<p><strong>${winner.name}</strong> secured the presidency largely on the strength of ${strongestTrait.toLowerCase()}
    and a platform that aligned closely with the national mood on <strong>${topIssue}</strong>.
    The <strong>${result.mostInfluentialEvent.label}</strong> proved to be the single most influential moment of the race,
    reshaping the trajectory of the final days of campaigning. In the end, ${winner.name} carried
    ${result.winnerKey === "player" ? result.statesWonA : result.statesWonB} states worth
    ${result.winnerKey === "player" ? result.electorsA : result.electorsB} electoral votes,
    a result the model classifies as a <strong>${result.rating}</strong>.</p>`;
}

document.addEventListener("DOMContentLoaded", initResultsPage);
