
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
let arc = Math.PI * 2 / prizes.length;
let spinTimeout = null;

function drawWheel() {
  const outsideRadius = 130;
  const textRadius = 100;
  const insideRadius = 75;

  ctx.clearRect(0, 0, 300, 300);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.font = "14px Arial";

  for (let i = 0; i < prizes.length; i++) {
    let angle = startAngle + i * arc;
    ctx.fillStyle = i % 2 === 0 ? "#f44336" : "#4caf50";

    ctx.beginPath();
    ctx.arc(150, 150, outsideRadius, angle, angle + arc, false);
    ctx.arc(150, 150, insideRadius, angle + arc, angle, true);
    ctx.fill();

    ctx.save();
    ctx.fillStyle = "white";
    ctx.translate(150 + Math.cos(angle + arc / 2) * textRadius,
                  150 + Math.sin(angle + arc / 2) * textRadius);
    ctx.rotate(angle + arc / 2 + Math.PI / 2);
    ctx.fillText(prizes[i].label, -ctx.measureText(prizes[i].label).width / 2, 0);
    ctx.restore();
  }
}

function getWeightedPrizeIndex() {
  const totalWeight = prizes.reduce((acc, p) => acc + p.weight, 0);
  const random = Math.random() * totalWeight;
  let sum = 0;
  for (let i = 0; i < prizes.length; i++) {
    sum += prizes[i].weight;
    if (random < sum) return i;
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
  let spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawWheel();
  spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  const degreesPerSlice = 360 / prizes.length;
  const finalDegree = 360 - (targetIndex * degreesPerSlice) + (degreesPerSlice / 2);
  startAngle = (finalDegree * Math.PI / 180);
  drawWheel();
  const prizeText = prizes[targetIndex].label;
  resultDiv.innerText = "🎉 You won: " + prizeText;

  // 回传至 Telegram
  if (window.Telegram.WebApp) {
    Telegram.WebApp.sendData(JSON.stringify({ result: prizeText }));
  }
}

function easeOut(t, b, c, d) {
  let ts = (t /= d) * t;
  let tc = ts * t;
  return b + c * (tc + -3 * ts + 3 * t);
}

spinBtn.addEventListener("click", () => {
  targetIndex = getWeightedPrizeIndex();
  const extraSpins = 5;
  const degreesPerSlice = 360 / prizes.length;
  const finalDegree = 360 - (targetIndex * degreesPerSlice) + (degreesPerSlice / 2);
  spinAngleStart = (360 * extraSpins) + finalDegree;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3000 + 4000;
  rotateWheel();
});

drawWheel();
