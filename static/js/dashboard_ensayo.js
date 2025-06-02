document.addEventListener("DOMContentLoaded", () => {
  // Cargar datos del usuario
  loadUserInfo()

  // Configurar cierre de sesión
  setupLogout()

  // Cargar datos iniciales
  loadInitialData()

  // Configurar modales
  setupModals()

  // Configurar formulario de inventario
  setupInventarioForm()
})

// Cargar información del usuario
function loadUserInfo() {
  const userName = document.getElementById("user-name")

  // Usar los datos del usuario pasados desde el backend
  if (window.userInfo && window.userInfo.nombreCompleto) {
    // El nombre ya está establecido en el HTML, pero podemos actualizarlo si es necesario
    if (userName.textContent === "Cargando...") {
      userName.textContent = window.userInfo.nombreCompleto
    }

    // Guardar en sessionStorage para uso futuro si es necesario
    sessionStorage.setItem("userName", window.userInfo.nombreCompleto)
    sessionStorage.setItem("userId", window.userInfo.id)
    sessionStorage.setItem("userRole", window.userInfo.rol)
  } else {
    // Fallback a sessionStorage si no hay datos del backend
    userName.textContent = sessionStorage.getItem("userName") || "Usuario Ensayo"
  }
}

// Configurar cierre de sesión
function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn")

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault()

    fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin",
    })
      .then(() => {
        window.location.href = "/"
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error)
        // Redirigir de todos modos
        window.location.href = "/"
      })
  })
}

// Cargar datos iniciales
function loadInitialData() {
  // Cargar tabla de inventario
  loadInventarioTable()

  // Cargar alertas
  loadAlertasInventario()
}

// Cargar tabla de inventario
function loadInventarioTable() {
  const table = document.getElementById("inventario-table")
  if (!table) return

  const tbody = table.querySelector("tbody")

  fetch("/api/inventario")
    .then((response) => response.json())
    .then((data) => {
      tbody.innerHTML = ""

      data.forEach((item) => {
        const row = document.createElement("tr")

        // Determinar el estado del item
        let estadoClass = "estado-normal"
        let estadoText = "Normal"

        if (item.cantidad <= item.minimo) {
          estadoClass = "estado-critico"
          estadoText = "Crítico"
        } else if (item.cantidad <= item.minimo * 1.5) {
          estadoClass = "estado-bajo"
          estadoText = "Bajo"
        }

        row.innerHTML = `
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>${item.unidad}</td>
                <td>${item.minimo}</td>
                <td><span class="estado-badge ${estadoClass}">${estadoText}</span></td>
                <td>
                    <button class="action-btn edit" data-id="${item.id}" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" data-id="${item.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                </td>
            `

        tbody.appendChild(row)
      })

      // Agregar event listeners para botones de editar y eliminar
      setupInventarioActions()
    })
    .catch((error) => console.error("Error al cargar inventario:", error))
}

// Configurar acciones para items de inventario
function setupInventarioActions() {
  // Botones de editar
  const editButtons = document.querySelectorAll("#inventario-table .action-btn.edit")
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const itemId = this.getAttribute("data-id")
      editInventarioItem(itemId)
    })
  })

  // Botones de eliminar
  const deleteButtons = document.querySelectorAll("#inventario-table .action-btn.delete")
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const itemId = this.getAttribute("data-id")
      deleteInventarioItem(itemId)
    })
  })
}

// Editar item de inventario
function editInventarioItem(itemId) {
  fetch(`/api/inventario/${itemId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener datos del item")
      }
      return response.json()
    })
    .then((item) => {
      // Llenar formulario con datos del item
      document.getElementById("item_id").value = item.id
      document.getElementById("nombre_item").value = item.nombre
      document.getElementById("cantidad").value = item.cantidad
      document.getElementById("minimo").value = item.minimo

      // Cambiar título y acción del formulario
      document.getElementById("form-title").textContent = "Editar Item"
      document.getElementById("inventario-form").action = `/api/inventario/${item.id}`

      // Mostrar modal
      document.getElementById("item-form").style.display = "block"
    })
    .catch((error) => {
      console.error("Error al obtener datos del item:", error)
      alert("No se pudo cargar la información del item. Por favor, intente nuevamente.")
    })
}

// Eliminar item de inventario
function deleteInventarioItem(itemId) {
  if (confirm("¿Está seguro que desea eliminar este item?")) {
    fetch(`/api/inventario/delete/${itemId}`, {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          // Recargar tabla
          loadInventarioTable()
          // Recargar alertas
          loadAlertasInventario()
        } else {
          throw new Error("Error al eliminar item")
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("Error al eliminar el item")
      })
  }
}

// Cargar alertas de inventario
function loadAlertasInventario() {
  const alertasContainer = document.getElementById("alertas-inventario")
  if (!alertasContainer) return

  fetch("/api/alertas/inventario")
    .then((response) => response.json())
    .then((data) => {
      alertasContainer.innerHTML = ""

      if (data.length === 0) {
        alertasContainer.innerHTML = "<p>No hay alertas de inventario actualmente.</p>"
        return
      }

      data.forEach((alerta) => {
        const alertaDiv = document.createElement("div")
        alertaDiv.className = `alerta-item alerta-${alerta.nivel}`

        alertaDiv.innerHTML = `
                <h4>${alerta.nombre} - ${alerta.nivel === "crítico" ? "Nivel Crítico" : "Nivel Bajo"}</h4>
                <p>Cantidad actual: ${alerta.cantidad} ${alerta.unidad} (Mínimo requerido: ${alerta.minimo} ${alerta.unidad})</p>
            `

        alertasContainer.appendChild(alertaDiv)
      })
    })
    .catch((error) => console.error("Error al cargar alertas de inventario:", error))
}

// Configurar modales
function setupModals() {
  // Modal de inventario
  const itemModal = document.getElementById("item-form")
  const addItemBtn = document.getElementById("add-item-btn")
  const closeBtn = itemModal.querySelector(".close")

  if (addItemBtn) {
    addItemBtn.addEventListener("click", () => {
      // Limpiar formulario
      document.getElementById("inventario-form").reset()
      document.getElementById("item_id").value = ""

      // Cambiar título y acción del formulario
      document.getElementById("form-title").textContent = "Agregar Item"
      document.getElementById("inventario-form").action = "/api/inventario"

      // Mostrar modal
      itemModal.style.display = "block"
    })
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      itemModal.style.display = "none"
    })
  }

  // Cerrar modal al hacer clic fuera del contenido
  window.addEventListener("click", (event) => {
    if (event.target === itemModal) {
      itemModal.style.display = "none"
    }
  })
}

// Configurar formulario de inventario
function setupInventarioForm() {
  const form = document.getElementById("inventario-form")
  if (!form) return

  form.addEventListener("submit", (e) => {
    // La validación y envío se maneja por el backend
  })
}
