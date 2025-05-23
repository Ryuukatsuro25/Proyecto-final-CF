let actualizando = true;
const historialTemperatura = [];
const historialHumedad = [];
const historialPresion = [];
const etiquetasTiempo = [];

const tempSpan = document.getElementById('temperatura');
const humSpan = document.getElementById('humedad');
const presSpan = document.getElementById('presion');
const mensajeClima = document.getElementById('mensaje');

const btnToggle = document.getElementById('btn-toggle');
const btnBluetooth = document.getElementById('btn-bluetooth');

let dispositivoBluetooth = null;
let caracteristicaTemperatura, caracteristicaHumedad, caracteristicaPresion;

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
    animation: { duration: 500 },
    scales: {
      y: {
        beginAtZero: false,
        grace: '5%'
      }
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }
});

// Simulación para uso sin Bluetooth (modo por defecto)
let tempActual = 20, humActual = 50, presActual = 1013;
function generarTemperatura() {
  tempActual += (Math.random() - 0.5);
  return Math.min(40, Math.max(0, tempActual)).toFixed(1);
}
function generarHumedad() {
  humActual += (Math.random() - 0.5) * 2;
  return Math.min(100, Math.max(10, humActual)).toFixed(0);
}
function generarPresion() {
  presActual += (Math.random() - 0.5) * 1.6;
  return Math.min(1050, Math.max(980, presActual)).toFixed(0);
}

function actualizarDatos(temp, hum, pres) {
  tempSpan.textContent = temp;
  humSpan.textContent = hum;
  presSpan.textContent = pres;
  mensajeClima.textContent = 'Datos actualizados al ' + new Date().toLocaleTimeString();
}

function actualizarGrafica(temp, hum, pres) {
  const ahora = new Date().toLocaleTimeString();
  etiquetasTiempo.push(ahora);
  historialTemperatura.push(temp);
  historialHumedad.push(hum);
  historialPresion.push(pres);

  if (etiquetasTiempo.length > 20) {
    etiquetasTiempo.shift();
    historialTemperatura.shift();
    historialHumedad.shift();
    historialPresion.shift();
  }

  grafica.update();
}

btnToggle.addEventListener('click', () => {
  actualizando = !actualizando;
  btnToggle.textContent = actualizando ? 'Pausar Actualización' : 'Continuar Actualización';
  btnToggle.setAttribute('aria-pressed', actualizando);
});

btnBluetooth.addEventListener('click', conectarBluetooth);

function bucleActualizacion() {
  if (actualizando) {
    if (dispositivoBluetooth && caracteristicaTemperatura && caracteristicaHumedad && caracteristicaPresion) {
      Promise.all([
        caracteristicaTemperatura.readValue(),
        caracteristicaHumedad.readValue(),
        caracteristicaPresion.readValue()
      ]).then(([tempData, humData, presData]) => {
        const temp = tempData.getUint8(0);
        const hum = humData.getUint8(0);
        const pres = presData.getUint16(0, true);
        actualizarDatos(temp, hum, pres);
        actualizarGrafica(temp, hum, pres);
      }).catch(console.error);
    } else {
      const t = generarTemperatura(), h = generarHumedad(), p = generarPresion();
      actualizarDatos(t, h, p);
      actualizarGrafica(t, h, p);
    }
  }
  setTimeout(bucleActualizacion, 3000);
}

bucleActualizacion();

function conectarBluetooth() {
  navigator.bluetooth.requestDevice({
    filters: [{ services: ['environmental_sensing'] }]
  }).then(device => {
    dispositivoBluetooth = device;
    return device.gatt.connect();
  }).then(server => {
    return server.getPrimaryService('environmental_sensing');
  }).then(service => {
    return Promise.all([
      service.getCharacteristic('temperature'),
      service.getCharacteristic('humidity'),
      service.getCharacteristic('pressure')
    ]);
  }).then(([tempChar, humChar, presChar]) => {
    caracteristicaTemperatura = tempChar;
    caracteristicaHumedad = humChar;
    caracteristicaPresion = presChar;
    mensajeClima.textContent = "Bluetooth conectado y listo";
  }).catch(error => {
    console.error(error);
    mensajeClima.textContent = "Error al conectar Bluetooth";
  });
}
