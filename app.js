let startTime, timerInterval;
let totalDistance = 0;
let previousPosition = null;
let mode = 'track';
let lapCount = 0;
let lapGoal = 12;
let watchId;
let goalTime = 45;
let lapsPerMile = 4;

const timeDisplay = document.getElementById('time');
const paceDisplay = document.getElementById('pace');
const distanceLabel = document.getElementById('distance-label');
const distanceBar = document.getElementById('distance-bar-fill');
const modeSelector = document.getElementById('modeSelector');
const lapsPerMileInput = document.getElementById('lapsPerMile');
const track = document.getElementById('track');
const mapDiv = document.getElementById('map');
const gpsBar = document.getElementById('gps-progress-container');
const roadEstimate = document.getElementById('roadEstimateText');

modeSelector.addEventListener('change', () => {
  mode = modeSelector.value;
  updateModeUI();
});

function updateModeUI() {
  track.classList.toggle('hidden', mode !== 'track');
  mapDiv.classList.toggle('hidden', mode !== 'gps');
  gpsBar.classList.toggle('hidden', mode !== 'gps');
  document.getElementById('lapsPerMileContainer').classList.toggle('hidden', mode !== 'track');
}

document.getElementById('startBtn').addEventListener('click', () => {
  startTime = Date.now();
  timerInterval = setInterval(updateTime, 1000);
  goalTime = parseFloat(document.getElementById('goalTime').value);
  lapsPerMile = parseFloat(lapsPerMileInput.value);
  lapGoal = lapsPerMile * 3;

  if (mode === 'gps') {
    initializeMap();
    startGPS();
  }

  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn').disabled = false;
});

document.getElementById('stopBtn').addEventListener('click', () => {
  clearInterval(timerInterval);
  if (watchId) navigator.geolocation.clearWatch(watchId);
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
});

function updateTime() {
  const now = Date.now();
  const diff = Math.floor((now - startTime) / 1000);
  const min = String(Math.floor(diff / 60)).padStart(2, '0');
  const sec = String(diff % 60).padStart(2, '0');
  timeDisplay.textContent = `${min}:${sec}`;

  const miles = totalDistance / 1609.34;
  const pace = miles > 0 ? (diff / 60) / miles : 0;
  paceDisplay.textContent = pace.toFixed(2);

  const percent = Math.min((miles / 3) * 100, 100);
  distanceBar.style.width = percent + "%";
  distanceLabel.textContent = `${miles.toFixed(2)} / 3.00 miles`;

  const remaining = 3 - miles;
  const estFinishMin = pace > 0 ? remaining * pace : 0;
  const est = isFinite(estFinishMin) ? formatTime(estFinishMin) : '--:--';

  if (mode === 'track') {
    document.getElementById('trackEstimateText').textContent = est;
    document.getElementById('lapCounter').textContent = `Lap ${lapCount} of ${lapGoal}`;
  } else if (mode === 'gps') {
    roadEstimate.textContent = est;
  }
}

function formatTime(mins) {
  const m = Math.floor(mins);
  const s = Math.round((mins - m) * 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ===== MAP =====
let map, userMarker, trail = [];

function initializeMap() {
  map = L.map('map').setView([0, 0], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OSM'
  }).addTo(map);
}

function startGPS() {
  if (!navigator.geolocation) {
    alert('GPS not supported');
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const currentPos = [lat, lon];

      if (!userMarker) {
        userMarker = L.marker(currentPos).addTo(map);
      } else {
        userMarker.setLatLng(currentPos);
      }

      map.setView(currentPos);

      // Add trail polyline
      trail.push(currentPos);
      if (trail.length > 1) {
        L.polyline(trail, { color: 'red' }).addTo(map);
      }

      if (previousPosition) {
        const d = getDistance(previousPosition, position.coords);
        totalDistance += d;
      }
      previousPosition = position.coords;

      updateGPSBar();
    },
    err => alert('GPS error: ' + err.message),
    { enableHighAccuracy: true }
  );
}

function updateGPSBar() {
  const bar = document.getElementById('gps-progress-container');
  const pacer = document.getElementById('gps-pacer-dot');
  const walker = document.getElementById('gps-user-icon');

  const elapsed = (Date.now() - startTime) / 1000;
  const totalSeconds = goalTime * 60;
  const pacerPercent = Math.min((elapsed / totalSeconds) * 100, 100);

  const miles = totalDistance / 1609.34;
  const userPercent = Math.min((miles / 3) * 100, 100);

  pacer.style.left = `${pacerPercent}%`;
  walker.style.left = `${userPercent}%`;
}

function getDistance(prev, curr) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(curr.latitude - prev.latitude);
  const dLon = toRad(curr.longitude - prev.longitude);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(prev.latitude)) * Math.cos(toRad(curr.latitude)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
