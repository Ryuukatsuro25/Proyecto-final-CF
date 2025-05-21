// script.js

document.addEventListener("DOMContentLoaded", () => {
  // Estado principal: datos en memoria
  const estado = {
    pasajeros: [],
    conductores: []
  };

  // --- UTILIDADES ---

  // Crea un ID único simple para nuevo registro
  function generarId() {
    return Math.floor(Math.random() * 1e9);
  }

  // Renderiza las cuentas bancarias en contenedor indicado
  function renderizarCuentas(contenedor, cuentas, tipoUsuario) {
    contenedor.innerHTML = "";

    cuentas.forEach((cuenta, index) => {
      const div = document.createElement("div");
      div.className = "cuenta-bancaria";

      div.innerHTML = `
        <label>
          Banco:
          <select class="banco-select" data-index="${index}">
            <option value="Bancolombia" ${cuenta.banco === "Bancolombia" ? "selected" : ""}>Bancolombia</option>
            <option value="Nequi" ${cuenta.banco === "Nequi" ? "selected" : ""}>Nequi</option>
            <option value="Banco de Bogotá" ${cuenta.banco === "Banco de Bogotá" ? "selected" : ""}>Banco de Bogotá</option>
          </select>
        </label>

        <label>
          Número:
          <input type="text" class="numero-input" data-index="${index}" value="${cuenta.numero}" />
        </label>

        <label>
          Titular:
          <input type="text" class="titular-input" data-index="${index}" value="${cuenta.titular}" />
        </label>

        <label>
          Cédula:
          <input type="text" class="cedula-input" data-index="${index}" value="${cuenta.cedula}" />
        </label>

        <label>
          Preferida:
          <input type="radio" name="preferida-${tipoUsuario}" class="preferida-radio" data-index="${index}" ${cuenta.preferida ? "checked" : ""} />
        </label>

        <button class="btn-eliminar-cuenta" data-index="${index}" title="Eliminar cuenta">X</button>
      `;

      contenedor.appendChild(div);
    });
  }

  // Actualiza datos de cuentas según inputs en DOM
  function actualizarCuentasDesdeDOM(cuentas, contenedor, tipoUsuario) {
    const divs = contenedor.querySelectorAll(".cuenta-bancaria");
    divs.forEach((div, i) => {
      const banco = div.querySelector(".banco-select").value;
      const numero = div.querySelector(".numero-input").value.trim();
      const titular = div.querySelector(".titular-input").value.trim();
      const cedula = div.querySelector(".cedula-input").value.trim();
      const preferida = div.querySelector(`input.preferida-radio`).checked;

      cuentas[i] = { banco, numero, titular, cedula, preferida };
    });

    // Solo una preferida
    let preferidaSet = false;
    cuentas.forEach(c => {
      if (c.preferida) {
        if (!preferidaSet) preferidaSet = true;
        else c.preferida = false; // desactiva si hay más de una marcada
      }
    });

    // Si ninguna está marcada preferida, la primera será preferida
    if (!preferidaSet && cuentas.length > 0) {
      cuentas[0].preferida = true;
    }
  }

  // Actualiza el JSON visualizador
  function actualizarJSONVisualizador() {
    const jsonVis = document.getElementById("json-visualizador");
    jsonVis.textContent = JSON.stringify(estado, null, 4);
  }

  // --- PASAJEROS ---

  const pasajeroForm = document.getElementById("pasajero-form");
  const pasajeroNombre = document.getElementById("pasajero-nombre");
  const pasajeroEstadoCuenta = document.getElementById("pasajero-estado-cuenta");
  const pasajeroMetodoPago = document.getElementById("pasajero-metodo-pago");
  const pasajeroTemaVisual = document.getElementById("pasajero-tema-visual");
  const pasajeroCuentasList = document.getElementById("pasajero-cuentas-list");
  const pasajeroAgregarCuentaBtn = document.getElementById("pasajero-agregar-cuenta-btn");

  // Inicializa datos pasajero
  let pasajeroActual = {
    id: generarId(),
    nombre: "",
    estado_cuenta: "activo",
    metodo_pago_preferido: "Efectivo",
    tema_visual: "claro",
    cuentas_bancarias: []
  };

  // Renderizar cuentas pasajero
  function renderizarCuentasPasajero() {
    renderizarCuentas(pasajeroCuentasList, pasajeroActual.cuentas_bancarias, "pasajero");
  }

  // Agregar cuenta pasajero
  pasajeroAgregarCuentaBtn.addEventListener("click", () => {
    if (pasajeroActual.cuentas_bancarias.length >= 3) {
      alert("Solo puedes agregar máximo 3 cuentas bancarias.");
      return;
    }
    pasajeroActual.cuentas_bancarias.push({
      banco: "Bancolombia",
      numero: "",
      titular: "",
      cedula: "",
      preferida: pasajeroActual.cuentas_bancarias.length === 0 // primera por defecto preferida
    });
    renderizarCuentasPasajero();
  });

  // Detectar cambios en cuentas pasajero para actualizar estado
  pasajeroCuentasList.addEventListener("input", e => {
    actualizarCuentasDesdeDOM(pasajeroActual.cuentas_bancarias, pasajeroCuentasList, "pasajero");
    actualizarJSONVisualizador();
  });

  pasajeroCuentasList.addEventListener("change", e => {
    actualizarCuentasDesdeDOM(pasajeroActual.cuentas_bancarias, pasajeroCuentasList, "pasajero");
    actualizarJSONVisualizador();
  });

  pasajeroCuentasList.addEventListener("click", e => {
    if (e.target.classList.contains("btn-eliminar-cuenta")) {
      const index = parseInt(e.target.dataset.index, 10);
      pasajeroActual.cuentas_bancarias.splice(index, 1);
      renderizarCuentasPasajero();
      actualizarJSONVisualizador();
    }
  });

  // Guardar pasajero
  pasajeroForm.addEventListener("submit", e => {
    e.preventDefault();
    // Actualizar datos generales
    pasajeroActual.nombre = pasajeroNombre.value.trim();
    pasajeroActual.estado_cuenta = pasajeroEstadoCuenta.value;
    pasajeroActual.metodo_pago_preferido = pasajeroMetodoPago.value;
    pasajeroActual.tema_visual = pasajeroTemaVisual.value;

    // Actualizar cuentas por si queda algún cambio sin guardar
    actualizarCuentasDesdeDOM(pasajeroActual.cuentas_bancarias, pasajeroCuentasList, "pasajero");

    // Buscar pasajero en estado
    const idx = estado.pasajeros.findIndex(p => p.id === pasajeroActual.id);
    if (idx !== -1) {
      estado.pasajeros[idx] = { ...pasajeroActual };
    } else {
      estado.pasajeros.push({ ...pasajeroActual });
    }

    alert("Pasajero guardado correctamente.");
    actualizarJSONVisualizador();
  });

  // --- CONDUCTORES ---

  const conductorForm = document.getElementById("conductor-form");
  const conductorNombre = document.getElementById("conductor-nombre");
  const conductorEstadoCuenta = document.getElementById("conductor-estado-cuenta");
  const conductorMetodoPago = document.getElementById("conductor-metodo-pago");
  const conductorTemaVisual = document.getElementById("conductor-tema-visual");
  const conductorCuentasList = document.getElementById("conductor-cuentas-list");
  const conductorAgregarCuentaBtn = document.getElementById("conductor-agregar-cuenta-btn");

  let conductorActual = {
    id: generarId(),
    nombre: "",
    estado_cuenta: "activo",
    metodo_pago_preferido: "Efectivo",
    tema_visual: "claro",
    cuentas_bancarias: []
  };

  // Renderizar cuentas conductor
  function renderizarCuentasConductor() {
    renderizarCuentas(conductorCuentasList, conductorActual.cuentas_bancarias, "conductor");
  }

  // Agregar cuenta conductor
  conductorAgregarCuentaBtn.addEventListener("click", () => {
    if (conductorActual.cuentas_bancarias.length >= 3) {
      alert("Solo puedes agregar máximo 3 cuentas bancarias.");
      return;
    }
    conductorActual.cuentas_bancarias.push({
      banco: "Bancolombia",
      numero: "",
      titular: "",
      cedula: "",
      preferida: conductorActual.cuentas_bancarias.length === 0
    });
    renderizarCuentasConductor();
  });

  // Detectar cambios en cuentas conductor
  conductorCuentasList.addEventListener("input", e => {
    actualizarCuentasDesdeDOM(conductorActual.cuentas_bancarias, conductorCuentasList, "conductor");
    actualizarJSONVisualizador();
  });

  conductorCuentasList.addEventListener("change", e => {
    actualizarCuentasDesdeDOM(conductorActual.cuentas_bancarias, conductorCuentasList, "conductor");
    actualizarJSONVisualizador();
  });

  conductorCuentasList.addEventListener("click", e => {
    if (e.target.classList.contains("btn-eliminar-cuenta")) {
      const index = parseInt(e.target.dataset.index, 10);
      conductorActual.cuentas_bancarias.splice(index, 1);
      renderizarCuentasConductor();
      actualizarJSONVisualizador();
    }
  });

  // Guardar conductor
  conductorForm.addEventListener("submit", e => {
    e.preventDefault();
    conductorActual.nombre = conductorNombre.value.trim();
    conductorActual.estado_cuenta = conductorEstadoCuenta.value;
    conductorActual.metodo_pago_preferido = conductorMetodoPago.value;
    conductorActual.tema_visual = conductorTemaVisual.value;

    actualizarCuentasDesdeDOM(conductorActual.cuentas_bancarias, conductorCuentasList, "conductor");

    const idx = estado.conductores.findIndex(c => c.id === conductorActual.id);
    if (idx !== -1) {
      estado.conductores[idx] = { ...conductorActual };
    } else {
      estado.conductores.push({ ...conductorActual });
    }

    alert("Conductor guardado correctamente.");
    actualizarJSONVisualizador();
  });

  // --- DESCARGA JSON ---

  const btnDescargarJSON = document.getElementById("btn-descargar-json");
  btnDescargarJSON.addEventListener("click", () => {
    const texto = JSON.stringify(estado, null, 4);
    const blob = new Blob([texto], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "datos_completos.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // --- INICIALIZACION ---

  // Poner valores iniciales vacíos y renderizar
  function inicializarFormPasajero() {
    pasajeroNombre.value = pasajeroActual.nombre;
    pasajeroEstadoCuenta.value = pasajeroActual.estado_cuenta;
    pasajeroMetodoPago.value = pasajeroActual.metodo_pago_preferido;
    pasajeroTemaVisual.value = pasajeroActual.tema_visual;
    renderizarCuentasPasajero();
  }

  function inicializarFormConductor() {
    conductorNombre.value = conductorActual.nombre;
    conductorEstadoCuenta.value = conductorActual.estado_cuenta;
    conductorMetodoPago.value = conductorActual.metodo_pago_preferido;
    conductorTemaVisual.value = conductorActual.tema_visual;
    renderizarCuentasConductor();
  }

  inicializarFormPasajero();
  inicializarFormConductor();
  actualizarJSONVisualizador();

});
