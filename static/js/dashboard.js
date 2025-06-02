document.addEventListener("DOMContentLoaded", () => {
  // Cargar datos del usuario
  loadUserInfo()

  // Configurar navegación del sidebar
  setupSidebarNavigation()

  // Configurar cierre de sesión
  setupLogout()

  // Cargar datos iniciales
  loadInitialData()

  // Configurar modales
  setupModals()

  // Configurar formularios
  setupInventarioForm()
  setupCamionesForm()
  setupVendedoresForm()
  setupClientesForm()
  setupMainClienteForm()
  setupChoferesForm()
  setupMainChoferForm()
  setupMainCamionForm()
  setupMainVendedorForm()
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
    userName.textContent = sessionStorage.getItem("userName") || "Usuario Administrador"
  }
}

// Configurar navegación del sidebar
function setupSidebarNavigation() {
  const menuLinks = document.querySelectorAll(".sidebar ul li a:not(#logout-btn)")

  menuLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // Remover clase active de todos los enlaces
      menuLinks.forEach((item) => item.classList.remove("active"))

      // Agregar clase active al enlace clickeado
      this.classList.add("active")

      // Mostrar la página correspondiente
      const pageId = this.getAttribute("data-page")
      showPage(pageId)
    })
  })
}

// Mostrar página específica
function showPage(pageId) {
  const pages = document.querySelectorAll(".page")

  pages.forEach((page) => {
    page.classList.remove("active")
  })

  const activePage = document.getElementById(pageId)
  if (activePage) {
    activePage.classList.add("active")
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
  // Cargar datos para los selects
  loadVendedores()
  loadClientes()
  loadChoferes()
  loadCamiones()
  loadDisenos() // Nueva función para cargar diseños

  // Cargar tablas
  loadDespachosTable()
  loadClientesTable()
  loadCamionesTable()
  loadChoferesTable()
  loadVendedoresTable()
  loadMantenimientoTable()
  loadInventarioTable()
  loadDisenosTable()

  // Cargar alertas
  loadAlertasInventario()
  loadAlertasDisenos()
}

// Cargar vendedores para selects
function loadVendedores() {
  fetch("/api/vendedores")
    .then((response) => response.json())
    .then((data) => {
      const vendedorSelect = document.getElementById("vendedor")
      const vendedorClienteSelect = document.getElementById("vendedor_cliente")
      const vendedorClienteEditSelect = document.getElementById("vendedor_cliente_edit")

      if (vendedorSelect) {
        vendedorSelect.innerHTML = '<option value="">Seleccione vendedor</option>'
        data.forEach((vendedor) => {
          const option = document.createElement("option")
          option.value = vendedor.id
          option.textContent = vendedor.nombre
          vendedorSelect.appendChild(option)
        })
      }

      if (vendedorClienteSelect) {
        vendedorClienteSelect.innerHTML = '<option value="">Seleccione vendedor</option>'
        data.forEach((vendedor) => {
          const option = document.createElement("option")
          option.value = vendedor.id
          option.textContent = vendedor.nombre
          vendedorClienteSelect.appendChild(option)
        })
      }

      if (vendedorClienteEditSelect) {
        vendedorClienteEditSelect.innerHTML = '<option value="">Seleccione vendedor</option>'
        data.forEach((vendedor) => {
          const option = document.createElement("option")
          option.value = vendedor.id
          option.textContent = vendedor.nombre
          vendedorClienteEditSelect.appendChild(option)
        })
      }
    })
    .catch((error) => console.error("Error al cargar vendedores:", error))
}

// Cargar clientes para selects
function loadClientes() {
  fetch("/api/clientes")
    .then((response) => response.json())
    .then((data) => {
      const clienteSelect = document.getElementById("cliente")

      if (clienteSelect) {
        clienteSelect.innerHTML = '<option value="">Seleccione cliente</option>'
        data.forEach((cliente) => {
          const option = document.createElement("option")
          option.value = cliente.id
          option.textContent = cliente.nombre
          clienteSelect.appendChild(option)
        })
      }
    })
    .catch((error) => console.error("Error al cargar clientes:", error))
}

// Cargar choferes para selects
function loadChoferes() {
  fetch("/api/choferes")
    .then((response) => response.json())
    .then((data) => {
      const choferSelect = document.getElementById("chofer")

      if (choferSelect) {
        choferSelect.innerHTML = '<option value="">Seleccione chofer</option>'
        data.forEach((chofer) => {
          const option = document.createElement("option")
          option.value = chofer.id
          option.textContent = chofer.nombre
          choferSelect.appendChild(option)
        })
      }
    })
    .catch((error) => console.error("Error al cargar choferes:", error))
}

// Cargar camiones para selects
function loadCamiones() {
  fetch("/api/camiones")
    .then((response) => response.json())
    .then((data) => {
      const camionSelect = document.getElementById("camion_id")

      if (camionSelect) {
        camionSelect.innerHTML = '<option value="">Seleccione camión</option>'
        data.forEach((camion) => {
          const option = document.createElement("option")
          option.value = camion.id
          option.textContent = `${camion.placa} - ${camion.modelo}`
          camionSelect.appendChild(option)
        })
      }
    })
    .catch((error) => console.error("Error al cargar camiones:", error))
}

// Cargar tabla de despachos
function loadDespachos() {
  const table = document.getElementById("despachos-table")
  if (!table) return

  const tbody = table.querySelector("tbody")

  fetch("/api/despachos")
    .then((response) => response.json())
    .then((data) => {
      tbody.innerHTML = ""

      data.forEach((despacho) => {
        const row = document.createElement("tr")

        row.innerHTML = `
                <td>${formatDate(despacho.fecha)}</td>
                <td>${despacho.guia}</td>
                <td>${despacho.m3}</td>
                <td>${despacho.resistencia}</td>
                <td>${despacho.cliente_nombre || "N/A"}</td>
                <td>${despacho.chofer_nombre || "N/A"}</td>
                <td>${despacho.vendedor_nombre || "N/A"}</td>
            `

        tbody.appendChild(row)
      })
    })
    .catch((error) => console.error("Error al cargar despachos:", error))
}

// Function to handle despacho form submission
function handleDespachoForm(event) {
  event.preventDefault()
  const form = event.target
  const designo = form.elements.designo.value
  const cantidad = form.elements.cantidad.value

  fetch("/api/despachos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ designo, cantidad }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Despacho procesado exitosamente")
        loadDespachos() // Reload despachos table
      } else {
        alert("Error al procesar despacho: " + data.message)
      }
    })
    .catch((error) => console.error("Error submitting despacho form:", error))
}

// Event listener for despacho form
document.getElementById("despachoForm").addEventListener("submit", handleDespachoForm)

// Additional code for error handling and inventory updates
function updateInventoryAlerts() {
  // Code to update inventory alerts
  fetch("/api/inventario")
    .then((response) => response.json())
    .then((data) => {
      const inventoryAlerts = document.getElementById("inventoryAlerts")
      inventoryAlerts.innerHTML = ""
      data.forEach((material) => {
        if (material.stock < material.threshold) {
          const alertRow = inventoryAlerts.insertRow()
          const alertCell = alertRow.insertCell(0)
          alertCell.innerHTML = `Alerta: ${material.nombre} está por debajo del umbral de stock`
        }
      })
    })
    .catch((error) => console.error("Error updating inventory alerts:", error))
}

// Call updateInventoryAlerts on page load
window.onload = updateInventoryAlerts

// Modificar la función loadClientesTable para incluir botones de acción
function loadClientesTable() {
  const table = document.getElementById("clientes-table")
  if (!table) return

  const tbody = table.querySelector("tbody")

  fetch("/api/clientes")
    .then((response) => response.json())
    .then((data) => {
      tbody.innerHTML = ""

      data.forEach((cliente) => {
        const row = document.createElement("tr")

        row.innerHTML = `
                <td>${cliente.nombre}</td>
                <td>${cliente.direccion}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.documento}</td>
                <td>${cliente.vendedor_nombre || "N/A"}</td>
                <td>
                    <button class="action-btn edit" data-id="${cliente.id}" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" data-id="${cliente.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                </td>
            `

        tbody.appendChild(row)
      })

      // Agregar event listeners para botones de editar y eliminar
      setupClientesActions()
    })
    .catch((error) => console.error("Error al cargar clientes:", error))
}

// Configurar acciones para clientes
function setupClientesActions() {
  // Botones de editar
  const editButtons = document.querySelectorAll("#clientes-table .action-btn.edit")
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const clienteId = this.getAttribute("data-id")
      if (clienteId) {
        editCliente(clienteId)
      } else {
        console.error("ID de cliente no encontrado")
        alert("Error: No se pudo obtener el ID del cliente")
      }
    })
  })

  // Botones de eliminar
  const deleteButtons = document.querySelectorAll("#clientes-table .action-btn.delete")
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const clienteId = this.getAttribute("data-id")
      if (clienteId) {
        deleteCliente(clienteId)
      } else {
        console.error("ID de cliente no encontrado")
        alert("Error: No se pudo obtener el ID del cliente")
      }
    })
  })
}

// Editar cliente
function editCliente(clienteId) {
  console.log("Editando cliente con ID:", clienteId)

  fetch(`/api/clientes/${clienteId}`)
    .then((response) => {
      console.log("Respuesta del servidor:", response.status)
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      console.log("Datos del cliente recibidos:", data)

      // Verificar si hay error en la respuesta
      if (data.error) {
        throw new Error(data.error)
      }

      const cliente = data

      // Llenar formulario con datos del cliente
      document.getElementById("cliente_id_edit").value = cliente.id
      document.getElementById("nombre_cliente_edit").value = cliente.nombre || ""
      document.getElementById("direccion_edit").value = cliente.direccion || ""
      document.getElementById("telefono_edit").value = cliente.telefono || ""

      // Separar el tipo de documento y el número
      let tipoDocumento = "V"
      let numeroDocumento = ""

      if (cliente.documento) {
        if (cliente.documento.includes("-")) {
          const partes = cliente.documento.split("-")
          tipoDocumento = partes[0] || "V"
          numeroDocumento = partes[1] || ""
        } else {
          // Si no tiene guión, asumir que es solo el número
          numeroDocumento = cliente.documento
        }
      }

      // Establecer el tipo de documento en el select
      const tipoDocumentoSelect = document.getElementById("tipo_documento_edit")
      if (tipoDocumentoSelect) {
        tipoDocumentoSelect.value = tipoDocumento
        console.log("Tipo de documento establecido:", tipoDocumento)
      } else {
        console.error("Select de tipo de documento no encontrado")
      }

      // Establecer solo el número en el campo de documento
      document.getElementById("documento_edit").value = numeroDocumento

      // Seleccionar el vendedor en el dropdown
      const vendedorSelect = document.getElementById("vendedor_cliente_edit")
      if (vendedorSelect && cliente.vendedor_id) {
        vendedorSelect.value = cliente.vendedor_id
      } else if (vendedorSelect) {
        vendedorSelect.value = ""
      }

      // Cambiar título y acción del formulario
      document.getElementById("form-title-cliente").textContent = "Editar Cliente"
      document.getElementById("cliente-form").action = `/api/clientes/${cliente.id}`

      // Mostrar modal
      document.getElementById("cliente-form-modal").style.display = "block"
    })
    .catch((error) => {
      console.error("Error completo:", error)
      alert(`Error al cargar la información del cliente: ${error.message}`)
    })
}

// Eliminar cliente
function deleteCliente(clienteId) {
  if (confirm("¿Está seguro que desea eliminar este cliente?")) {
    fetch(`/api/clientes/delete/${clienteId}`, {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          // Recargar tabla
          loadClientesTable()
        } else {
          return response.text().then((text) => {
            throw new Error(text || "Error al eliminar cliente")
          })
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("Error al eliminar el cliente. Es posible que tenga despachos asociados.")
      })
  }
}

// Cargar tabla de camiones
function loadCamionesTable() {
  const table = document.getElementById("camiones-table")
  if (!table) return



  const tbody = table.querySelector("tbody")

  fetch("/api/camiones")
    .then((response) => response.json())
    .then((data) => {
      tbody.innerHTML = ""

      data.forEach((camion) => {
        const row = document.createElement("tr")

        row.innerHTML = `
                <td>${camion.marca}</td>
                <td>${camion.modelo}</td>
                <td>${camion.placa}</td>
                <td>${camion.capacidad} Ton</td>
                <td>${camion.estado || "Activo"}</td>
                <td>
                    <button class="action-btn edit" data-id="${camion.id}" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" data-id="${camion.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                </td>
            `

        tbody.appendChild(row)
      })

      // Agregar event listeners para botones de editar y eliminar
      setupCamionesActions()
    })
    .catch((error) => {
      console.error("Error al cargar camiones:", error)
      // Mostrar mensaje de error en la tabla
      tbody.innerHTML = `<tr><td colspan="6" class="error-message">Error al cargar datos de camiones</td></tr>`
    })
}

// Configurar acciones para camiones
function setupCamionesActions() {
  // Botones de editar
  const editButtons = document.querySelectorAll("#camiones-table .action-btn.edit")
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const camionId = this.getAttribute("data-id")
      editCamion(camionId)
    })
  })

  // Botones de eliminar
  const deleteButtons = document.querySelectorAll("#camiones-table .action-btn.delete")
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const camionId = this.getAttribute("data-id")
      deleteCamion(camionId)
    })
  })
}

// Editar camión
function editCamion(camionId) {
  fetch(`/api/camiones/${camionId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener datos del camión")
      }
      return response.json()
    })
    .then((camion) => {
      console.log("Datos del camión recibidos:", camion) // Para depuración

      // Llenar formulario con datos del camión
      document.getElementById("camion_id_edit").value = camion.id
      document.getElementById("marca_edit").value = camion.marca
      document.getElementById("modelo_edit").value = camion.modelo
      document.getElementById("placa_edit").value = camion.placa
      document.getElementById("capacidad_edit").value = camion.capacidad

      // Establecer el estado del camión en el select
      const estadoSelect = document.getElementById("estado_edit")
      if (estadoSelect) {
        // Si el camión no tiene estado o es null, establecer como "Activo" por defecto
        const estadoCamion = camion.estado || "Activo"
        for (let i = 0; i < estadoSelect.options.length; i++) {
          if (estadoSelect.options[i].value === estadoCamion) {
            estadoSelect.selectedIndex = i
            break
          }
        }
      }

      // Cambiar título y acción del formulario
      document.getElementById("form-title-camion").textContent = "Editar Camión"
      document.getElementById("camion-form").action = `/api/camiones/${camion.id}`

      // Mostrar modal
      document.getElementById("camion-form-modal").style.display = "block"
    })
    .catch((error) => {
      console.error("Error al obtener datos del camión:", error)
      alert("No se pudo cargar la información del camión. Por favor, intente nuevamente.")
    })
}

// Eliminar camión
function deleteCamion(camionId) {
  if (confirm("¿Está seguro que desea eliminar este camión?")) {
    // Actualización optimista - remover de la tabla inmediatamente
    const row = document.querySelector(`#camiones-table .action-btn.delete[data-id="${camionId}"]`).closest("tr")
    if (row) {
      row.remove()
    }

    fetch(`/api/camiones/delete/${camionId}`, {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Camión eliminado exitosamente")
          // Actualizar selects que usen camiones
          loadCamiones()
        } else {
          return response.text().then((text) => {
            throw new Error(text || "Error al eliminar camión")
          })
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("Error al eliminar el camión. Es posible que tenga mantenimientos asociados.")
        // Si hay error, recargar la tabla completa para revertir cambios
        loadCamionesTable()
      })
  }
}

// Modificar la función loadChoferesTable para incluir botones de acción
function loadChoferesTable() {
  const table = document.getElementById("choferes-table")
  if (!table) return

  const tbody = table.querySelector("tbody")

  fetch("/api/choferes")
    .then((response) => response.json())
    .then((data) => {
      tbody.innerHTML = ""

      data.forEach((chofer) => {
        const row = document.createElement("tr")

        row.innerHTML = `
                <td>${chofer.nombre}</td>
                <td>${chofer.cedula}</td>
                <td>${chofer.licencia}</td>
                <td>${formatDate(chofer.vencimiento_licencia)}</td>
                <td>${chofer.certificado_medico || "N/A"}</td>
                <td>${chofer.vencimiento_certificado ? formatDate(chofer.vencimiento_certificado) : "N/A"}</td>
                <td>
                    <button class="action-btn edit" data-id="${chofer.id}" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" data-id="${chofer.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                </td>
            `

        tbody.appendChild(row)
      })

      // Agregar event listeners para botones de editar y eliminar
      setupChoferesActions()
    })
    .catch((error) => console.error("Error al cargar choferes:", error))
}

// Configurar acciones para choferes
function setupChoferesActions() {
  // Botones de editar
  const editButtons = document.querySelectorAll("#choferes-table .action-btn.edit")
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const choferId = this.getAttribute("data-id")
      editChofer(choferId)
    })
  })

  // Botones de eliminar
  const deleteButtons = document.querySelectorAll("#choferes-table .action-btn.delete")
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const choferId = this.getAttribute("data-id")
      deleteChofer(choferId)
    })
  })
}

// Editar chofer
function editChofer(choferId) {
  console.log("Editando chofer con ID:", choferId)

  fetch(`/api/choferes/${choferId}`)
    .then((response) => {
      console.log("Respuesta del servidor:", response.status)
      if (!response.ok) {
        throw new Error(`Error al obtener datos del chofer: ${response.status}`)
      }
      return response.json()
    })
    .then((chofer) => {
      console.log("Datos del chofer recibidos:", chofer)

      // Llenar formulario con datos del chofer
      document.getElementById("chofer_id_edit").value = chofer.id
      document.getElementById("nombre_chofer_edit").value = chofer.nombre
      document.getElementById("cedula_chofer_edit").value = chofer.cedula
      document.getElementById("licencia_edit").value = chofer.licencia

      // Formatear fechas para el input date
      if (chofer.vencimiento_licencia) {
        document.getElementById("vencimiento_licencia_edit").value = formatDateForInput(chofer.vencimiento_licencia)
      }

      document.getElementById("certificado_medico_edit").value = chofer.certificado_medico || ""

      if (chofer.vencimiento_certificado) {
        document.getElementById("vencimiento_certificado_edit").value = formatDateForInput(
          chofer.vencimiento_certificado,
        )
      }

      // Cambiar título y acción del formulario
      document.getElementById("form-title-chofer").textContent = "Editar Chofer"
      document.getElementById("chofer-form").action = `/api/choferes/${chofer.id}`

      // Mostrar modal
      document.getElementById("chofer-form-modal").style.display = "block"
    })
    .catch((error) => {
      console.error("Error al obtener datos del chofer:", error)
      alert("No se pudo cargar la información del chofer. Por favor, intente nuevamente.")
    })
}

// Eliminar chofer
function deleteChofer(choferId) {
  if (confirm("¿Está seguro que desea eliminar este chofer?")) {
    // Actualización optimista - remover de la tabla inmediatamente
    const row = document.querySelector(`#choferes-table .action-btn.delete[data-id="${choferId}"]`).closest("tr")
    if (row) {
      row.remove()
    }

    fetch(`/api/choferes/delete/${choferId}`, {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Chofer eliminado exitosamente")
          // Actualizar selects que usen choferes
          loadChoferes()
        } else {
          return response.text().then((text) => {
            throw new Error(text || "Error al eliminar chofer")
          })
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("Error al eliminar el chofer. Es posible que tenga despachos asociados.")
        // Si hay error, recargar la tabla completa para revertir cambios
        loadChoferesTable()
      })
  }
}

// Cargar tabla de vendedores
function loadVendedoresTable() {
  const table = document.getElementById("vendedores-table")
  if (!table) return

  const tbody = table.querySelector("tbody")

  fetch("/api/vendedores")
    .then((response) => response.json())
    .then((data) => {
      tbody.innerHTML = ""

      data.forEach((vendedor) => {
        const row = document.createElement("tr")

        row.innerHTML = `
                <td>${vendedor.nombre}</td>
                <td>${vendedor.cedula}</td>
                <td>
                    <button class="action-btn edit" data-id="${vendedor.id}" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" data-id="${vendedor.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                </td>
            `

        tbody.appendChild(row)
      })

      // Agregar event listeners para botones de editar y eliminar
      setupVendedoresActions()
    })
    .catch((error) => console.error("Error al cargar vendedores:", error))
}

// Configurar acciones para vendedores
function setupVendedoresActions() {
  // Botones de editar
  const editButtons = document.querySelectorAll("#vendedores-table .action-btn.edit")
  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const vendedorId = this.getAttribute("data-id")
      editVendedor(vendedorId)
    })
  })

  // Botones de eliminar
  const deleteButtons = document.querySelectorAll("#vendedores-table .action-btn.delete")
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const vendedorId = this.getAttribute("data-id")
      deleteVendedor(vendedorId)
    })
  })
}

// Editar vendedor
function editVendedor(vendedorId) {
  console.log("Editando vendedor con ID:", vendedorId)

  fetch(`/api/vendedores/${vendedorId}`)
    .then((response) => {
      console.log("Respuesta del servidor:", response.status)
      if (!response.ok) {
        throw new Error(`Error al obtener datos del vendedor: ${response.status}`)
      }
      return response.json()
    })
    .then((vendedor) => {
      console.log("Datos del vendedor recibidos:", vendedor)

      // Llenar formulario con datos del vendedor
      document.getElementById("vendedor_id_edit").value = vendedor.id
      document.getElementById("nombre_vendedor_edit").value = vendedor.nombre
      document.getElementById("cedula_vendedor_edit").value = vendedor.cedula

      // Cambiar título y acción del formulario
      document.getElementById("form-title-vendedor").textContent = "Editar Vendedor"
      document.getElementById("vendedor-form").action = `/api/vendedores/${vendedor.id}`

      // Mostrar modal
      document.getElementById("vendedor-form-modal").style.display = "block"
    })
    .catch((error) => {
      console.error("Error al obtener datos del vendedor:", error)
      alert("No se pudo cargar la información del vendedor. Por favor, intente nuevamente.")
    })
}

// Eliminar vendedor
function deleteVendedor(vendedorId) {
  if (confirm("¿Está seguro que desea eliminar este vendedor?")) {
    // Actualización optimista - remover de la tabla inmediatamente
    const row = document.querySelector(`#vendedores-table .action-btn.delete[data-id="${vendedorId}"]`).closest("tr")
    if (row) {
      row.remove()
    }

    fetch(`/api/vendedores/delete/${vendedorId}`, {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Vendedor eliminado exitosamente")
          // Actualizar selects que usen vendedores
          loadVendedores()
        } else {
          return response.text().then((text) => {
            throw new Error(text || "Error al eliminar vendedor")
          })
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("Error al eliminar el vendedor. Es posible que tenga clientes asociados.")
        // Si hay error, recargar la tabla completa para revertir cambios
        loadVendedoresTable()
      })
  }
}

// Cargar tabla de mantenimiento
function loadMantenimientoTable() {
  const table = document.getElementById("mantenimiento-table")
  if (!table) return

  const tbody = table.querySelector("tbody")

  fetch("/api/mantenimiento")
    .then((response) => response.json())
    .then((data) => {
      tbody.innerHTML = ""

      data.forEach((mantenimiento) => {
        const row = document.createElement("tr")

        row.innerHTML = `
                <td>${mantenimiento.placa} - ${mantenimiento.modelo}</td>
                <td>${formatDate(mantenimiento.fecha)}</td>
                <td>${mantenimiento.descripcion}</td>
                <td>${formatCurrency(mantenimiento.costo)}</td>
            `

        tbody.appendChild(row)
      })
    })
    .catch((error) => console.error("Error al cargar mantenimientos:", error))
}

// Modificar la función loadDisenosTable para asegurar que use el umbral fijo de 200m³
function loadDisenosTable() {
  const table = document.getElementById("disenos-table")
  if (!table) return

  const tbody = table.querySelector("tbody")

  fetch("/api/inventario/disenos")
    .then((response) => response.json())
    .then((data) => {
      tbody.innerHTML = ""

      // Ordenar por resistencia y asentamiento
      const disenosOrdenados = Object.entries(data).sort((a, b) => {
        const [idA, disenoA] = a
        const [idB, disenoB] = b

        // Extraer resistencia del nombre
        const resistenciaA = Number.parseInt(disenoA.nombre.split(" ")[0])
        const resistenciaB = Number.parseInt(disenoB.nombre.split(" ")[0])

        if (resistenciaA !== resistenciaB) {
          return resistenciaA - resistenciaB
        }

        // Si la resistencia es igual, ordenar por asentamiento
        const asentamientoA = Number.parseInt(disenoA.nombre.split('"')[0].split("-")[1].trim())
        const asentamientoB = Number.parseInt(disenoB.nombre.split('"')[0].split("-")[1].trim())

        return asentamientoA - asentamientoB
      })

      disenosOrdenados.forEach(([disenoId, diseno]) => {
        const row = document.createElement("tr")

        // Determinar estado y clase CSS usando el umbral fijo de 200m³
        let estadoClass = "estado-agotado"
        let estadoText = "Agotado"

        if (diseno.m3_posibles > 200) {
          estadoClass = "estado-disponible"
          estadoText = "Disponible"
        } else if (diseno.m3_posibles > 0) {
          estadoClass = "estado-limitado"
          estadoText = "Limitado"
        }

        // Procesar materiales limitantes - mostrar todos si hay múltiples
        let materialesLimitantes = "N/A"
        if (diseno.limitante) {
          if (Array.isArray(diseno.limitante)) {
            materialesLimitantes = diseno.limitante.join(", ")
          } else if (typeof diseno.limitante === "string") {
            materialesLimitantes = diseno.limitante
          } else if (typeof diseno.limitante === "object") {
            // Si es un objeto, extraer los valores
            materialesLimitantes = Object.values(diseno.limitante).join(", ")
          }
        }

        row.innerHTML = `
                    <td><strong>${diseno.nombre}</strong></td>
                    <td><strong>${diseno.m3_posibles} M³</strong></td>
                    <td class="material-limitante">${materialesLimitantes}</td>
                    <td><span class="estado-diseno ${estadoClass}">${estadoText}</span></td>
                `

        tbody.appendChild(row)
      })
    })
    .catch((error) => {
      console.error("Error al cargar diseños:", error)
      tbody.innerHTML = `<tr><td colspan="4" class="error-message">Error al cargar datos de diseños</td></tr>`
    })
}

// Modificar la función loadInventarioTable para recargar también los diseños
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

      // Recargar tabla de diseños cuando cambie el inventario
      loadDisenosTable()
    })
    .catch((error) => console.error("Error al cargar inventario:", error))
}

// Resto del código JavaScript permanece igual...

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
      // Eliminar la línea que establece el valor del campo mínimo
      //document.getElementById("minimo").value = item.minimo

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

// Agregar la función loadAlertasDisenos para mostrar alertas basadas en el umbral fijo de 200m³
function loadAlertasDisenos() {
  const alertasContainer = document.getElementById("alertas-disenos")
  if (!alertasContainer) return

  fetch("/api/inventario/disenos")
    .then((response) => response.json())
    .then((data) => {
      alertasContainer.innerHTML = ""

      const disenosEnAlerta = Object.entries(data).filter(([id, diseno]) => diseno.m3_posibles <= 200)

      if (disenosEnAlerta.length === 0) {
        alertasContainer.innerHTML = "<p>No hay alertas de diseños actualmente.</p>"
        return
      }

      // Separar por tipo de alerta
      const disenosAgotados = disenosEnAlerta.filter(([id, diseno]) => diseno.m3_posibles === 0)
      const disenosLimitados = disenosEnAlerta.filter(([id, diseno]) => diseno.m3_posibles > 0)

      // Crear contenedor compacto
      const alertaCompacta = document.createElement("div")
      alertaCompacta.className = "alertas-compactas"

      // Alertas críticas (agotados)
      if (disenosAgotados.length > 0) {
        const alertaCritica = document.createElement("div")
        alertaCritica.className = "alerta-grupo alerta-critico"

        const disenosAgotadosNombres = disenosAgotados.map(([id, diseno]) => diseno.nombre).join(", ")

        alertaCritica.innerHTML = `
          <div class="alerta-header">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Diseños Agotados (${disenosAgotados.length})</strong>
          </div>
          <div class="alerta-content">
            ${disenosAgotadosNombres}
          </div>
        `
        alertaCompacta.appendChild(alertaCritica)
      }

      // Alertas de nivel bajo
      if (disenosLimitados.length > 0) {
        const alertaBaja = document.createElement("div")
        alertaBaja.className = "alerta-grupo alerta-bajo"

        const disenosLimitadosInfo = disenosLimitados
          .map(([id, diseno]) => `${diseno.nombre} (${diseno.m3_posibles}m³)`)
          .join(", ")

        alertaBaja.innerHTML = `
          <div class="alerta-header">
            <i class="fas fa-exclamation-circle"></i>
            <strong>Diseños con Nivel Bajo (${disenosLimitados.length})</strong>
          </div>
          <div class="alerta-content">
            ${disenosLimitadosInfo}
          </div>
        `
        alertaCompacta.appendChild(alertaBaja)
      }

      // Agregar información del material limitante más común
      const materialesLimitantes = disenosEnAlerta.map(([id, diseno]) => diseno.limitante).filter(Boolean)
      const materialMasComun = materialesLimitantes.reduce((acc, material) => {
        acc[material] = (acc[material] || 0) + 1
        return acc
      }, {})

      const materialPrincipal = Object.keys(materialMasComun).reduce(
        (a, b) => (materialMasComun[a] > materialMasComun[b] ? a : b),
        "",
      )

      if (materialPrincipal) {
        const infoMaterial = document.createElement("div")
        infoMaterial.className = "material-limitante-info"
        infoMaterial.innerHTML = `
          <i class="fas fa-info-circle"></i>
          <span>Material más limitante: <strong>${materialPrincipal}</strong> (afecta ${materialMasComun[materialPrincipal]} diseños)</span>
        `
        alertaCompacta.appendChild(infoMaterial)
      }

      alertasContainer.appendChild(alertaCompacta)
    })
    .catch((error) => console.error("Error al cargar alertas de diseños:", error))
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

// Modificar la función setupModals para incluir el modal de vendedores
function setupModals() {
  // Modal de inventario
  const itemModal = document.getElementById("item-form")
  const addItemBtn = document.getElementById("add-item-btn")
  const closeBtn = itemModal ? itemModal.querySelector(".close") : null

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

  // Modal de camiones
  const camionModal = document.getElementById("camion-form-modal")
  if (camionModal) {
    const closeBtnCamion = camionModal.querySelector(".close")
    const addCamionBtn = document.getElementById("add-camion-btn")

    if (addCamionBtn) {
      addCamionBtn.addEventListener("click", () => {
        // Limpiar formulario
        document.getElementById("camion-form").reset()
        document.getElementById("camion_id_edit").value = ""

        // Cambiar título y acción del formulario
        document.getElementById("form-title-camion").textContent = "Agregar Camión"
        document.getElementById("camion-form").action = "/api/camiones"

        // Mostrar modal
        camionModal.style.display = "block"
      })
    }

    if (closeBtnCamion) {
      closeBtnCamion.addEventListener("click", () => {
        camionModal.style.display = "none"
      })
    }
  }

  // Modal de vendedores
  const vendedorModal = document.getElementById("vendedor-form-modal")
  if (vendedorModal) {
    const closeBtnVendedor = vendedorModal.querySelector(".close")

    if (closeBtnVendedor) {
      closeBtnVendedor.addEventListener("click", () => {
        vendedorModal.style.display = "none"
      })
    }
  }

  // Modal de clientes
  const clienteModal = document.getElementById("cliente-form-modal")
  if (clienteModal) {
    const closeBtnCliente = clienteModal.querySelector(".close")
    const addClienteBtn = document.getElementById("add-cliente-btn")

    if (addClienteBtn) {
      addClienteBtn.addEventListener("click", () => {
        // Limpiar formulario
        document.getElementById("cliente-form").reset()
        document.getElementById("cliente_id_edit").value = ""

        // Cambiar título y acción del formulario
        document.getElementById("form-title-cliente").textContent = "Agregar Cliente"
        document.getElementById("cliente-form").action = "/api/clientes"

        // Mostrar modal
        clienteModal.style.display = "block"
      })
    }

    if (closeBtnCliente) {
      closeBtnCliente.addEventListener("click", () => {
        clienteModal.style.display = "none"
      })
    }
  }

  // Modal de choferes
  const choferModal = document.getElementById("chofer-form-modal")
  if (choferModal) {
    const closeBtnChofer = choferModal.querySelector(".close")
    const addChoferBtn = document.getElementById("add-chofer-btn")

    if (addChoferBtn) {
      addChoferBtn.addEventListener("click", () => {
        // Limpiar formulario
        document.getElementById("chofer-form").reset()
        document.getElementById("chofer_id_edit").value = ""

        // Cambiar título y acción del formulario
        document.getElementById("form-title-chofer").textContent = "Agregar Chofer"
        document.getElementById("chofer-form").action = "/api/choferes"

        // Mostrar modal
        choferModal.style.display = "block"
      })
    }

    if (closeBtnChofer) {
      closeBtnChofer.addEventListener("click", () => {
        choferModal.style.display = "none"
      })
    }
  }

  // Cerrar modales al hacer clic fuera del contenido
  window.addEventListener("click", (event) => {
    if (itemModal && event.target === itemModal) {
      itemModal.style.display = "none"
    }
    if (camionModal && event.target === camionModal) {
      camionModal.style.display = "none"
    }
    if (vendedorModal && event.target === vendedorModal) {
      vendedorModal.style.display = "none"
    }
    if (clienteModal && event.target === clienteModal) {
      clienteModal.style.display = "none"
    }
    if (choferModal && event.target === choferModal) {
      choferModal.style.display = "none"
    }
  })
}

// Configurar formularios
function setupInventarioForm() {
  const form = document.getElementById("inventario-form")
  if (!form) return

  form.addEventListener("submit", (e) => {
    // La validación y envío se maneja por el backend
  })
}

function setupCamionesForm() {
  const form = document.getElementById("camion-form")
  if (!form) return

  form.addEventListener("submit", (e) => {
    e.preventDefault()

    const marcaElement = document.getElementById("marca_edit")
    const modeloElement = document.getElementById("modelo_edit")
    const placaElement = document.getElementById("placa_edit")
    const capacidadElement = document.getElementById("capacidad_edit")
    const estadoElement = document.getElementById("estado_edit")
    const camionIdElement = document.getElementById("camion_id_edit")

    if (!marcaElement || !modeloElement || !placaElement || !capacidadElement || !estadoElement) {
      alert("Error: No se pudieron encontrar todos los campos del formulario")
      return
    }

    const marca = marcaElement.value.trim()
    const modelo = modeloElement.value.trim()
    const placa = placaElement.value.trim()
    const capacidad = capacidadElement.value.trim()
    const estado = estadoElement.value
    const camionId = camionIdElement.value

    if (!marca || !modelo || !placa || !capacidad || !estado) {
      alert("Todos los campos son obligatorios")
      return
    }

    // Cerrar el modal inmediatamente
    document.getElementById("camion-form-modal").style.display = "none"

    // Actualización optimista de la tabla
    const camionData = {
      id: camionId || Date.now(),
      marca: marca,
      modelo: modelo,
      placa: placa,
      capacidad: capacidad,
      estado: estado,
    }

    // Actualizar la tabla inmediatamente
    updateCamionInTable(camionData, !camionId)

    // Crear FormData para enviar los datos
    const formData = new FormData()
    formData.append("marca", marca)
    formData.append("modelo", modelo)
    formData.append("placa", placa)
    formData.append("capacidad", capacidad)
    formData.append("estado", estado)
    if (camionId) {
      formData.append("id", camionId)
    }

    // Enviar datos al servidor en segundo plano
    const url = camionId ? `/api/camiones/${camionId}` : "/api/camiones"
    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al guardar camión")
        }
        console.log("Camión guardado exitosamente")
        // Actualizar selects que usen camiones
        loadCamiones()
      })
      .catch((error) => {
        console.error("Error:", error)
        alert(`Error al guardar el camión: ${error.message}`)
        // Si hay error, recargar la tabla completa para revertir cambios
        loadCamionesTable()
      })
  })
}

function setupVendedoresForm() {
  const form = document.getElementById("vendedor-form")
  if (!form) return

  form.addEventListener("submit", (e) => {
    e.preventDefault()

    const nombreElement = document.getElementById("nombre_vendedor_edit")
    const cedulaElement = document.getElementById("cedula_vendedor_edit")
    const vendedorIdElement = document.getElementById("vendedor_id_edit")

    if (!nombreElement || !cedulaElement) {
      alert("Error: No se pudieron encontrar todos los campos del formulario")
      return
    }

    const nombre = nombreElement.value.trim()
    const cedula = cedulaElement.value.trim()
    const vendedorId = vendedorIdElement.value

    if (!nombre || !cedula) {
      alert("Todos los campos son obligatorios")
      return
    }

    if (!/^\d+$/.test(cedula)) {
      alert("La cédula debe contener solo números")
      return
    }

    // Cerrar el modal inmediatamente
    document.getElementById("vendedor-form-modal").style.display = "none"

    // Actualización optimista de la tabla
    const vendedorData = {
      id: vendedorId || Date.now(),
      nombre: nombre,
      cedula: cedula,
    }

    // Actualizar la tabla inmediatamente
    updateVendedorInTable(vendedorData, !vendedorId)

    // Crear FormData para enviar los datos
    const formData = new FormData()
    formData.append("nombre", nombre)
    formData.append("cedula", cedula)
    if (vendedorId) {
      formData.append("id", vendedorId)
    }

    // Enviar datos al servidor en segundo plano
    const url = vendedorId ? `/api/vendedores/${vendedorId}` : "/api/vendedores"
    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al guardar vendedor")
        }
        console.log("Vendedor guardado exitosamente")
        // Actualizar selects que usen vendedores
        loadVendedores()
      })
      .catch((error) => {
        console.error("Error:", error)
        alert(`Error al guardar el vendedor: ${error.message}`)
        // Si hay error, recargar la tabla completa para revertir cambios
        loadVendedoresTable()
      })
  })
}

function setupClientesForm() {
  const form = document.getElementById("cliente-form")
  if (!form) return

  form.addEventListener("submit", (e) => {
    e.preventDefault()

    // Buscar elementos con diferentes posibles IDs
    const nombreElement = document.getElementById("nombre_cliente_edit") || document.getElementById("nombre_edit")
    const telefonoElement = document.getElementById("telefono_edit") || document.getElementById("telefono_cliente_edit")
    const documentoElement =
      document.getElementById("documento_edit") || document.getElementById("documento_cliente_edit")
    const direccionElement = document.getElementById("direccion_edit")
    const vendedorElement = document.getElementById("vendedor_cliente_edit")
    const clienteIdElement = document.getElementById("cliente_id_edit") || document.getElementById("cliente_id")
    const tipoDocumentoElement =
      document.getElementById("tipo_documento_edit") ||
      document.getElementById("tipo_documento_cliente_edit") ||
      document.getElementById("tipo_documento") ||
      form.querySelector('select[name="tipo_documento"]')

    // Verificar que todos los elementos existan
    if (!nombreElement || !telefonoElement || !documentoElement || !clienteIdElement || !tipoDocumentoElement) {
      alert("Error: No se pudieron encontrar todos los campos del formulario")
      return
    }

    // Obtener valores
    const nombre = nombreElement.value.trim()
    const telefono = telefonoElement.value.trim()
    const documento = documentoElement.value.trim()
    const direccion = direccionElement.value.trim()
    const vendedorId = vendedorElement.value
    const clienteId = clienteIdElement.value
    const tipoDocumento = tipoDocumentoElement.value

    // Validaciones básicas
    if (!nombre || !telefono || !documento || !direccion) {
      alert("Todos los campos son obligatorios")
      return
    }

    if (!/^\d+$/.test(telefono)) {
      alert("El teléfono debe contener solo números")
      return
    }

    if (!/^\d+$/.test(documento)) {
      alert("El número de documento debe contener solo números")
      return
    }

    // Cerrar el modal inmediatamente
    document.getElementById("cliente-form-modal").style.display = "none"

    // Crear el documento completo
    const documentoCompleto = `${tipoDocumento}-${documento}`

    // Obtener nombre del vendedor para mostrar en la tabla
    let vendedorNombre = "N/A"
    if (vendedorId) {
      const vendedorSelect = document.getElementById("vendedor_cliente_edit")
      const selectedOption = vendedorSelect.querySelector(`option[value="${vendedorId}"]`)
      if (selectedOption) {
        vendedorNombre = selectedOption.textContent
      }
    }

    // Actualización optimista de la tabla
    const clienteData = {
      id: clienteId || Date.now(), // ID temporal si es nuevo
      nombre: nombre,
      direccion: direccion,
      telefono: telefono,
      documento: documentoCompleto,
      vendedor_nombre: vendedorNombre,
      vendedor_id: vendedorId,
    }

    // Actualizar la tabla inmediatamente
    updateClienteInTable(clienteData, !clienteId) // true si es nuevo cliente

    // Crear FormData para enviar los datos
    const formData = new FormData()
    formData.append("nombre", nombre)
    formData.append("direccion", direccion)
    formData.append("telefono", telefono)
    formData.append("documento", documentoCompleto)
    formData.append("vendedor", vendedorId)
    if (clienteId) {
      formData.append("id", clienteId)
    }

    // Enviar datos al servidor en segundo plano
    const url = clienteId ? `/api/clientes/${clienteId}` : "/api/clientes"
    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al guardar cliente")
        }
        // Si es exitoso, recargar datos para sincronizar
        loadClientes() // Recargar selects
        console.log("Cliente guardado exitosamente")
      })
      .catch((error) => {
        console.error("Error:", error)
        alert(`Error al guardar el cliente: ${error.message}`)
        // Si hay error, recargar la tabla completa para revertir cambios
        loadClientesTable()
      })
  })
}

// Nueva función para actualizar un cliente específico en la tabla
function updateClienteInTable(clienteData, isNew = false) {
  const table = document.getElementById("clientes-table")
  if (!table) return

  const tbody = table.querySelector("tbody")

  if (isNew) {
    // Agregar nueva fila al principio de la tabla
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${clienteData.nombre}</td>
      <td>${clienteData.direccion}</td>
      <td>${clienteData.telefono}</td>
      <td>${clienteData.documento}</td>
      <td>${clienteData.vendedor_nombre || "N/A"}</td>
      <td>
          <button class="action-btn edit" data-id="${clienteData.id}" title="Editar"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" data-id="${clienteData.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
      </td>
    `
    tbody.insertBefore(row, tbody.firstChild)
  } else {
    // Actualizar fila existente
    const rows = tbody.querySelectorAll("tr")
    rows.forEach((row) => {
      const editBtn = row.querySelector(".action-btn.edit")
      if (editBtn && editBtn.getAttribute("data-id") == clienteData.id) {
        row.innerHTML = `
          <td>${clienteData.nombre}</td>
          <td>${clienteData.direccion}</td>
          <td>${clienteData.telefono}</td>
          <td>${clienteData.documento}</td>
          <td>${clienteData.vendedor_nombre || "N/A"}</td>
          <td>
              <button class="action-btn edit" data-id="${clienteData.id}" title="Editar"><i class="fas fa-edit"></i></button>
              <button class="action-btn delete" data-id="${clienteData.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
          </td>
        `
      }
    })
  }

  // Reconfigurar los event listeners para los nuevos botones
  setupClientesActions()
}

// Nueva función para actualizar un camión específico en la tabla
function updateCamionInTable(camionData, isNew = false) {
  const table = document.getElementById("camiones-table")
  if (!table) return

  const tbody = table.querySelector("tbody")

  if (isNew) {
    // Agregar nueva fila al principio de la tabla
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${camionData.marca}</td>
      <td>${camionData.modelo}</td>
      <td>${camionData.placa}</td>
      <td>${camionData.capacidad} Ton</td>
      <td>${camionData.estado}</td>
      <td>
          <button class="action-btn edit" data-id="${camionData.id}" title="Editar"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" data-id="${camionData.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
      </td>
    `
    tbody.insertBefore(row, tbody.firstChild)
  } else {
    // Actualizar fila existente
    const rows = tbody.querySelectorAll("tr")
    rows.forEach((row) => {
      const editBtn = row.querySelector(".action-btn.edit")
      if (editBtn && editBtn.getAttribute("data-id") == camionData.id) {
        row.innerHTML = `
          <td>${camionData.marca}</td>
          <td>${camionData.modelo}</td>
          <td>${camionData.placa}</td>
          <td>${camionData.capacidad} Ton</td>
          <td>${camionData.estado}</td>
          <td>
              <button class="action-btn edit" data-id="${camionData.id}" title="Editar"><i class="fas fa-edit"></i></button>
              <button class="action-btn delete" data-id="${camionData.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
          </td>
        `
      }
    })
  }

  // Reconfigurar los event listeners para los nuevos botones
  setupCamionesActions()
}

// Nueva función para actualizar un vendedor específico en la tabla
function updateVendedorInTable(vendedorData, isNew = false) {
  const table = document.getElementById("vendedores-table")
  if (!table) return

  const tbody = table.querySelector("tbody")

  if (isNew) {
    // Agregar nueva fila al principio de la tabla
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${vendedorData.nombre}</td>
      <td>${vendedorData.cedula}</td>
      <td>
          <button class="action-btn edit" data-id="${vendedorData.id}" title="Editar"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" data-id="${vendedorData.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
      </td>
    `
    tbody.insertBefore(row, tbody.firstChild)
  } else {
    // Actualizar fila existente
    const rows = tbody.querySelectorAll("tr")
    rows.forEach((row) => {
      const editBtn = row.querySelector(".action-btn.edit")
      if (editBtn && editBtn.getAttribute("data-id") == vendedorData.id) {
        row.innerHTML = `
          <td>${vendedorData.nombre}</td>
          <td>${vendedorData.cedula}</td>
          <td>
              <button class="action-btn edit" data-id="${vendedorData.id}" title="Editar"><i class="fas fa-edit"></i></button>
              <button class="action-btn delete" data-id="${vendedorData.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
          </td>
        `
      }
    })
  }

  // Reconfigurar los event listeners para los nuevos botones
  setupVendedoresActions()
}

// Nueva función para actualizar un chofer específico en la tabla
function updateChoferInTable(choferData, isNew = false) {
  const table = document.getElementById("choferes-table")
  if (!table) return

  const tbody = table.querySelector("tbody")

  if (isNew) {
    // Agregar nueva fila al principio de la tabla
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${choferData.nombre}</td>
      <td>${choferData.cedula}</td>
      <td>${choferData.licencia}</td>
      <td>${choferData.vencimiento_licencia}</td>
      <td>${choferData.certificado_medico || "N/A"}</td>
      <td>${choferData.vencimiento_certificado || "N/A"}</td>
      <td>
          <button class="action-btn edit" data-id="${choferData.id}" title="Editar"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" data-id="${choferData.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
      </td>
    `
    tbody.insertBefore(row, tbody.firstChild)
  } else {
    // Actualizar fila existente
    const rows = tbody.querySelectorAll("tr")
    rows.forEach((row) => {
      const editBtn = row.querySelector(".action-btn.edit")
      if (editBtn && editBtn.getAttribute("data-id") == choferData.id) {
        row.innerHTML = `
          <td>${choferData.nombre}</td>
          <td>${choferData.cedula}</td>
          <td>${choferData.licencia}</td>
          <td>${choferData.vencimiento_licencia}</td>
          <td>${choferData.certificado_medico || "N/A"}</td>
          <td>${choferData.vencimiento_certificado || "N/A"}</td>
          <td>
              <button class="action-btn edit" data-id="${choferData.id}" title="Editar"><i class="fas fa-edit"></i></button>
              <button class="action-btn delete" data-id="${choferData.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
          </td>
        `
      }
    })
  }

  // Reconfigurar los event listeners para los nuevos botones
  setupChoferesActions()
}

function setupMainClienteForm() {
  const mainForm = document.querySelector('#clientes form[action="/api/clientes"]')
  if (!mainForm) return

  mainForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Buscar elementos
    const nombreElement = document.getElementById("nombre_cliente") || document.getElementById("nombre")
    const telefonoElement = document.getElementById("telefono") || document.getElementById("telefono_cliente")
    const documentoElement = document.getElementById("documento") || document.getElementById("documento_cliente")
    const direccionElement = document.getElementById("direccion")
    const vendedorElement = document.getElementById("vendedor_cliente")
    const tipoDocumentoElement =
      document.getElementById("tipo_documento") ||
      document.getElementById("tipo_documento_cliente") ||
      mainForm.querySelector('select[name="tipo_documento"]')

    if (!nombreElement || !telefonoElement || !documentoElement || !direccionElement || !tipoDocumentoElement) {
      alert("Error: No se pudieron encontrar todos los campos del formulario")
      return
    }

    // Obtener valores
    const nombre = nombreElement.value.trim()
    const telefono = telefonoElement.value.trim()
    const documento = documentoElement.value.trim()
    const direccion = direccionElement.value.trim()
    const vendedorId = vendedorElement.value
    const tipoDocumento = tipoDocumentoElement.value

    // Validaciones básicas
    if (!nombre || !telefono || !documento || !direccion) {
      alert("Todos los campos son obligatorios")
      return
    }

    if (!/^\d+$/.test(telefono)) {
      alert("El teléfono debe contener solo números")
      return
    }

    if (!/^\d+$/.test(documento)) {
      alert("El número de documento debe contener solo números")
      return
    }

    // Crear el documento completo
    const documentoCompleto = `${tipoDocumento}-${documento}`

    // Obtener nombre del vendedor
    let vendedorNombre = "N/A"
    if (vendedorId) {
      const vendedorSelect = document.getElementById("vendedor_cliente")
      const selectedOption = vendedorSelect.querySelector(`option[value="${vendedorId}"]`)
      if (selectedOption) {
        vendedorNombre = selectedOption.textContent
      }
    }

    // Limpiar formulario inmediatamente
    mainForm.reset()

    // Actualización optimista de la tabla
    const clienteData = {
      id: Date.now(), // ID temporal
      nombre: nombre,
      direccion: direccion,
      telefono: telefono,
      documento: documentoCompleto,
      vendedor_nombre: vendedorNombre,
      vendedor_id: vendedorId,
    }

    // Actualizar la tabla inmediatamente
    updateClienteInTable(clienteData, true)

    // Actualizar el valor del campo documento con el formato completo
    documentoElement.value = documentoCompleto

    // Enviar formulario en segundo plano
    mainForm.submit()
  })
}

function setupMainCamionForm() {
  const mainForm = document.querySelector('#camiones form[action="/api/camiones"]')
  if (!mainForm) return

  mainForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const marcaElement = document.getElementById("marca_registro")
    const modeloElement = document.getElementById("modelo_registro")
    const placaElement = document.getElementById("placa_registro")
    const capacidadElement = document.getElementById("capacidad_registro")
    const estadoElement = document.getElementById("estado_registro")

    if (!marcaElement || !modeloElement || !placaElement || !capacidadElement || !estadoElement) {
      alert("Error: No se pudieron encontrar todos los campos del formulario")
      return
    }

    const marca = marcaElement.value.trim()
    const modelo = modeloElement.value.trim()
    const placa = placaElement.value.trim()
    const capacidad = capacidadElement.value.trim()
    const estado = estadoElement.value

    if (!marca || !modelo || !placa || !capacidad || !estado) {
      alert("Todos los campos son obligatorios")
      return
    }

    // Limpiar formulario inmediatamente
    mainForm.reset()

    // Actualización optimista de la tabla
    const camionData = {
      id: Date.now(), // ID temporal
      marca: marca,
      modelo: modelo,
      placa: placa,
      capacidad: capacidad,
      estado: estado,
    }

    // Actualizar la tabla inmediatamente
    updateCamionInTable(camionData, true)

    // Crear FormData para enviar los datos
    const formData = new FormData()
    formData.append("marca", marca)
    formData.append("modelo", modelo)
    formData.append("placa", placa)
    formData.append("capacidad", capacidad)
    formData.append("estado", estado)

    // Enviar datos al servidor en segundo plano
    fetch("/api/api/camiones", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al guardar camión")
        }
        console.log("Camión guardado exitosamente")
        // Actualizar selects que usen camiones
        loadCamiones()
      })
      .catch((error) => {
        console.error("Error:", error)
        alert(`Error al guardar el camión: ${error.message}`)
        // Si hay error, recargar la tabla completa para revertir cambios
        loadCamionesTable()
      })
  })
}

function setupMainVendedorForm() {
  const mainForm = document.querySelector('#vendedores form[action="/api/vendedores"]')
  if (!mainForm) return

  mainForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const nombreElement = document.getElementById("nombre_vendedor")
    const cedulaElement = document.getElementById("cedula_vendedor")

    if (!nombreElement || !cedulaElement) {
      alert("Error: No se pudieron encontrar todos los campos del formulario")
      return
    }

    const nombre = nombreElement.value.trim()
    const cedula = cedulaElement.value.trim()

    if (!nombre || !cedula) {
      alert("Todos los campos son obligatorios")
      return
    }

    if (!/^\d+$/.test(cedula)) {
      alert("La cédula debe contener solo números")
      return
    }

    // Limpiar formulario inmediatamente
    mainForm.reset()

    // Actualización optimista de la tabla
    const vendedorData = {
      id: Date.now(), // ID temporal
      nombre: nombre,
      cedula: cedula,
    }

    // Actualizar la tabla inmediatamente
    updateVendedorInTable(vendedorData, true)

    // Crear FormData para enviar los datos
    const formData = new FormData()
    formData.append("nombre", nombre)
    formData.append("cedula", cedula)

    // Enviar datos al servidor en segundo plano
    fetch("/api/vendedores", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al guardar vendedor")
        }
        console.log("Vendedor guardado exitosamente")
        // Actualizar selects que usen vendedores
        loadVendedores()
      })
      .catch((error) => {
        console.error("Error:", error)
        alert(`Error al guardar el vendedor: ${error.message}`)
        // Si hay error, recargar la tabla completa para revertir cambios
        loadVendedoresTable()
      })
  })
}

function setupMainChoferForm() {
  const mainForm = document.querySelector('#choferes form[action="/api/choferes"]')
  if (!mainForm) return

  mainForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const nombreElement = document.getElementById("nombre_chofer")
    const cedulaElement = document.getElementById("cedula_chofer")
    const licenciaElement = document.getElementById("licencia")
    const vencimientoLicenciaElement = document.getElementById("vencimientoLicencia")
    const certificadoMedicoElement = document.getElementById("certificadoMedico")
    const vencimientoCertificadoElement = document.getElementById("vencimientoCertificado")

    if (!nombreElement || !cedulaElement || !licenciaElement || !vencimientoLicenciaElement) {
      alert("Error: No se pudieron encontrar todos los campos del formulario")
      return
    }

    const nombre = nombreElement.value.trim()
    const cedula = cedulaElement.value.trim()
    const licencia = licenciaElement.value.trim()
    const vencimientoLicencia = vencimientoLicenciaElement.value
    const certificadoMedico = certificadoMedicoElement.value.trim()
    const vencimientoCertificado = vencimientoCertificadoElement.value

    if (!nombre || !cedula || !licencia || !vencimientoLicencia) {
      alert("Los campos nombre, cédula, licencia y vencimiento de licencia son obligatorios")
      return
    }

    if (!/^\d+$/.test(cedula)) {
      alert("La cédula debe contener solo números")
      return
    }

    // Limpiar formulario inmediatamente
    mainForm.reset()

    // Actualización optimista de la tabla
    const choferData = {
      id: Date.now(), // ID temporal
      nombre: nombre,
      cedula: cedula,
      licencia: licencia,
      vencimiento_licencia: formatDate(vencimientoLicencia),
      certificado_medico: certificadoMedico,
      vencimiento_certificado: vencimientoCertificado ? formatDate(vencimientoCertificado) : null,
    }

    // Actualizar la tabla inmediatamente
    updateChoferInTable(choferData, true)

    // Crear FormData para enviar los datos
    const formData = new FormData()
    formData.append("nombre", nombre)
    formData.append("cedula", cedula)
    formData.append("licencia", licencia)
    formData.append("vencimientoLicencia", vencimientoLicencia)
    formData.append("certificadoMedico", certificadoMedico)
    formData.append("vencimientoCertificado", vencimientoCertificado)

    // Enviar datos al servidor en segundo plano
    fetch("/api/choferes", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al guardar chofer")
        }
        console.log("Chofer guardado exitosamente")
        // Actualizar selects que usen choferes
        loadChoferes()
      })
      .catch((error) => {
        console.error("Error:", error)
        alert(`Error al guardar el chofer: ${error.message}`)
        // Si hay error, recargar la tabla completa para revertir cambios
        loadChoferesTable()
      })
  })
}

function setupChoferesForm() {
  const form = document.getElementById("chofer-form")
  if (!form) return

  form.addEventListener("submit", (e) => {
    e.preventDefault()

    const nombreElement = document.getElementById("nombre_chofer_edit")
    const cedulaElement = document.getElementById("cedula_chofer_edit")
    const licenciaElement = document.getElementById("licencia_edit")
    const vencimientoLicenciaElement = document.getElementById("vencimiento_licencia_edit")
    const certificadoMedicoElement = document.getElementById("certificado_medico_edit")
    const vencimientoCertificadoElement = document.getElementById("vencimiento_certificado_edit")
    const choferIdElement = document.getElementById("chofer_id_edit")

    if (!nombreElement || !cedulaElement || !licenciaElement || !vencimientoLicenciaElement) {
      alert("Error: No se pudieron encontrar todos los campos del formulario")
      return
    }

    const nombre = nombreElement.value.trim()
    const cedula = cedulaElement.value.trim()
    const licencia = licenciaElement.value.trim()
    const vencimientoLicencia = vencimientoLicenciaElement.value
    const certificadoMedico = certificadoMedicoElement.value.trim()
    const vencimientoCertificado = vencimientoCertificadoElement.value
    const choferId = choferIdElement.value

    if (!nombre || !cedula || !licencia || !vencimientoLicencia) {
      alert("Los campos nombre, cédula, licencia y vencimiento de licencia son obligatorios")
      return
    }

    if (!/^\d+$/.test(cedula)) {
      alert("La cédula debe contener solo números")
      return
    }

    // Cerrar el modal inmediatamente
    document.getElementById("chofer-form-modal").style.display = "none"

    // Actualización optimista de la tabla
    const choferData = {
      id: choferId || Date.now(),
      nombre: nombre,
      cedula: cedula,
      licencia: licencia,
      vencimiento_licencia: formatDate(vencimientoLicencia),
      certificado_medico: certificadoMedico,
      vencimiento_certificado: vencimientoCertificado ? formatDate(vencimientoCertificado) : null,
    }

    // Actualizar la tabla inmediatamente
    updateChoferInTable(choferData, !choferId)

    // Crear FormData para enviar los datos
    const formData = new FormData()
    formData.append("nombre", nombre)
    formData.append("cedula", cedula)
    formData.append("licencia", licencia)
    formData.append("vencimientoLicencia", vencimientoLicencia)
    formData.append("certificadoMedico", certificadoMedico)
    formData.append("vencimientoCertificado", vencimientoCertificado)
    if (choferId) {
      formData.append("id", choferId)
    }

    // Enviar datos al servidor en segundo plano
    const url = choferId ? `/api/choferes/${choferId}` : "/api/choferes"
    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al guardar chofer")
        }
        console.log("Chofer guardado exitosamente")
        // Actualizar selects que usen choferes
        loadChoferes()
      })
      .catch((error) => {
        console.error("Error:", error)
        alert(`Error al guardar el chofer: ${error.message}`)
        // Si hay error, recargar la tabla completa para revertir cambios
        loadChoferesTable()
      })
  })
}

// Utilidades

// Función para formatear fecha para inputs de tipo date (YYYY-MM-DD)
function formatDateForInput(dateString) {
  if (!dateString) return ""

  const date = new Date(dateString)
  return date.toISOString().split("T")[0]
}

// Formatear fecha
function formatDate(dateString) {
  if (!dateString) return "N/A"

  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES")
}

// Formatear moneda
function formatCurrency(value) {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "VES",
  }).format(value)
}

// Nueva función para cargar diseños en el select
function loadDisenos() {
  const disenoSelect = document.getElementById("diseno")

  if (disenoSelect) {
    // Limpiar opciones existentes
    disenoSelect.innerHTML = '<option value="">Seleccione diseño</option>'

    // Agregar los 10 diseños de PREALCA
    const disenos = [
      { id: "180_5", nombre: '180 kgf/cm² - 5"' },
      { id: "180_7", nombre: '180 kgf/cm² - 7"' },
      { id: "210_5", nombre: '210 kgf/cm² - 5"' },
      { id: "210_7", nombre: '210 kgf/cm² - 7"' },
      { id: "250_5", nombre: '250 kgf/cm² - 5"' },
      { id: "250_7", nombre: '250 kgf/cm² - 7"' },
      { id: "280_5", nombre: '280 kgf/cm² - 5"' },
      { id: "280_7", nombre: '280 kgf/cm² - 7"' },
      { id: "310_5", nombre: '310 kgf/cm² - 5"' },
      { id: "310_7", nombre: '310 kgf/cm² - 7"' },
    ]

    disenos.forEach((diseno) => {
      const option = document.createElement("option")
      option.value = diseno.id
      option.textContent = diseno.nombre
      disenoSelect.appendChild(option)
    })
  }
}

// Cargar tabla de despachos (modificada para mostrar diseño)
function loadDespachosTable() {
  const table = document.getElementById("despachos-table")
  if (!table) return

  const tbody = table.querySelector("tbody")

  fetch("/api/despachos")
    .then((response) => response.json())
    .then((data) => {
      tbody.innerHTML = ""

      data.forEach((despacho) => {
        const row = document.createElement("tr")

        // Convertir el ID del diseño a nombre legible
        let disenoNombre = despacho.diseno || despacho.resistencia || "N/A"
        if (despacho.diseno) {
          const disenosMap = {
            "180_5": '180 kgf/cm² - 5"',
            "180_7": '180 kgf/cm² - 7"',
            "210_5": '210 kgf/cm² - 5"',
            "210_7": '210 kgf/cm² - 7"',
            "250_5": '250 kgf/cm² - 5"',
            "250_7": '250 kgf/cm² - 7"',
            "280_5": '280 kgf/cm² - 5"',
            "280_7": '280 kgf/cm² - 7"',
            "310_5": '310 kgf/cm² - 5"',
            "310_7": '310 kgf/cm² - 7"',
          }
          disenoNombre = disenosMap[despacho.diseno] || despacho.diseno
        }

        row.innerHTML = `
                <td>${formatDate(despacho.fecha)}</td>
                <td>${despacho.guia}</td>
                <td>${despacho.m3}</td>
                <td>${disenoNombre}</td>
                <td>${despacho.cliente_nombre || "N/A"}</td>
                <td>${despacho.chofer_nombre || "N/A"}</td>
                <td>${despacho.vendedor_nombre || "N/A"}</td>
            `

        tbody.appendChild(row)
      })
    })
    .catch((error) => console.error("Error al cargar despachos:", error))
}

// Nueva función para configurar el formulario de despachos
function setupDespachoForm() {
  const despachoForm = document.querySelector('#despachos form[action="/api/despachos"]')
  if (!despachoForm) return

  despachoForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const fecha = document.getElementById("fecha").value
    const guia = document.getElementById("guia").value
    const m3 = Number.parseFloat(document.getElementById("m3").value)
    const diseno = document.getElementById("diseno").value
    const clienteId = document.getElementById("cliente").value
    const choferId = document.getElementById("chofer").value
    const vendedorId = document.getElementById("vendedor").value

    // Validaciones
    if (!fecha || !guia || !m3 || !diseno || !clienteId || !choferId || !vendedorId) {
      alert("Todos los campos son obligatorios")
      return
    }

    if (m3 <= 0) {
      alert("Los M³ deben ser mayor a 0")
      return
    }

    // Verificar disponibilidad de materiales antes de procesar
    verificarDisponibilidadMateriales(diseno, m3)
      .then((disponible) => {
        if (!disponible.success) {
          alert(`No hay suficientes materiales para este despacho:\n${disponible.message}`)
          return
        }

        // Si hay materiales suficientes, procesar el despacho
        procesarDespacho({
          fecha,
          guia,
          m3,
          diseno,
          cliente_id: clienteId,
          chofer_id: choferId,
          vendedor_id: vendedorId,
        })
      })
      .catch((error) => {
        console.error("Error al verificar disponibilidad:", error)
        alert("Error al verificar disponibilidad de materiales")
      })
  })
}

// Función para verificar disponibilidad de materiales con conversiones
function verificarDisponibilidadMateriales(disenoId, m3Solicitados) {
  return fetch(`/api/inventario/disenos`)
    .then((response) => response.json())
    .then((data) => {
      const diseno = data[disenoId]
      if (!diseno) {
        return { success: false, message: "Diseño no encontrado" }
      }

      // Obtener el inventario actual para hacer las conversiones
      return fetch("/api/inventario")
        .then((response) => response.json())
        .then((inventario) => {
          // Buscar los materiales en el inventario
          const cemento = inventario.find((item) => item.nombre.toLowerCase().includes("cemento"))
          const arena = inventario.find((item) => item.nombre.toLowerCase().includes("arena"))
          const piedra = inventario.find((item) => item.nombre.toLowerCase().includes("piedra"))

          if (!cemento || !arena || !piedra) {
            return { success: false, message: "No se encontraron todos los materiales en el inventario" }
          }

          // Obtener las cantidades necesarias del diseño (en kg)
          const cementoNecesarioKg = diseno.cemento_kg_por_m3 * m3Solicitados
          const arenaNecesariaKg = diseno.arena_kg_por_m3 * m3Solicitados
          const piedraNecesariaKg = diseno.piedra_kg_por_m3 * m3Solicitados

          // Convertir a las unidades del inventario
          const cementoNecesarioTon = cementoNecesarioKg / 1000 // kg a toneladas
          const arenaNecesariaM3 = arenaNecesariaKg / 1600 // kg a m3 (densidad arena ≈ 1600 kg/m3)
          const piedraNecesariaM3 = piedraNecesariaKg / 1500 // kg a m3 (densidad piedra ≈ 1500 kg/m3)

          // Verificar disponibilidad
          const materialesInsuficientes = []

          if (cemento.cantidad < cementoNecesarioTon) {
            materialesInsuficientes.push(
              `Cemento: necesita ${cementoNecesarioTon.toFixed(2)} ton, disponible ${cemento.cantidad} ton`,
            )
          }

          if (arena.cantidad < arenaNecesariaM3) {
            materialesInsuficientes.push(
              `Arena: necesita ${arenaNecesariaM3.toFixed(2)} m³, disponible ${arena.cantidad} m³`,
            )
          }

          if (piedra.cantidad < piedraNecesariaM3) {
            materialesInsuficientes.push(
              `Piedra: necesita ${piedraNecesariaM3.toFixed(2)} m³, disponible ${piedra.cantidad} m³`,
            )
          }

          if (materialesInsuficientes.length > 0) {
            return {
              success: false,
              message: `Materiales insuficientes:\n${materialesInsuficientes.join("\n")}`,
            }
          }

          return {
            success: true,
            conversiones: {
              cemento: { necesario: cementoNecesarioTon, disponible: cemento.cantidad, id: cemento.id },
              arena: { necesario: arenaNecesariaM3, disponible: arena.cantidad, id: arena.id },
              piedra: { necesario: piedraNecesariaM3, disponible: piedra.cantidad, id: piedra.id },
            },
          }
        })
    })
}

// Función para procesar el despacho con descuento automático de materiales
function procesarDespacho(despachoData) {
  // Primero verificar disponibilidad y obtener las conversiones
  verificarDisponibilidadMateriales(despachoData.diseno, despachoData.m3)
    .then((verificacion) => {
      if (!verificacion.success) {
        alert(`Error: ${verificacion.message}`)
        return
      }

      // Crear FormData para el despacho
      const formData = new FormData()
      Object.keys(despachoData).forEach((key) => {
        formData.append(key, despachoData[key])
      })

      // Agregar información de conversiones para el backend
      formData.append("conversiones", JSON.stringify(verificacion.conversiones))

      // Procesar el despacho
      fetch("/api/despachos", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            // Descontar materiales del inventario
            return descontarMaterialesInventario(verificacion.conversiones).then(() => {
              alert("Despacho registrado exitosamente. Los materiales han sido descontados del inventario.")

              // Limpiar formulario
              document.querySelector("#despachos form").reset()

              // Recargar datos
              loadDespachosTable()
              loadInventarioTable()
              loadDisenosTable()
              loadAlertasDisenos()
              loadAlertasInventario()

              return response.text()
            })
          } else {
            return response.text().then((text) => {
              throw new Error(text || "Error al registrar despacho")
            })
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          alert(`Error al registrar el despacho: ${error.message}`)
        })
    })
    .catch((error) => {
      console.error("Error al verificar disponibilidad:", error)
      alert("Error al verificar disponibilidad de materiales")
    })
}

// Función para descontar materiales del inventario
function descontarMaterialesInventario(conversiones) {
  const promesas = []

  // Descontar cemento (en toneladas)
  if (conversiones.cemento) {
    const nuevaCantidadCemento = conversiones.cemento.disponible - conversiones.cemento.necesario
    promesas.push(
      fetch(`/api/inventario/${conversiones.cemento.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cantidad: Math.max(0, nuevaCantidadCemento.toFixed(3)),
        }),
      }),
    )
  }

  // Descontar arena (en m³)
  if (conversiones.arena) {
    const nuevaCantidadArena = conversiones.arena.disponible - conversiones.arena.necesario
    const formDataArena = new FormData()
    formDataArena.append("cantidad", Math.max(0, nuevaCantidadArena).toFixed(3))

    console.log(
      `Descontando arena: ${conversiones.arena.disponible} - ${conversiones.arena.necesario} = ${nuevaCantidadArena.toFixed(3)} m³`,
    )

    promesas.push(
      fetch(`/api/inventario/${conversiones.arena.id}`, {
        method: "POST",
        body: formDataArena,
      }),
    )
  }

  // Descontar piedra (en m³)
  if (conversiones.piedra) {
    const nuevaCantidadPiedra = conversiones.piedra.disponible - conversiones.piedra.necesario
    const formDataPiedra = new FormData()
    formDataPiedra.append("cantidad", Math.max(0, nuevaCantidadPiedra).toFixed(3))

    console.log(
      `Descontando piedra: ${conversiones.piedra.disponible} - ${conversiones.piedra.necesario} = ${nuevaCantidadPiedra.toFixed(3)} m³`,
    )

    promesas.push(
      fetch(`/api/inventario/${conversiones.piedra.id}`, {
        method: "POST",
        body: formDataPiedra,
      }),
    )
  }

  return Promise.all(promesas)
    .then((responses) => {
      // Verificar que todas las actualizaciones fueron exitosas
      const errores = responses.filter((response) => !response.ok)
      if (errores.length > 0) {
        console.error("Errores en actualización de inventario:", errores)
        throw new Error("Error al actualizar algunos materiales en el inventario")
      }
      console.log("Materiales descontados exitosamente del inventario")
    })
    .catch((error) => {
      console.error("Error completo en descuento de materiales:", error)
      throw error
  })
}

// Función para obtener factores de conversión de materiales
function obtenerFactoresConversion() {
  return {
    arena: {
      densidad_kg_por_m3: 1600, // kg/m³
      descripcion: "Arena seca compactada",
    },
    piedra: {
      densidad_kg_por_m3: 1500, // kg/m³
      descripcion: "Piedra triturada",
    },
    cemento: {
      kg_por_tonelada: 1000,
      descripcion: "Cemento Portland",
    },
  }
}