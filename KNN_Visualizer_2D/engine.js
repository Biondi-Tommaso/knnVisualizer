/* --------------------------------------------------------------
   Configurazione
   -------------------------------------------------------------- */
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const MAX_VALUE = 10;
const SCALE = WIDTH / (MAX_VALUE + 1);

/* Stato dell'applicazione */
let points = [];
let isPredictionMode = false;

/* Elementi DOM */
const form = document.getElementById('pointForm');
const xInput = document.getElementById('xInput');
const yInput = document.getElementById('yInput');
const colorPicker = document.getElementById('colorPicker');
const modeToggle = document.getElementById('modeToggle');
const modeLabel = document.getElementById('modeLabel');
const modeDescription = document.getElementById('modeDescription');
const manualColorSection = document.getElementById('manualColorSection');
const kSection = document.getElementById('kSection');
const kInput = document.getElementById('kInput');
const actionBtn = document.getElementById('actionBtn');

/* --------------------------------------------------------------
   Disegno (Canvas)
   -------------------------------------------------------------- */
function clearCanvas() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function drawAxes() {
  ctx.save();
  ctx.strokeStyle = '#e5e7eb'; // griglia leggera
  ctx.lineWidth = 1;

  // Griglia
  for (let i = 0; i <= MAX_VALUE; i++) {
    const pos = SCALE + i * SCALE;
    // Verticale
    ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, HEIGHT); ctx.stroke();
    // Orizzontale
    ctx.beginPath(); ctx.moveTo(0, HEIGHT - pos); ctx.lineTo(WIDTH, HEIGHT - pos); ctx.stroke();
  }

  // Assi principali
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(SCALE, 0); ctx.lineTo(SCALE, HEIGHT); ctx.stroke(); // Y
  ctx.beginPath(); ctx.moveTo(0, HEIGHT - SCALE); ctx.lineTo(WIDTH, HEIGHT - SCALE); ctx.stroke(); // X

  // Numeri
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  for (let i = 0; i <= MAX_VALUE; i++) {
    const x = SCALE + i * SCALE;
    const y = HEIGHT - SCALE - i * SCALE;
    // Label X
    ctx.fillText(i, x, HEIGHT - SCALE + 20);
    // Label Y
    if(i > 0) ctx.fillText(i, SCALE - 20, y);
  }
  ctx.restore();
}

function drawPoint(p, isNew = false) {
  ctx.save();
  const cx = SCALE + p.x * SCALE;
  const cy = HEIGHT - SCALE - p.y * SCALE;
  
  ctx.fillStyle = p.color;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  // Se è un punto appena aggiunto, lo facciamo leggermente più grande
  const radius = isNew ? 9 : 6;
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawConnectionLine(startP, endP) {
  ctx.save();
  ctx.strokeStyle = '#6366f1'; // Indaco
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]); // Linea tratteggiata

  const startX = SCALE + startP.x * SCALE;
  const startY = HEIGHT - SCALE - startP.y * SCALE;
  const endX = SCALE + endP.x * SCALE;
  const endY = HEIGHT - SCALE - endP.y * SCALE;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.restore();
}

function redrawAll() {
  clearCanvas();
  drawAxes();
  points.forEach(p => drawPoint(p));
}

/* --------------------------------------------------------------
   Logica KNN
   -------------------------------------------------------------- */
function runKnn(newX, newY, k) {
    // 1. Calcola distanze
    let distances = points.map(p => {
        return {
            point: p,
            dist: Math.hypot(p.x - newX, p.y - newY)
        };
    });
    
    // 2. Ordina per distanza crescente
    distances.sort((a, b) => a.dist - b.dist);
    
    // 3. Prendi i primi K vicini
    // Assicuriamoci di non chiedere più vicini di quanti punti esistono
    const kValid = Math.min(k, points.length);
    const nearest = distances.slice(0, kValid);
    
    // 4. Disegna le linee verso i vicini
    nearest.forEach(neighbor => {
        drawConnectionLine({x: newX, y: newY}, neighbor.point);
    });

    // 5. Votazione (Majority Vote)
    let colorCount = {};
    nearest.forEach(n => {
        let c = n.point.color;
        colorCount[c] = (colorCount[c] || 0) + 1;
    });

    let predictedColor = '#000000'; // Default se qualcosa va storto
    let maxCount = -1;

    for (let c in colorCount) {
        if (colorCount[c] > maxCount) {
            maxCount = colorCount[c];
            predictedColor = c;
        }
    }

    return predictedColor;
}

/* --------------------------------------------------------------
   Gestione Eventi UI
   -------------------------------------------------------------- */

// Cambio Modalità
modeToggle.addEventListener('change', (e) => {
  isPredictionMode = e.target.checked;

  if (isPredictionMode) {
    // UI: Attiva Modalità KNN
    modeLabel.textContent = "Modalità Predizione (AI)";
    modeLabel.classList.add("text-indigo-600");
    modeDescription.textContent = "L'algoritmo decide il colore in base ai vicini.";
    
    manualColorSection.classList.add('hidden-panel');
    kSection.classList.remove('hidden-panel');
    
    actionBtn.textContent = "Predici e Aggiungi";
    actionBtn.classList.remove('bg-gray-800', 'hover:bg-gray-900');
    actionBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
  } else {
    // UI: Attiva Modalità Manuale
    modeLabel.textContent = "Modalità Inserimento";
    modeLabel.classList.remove("text-indigo-600");
    modeDescription.textContent = "Scegli tu il colore dei punti per creare il dataset.";

    manualColorSection.classList.remove('hidden-panel');
    kSection.classList.add('hidden-panel');

    actionBtn.textContent = "Aggiungi Punto";
    actionBtn.classList.add('bg-gray-800', 'hover:bg-gray-900');
    actionBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
  }
});

// Submit Form
form.addEventListener('submit', e => {
  e.preventDefault();

  const x = parseFloat(xInput.value);
  const y = parseFloat(yInput.value);
  let color = colorPicker.value;

  // Validazione
  if (x < 0 || y < 0 || x > MAX_VALUE || y > MAX_VALUE) {
    alert(`Inserisci valori tra 0 e ${MAX_VALUE}.`);
    return;
  }

  // Se siamo in modalità Predizione, calcoliamo il colore
  if (isPredictionMode) {
      if(points.length === 0) {
          alert("Inserisci almeno un punto manualmente prima di usare l'AI!");
          return;
      }
      const k = parseInt(kInput.value) || 3;
      // Nota: runKnn disegna anche le linee
      color = runKnn(x, y, k);
  }

  // Creazione e salvataggio punto
  const newPoint = { x, y, color };
  points.push(newPoint);
  
  // Disegniamo il punto sopra le linee
  drawPoint(newPoint, true);

  // Reset Input (ma non colore in modalità manuale, comodo per inserirne tanti uguali)
  xInput.value = '';
  yInput.value = '';
  xInput.focus();
});

// Funzione reset globale
function clearAll() {
    points = [];
    redrawAll();
}

// Avvio
redrawAll();