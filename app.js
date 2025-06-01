let timerInterval, startTime;
let totalDistance = 0;
let lapLength = 0.25; // miles per lap
let lapsPerMile = 4;
let goalTime = 45; // minutes
let watchID;
let lastPosition = null;
let dotAngle = 0;
let pace = 0;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimer() {
  const now = Date.now();
  const elapsed = (now - startTime) / 1000;
  document.getElementById("timer").textContent = formatTime(elapsed);
  document.getElementById("lapTime").textContent = "Lap Time: " + formatTime(elapsed % (60 / (goalTime / 3)));

  // update estimated finish
  if (pace > 0) {
    const milesLeft = 3 - totalDistance;
    const estFinish = new Date(now + (milesLeft / pace) * 3600000);
    document.getElementById("estFinish").textContent =
      estFinish.getMinutes() > 50 ? "Est Finish: >50" :
      "Est Finish: " + estFinish.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  } else {
    document.getElementById("estFinish").textContent = "Est Finish: --";
  }

  movePacerDot(elapsed);
}

function movePacerDot(elapsed) {
  const track = document.getElementById("track");
  const dot = document.getElementById("pacerDot");
  const radius = track.offsetWidth / 2 - 10;
  const angle = (elapsed / (goalTime * 60)) * 2 * Math.PI;

  const x = radius + radius * Math.cos(angle - Math.PI / 2);
  const y = radius + radius * Math.sin(angle - Math.PI / 2);

  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
}

function moveWalkerIcon(distance) {
  const percent = (distance / 3);
  const track = document.getElementById("track");
  const icon = document.getElementById("walkerIcon");
  const radius = track.offsetWidth / 2 - 10;
  const angle = percent * 2 * Math.PI;

  const x = radius + radius * Math.cos(angle - Math.PI / 2);
  const y = radius + radius * Math.sin(angle - Math.PI / 2);

  icon.style.left = `${x}px`;
  icon.style.top = `${y}px`;
}

function startTest() {
  goalTime = parseFloat(document.getElementById("goalTime").value);
  lapsPerMile = parseFloat(document.getElementById("lapsPerMile").value);
  lapLength = 1 / lapsPerMile;
  totalDistance = 0;
  startTime = Date.now();
  lastPosition = null;

  timerInterval = setInterval(updateTimer, 1000);

  if (navigator.geolocation) {
    watchID = navigator.geolocation.watchPosition(gpsSuccess, gpsError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000
    });
  }
}

function stopTest() {
  clearInterval(timerInterval);
  navigator.geolocation.clearWatch(watchID);
}

function gpsSuccess(position) {
  const current = position.coords;
  const now = Date.now();

  if (lastPosition) {
    const dist = calculateDistance(
      lastPosition.latitude, lastPosition.longitude,
      current.latitude, current.longitude
    );

    const timeElapsed = (now - lastPosition.timestamp) / 1000;
    totalDistance += dist;

    pace = (dist / (timeElapsed / 3600)); // mph
    document.getElementById("pace").textContent = `Pace: ${pace.toFixed(2)} mph`;

    const progress = Math.min((totalDistance / 3) * 100, 100);
    document.getElementById("distanceFill").style.width = `${progress}%`;

    moveWalkerIcon(totalDistance);
  }

  lastPosition = {
    latitude: current.latitude,
    longitude: current.longitude,
    timestamp: now
  };
}

function gpsError(err) {
  console.error("GPS error:", err);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
