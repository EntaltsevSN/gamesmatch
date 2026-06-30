const stageTitle = document.getElementById("stage-title");
const stageDescription = document.getElementById("stage-description");
const matchCounter = document.getElementById("match-counter");
const remainingCounter = document.getElementById("remaining-counter");

const matchSection = document.getElementById("match-section");
const leftTitle = document.getElementById("left-title");
const leftCover = document.getElementById("left-cover");
const rightTitle = document.getElementById("right-title");
const rightCover = document.getElementById("right-cover");
const leftPick = document.getElementById("left-pick");
const rightPick = document.getElementById("right-pick");

const resultSection = document.getElementById("result-section");
const championTitle = document.getElementById("champion-title");
const restartBtn = document.getElementById("restart-btn");
const stageLog = document.getElementById("stage-log");

const saveRunForm = document.getElementById("save-run-form");
const runNameInput = document.getElementById("run-name-input");
const saveRunBtn = document.getElementById("save-run-btn");
const saveRunFeedback = document.getElementById("save-run-feedback");
const savedRunsSection = document.getElementById("saved-runs-section");
const savedRunsList = document.getElementById("saved-runs-list");

const STORAGE_KEY = "ps1major_runs";
const LOCAL_COVERS_BASE_PATH = "./covers/";

const STAGE_META = [
  { key: "stage1",  title: "Этап 1",            description: "64 участника играют 32 матча. Победители идут в виннеры, проигравшие в лузеры." },
  { key: "stage2w", title: "Этап 2 — Виннеры",  description: "16 пар виннеров дают 8 пар новых виннеров и 8 пар новых лузеров." },
  { key: "stage2l", title: "Этап 2 — Лузеры",   description: "16 пар лузеров оставляют 8 пар. Потом к ним добавятся лузеры из виннеров." },
  { key: "stage3w", title: "Этап 3 — Виннеры",  description: "8 пар виннеров дают 4 пары новых виннеров и 4 пары новых лузеров." },
  { key: "stage3l", title: "Этап 3 — Лузеры",   description: "16 пар лузеров оставляют 8 пар, к ним прибавятся 4 пары новых лузеров." },
  { key: "stage4w", title: "Этап 4 — Виннеры",  description: "4 пары виннеров делятся на 2 пары новых виннеров и 2 пары новых лузеров." },
  { key: "stage4l", title: "Этап 4 — Лузеры",   description: "12 пар лузеров оставляют 6 пар, затем добавляются 2 пары из виннеров." },
  { key: "stage5l", title: "Этап 5 — Лузеры",   description: "2 пары виннеров без изменений. В лузерах 8 пар отбирают 4 пары." },
  { key: "stage6w", title: "Этап 6 — Виннеры",  description: "2 пары виннеров дают пару виннеров и пару лузеров." },
  { key: "stage6l", title: "Этап 6 — Лузеры",   description: "4 пары лузеров оставляют 2 пары, затем добавляется пара из виннеров." },
  { key: "stage7",  title: "Этап 7",             description: "Пара виннеров и 3 пары лузеров играют на вылет до 2 пар." },
  { key: "stage8",  title: "Этап 8",             description: "2 пары играют на вылет до одной пары." },
  { key: "stage9",  title: "Финал",              description: "Последний матч определяет чемпиона." }
];

const stageByKey = Object.fromEntries(STAGE_META.map(function(item) { return [item.key, item]; }));

var initialGames = [];
var state = null;

function createMatchQueue(stageKey, participants) {
  var matches = [];
  for (var i = 0; i < participants.length; i += 2) {
    matches.push({ stageKey: stageKey, left: participants[i], right: participants[i + 1] });
  }
  return matches;
}

function setStatus(title, description) {
  stageTitle.textContent = title;
  stageDescription.textContent = description;
}

function updateMeta() {
  matchCounter.textContent = "Матч " + (state.currentMatchIndex + 1) + " из " + state.currentStageMatches;
  remainingCounter.textContent = "Осталось участников: " + state.aliveCount;
}

function renderCurrentMatch() {
  var match = state.currentQueue[0];
  var info = stageByKey[match.stageKey];
  setStatus(info.title, info.description);
  leftTitle.textContent = match.left.title;
  leftCover.src = match.left.localCoverPath || "";
  leftCover.alt = match.left.title;
  rightTitle.textContent = match.right.title;
  rightCover.src = match.right.localCoverPath || "";
  rightCover.alt = match.right.title;
  updateMeta();
}

function logStageResult(text) {
  var li = document.createElement("li");
  li.textContent = text;
  stageLog.appendChild(li);
}

function chooseWinner(side) {
  var current = state.currentQueue.shift();
  var winner = side === "left" ? current.left : current.right;
  var loser  = side === "left" ? current.right : current.left;

  state.buffers[current.stageKey].winners.push(winner);
  state.buffers[current.stageKey].losers.push(loser);
  state.currentMatchIndex += 1;

  state.choiceHistory.push({
    stageKey: current.stageKey,
    matchIndex: state.currentMatchIndex,
    winner: { id: winner.id, title: winner.title },
    loser:  { id: loser.id,  title: loser.title }
  });

  if (state.currentQueue.length > 0) {
    renderCurrentMatch();
    return;
  }

  finalizeStage(current.stageKey);
}

function startStage(stageKey, participants) {
  state.currentQueue = createMatchQueue(stageKey, participants);
  state.currentStageMatches = state.currentQueue.length;
  state.currentMatchIndex = 0;
  state.buffers[stageKey] = { winners: [], losers: [] };
  state.aliveCount = participants.length;
  renderCurrentMatch();
}

function finalizeStage(stageKey) {
  var winners = state.buffers[stageKey].winners;
  var losers  = state.buffers[stageKey].losers;

  switch (stageKey) {
    case "stage1":
      state.brackets.winners = winners;
      state.brackets.losers  = losers;
      logStageResult("Этап 1 завершен: виннеры " + winners.length + ", лузеры " + losers.length + ".");
      startStage("stage2w", state.brackets.winners);
      break;

    case "stage2w":
      state.temp.stage2w = { winners: winners, losers: losers };
      logStageResult("Этап 2 (виннеры): осталось " + winners.length + " участников в сетке виннеров.");
      startStage("stage2l", state.brackets.losers);
      break;

    case "stage2l":
      state.brackets.winners = state.temp.stage2w.winners;
      state.brackets.losers  = winners.concat(state.temp.stage2w.losers);
      logStageResult("Этап 2 завершен: виннеры " + state.brackets.winners.length + ", лузеры " + state.brackets.losers.length + ".");
      startStage("stage3w", state.brackets.winners);
      break;

    case "stage3w":
      state.temp.stage3w = { winners: winners, losers: losers };
      logStageResult("Этап 3 (виннеры): осталось " + winners.length + " участников в сетке виннеров.");
      startStage("stage3l", state.brackets.losers);
      break;

    case "stage3l":
      state.brackets.winners = state.temp.stage3w.winners;
      state.brackets.losers  = winners.concat(state.temp.stage3w.losers);
      logStageResult("Этап 3 завершен: виннеры " + state.brackets.winners.length + ", лузеры " + state.brackets.losers.length + ".");
      startStage("stage4w", state.brackets.winners);
      break;

    case "stage4w":
      state.temp.stage4w = { winners: winners, losers: losers };
      logStageResult("Этап 4 (виннеры): осталось " + winners.length + " участников в сетке виннеров.");
      startStage("stage4l", state.brackets.losers);
      break;

    case "stage4l":
      state.brackets.winners = state.temp.stage4w.winners;
      state.brackets.losers  = winners.concat(state.temp.stage4w.losers);
      logStageResult("Этап 4 завершен: виннеры " + state.brackets.winners.length + ", лузеры " + state.brackets.losers.length + ".");
      startStage("stage5l", state.brackets.losers);
      break;

    case "stage5l":
      state.brackets.losers = winners;
      logStageResult("Этап 5 завершен: виннеры " + state.brackets.winners.length + " (без изменений), лузеры " + state.brackets.losers.length + ".");
      startStage("stage6w", state.brackets.winners);
      break;

    case "stage6w":
      state.temp.stage6w = { winners: winners, losers: losers };
      logStageResult("Этап 6 (виннеры): осталось " + winners.length + " участника в виннерах.");
      startStage("stage6l", state.brackets.losers);
      break;

    case "stage6l":
      state.brackets.winners = state.temp.stage6w.winners;
      state.brackets.losers  = winners.concat(state.temp.stage6w.losers);
      logStageResult("Этап 6 завершен: виннеры " + state.brackets.winners.length + ", лузеры " + state.brackets.losers.length + ".");
      startStage("stage7", state.brackets.winners.concat(state.brackets.losers));
      break;

    case "stage7":
      state.brackets.finalists = winners;
      logStageResult("Этап 7 завершен: осталось " + winners.length + " участников (2 пары).");
      startStage("stage8", state.brackets.finalists);
      break;

    case "stage8":
      state.brackets.grandFinal = winners;
      logStageResult("Этап 8 завершен: осталась 1 пара финалистов.");
      startStage("stage9", state.brackets.grandFinal);
      break;

    case "stage9":
      finishTournament(winners[0]);
      break;

    default:
      throw new Error("Неизвестный этап: " + stageKey);
  }
}

function getSavedRuns() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveRun(name, champion, history) {
  var runs = getSavedRuns();
  runs.push({
    name: name,
    champion: { id: champion.id, title: champion.title },
    history: history,
    date: new Date().toISOString()
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

function renderSavedRuns() {
  var runs = getSavedRuns();
  if (runs.length === 0) {
    savedRunsSection.classList.add("hidden");
    return;
  }
  savedRunsSection.classList.remove("hidden");
  savedRunsList.innerHTML = "";
  runs.slice().reverse().forEach(function(run) {
    var li = document.createElement("li");
    var date = new Date(run.date);
    var dateStr = date.toLocaleDateString("ru-RU") + " " + date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    li.innerHTML =
      "<span class='run-name'>" + escapeHtml(run.name) + "</span>" +
      " — чемпион: <strong>" + escapeHtml(run.champion.title) + "</strong>" +
      " <span class='run-date'>" + dateStr + "</span>" +
      " <span class='run-picks'>(" + run.history.length + " матчей)</span>";
    savedRunsList.appendChild(li);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function finishTournament(champion) {
  matchSection.classList.add("hidden");
  resultSection.classList.remove("hidden");
  setStatus("Турнир завершен", "Поздравляем победителя!");
  championTitle.textContent = "Чемпион: " + champion.title;
  matchCounter.textContent = "Финал сыгран";
  remainingCounter.textContent = "Победитель: " + champion.title;
  logStageResult("Финал: чемпионом становится «" + champion.title + "».");

  state.champion = champion;

  saveRunForm.classList.remove("hidden");
  saveRunFeedback.classList.add("hidden");
  runNameInput.value = "";
  runNameInput.focus();

  renderSavedRuns();
}

function initState() {
  state = {
    currentQueue: [],
    currentStageMatches: 0,
    currentMatchIndex: 0,
    aliveCount: 0,
    buffers: {},
    temp: {},
    brackets: { winners: [], losers: [], finalists: [], grandFinal: [] },
    choiceHistory: [],
    champion: null
  };
}

function shuffle(items) {
  var array = items.slice();
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = array[i]; array[i] = array[j]; array[j] = tmp;
  }
  return array;
}

function startTournament() {
  stageLog.innerHTML = "";
  matchSection.classList.remove("hidden");
  resultSection.classList.add("hidden");
  saveRunForm.classList.add("hidden");
  initState();
  var seed = shuffle(initialGames);
  logStageResult("Турнир начат: участники перемешаны и разбиты на стартовые пары.");
  startStage("stage1", seed);
}

function loadData() {
  if (typeof GAMES_DATA === "undefined" || !Array.isArray(GAMES_DATA.games)) {
    setStatus("Ошибка данных", "Переменная GAMES_DATA не найдена. Проверь файл data.js.");
    return;
  }
  initialGames = GAMES_DATA.games.map(function(item) {
    return {
      id: item.id,
      title: item.title,
      image: item.image,
      localCoverPath: LOCAL_COVERS_BASE_PATH + item.image
    };
  });
  if (initialGames.length !== 64) {
    setStatus("Ошибка данных", "Ожидается 64 участника, найдено: " + initialGames.length + ".");
    return;
  }
  startTournament();
}

leftPick.addEventListener("click", function() { chooseWinner("left"); });
rightPick.addEventListener("click", function() { chooseWinner("right"); });
restartBtn.addEventListener("click", function() { startTournament(); });

saveRunBtn.addEventListener("click", function() {
  var name = runNameInput.value.trim();
  if (!name) {
    saveRunFeedback.textContent = "Введи имя перед сохранением.";
    saveRunFeedback.classList.remove("hidden");
    runNameInput.focus();
    return;
  }
  saveRun(name, state.champion, state.choiceHistory);
  saveRunFeedback.textContent = "Прохождение «" + name + "» сохранено!";
  saveRunFeedback.classList.remove("hidden");
  saveRunBtn.disabled = true;
  runNameInput.disabled = true;
  renderSavedRuns();
});

runNameInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") saveRunBtn.click();
});

loadData();
