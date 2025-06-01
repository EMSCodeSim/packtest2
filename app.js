let lapCount = 0;
let lapGoal = 12;
let startTime;
let timer;
let pace = 0;

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function startTrack(goalMinutes = 45) {
  startTime = Date.now();
  timer = setInterval(() => updateStats(goalMinutes), 1000);
  animateDots(goalMinutes);
}

function stopTest() {
  clearInterval(timer);
  alert("Test Ended");
  location.reload();
}

function updateStats(goalMinutes) {
  const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById("timeText").textContent = `Time: ${formatTime(elapsedSec)}`;

  const miles = lapCount / 4; // 4 laps/mile
  pace = miles > 0 ? (elapsedSec / 60) / miles : 0;
  document.getElementById("paceText").textContent = `Pace: ${pace ? pace.toFixed(2) : "--"}`;

  const estTime = pace > 0 ? pace * 3 : 0;
  document.getElementById("estText").textContent = `Est: ${pace ? formatTime(Math.round(estTime * 60)) : "--:--"}`;

  document.getElementById("lapText").textContent = `Lap ${lapCount}/${lapGoal}`;
  document.getElementById("distanceFill").style.width = `${(lapCount / lapGoal) * 100}%`;
}

function animateDots(goalMinutes) {
  const trackHeight = document.getElementById("trackContainer").offsetHeight - 40;
  let angle = 0;

  function frame() {
    const elapsed = (Date.now() - startTime) / 1000;
    const percent = (elapsed / (goalMinutes * 60)) % 1;

    const y = percent * trackHeight;
    document.getElementById("pacerDot").style.top = `${y}px`;
    document.getElementById("walkerIcon").style.top = `${y}px`;

    if (percent >= 0.99) lapCount++;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function switchToRoadMode() {
  alert("Road Mode coming soon.");
}

// Start automatically for demo/testing
startTrack(45);
