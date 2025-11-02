// Link do CSV público do Google Sheets
const csvUrl = "https://docs.google.com/spreadsheets/d/1r0c6ViGzlMPuqp6Z0Jm3mk7HrgLlBS5MVcLVL7A3bHY/export?format=csv&gid=0";

let rawRows = [];
let chartInstance = null;

// Seletores do HTML
const tenisSelect = document.querySelector(".filtros select:nth-of-type(2)"); // select de tênis
const notaDiv = document.querySelector(".nota");

// Colunas usadas no gráfico radar (sem acentos, como estão no CSV)
const radarColumns = [
  "GCT NOTA",
  "Power NOTA",
  "Impacto NOTA",
  "Pronacao NOTA",
  "Vel. Pronacao NOTA",
  "Xpro NOTA",
  "H20 NOTA",
  "VO2 NOTA",
  "MP - TO NOTA"
];

// Converte valores numéricos de forma segura
function safeNum(value) {
  if (!value) return 0;
  return Number(String(value).trim().replace(",", ".")) || 0;
}

// Carregar CSV
async function loadData() {
  try {
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error("Erro ao carregar CSV");
    const txt = await res.text();
    const parsed = Papa.parse(txt, { header: true, skipEmptyLines: true });
    rawRows = parsed.data;

    populateSelect();
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar os dados: " + err.message);
  }
}

// Popular o select com os tênis da planilha
function populateSelect() {
  tenisSelect.innerHTML = '<option value="">----</option>';

  rawRows.forEach((row, i) => {
    const name = row["Tenis"] || row["TENIS"] || row["Tênis"] || `Item ${i + 1}`;
    const option = document.createElement("option");
    option.value = i;
    option.textContent = name;
    tenisSelect.appendChild(option);
  });

  tenisSelect.addEventListener("change", () => {
    const idx = Number(tenisSelect.value);
    if (!Number.isNaN(idx)) renderForIndex(idx);
  });
}

// Renderizar o gráfico e as informações laterais
function renderForIndex(idx) {
  const row = rawRows[idx];
  const label = row["Tenis"] || row["TENIS"] || row["Tênis"] || `Item ${idx + 1}`;

  // Coleta as notas para o gráfico radar
  const data = radarColumns.map(c => safeNum(row[c]));

 const sum = data.reduce((a, b) => a + b, 0);
 const avg = (sum / 10).toFixed(1);

  // Atualizar informações do canto
  notaDiv.innerHTML = `
    <p>NOTA</p>
    <span>${avg}</span>
    <p>Preço: R$${row["Preco"] || row["PRECO"] || "-"}</p>
    <p>Preço Ideal: R$${row["Preco IDEAL"] || row["PRECO IDEAL"] || "-"}</p>
    <p>Custo-Benefício: ${row["C x B"] || row["C X B"] || "-"}</p>
  `;

  // Criar ou atualizar o gráfico radar
  const ctx = document.getElementById("radarChart");
  if (chartInstance) {
    chartInstance.data.labels = radarColumns;
    chartInstance.data.datasets = [{
      label,
      data,
      fill: true,
      borderWidth: 2,
      pointRadius: 4
    }];
    chartInstance.update();
  } else {
    chartInstance = new Chart(ctx, {
      type: "radar",
      data: {
        labels: radarColumns,
        datasets: [{
          label,
          data,
          fill: true,
          borderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: { stepSize: 1 }
          }
        },
        plugins: {
          legend: { position: "top" }
        }
      }
    });
  }
}

loadData();
