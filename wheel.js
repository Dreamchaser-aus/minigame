// Optimized wheel.js with pointer-accurate alignment and visual smoothing
const canvas = document.getElementById("wheelcanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spin");
const resultDiv = document.getElementById("result");

const prizes = [
  { label: "🎁 10 Token", weight: 25 },
  { label: "🔥 50 Token", weight: 10 },
  { label: "😢 No Luck", weight: 40 },
  { label: "🎉 Jackpot", weight: 5 },
  { label: "💰 5 Token", weight: 20 }
];

let startAngle = 0;
const arc = Math.PI * 2 / prizes.length;
let spinTimeout = null;

function drawWheel() {
  const outerR = 130;
  const innerR = 75;
  const textR = 100;

  ctx.clearRect(0, 0, 300, 300);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.font = "14px Inter";

  for (let i = 0; i < prizes.length; i++) {
    const angle = startAngle + i * arc;
    ctx.fillStyle = i % 2 === 0 ? "#4caf50" : "#2196f3";

    ctx.beginPath();
    ctx.arc(150, 150, outerR, angle, angle + arc, false);
    ctx.arc(150, 150, innerR, angle + arc, angle, true);
    ctx.fill();

    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.translate(
      150 + Math.cos(angle + arc / 2) * textR,
      150 + Math.sin(angle + arc / 2) * textR
    );
    ctx.rotate(angle + arc / 2 + Math.PI / 2);
    ctx.fillText(prizes[i].label, -ctx.measureText(prizes[i].label).width / 2, 0);
    ctx.restore();
  }
}

function getWeightedPrizeIndex() {
  const total = prizes.reduce((acc, p) => acc + p.weight, 0);
  const rand = Math.random() * total;
  let sum = 0;
  for (let i = 0; i < prizes.length; i++) {
    sum += prizes[i].weight;
    if (rand < sum) return i;
  }
}

let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;
let targetIndex = 0;

function rotateWheel() {
  spinTime += 30;
  if (spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawWheel();
  spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);

  const degreesPerSlice = 360 / prizes.length;
  const finalDegree = 360 - (targetIndex * degreesPerSlice) - degreesPerSlice / 2;

  // Ensure final rotation angle lines up with pointer
  startAngle = (finalDegree * Math.PI / 180) % (Math.PI * 2);
  drawWheel();

  const prizeText = prizes[targetIndex].label;
  resultDiv.innerText = "🎉 You won: " + prizeText;

  // Send result back to Telegram WebApp
  if (window.Telegram.WebApp) {
    Telegram.WebApp.sendData(JSON.stringify({ result: prizeText }));
  }
}

function easeOut(t, b, c, d) {
  const ts = (t /= d) * t;
  const tc = ts * t;
  return b + c * (tc + -3 * ts + 3 * t);
}

spinBtn.addEventListener("click", () => {
  targetIndex = getWeightedPrizeIndex();
  const extraSpins = 6; // Full rotations for visual effect
  const degreesPerSlice = 360 / prizes.length;
  const finalDegree = 360 - (targetIndex * degreesPerSlice) - degreesPerSlice / 2;
  spinAngleStart = (360 * extraSpins) + finalDegree;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3000 + 3000;
  rotateWheel();
});

drawWheel();
