const canvas = document.getElementById('wheelcanvas');
const ctx = canvas.getContext('2d');

const segments = ["Jackpot", "500", "Try Again", "100", "250", "Thanks", "750", "50"];
const colors = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#e67e22", "#9b59b6", "#1abc9c", "#34495e"];
const spinBtn = document.getElementById('spin');
const resultDiv = document.getElementById('result');

const segmentAngle = 2 * Math.PI / segments.length;
let rotation = 0;
let isSpinning = false;

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < segments.length; i++) {
    ctx.beginPath();
    ctx.fillStyle = colors[i];
    ctx.moveTo(150, 150);
    ctx.arc(150, 150, 150, segmentAngle * i + rotation, segmentAngle * (i + 1) + rotation);
    ctx.lineTo(150, 150);
    ctx.fill();
    ctx.save();
    ctx.translate(150, 150);
    ctx.rotate(segmentAngle * (i + 0.5) + rotation);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Inter";
    ctx.fillText(segments[i], 140, 10);
    ctx.restore();
  }
}

drawWheel();

spinBtn.addEventListener('click', () => {
  if (isSpinning) return;
  isSpinning = true;

  const targetIndex = Math.floor(Math.random() * segments.length);
  const baseRotation = 10 * 2 * Math.PI;
  const targetAngle = (segments.length - targetIndex) * segmentAngle - segmentAngle / 2;
  const finalRotation = baseRotation + targetAngle;

  const duration = 4000;
  const frameRate = 1000 / 60;
  const totalFrames = duration / frameRate;
  let frame = 0;

  const startRotation = rotation;
  const deltaRotation = finalRotation;

  const animate = () => {
    frame++;
    const progress = frame / totalFrames;
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    rotation = startRotation + deltaRotation * easedProgress;
    drawWheel();
    if (frame < totalFrames) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      const result = segments[targetIndex];
      resultDiv.textContent = `🎉 ${result}!`;
    }
  };

  animate();
});