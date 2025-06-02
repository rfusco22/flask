document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form")

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const loginBtn = document.getElementById("login-btn")

    // Cambiar el texto del botón para indicar carga
    loginBtn.textContent = "Cargando..."
    loginBtn.disabled = true

    // Enviar solicitud de inicio de sesión
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "same-origin",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Redirigir según el rol del usuario
          switch (data.user.rol) {
            case "administrador":
              window.location.href = "/dashboard/admin"
              break
            case "registro":
              window.location.href = "/dashboard/registro"
              break
            case "ensayo":
              window.location.href = "/dashboard/ensayo"
              break
            default:
              window.location.href = "/dashboard/admin"
          }
        } else {
          // Mostrar mensaje de error
          showError("Credenciales inválidas o cuenta no verificada")
          loginBtn.textContent = "INICIAR SESIÓN"
          loginBtn.disabled = false
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        showError("Error al conectar con el servidor")
        loginBtn.textContent = "INICIAR SESIÓN"
        loginBtn.disabled = false
      })
  })

  // Función para mostrar mensajes de error
  function showError(message) {
    // Verificar si ya existe un mensaje de error
    let errorDiv = document.querySelector(".alert-error")

    if (!errorDiv) {
      // Crear nuevo elemento para el mensaje
      errorDiv = document.createElement("div")
      errorDiv.className = "alert alert-error"

      // Insertar antes del formulario
      const form = document.getElementById("login-form")
      form.parentNode.insertBefore(errorDiv, form)
    }

    errorDiv.textContent = message
  }
})
