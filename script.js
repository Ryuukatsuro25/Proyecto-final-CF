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

// Simulación sin Bluetooth
let tempActual = 20, humActual = 50, presActual = 1013;
function generarTemperatura() {
  tempActual += (Math.random() - 0.5);
  return Number(Math.min(40, Math.max(0, tempActual)).toFixed(1));
}
function generarHumedad() {
  humActual += (Math.random() - 0.5) * 2;
  return Number(Math.min(100, Math.max(10, humActual)).toFixed(0));
}
function generarPresion() {
  presActual += (Math.random() - 0.5) * 1.6;
  return Number(Math.min(1050, Math.max(980, presActual)).toFixed(0));
}

function actualizarDatos(temp, hum, pres) {
  tempSpan.textContent = temp;
  humSpan.textContent = hum;
  presSpan.textContent = pres;
  actualizarResumenAccesible(temp, hum, pres);
}

function actualizarResumenAccesible(temp, hum, pres) {
  mensajeClima.textContent = `Temperatura: ${temp} °C, Humedad: ${hum} %, Presión: ${pres} hPa (actualizado a las ${new Date().toLocaleTimeString()})`;
}

function actualizarGrafica(temp, hum, pres) {
  const ahora = new Date().toLocaleTimeString();
  etiquetasTiempo.push(ahora);
  historialTemperatura.push(Number(temp));
  historialHumedad.push(Number(hum));
  historialPresion.push(Number(pres));

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
  btnToggle.classList.toggle('pausado', !actualizando);
});

btnBluetooth.addEventListener('click', () => {
  btnBluetooth.disabled = true;
  conectarBluetooth().finally(() => {
    btnBluetooth.disabled = false;
  });
});

function bucleActualizacion() {
  if (actualizando) {
    if (dispositivoBluetooth && caracteristicaTemperatura && caracteristicaHumedad && caracteristicaPresion) {
      leerCaracteristicasBluetooth().then(({ temp, hum, pres }) => {
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

function leerCaracteristicasBluetooth() {
  return Promise.all([
    caracteristicaTemperatura.readValue(),
    caracteristicaHumedad.readValue(),
    caracteristicaPresion.readValue()
  ]).then(([tempData, humData, presData]) => ({
    temp: tempData.getUint8(0),
    hum: humData.getUint8(0),
    pres: presData.getUint16(0, true)
  }));
}

function conectarBluetooth() {
  return navigator.bluetooth.requestDevice({
    filters: [{ services: ['environmental_sensing'] }]
  }).then(device => {
    dispositivoBluetooth = device;
    dispositivoBluetooth.addEventListener('gattserverdisconnected', manejarDesconexion);
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

function manejarDesconexion() {
  mensajeClima.textContent = "Bluetooth desconectado";
  caracteristicaTemperatura = null;
  caracteristicaHumedad = null;
  caracteristicaPresion = null;
  dispositivoBluetooth = null;
}

bucleActualizacion();
