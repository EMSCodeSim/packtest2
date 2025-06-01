let mode = null;
let lapsPerMile = 4;
let goalTime = 45;
let lapGoal = 12;
let lapCount = 0;
let totalDistance = 0;
let startTime = null;
let timerInterval = null;

// Welcome screen logic
function selectMode(selected) {
  mode = selected;
  document.getElementById('welcomeScreen').classList.remove('active');
  document.getElementById('settingsScreen').classList.add('active');
  document.getElementById('lapsPerMileGroup').style.display = (mode === 'track') ? 'block' : 'none';
}

// Start test logic
function startTest() {
  goalTime = parseFloat(document.getElementById('goalTime').value) || 45;
  if (mode === 'track') {
    lapsPerMile = parseFloat(document.getElementById('lapsPerMile').value) || 4;
    lapGoal = lapsPerMile * 3;
    document.getElementById('settingsScreen').classList.remove('active');
    document.getElementById('trackScreen').classList.add('active');
    startTrackMode();
  }
  // Future: Road mode logic here
}

// Stop logic
function stopTest() {
  clearInterval(timerInterval);
  alert("Test Ended");
  location.reload();
}

// Timer & Animation
function startTrackMode() {
  startTime = Date.now();
  timerInterval = setInterval(updateTrackStats, 1000);
  animateDots();
}

function updateTrackStats() {
  const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
  const minutes = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
  const seconds = String(elapsedSec % 60).padStart(2, '0');
  document.getElementById('timeText').textContent = `Time: ${minutes}:${seconds}`;

  const lapsCompleted = lapCount;
  const miles = lapsCompleted / lapsPerMile;
  const pace = miles > 0 ? (elapsedSec / 60) / miles : 0;
  const paceDisplay = pace > 0 ? pace.toFixed(2) : '--';
  document.getElementById('paceText').textContent = `Pace: ${paceDisplay}`;

  const remainingMiles = 3 - miles;
  const estFinishMin = pace > 0 ? remainingMiles * pace : 0;
  const est = isFinite(estFinishMin) ? formatTime(estFinishMin) : '--:--';
  document.getElementById('trackEstimateText').textContent = est;
  document.getElementById('lapCounterText').textContent = `Lap ${lapsCompleted} of ${lapGoal}`;
}

function formatTime(mins) {
  const m = Math.floor(mins);
  const s = Math.round((mins - m) * 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Oval animation logic
let angle = 0;
function animateDots() {
  const cx = 150;
  const cy = 100;
  const rx = 100;
  const ry = 70;
  let walkerAngle = 0;
  let lapsDone = 0;

  function drawFrame() {
    const elapsed = (Date.now() - startTime) / 1000;
    const percentComplete = Math.min(elapsed / (goalTime * 60), 1);
    angle = 360 * percentComplete;

    // PACER DOT
    const rad = angle * Math.PI / 180;
    const px = cx + rx * Math.cos(rad);
    const py = cy - ry * Math.sin(rad);
    document.getElementById('pacerDot').setAttribute('cx', px);
    document.getElementById('pacerDot').setAttribute('cy', py);

    // WALKER DOT (simulate lap progression every 20s)
    walkerAngle += 0.3;
    const wrad = walkerAngle * Math.PI / 180;
    const wx = cx + rx * Math.cos(wrad);
    const wy = cy - ry * Math.sin(wrad);
    document.getElementById('walkerIcon').setAttribute('x', wx);
    document.getElementById('walkerIcon').setAttribute('y', wy);

    // Count laps if full rotation
    if (walkerAngle >= 360) {
      walkerAngle -= 360;
      lapCount += 1;
    }

    requestAnimationFrame(drawFrame);
  }
  requestAnimationFrame(drawFrame);
}
