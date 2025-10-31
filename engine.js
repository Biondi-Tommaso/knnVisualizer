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

const points = [];   // [{x, y, color}]

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
function drawPoints() {
  ctx.save();
  points.forEach(p => {
    const cx = SCALE + p.x * SCALE;
    const cy = HEIGHT - SCALE - p.y * SCALE;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/* Render completo */
function render() {
  clearCanvas();
  drawAxes();
  drawPoints();
}

/* --------------------------------------------------------------
   Aggiornamento della tabella laterale
   -------------------------------------------------------------- */
function updateTable() {
  const tbody = document.getElementById('pointsTableBody');
  tbody.innerHTML = '';

  points.forEach((p, idx) => {
    const tr = document.createElement('tr');
    tr.className = idx % 2 ? 'bg-gray-50' : '';

    // Pulsante di rimozione
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Rimuovi';
    removeBtn.className =
      'px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs';
    removeBtn.addEventListener('click', () => {
      // Rimuove il punto all’indice idx
      points.splice(idx, 1);
      updateTable();
      render();
    });

    tr.innerHTML = `
      <td class="px-2 py-1">${idx + 1}</td>
      <td class="px-2 py-1">${p.x}</td>
      <td class="px-2 py-1">${p.y}</td>
      <td class="px-2 py-1">
        <span class="inline-block w-4 h-4 rounded-full" style="background:${p.color}"></span>
        ${p.color}
      </td>
      <td class="px-2 py-1"></td>`;   // spazio per il bottone

    // Inseriamo il bottone nella cella “Azioni”
    tr.children[4].appendChild(removeBtn);
    tbody.appendChild(tr);
  });
}

/* --------------------------------------------------------------
   Gestione del form
   -------------------------------------------------------------- */
const form = document.getElementById('pointForm');
const xInput = document.getElementById('xInput');
const yInput = document.getElementById('yInput');
const colorPicker = document.getElementById('colorPicker');

form.addEventListener('submit', e => {
  e.preventDefault();

  const x = parseFloat(xInput.value);
  const y = parseFloat(yInput.value);
  const color = colorPicker.value;

  // Controlli di validità (solo valori positivi e dentro il range)
  if (x < 0 || y < 0) {
    alert('Inserisci solo valori ≥ 0.');
    return;
  }
  if (x > MAX_VALUE || y > MAX_VALUE) {
    alert(`Il valore massimo consentito è ${MAX_VALUE}.`);
    return;
  }

  points.push({ x, y, color });
  updateTable();
  render();

  // Reset campi
  xInput.value = '';
  yInput.value = '';
  xInput.focus();
});

/* Render iniziale (solo assi) */
render();