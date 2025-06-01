let mode = null;
let lapsPerMile = 4;
let lapGoal = 12;
let lapCount = 0;
let goalTime = 45;
let startTime;
let timer;
let currentDistance = 0;

function selectMode(selectedMode) {
  mode = selectedMode;
  document.getElementById('welcomeScreen').classList.remove('active');
  document.getElementById('settingsScreen').classList.add('active');
}

function startTest() {
  lapsPerMile = parseInt(document.getElementById('lapsPerMile').value) || 4;
  goalTime = parseFloat(document.getElementById('goalTime').value) || 45;
  lapGoal = lapsPerMile * 3;
  startTime = Date.now();
  document.getElementById('settingsScreen').classList.remove('active');
  document.getElementById('trackScreen').classList.add('active');

  if (mode === 'track') {
    startTrack();
  } else {
    startRoadMode();
  }
}

function stopTest() {
  clearInterval(timer);
  alert("Test stopped");
  location.reload();
}

function startTrack() {
  lapCount = 0;
  timer = setInterval(updateTrackStats, 1000);
  animateDots();
}

function updateTrackStats() {
  const elapsed = (Date.now() - startTime) / 1000;
  const min = Math.floor(elapsed / 60);
  const sec = Math.floor(elapsed % 60);
  const pace = (lapCount / lapsPerMile) > 0 ? (elapsed / 60) / (lapCount / lapsPerMile) : 0;
  const est = pace > 0 ? (3 * pace).toFixed(2) : '--';

  document.getElementById('lapCountText').textContent = `Lap ${lapCount}/${lapGoal}`;
  document.getElementById('timeText').textContent = `Time: ${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  document.getElementById('paceText').textContent = `Pace: ${pace ? pace.toFixed(2) : '--'}`;
  document.getElementById('estimateText').textContent = `Est: ${formatTime(est)}`;

  let progress = ((lapCount / lapGoal) * 100).toFixed(1);
  document.getElementById('distanceFill').style.width = `${progress}%`;
}

function animateDots() {
  const trackHeight = document.getElementById('tallTrack').clientHeight;
  const update = () => {
    const elapsed = (Date.now() - startTime) / 1000;
    const percent = (elapsed / (goalTime * 60)) % 1;
    const y = percent * (trackHeight - 30);

    document.getElementById('pacerDot').style.top = `${y}px`;
    document.getElementById('walkerIcon').style.top = `${y}px`;

    if (percent >= 0.99) lapCount++;
    requestAnimationFrame(update);
  };
  update();
}

function switchToRoadMode() {
  alert("Road Mode coming soon.");
}

function formatTime(mins) {
  if (mins === '--') return '--:--';
  let m = Math.floor(mins);
  let s = Math.round((mins - m) * 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Optional: Auto-enable GPS
navigator.geolocation?.getCurrentPosition(() => {}, () => {}, { enableHighAccuracy: true });
