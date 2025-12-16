/* --------------------------------------------------------------
   Configurazione del piano cartesiano (solo valori positivi)
   -------------------------------------------------------------- */
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

/* 0 … MAX_VALUE su entrambi gli assi (solo positivo) */
const MAX_VALUE = 10;                     // puoi modificarlo a piacere
const SCALE = WIDTH / (MAX_VALUE + 1);    // pixel per unità (lascia margine)


/* --------------------------------------------------------------
   Funzioni di disegno
   -------------------------------------------------------------- */
function clearCanvas() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

/* Disegna gli assi X e Y (solo dal 0 al MAX_VALUE) */
function drawAxes() {
  ctx.save();
  ctx.strokeStyle = '#4b5563';   // gray‑700
  ctx.lineWidth = 2;

  // Asse X (da 0 a MAX_VALUE)
  ctx.beginPath();
  ctx.moveTo(SCALE, HEIGHT - SCALE);
  ctx.lineTo(WIDTH - SCALE, HEIGHT - SCALE);
  ctx.stroke();

  // Asse Y (da 0 a MAX_VALUE)
  ctx.beginPath();
  ctx.moveTo(SCALE, HEIGHT - SCALE);
  ctx.lineTo(SCALE, SCALE);
  ctx.stroke();

  // Ticks e numeri
  ctx.fillStyle = '#4b5563';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (let i = 0; i <= MAX_VALUE; i++) {
    // Tick X
    const x = SCALE + i * SCALE;
    ctx.beginPath();
    ctx.moveTo(x, HEIGHT - SCALE - 5);
    ctx.lineTo(x, HEIGHT - SCALE + 5);
    ctx.stroke();
    ctx.fillText(i, x, HEIGHT - SCALE + 8);

    // Tick Y
    const y = HEIGHT - SCALE - i * SCALE;
    ctx.beginPath();
    ctx.moveTo(SCALE - 5, y);
    ctx.lineTo(SCALE + 5, y);
    ctx.stroke();
    ctx.fillText(i, SCALE - 12, y - 4);
  }
  ctx.restore();
}

/* Disegna tutti i punti memorizzati */
function drawPoint(p) {
  ctx.save();
  const cx = SCALE + p.x * SCALE;
  const cy = HEIGHT - SCALE - p.y * SCALE;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}


/* --------------------------------------------------------------
   Gestione del form
   -------------------------------------------------------------- */
const form = document.getElementById('pointForm');
const xInput = document.getElementById('xInput');
const yInput = document.getElementById('yInput');
const colorPicker = document.getElementById('colorPicker');
const avvia_knn_button = document.getElementById('avvia_knn_btn');

function knn(points, new_point_x, new_point_y) {
    let distances = [];
    
    // Calculate distances
    for (let i = 0; i < points.length; i++) {
        let dist = Math.hypot(points[i].x - new_point_x, points[i].y - new_point_y);
        distances.push({ color: points[i].color, dist: dist });
    }
    
    // Sort by distance
    distances.sort((a, b) => a.dist - b.dist);
    
    // Count color frequencies for the 3 nearest neighbors
    let colorCount = {};
    for (let i = 0; i < 3 && i < distances.length; i++) {
        console.log(distances[i]);
        let color = distances[i].color;
        colorCount[color] = (colorCount[color] || 0) + 1;
    }
    
    // Find the color with the highest count
    let predictedColor = null;
    let maxCount = 0;
    for (let color in colorCount) {
        if (colorCount[color] > maxCount) {
            maxCount = colorCount[color];
            predictedColor = color;
        }
    }
    
    return predictedColor;
}



use_knn_for_color = false;
points = [];

avvia_knn_button.addEventListener("click", evt => {
  use_knn_for_color = true;
});

form.addEventListener('submit', e => {
  e.preventDefault();

  const x = parseFloat(xInput.value);
  const y = parseFloat(yInput.value);
  let color = colorPicker.value;

  // Controlli di validità (solo valori positivi e dentro il range)
  if (x < 0 || y < 0) {
    alert('Inserisci solo valori ≥ 0.');
    return;
  }
  if (x > MAX_VALUE || y > MAX_VALUE) {
    alert(`Il valore massimo consentito è ${MAX_VALUE}.`);
    return;
  }

  if(use_knn_for_color){
    color = knn(points, x, y);
    console.log(color);
  }
  point = { x, y, color };
  points.push(point);
  
  drawPoint(point);

  // Reset campi
  xInput.value = '';
  yInput.value = '';
  xInput.focus();
});

clearCanvas();
drawAxes();