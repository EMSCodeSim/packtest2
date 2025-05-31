let watchId;
let startTime;
let totalDistance = 0;
let lapCount = 0;
let previousCoords = null;
let timerInterval;
let map, marker, pathLine;
let pathCoords = [];
let trackStartTime = null;
let pacerInterval;

const timeDisplay = document.getElementById("time");
const paceDisplay = document.getElementById("pace");
const lapDisplay = document.getElementById("laps");
const distLabel = document.getElementById("distance-label");
const distFill = document.getElementById("distance-bar-fill");
const lapLabel = document.getElementById("lap-label");
const lapFill = document.getElementById("lap-bar-fill");
const estimateText = document.getElementById("estimate-text");
const modeSelector = document.getElementById("modeSelector");
const mapDiv = document.getElementById("map");
const trackDiv = document.getElementById("track");
const lapsPerMileInput = document.getElementById("lapsPerMile");
const lapsPerMileContainer = document.getElementById("lapsPerMileContainer");

modeSelector.addEventListener("change", () => {
  const mode = modeSelector.value;
  if (mode === "gps") {
    mapDiv.classList.remove("hidden");
    trackDiv.classList.add("hidden");
    lapsPerMileContainer.classList.add("hidden");
    initializeMap();
  } else {
    mapDiv.classList.add("hidden");
    trackDiv.classList.remove("hidden");
    lapsPerMileContainer.classList.remove("hidden");
  }
});

document.getElementById("startBtn").addEventListener("click", () => {
  startTime = Date.now();
  totalDistance = 0;
  lapCount = 0;
  previousCoords = null;
  pathCoords = [];
  if (pathLine) pathLine.remove();

  document.getElementById("stopBtn").disabled = false;
  document.getElementById("startBtn").disabled = true;

  startTimer();

  if (modeSelector.value === "gps") {
    startTracking();
  } else {
    startTrackAnimation();
  }
});

document.getElementById("stopBtn").addEventListener("click", () => {
  clearInterval(timerInterval);
  clearInterval(pacerInterval);
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

      if (map) {
        if (!marker) {
          marker = L.marker(current).addTo(map);
        } else {
          marker.setLatLng(current);
        }

        pathCoords.push([latitude, longitude]);
        if (pathLine) pathLine.setLatLngs(pathCoords);
        else pathLine = L.polyline(pathCoords, { color: 'blue', weight: 5 }).addTo(map);

        map.setView(current, 18);
      }

      if (previousCoords) {
        const dist = getDistance(previousCoords, current);
        totalDistance += dist;

        const miles = totalDistance / 1609.34;
        const lapsPerMile = parseFloat(lapsPerMileInput.value) || 12;
        const totalLaps = lapsPerMile * 3;
        const laps = Math.floor(miles * lapsPerMile);
        if (laps > lapCount) lapCount = laps;

        distLabel.textContent = `${miles.toFixed(2)} / 3.00 miles`;
        lapLabel.textContent = `${lapCount} / ${totalLaps}`;
        distFill.style.width = `${(miles / 3) * 100}%`;
        lapFill.style.width = `${(lapCount / totalLaps) * 100}%`;
        lapDisplay.textContent = `${lapCount}/${totalLaps}`;

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
    estimateText.textContent = `${pad(estMin)}:${pad(estSec)}`;
  } else {
    estimateText.textContent = "--:--";
  }
}

function getDistance(c1, c2) {
  const R = 6371e3;
  const φ1 = c1.lat * Math.PI / 180;
  const φ2 = c2.lat * Math.PI / 180;
  const Δφ = (c2.lat - c1.lat) * Math.PI / 180;
  const Δλ = (c2.lng - c1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function initializeMap() {
  setTimeout(() => {
    if (!map) {
      map = L.map('map').setView([39.7392, -104.9903], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);
    } else {
      map.invalidateSize();
    }
  }, 200);
}

function startTrackAnimation() {
  trackStartTime = Date.now();
  clearInterval(pacerInterval);

  pacerInterval = setInterval(() => {
    const now = Date.now();
    const elapsedSec = (now - trackStartTime) / 1000;
    const goalTimeMin = parseFloat(document.getElementById("goalTime").value) || 45;
    const lapsPerMile = parseFloat(lapsPerMileInput.value) || 12;

    const totalTrackSeconds = goalTimeMin * 60;
    const pacerProgress = elapsedSec / totalTrackSeconds;

    const userMiles = totalDistance / 1609.34;
    const userProgress = userMiles / 3;

    const pacerAngle = pacerProgress * 360;
    const userAngle = userProgress * 360;

    const totalLaps = lapsPerMile * 3;
    const userLaps = Math.floor(userMiles * lapsPerMile);
    lapLabel.textContent = `${userLaps} / ${totalLaps}`;
    lapDisplay.textContent = `${userLaps}/${totalLaps}`;
    lapFill.style.width = `${(userLaps / totalLaps) * 100}%`;

    moveDot("pacerDot", pacerAngle);
    moveWalkerIcon("walkerIcon", userAngle);
  }, 1000);
}

function moveDot(dotId, angle) {
  const ellipse = document.querySelector("#trackSVG ellipse");
  const cx = parseFloat(ellipse.getAttribute("cx"));
  const cy = parseFloat(ellipse.getAttribute("cy"));
  const rx = parseFloat(ellipse.getAttribute("rx"));
  const ry = parseFloat(ellipse.getAttribute("ry"));

  const rad = (angle - 90) * (Math.PI / 180);
  const x = cx + rx * Math.cos(rad);
  const y = cy + ry * Math.sin(rad);

  const dot = document.getElementById(dotId);
  dot.setAttribute("cx", x);
  dot.setAttribute("cy", y);
}

function moveWalkerIcon(textId, angle) {
  const ellipse = document.querySelector("#trackSVG ellipse");
  const cx = parseFloat(ellipse.getAttribute("cx"));
  const cy = parseFloat(ellipse.getAttribute("cy"));
  const rx = parseFloat(ellipse.getAttribute("rx"));
  const ry = parseFloat(ellipse.getAttribute("ry"));

  const rad = (angle - 90) * (Math.PI / 180);
  const x = cx + rx * Math.cos(rad);
  const y = cy + ry * Math.sin(rad);

  const icon = document.getElementById(textId);
  icon.setAttribute("x", x);
  icon.setAttribute("y", y);
}
