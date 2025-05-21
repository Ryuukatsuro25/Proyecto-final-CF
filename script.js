// Variables para guardar estado de actualización y datos históricos
let actualizando = true;
const historialTemperatura = [];
const historialHumedad = [];
const historialPresion = [];
const etiquetasTiempo = [];

// Referencias a elementos DOM
const tempSpan = document.getElementById('temperatura');
const humSpan = document.getElementById('humedad');
const presSpan = document.getElementById('presion');
const mensajeClima = document.getElementById('mensaje');

const btnToggle = document.getElementById('btn-toggle');

// Inicializar gráfica con Chart.js
const ctx = document.getElementById('grafica').getContext('2d');
const grafica = new Chart(ctx, {
  type: 'line',
  data: {
    labels: etiquetasTiempo,
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: historialTemperatura,
        borderColor: 'rgb(30, 58, 138)',
        backgroundColor: 'rgba(30, 58, 138, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Humedad (%)',
        data: historialHumedad,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Presión (hPa)',
        data: historialPresion,
        borderColor: 'rgb(107, 114, 128)',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        tension: 0.3,
      }
    ]
  },
  options: {
    responsive: true,
    animation: {
      duration: 500
    },
    scales: {
      y: {
        beginAtZero: false,
        grace: '5%'
      }
    },
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }
});

// Función para generar valores aleatorios para los sensores
function generarDatosClima() {
  // Generar valores simulados con variación suave
  const nuevaTemp = generarTemperatura();
  const nuevaHum = generarHumedad();
  const nuevaPres = generarPresion();

  // Actualizar valores en el DOM
  actualizarDatos(nuevaTemp, nuevaHum, nuevaPres);
  actualizarGrafica(nuevaTemp, nuevaHum, nuevaPres);
}

// Generadores individuales con lógica de variación
let tempActual = 20;
let humActual = 50;
let presActual = 1013;

function generarTemperatura() {
  // Variación aleatoria +/- 0.5 grados, dentro de 0-40 °C
  tempActual += (Math.random() - 0.5);
  tempActual = Math.min(40, Math.max(0, tempActual));
  return tempActual.toFixed(1);
}

function generarHumedad() {
  // Variación aleatoria +/- 1%, dentro de 10-100%
  humActual += (Math.random() - 0.5) * 2;
  humActual = Math.min(100, Math.max(10, humActual));
  return humActual.toFixed(0);
}

function generarPresion() {
  // Variación aleatoria +/- 0.8 hPa, dentro de 980-1050 hPa
  presActual += (Math.random() - 0.5) * 1.6;
  presActual = Math.min(1050, Math.max(980, presActual));
  return presActual.toFixed(0);
}

// Actualiza los valores en el DOM
function actualizarDatos(temp, hum, pres) {
  tempSpan.textContent = temp;
  humSpan.textContent = hum;
  presSpan.textContent = pres;
  mensajeClima.textContent = 'Datos actualizados al ' + new Date().toLocaleTimeString();
}

// Actualiza la gráfica con nuevos datos
function actualizarGrafica(temp, hum, pres) {
  const ahora = new Date().toLocaleTimeString();

  // Añadir nuevas etiquetas y datos
  etiquetasTiempo.push(ahora);
  historialTemperatura.push(temp);
  historialHumedad.push(hum);
  historialPresion.push(pres);

  // Mantener solo los últimos 20 datos
  if (etiquetasTiempo.length > 20) {
    etiquetasTiempo.shift();
    historialTemperatura.shift();
    historialHumedad.shift();
    historialPresion.shift();
  }

  // Actualizar gráfica
  grafica.update();
}

// Control para pausar o continuar actualización
btnToggle.addEventListener('click', () => {
  actualizando = !actualizando;
  btnToggle.textContent = actualizando ? 'Pausar Actualización' : 'Continuar Actualización';
  btnToggle.setAttribute('aria-pressed', actualizando);
});

// Loop principal de actualización de datos cada 3 segundos
function bucleActualizacion() {
  if (actualizando) {
    generarDatosClima();
  }
  setTimeout(bucleActualizacion, 3000);
}

// Iniciar actualización automática
bucleActualizacion();
