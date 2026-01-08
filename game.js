const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");
const modeEl = document.getElementById("mode");
const overlay = document.getElementById("overlay");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const modeButtons = Array.from(document.querySelectorAll(".mode-button"));

const settings = {
  gravity: 0.35,
  lift: -6.5,
  pipeGap: 150,
  pipeWidth: 62,
  pipeSpeed: 2.3,
  spawnInterval: 1400,
};

const modeConfigs = {
  desktop: {
    width: 520,
    height: 640,
    gravity: 0.34,
    lift: -6.8,
    pipeGap: 170,
    pipeWidth: 68,
    pipeSpeed: 2.6,
    spawnInterval: 1350,
  },
  mobile: {
    width: 360,
    height: 640,
    gravity: 0.38,
    lift: -6.2,
    pipeGap: 150,
    pipeWidth: 60,
    pipeSpeed: 2.3,
    spawnInterval: 1500,
  },
};

const state = {
  mode: "ready",
  score: 0,
  best: Number(localStorage.getItem("skyhopBest") || 0),
  pipes: [],
  lastSpawn: 0,
  lastTime: 0,
  bird: null,
  modeSelection: "auto",
  activeMode: "desktop",
};

function detectMode() {
  const narrow = window.matchMedia("(max-width: 700px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return narrow || coarse ? "mobile" : "desktop";
}

function applyModeConfig(mode) {
  const config = modeConfigs[mode];
  canvas.width = config.width;
  canvas.height = config.height;
  settings.gravity = config.gravity;
  settings.lift = config.lift;
  settings.pipeGap = config.pipeGap;
  settings.pipeWidth = config.pipeWidth;
  settings.pipeSpeed = config.pipeSpeed;
  settings.spawnInterval = config.spawnInterval;
}

function updateModeUI() {
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.modeSelection);
  });
  if (state.modeSelection === "auto") {
    modeEl.textContent = `Auto (${state.activeMode})`;
  } else {
    modeEl.textContent = state.activeMode === "desktop" ? "Desktop" : "Mobile";
  }
}

function setMode(selection) {
  state.modeSelection = selection;
  const nextMode = selection === "auto" ? detectMode() : selection;
  const modeChanged = nextMode !== state.activeMode;
  state.activeMode = nextMode;
  document.body.dataset.mode = state.activeMode;
  if (modeChanged) {
    applyModeConfig(nextMode);
    resetGame();
  }
  updateModeUI();
}

function createBird() {
  return {
    x: 90,
    y: canvas.height / 2,
    radius: 13,
    velocity: 0,
  };
}

function resetGame() {
  state.pipes = [];
  state.score = 0;
  state.lastSpawn = 0;
  state.lastTime = 0;
  state.bird = createBird();
  updateUI("ready");
}

function updateUI(mode) {
  state.mode = mode;
  scoreEl.textContent = String(state.score);
  bestEl.textContent = String(state.best);
  statusEl.textContent = mode === "running" ? "In Flight" : mode === "over" ? "Crashed" : "Ready";
  updateModeUI();
  overlay.classList.toggle("hidden", mode === "running");
  if (mode === "ready") {
    overlay.querySelector("h2").textContent = "Tap to launch";
    overlay.querySelector("p").textContent = "Keep the glow bird aloft and slip through the gates.";
  }
  if (mode === "over") {
    overlay.querySelector("h2").textContent = "Run over";
    overlay.querySelector("p").textContent = "Tap to try again and chase a new high score.";
  }
}

function addPipe() {
  const topHeight = 80 + Math.random() * (canvas.height - settings.pipeGap - 200);
  state.pipes.push({
    x: canvas.width + settings.pipeWidth,
    top: topHeight,
    scored: false,
  });
}

function startRun() {
  if (state.mode === "running") return;
  if (state.mode === "over") {
    resetGame();
  }
  updateUI("running");
}

function flap() {
  if (state.mode === "ready") {
    startRun();
  }
  if (state.mode !== "running") return;
  state.bird.velocity = settings.lift;
}

function crash() {
  updateUI("over");
  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem("skyhopBest", String(state.best));
  }
}

function updatePipes(delta) {
  for (const pipe of state.pipes) {
    pipe.x -= settings.pipeSpeed * delta * 0.06;
    if (!pipe.scored && pipe.x + settings.pipeWidth < state.bird.x) {
      pipe.scored = true;
      state.score += 1;
    }
  }
  state.pipes = state.pipes.filter((pipe) => pipe.x + settings.pipeWidth > -20);
}

function checkCollision() {
  const bird = state.bird;
  if (bird.y - bird.radius <= 0 || bird.y + bird.radius >= canvas.height) {
    return true;
  }
  return state.pipes.some((pipe) => {
    const withinX = bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + settings.pipeWidth;
    const hitTop = bird.y - bird.radius < pipe.top;
    const hitBottom = bird.y + bird.radius > pipe.top + settings.pipeGap;
    return withinX && (hitTop || hitBottom);
  });
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#8ed6ff");
  gradient.addColorStop(0.55, "#d7fbff");
  gradient.addColorStop(1, "#f7f1df");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.ellipse(60 + i * 70, 120 + (i % 2) * 40, 30, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#f4d7a8";
  ctx.fillRect(0, canvas.height - 70, canvas.width, 70);
  ctx.fillStyle = "#d6b07f";
  ctx.fillRect(0, canvas.height - 70, canvas.width, 10);

  ctx.fillStyle = "rgba(44, 93, 123, 0.35)";
  for (let i = 0; i < 6; i += 1) {
    ctx.fillRect(20 + i * 60, canvas.height - 90 - (i % 3) * 20, 36, 30 + (i % 3) * 14);
  }
}

function drawPipes() {
  ctx.fillStyle = "#2a6f6c";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  for (const pipe of state.pipes) {
    ctx.fillRect(pipe.x, 0, settings.pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.top + settings.pipeGap, settings.pipeWidth, canvas.height - pipe.top);
    ctx.strokeRect(pipe.x + 6, pipe.top - 12, settings.pipeWidth - 12, 12);
    ctx.strokeRect(
      pipe.x + 6,
      pipe.top + settings.pipeGap,
      settings.pipeWidth - 12,
      12
    );
  }
}

function drawBird() {
  const bird = state.bird;
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(Math.min(bird.velocity / 10, 0.4));
  ctx.fillStyle = "#ff7b3a";
  ctx.beginPath();
  ctx.ellipse(0, 0, bird.radius + 4, bird.radius, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff4e0";
  ctx.beginPath();
  ctx.ellipse(-4, 0, bird.radius - 3, bird.radius - 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1f1e1c";
  ctx.beginPath();
  ctx.arc(6, -4, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f55f2b";
  ctx.beginPath();
  ctx.moveTo(8, 2);
  ctx.lineTo(20, 6);
  ctx.lineTo(8, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function update(timestamp) {
  if (!state.bird) resetGame();
  const delta = timestamp - state.lastTime;
  state.lastTime = timestamp;

  drawBackground();

  if (state.mode === "running") {
    state.bird.velocity += settings.gravity * delta * 0.06;
    state.bird.y += state.bird.velocity * delta * 0.06;

    if (timestamp - state.lastSpawn > settings.spawnInterval) {
      addPipe();
      state.lastSpawn = timestamp;
    }

    updatePipes(delta);

    if (checkCollision()) {
      crash();
    }
  }

  drawPipes();
  drawBird();

  scoreEl.textContent = String(state.score);
  bestEl.textContent = String(state.best);
  statusEl.textContent = state.mode === "running" ? "In Flight" : state.mode === "over" ? "Crashed" : "Ready";

  requestAnimationFrame(update);
}

function handleAction() {
  if (state.mode === "over") {
    resetGame();
    startRun();
    flap();
    return;
  }
  flap();
}

startButton.addEventListener("click", () => {
  startRun();
});

resetButton.addEventListener("click", () => {
  resetGame();
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode);
  });
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    handleAction();
  }
});

canvas.addEventListener("pointerdown", () => {
  handleAction();
});

overlay.addEventListener("pointerdown", () => {
  handleAction();
});

window.addEventListener("resize", () => {
  if (state.modeSelection === "auto") {
    setMode("auto");
  }
});

setMode("auto");
resetGame();
requestAnimationFrame(update);
