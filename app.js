let timer = null;
let startTime = null;
let totalLaps = 12;
let currentLap = 0;
let distanceMiles = 0;
let pacerInterval = null;

const lapText = document.getElementById("lapText");
const timeText = document.getElementById("timeText");
const paceText = document.getElementById("paceText");
const estText = document.getElementById("estText");
const distanceFill = document.getElementById("distanceFill");

const walkerIcon = document.getElementById("walkerIcon");
const pacerDot = document.getElementById("pacerDot");

let goalTimeMin = parseFloat(document.getElementById("goalTime").value);
let lapsPerMile = parseFloat(document.getElementById("lapsPerMile").value);

let animationFrame;
let walkerAngle = 0;
let pacerAngle = 0;
let totalDistance = 3; // miles

function updateStats() {
  const now = new Date();
  const elapsed = (now - startTime) / 1000; // seconds

  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);
  timeText.textContent = `Time: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const milesWalked = (currentLap / lapsPerMile);
  const pace = milesWalked > 0 ? elapsed / 60 / milesWalked : 0;
  paceText.textContent = `Pace: ${pace.toFixed(1)} min/mi`;

  const est = milesWalked > 0 ? pace * totalDistance : 0;
  const estMin = Math.floor(est);
  const estSec = Math.round((est - estMin) * 60);
  estText.textContent = `Est: ${String(estMin).padStart(2, '0')}:${String(estSec).padStart(2, '0')}`;

  const progressPercent = Math.min((milesWalked / totalDistance) * 100, 100);
  distanceFill.style.width = `${progressPercent}%`;

  lapText.textContent = `Lap: ${currentLap}/${totalLaps}`;
}

function animatePacer() {
  const totalPaceSeconds = goalTimeMin * 60;
  const laps = totalLaps;
  const secondsPerLap = totalPaceSeconds / laps;

  let start = null;

  function movePacer(timestamp) {
    if (!start) start = timestamp;
    const progress = (timestamp - start) / 1000;

    pacerAngle = (progress / secondsPerLap) * 360 * laps % 360;
    moveIconOnTrack(pacerDot, pacerAngle);

    animationFrame = requestAnimationFrame(movePacer);
  }

  animationFrame = requestAnimationFrame(movePacer);
}

function moveIconOnTrack(icon, angle) {
  const radius = 130; // pixels
  const centerX = 60;
  const centerY = 300;

  const rad = (angle - 90) * (Math.PI / 180); // offset by -90 to start top
  const x = centerX + radius * Math.cos(rad);
  const y = centerY + radius * Math.sin(rad);

  icon.style.left = `${x}px`;
  icon.style.top = `${y}px`;
}

function simulateLapProgress() {
  setInterval(() => {
    currentLap += 1;
    if (currentLap > totalLaps) currentLap = totalLaps;
  }, (goalTimeMin * 60 * 1000) / totalLaps);
}

function startOrStop() {
  if (timer) {
    clearInterval(timer);
    cancelAnimationFrame(animationFrame);
    timer = null;
    startTime = null;
    return;
  }

  currentLap = 0;
  lapsPerMile = parseFloat(document.getElementById("lapsPerMile").value);
  goalTimeMin = parseFloat(document.getElementById("goalTime").value);
  totalLaps = Math.round(lapsPerMile * totalDistance);

  startTime = new Date();
  timer = setInterval(updateStats, 1000);
  simulateLapProgress();
  animatePacer();
  getLocation(); // Start GPS
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(showPosition, showError, {
      enableHighAccuracy: true,
      maximumAge: 0
    });
  } else {
    alert("Geolocation is not supported.");
  }
}

function showPosition(position) {
  // Fake walker movement for demo
  walkerAngle = (walkerAngle + 1) % 360;
  moveIconOnTrack(walkerIcon, walkerAngle);
}

function showError(error) {
  console.warn(`GPS Error: ${error.message}`);
}

function switchToRoadMode() {
  alert("Road Mode view not implemented in this version.");
}
