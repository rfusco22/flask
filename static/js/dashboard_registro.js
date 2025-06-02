document.addEventListener("DOMContentLoaded", () => {
  // Cargar datos del usuario
  loadUserInfo()

  // Configurar navegación del sidebar
  setupSidebarNavigation()

  // Configurar cierre de sesión
  setupLogout()

  // Cargar datos iniciales
  loadInitialData()
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
    userName.textContent = sessionStorage.getItem("userName") || "Usuario"
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

  // Cargar tablas
  loadDespachos()
  loadClientesTable()
}

// Cargar vendedores para selects
function loadVendedores() {
  fetch("/api/vendedores")
    .then((response) => response.json())
    .then((data) => {
      const vendedorSelect = document.getElementById("vendedor")
      const vendedorClienteSelect = document.getElementById("vendedor_cliente")

      if (vendedorSelect) {
        data.forEach((vendedor) => {
          const option = document.createElement("option")
          option.value = vendedor.id
          option.textContent = vendedor.nombre
          vendedorSelect.appendChild(option)
        })
      }

      if (vendedorClienteSelect) {
        data.forEach((vendedor) => {
          const option = document.createElement("option")
          option.value = vendedor.id
          option.textContent = vendedor.nombre
          vendedorClienteSelect.appendChild(option)
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

// Cargar tabla de clientes
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
            `

        tbody.appendChild(row)
      })
    })
    .catch((error) => console.error("Error al cargar clientes:", error))
}

// Formatear fecha
function formatDate(dateString) {
  if (!dateString) return "N/A"

  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES")
}
