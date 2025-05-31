let watchId;
let startTime;
let totalDistance = 0;
let lapCount = 0;
let previousCoords = null;
let timerInterval;

const timeDisplay = document.getElementById("time");
const paceDisplay = document.getElementById("pace");
const lapDisplay = document.getElementById("laps");
const distLabel = document.getElementById("distance-label");
const distFill = document.getElementById("distance-bar-fill");
const lapLabel = document.getElementById("lap-label");
const lapFill = document.getElementById("lap-bar-fill");
const estimateText = document.getElementById("estimate-text");

document.getElementById("startBtn").addEventListener("click", () => {
  startTime = Date.now();
  totalDistance = 0;
  lapCount = 0;
  previousCoords = null;

  document.getElementById("stopBtn").disabled = false;
  document.getElementById("startBtn").disabled = true;

  startTimer();
  startTracking();
});

document.getElementById("stopBtn").addEventListener("click", () => {
  clearInterval(timerInterval);
  navigator.geolocation.clearWatch(watchId);
  document.getElementById("stopBtn").disabled = true;
  document.getElementById("startBtn").disabled = false;
});

function startTimer() {
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timeDisplay.textContent = `${pad(minutes)}:${pad(seconds)}`;

    updateEstimate();
  }, 1000);
}

function pad(num) {
  return num < 10 ? "0" + num : num;
}

function startTracking() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const current = { lat: latitude, lng: longitude };

      if (previousCoords) {
        const dist = getDistance(previousCoords, current);
        totalDistance += dist;

        const miles = totalDistance / 1609.34;
        const laps = Math.floor(miles / 0.25); // 400m = 0.25 miles
        if (laps > lapCount) lapCount = laps;

        distLabel.textContent = `${miles.toFixed(2)} / 3.00 miles`;
        lapLabel.textContent = `${lapCount} / 12 laps`;
        distFill.style.width = `${(miles / 3) * 100}%`;
        lapFill.style.width = `${(lapCount / 12) * 100}%`;
        lapDisplay.textContent = `${lapCount}/12`;

        const elapsedMin = (Date.now() - startTime) / 60000;
        const pace = miles > 0 ? elapsedMin / miles : 0;
        paceDisplay.textContent = pace > 0 ? pace.toFixed(2) : "--";
      }

      previousCoords = current;
    },
    (err) => {
      console.error("GPS error:", err);
      alert("Unable to get GPS location.");
    },
    { enableHighAccuracy: true, maximumAge: 1000 }
  );
}

function updateEstimate() {
  const miles = totalDistance / 1609.34;
  const elapsed = (Date.now() - startTime) / 60000;

  const pace = miles > 0 ? elapsed / miles : 0;
  const estTime = pace * 3;

  if (estTime > 0) {
    const estMin = Math.floor(estTime);
    const estSec = Math.floor((estTime % 1) * 60);
    estimateText.textContent = `Est. Finish: ${pad(estMin)}:${pad(estSec)}`;
  } else {
    estimateText.textContent = "Est. Finish: --:--";
  }
}

function getDistance(c1, c2) {
  const R = 6371e3;
  const φ1 = c1.lat * Math.PI / 180;
  const φ2 = c2.lat * Math.PI / 180;
  const Δφ = (c2.lat - c1.lat) * Math.PI / 180;
  const Δλ = (c2.lng - c1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ/2)**2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2)**2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
