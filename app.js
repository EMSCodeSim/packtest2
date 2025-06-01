let isRunning = false;
let startTime;
let lapCount = 0;
let lapGoal = 12;
let timer;
let pace = 0;

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateStats() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const miles = lapCount / (parseInt(document.getElementById("lapsPerMile").value) || 4);
  pace = miles > 0 ? (elapsed / 60) / miles : 0;

  document.getElementById("lapText").textContent = `Lap ${lapCount}/${lapGoal}`;
  document.getElementById("timeText").textContent = `Time: ${formatTime(elapsed)}`;
  document.getElementById("paceText").textContent = `Pace: ${pace ? pace.toFixed(2) : "--"}`;
  document.getElementById("estText").textContent = `Est: ${pace ? formatTime(Math.round(pace * 3 * 60)) : "--:--"}`;

  const fill = Math.min((lapCount / lapGoal) * 100, 100);
  document.getElementById("distanceFill").style.width = `${fill}%`;
}

function animateDots(goalMin, lapsPerMile) {
  const track = document.getElementById("trackOuter");
  const trackHeight = track.clientHeight - 40;

  function move() {
    if (!isRunning) return;

    const elapsed = (Date.now() - startTime) / 1000;
    const progress = (elapsed / (goalMin * 60)) % 1;
    const y = progress * trackHeight;

    document.getElementById("pacerDot").style.top = `${y}px`;
    document.getElementById("walkerIcon").style.top = `${y}px`;

    if (progress >= 0.99) lapCount++;

    requestAnimationFrame(move);
  }

  requestAnimationFrame(move);
}

function startOrStop() {
  isRunning = !isRunning;
  if (isRunning) {
    lapCount = 0;
    startTime = Date.now();
    const goalTime = parseInt(document.getElementById("goalTime").value) || 45;
    const lapsPerMile = parseInt(document.getElementById("lapsPerMile").value) || 4;
    lapGoal = lapsPerMile * 3;
    timer = setInterval(updateStats, 1000);
    animateDots(goalTime, lapsPerMile);
    document.querySelector("button[onclick='startOrStop()']").textContent = "Stop";
  } else {
    clearInterval(timer);
    alert("Test Ended");
    location.reload();
  }
}

function switchToRoadMode() {
  alert("Road Mode coming soon.");
}
