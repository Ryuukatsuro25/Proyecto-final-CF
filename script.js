// Variables para guardar estado de actualización y datos históricos
let actualizando = true;
const historialTemperatura = [];
const historialHumedad = [];
const historialPresion = [];
const etiquetasTiempo = [];

// Elementos DOM
const tempSpan = document.getElementById('temperatura');
const humSpan = document.getElementById('humedad');
const presSpan = document.getElementById('presion');
const mensajeClima = document.getElementById('mensaje');

const btnToggle = document.getElementById('btn-toggle');

// Genera valores aleatorios para los sensores
function generarTemperatura() {
  // Temperatura entre 15 y 35 °C
  return (Math.random() * 20 + 15).toFixed(1);
}

function generarHumedad() {
  // Humedad relativa entre 30% y 90%
  return (Math.random() * 60 + 30).toFixed(0);
}

function generarPresion() {
  // Presión atmosférica entre 980 y 1030 hPa
  return (Math.random() * 50 + 980).toFixed(1);
}

// Actualiza los colores y clases según valores
function actualizarColores(temp, hum, pres) {
  const tempDiv = document.getElementById('temp-dato');
  const humDiv = document.getElementById('hum-dato');
  const presDiv = document.getElementById('pres-dato');

  // Temperatura
  tempDiv.classList.remove('high', 'low');
  if (temp >= 30) tempDiv.classList.add('high');
  else if (temp <= 18) tempDiv.classList.add('low');

  // Humedad
  humDiv.classList.remove('high', 'low');
  if (hum >= 70) humDiv.classList.add('high');
  else if (hum <= 40) humDiv.classList.add('low');

  // Presión
  presDiv.classList.remove('high', 'low');
  if (pres >= 1020) presDiv.classList.add('high');
  else if (pres <= 990) presDiv.classList.add('low');
}

// Actualiza el mensaje del clima
function actualizarMensaje(temp, hum) {
  if (temp >= 30 && hum >= 70) {
    mensajeClima.textContent = 'Clima caluroso y húmedo, ¡mantente hidratado!';
  } else if (temp <= 18 && hum <= 40) {
    mensajeClima.textContent = 'Clima frío y seco, ¡abrígate bien!';
  } else if (temp >= 30) {
    mensajeClima.textContent = 'Clima caluroso, evita la exposición prolongada al sol.';
  } else if (temp <= 18) {
    mensajeClima.textContent = 'Clima fresco, una chaqueta ligera es recomendable.';
  } else {
    mensajeClima.textContent = 'Clima agradable y estable.';
  }
}

// Función para actualizar datos y gráficos
function actualizarDatos() {
  if (!actualizando) return;

  const temp = parseFloat(generarTemperatura());
  const hum = parseInt(generarHumedad());
  const pres = parseFloat(generarPresion());

  tempSpan.textContent = temp.toFixed(1);
  humSpan.textContent = hum;
  presSpan.textContent = pres.toFixed(1);

  actualizarColores(temp, hum, pres);
  actualizarMensaje(temp, hum);

  // Guardar datos en el historial
  const ahora = new Date();
  const horaMin = ahora.getHours().toString().padStart(2, '0') + ':' + ahora.getMinutes().toString().padStart(2, '0');
  etiquetasTiempo.push(horaMin);
  historialTemperatura.push(temp);
  historialHumedad.push(hum);
  historialPresion.push(pres);

  // Mantener máximo 10 datos
  if (etiquetasTiempo.length > 10) {
    etiquetasTiempo.shift();
    historialTemperatura.shift();
    historialHumedad.shift();
    historialPresion.shift();
  }

  // Actualizar gráficos
  graficoTemperatura.data.labels = etiquetasTiempo;
  graficoTemperatura.data.datasets[0].data = historialTemperatura;
  graficoTemperatura.update();

  graficoHumedad.data.labels = etiquetasTiempo;
  graficoHumedad.data.datasets[0].data = historialHumedad;
  graficoHumedad.update();

  graficoPresion.data.labels = etiquetasTiempo;
  graficoPresion.data.datasets[0].data = historialPresion;
  graficoPresion.update();
}

// Configuración de gráficos con Chart.js

const ctxTemp = document.getElementById('grafico-temperatura').getContext('2d');
const graficoTemperatura = new Chart(ctxTemp, {
  type: 'line',
  data: {
    labels: etiquetasTiempo,
    datasets: [{
      label: 'Temperatura (°C)',
      data: historialTemperatura,
      borderColor: '#d62828',
      backgroundColor: 'rgba(214, 40, 40, 0.2)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 7,
      borderWidth: 3
    }]
  },
  options: {
    responsive: true,
    animation: {
      duration: 700
    },
    scales: {
      y: {
        min: 10,
        max: 40,
        ticks: {
          stepSize: 5
        }
      }
    }
  }
});

const ctxHum = document.getElementById('grafico-humedad').getContext('2d');
const graficoHumedad = new Chart(ctxHum, {
  type: 'line',
  data: {
    labels: etiquetasTiempo,
    datasets: [{
      label: 'Humedad (%)',
      data: historialHumedad,
      borderColor: '#007f5f',
      backgroundColor: 'rgba(0, 127, 95, 0.2)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 7,
      borderWidth: 3
    }]
  },
  options: {
    responsive: true,
    animation: {
      duration: 700
    },
    scales: {
      y: {
        min: 20,
        max: 100,
        ticks: {
          stepSize: 10
        }
      }
    }
  }
});

const ctxPres = document.getElementById('grafico-presion').getContext('2d');
const graficoPresion = new Chart(ctxPres, {
  type: 'line',
  data: {
    labels: etiquetasTiempo,
    datasets: [{
      label: 'Presión (hPa)',
      data: historialPresion,
      borderColor: '#6a994e',
      backgroundColor: 'rgba(106, 153, 78, 0.2)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 7,
      borderWidth: 3
    }]
  },
  options: {
    responsive: true,
    animation: {
      duration: 700
    },
    scales: {
      y: {
        min: 970,
        max: 1050,
        ticks: {
          stepSize: 10
        }
      }
    }
  }
});

// Control de actualización con botón

btnToggle.addEventListener('click', () => {
  actualizando = !actualizando;
  btnToggle.textContent = actualizando ? 'Pausar Actualización' : 'Reanudar Actualización';
  if (actualizando) actualizarDatos();
});

// Actualiza datos al cargar la página
actualizarDatos();

// Actualiza cada 5 segundos
setInterval(actualizarDatos, 5000);
