// API client para comunicación con el backend
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Configuración de axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)

// Funciones de autenticación
export const login = async (username, password) => {
  const response = await api.post("/login", { username, password })
  return response.data
}

export const register = async (formData) => {
  const response = await api.post("/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

export const verifyCode = async (codigo) => {
  const response = await api.post("/verify", { codigo })
  return response.data
}

export const resendCode = async () => {
  const response = await api.post("/resend_code")
  return response.data
}

export const forgotPassword = async (email) => {
  const response = await api.post("/forgot_password", { email })
  return response.data
}

// Funciones para clientes
export const getClientes = async () => {
  const response = await api.get("/clientes")
  return response.data
}

export const addCliente = async (clienteData) => {
  const response = await api.post("/clientes", clienteData)
  return response.data
}

// Funciones para camiones
export const getCamiones = async () => {
  const response = await api.get("/camiones")
  return response.data
}

export const addCamion = async (camionData) => {
  const response = await api.post("/camiones", camionData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

// Funciones para choferes
export const getChoferes = async () => {
  const response = await api.get("/choferes")
  return response.data
}

export const addChofer = async (choferData) => {
  const response = await api.post("/choferes", choferData)
  return response.data
}

// Funciones para vendedores
export const getVendedores = async () => {
  const response = await api.get("/vendedores")
  return response.data
}

export const addVendedor = async (vendedorData) => {
  const response = await api.post("/vendedores", vendedorData)
  return response.data
}

// Funciones para despachos
export const getDespachos = async () => {
  const response = await api.get("/despachos")
  return response.data
}

export const addDespacho = async (despachoData) => {
  const response = await api.post("/despachos", despachoData)
  return response.data
}

// Funciones para inventario
export const getInventario = async () => {
  const response = await api.get("/inventario")
  return response.data
}

export const addInventario = async (inventarioData) => {
  const response = await api.post("/inventario", inventarioData)
  return response.data
}

export const updateInventario = async (id, inventarioData) => {
  const response = await api.put(`/inventario/${id}`, inventarioData)
  return response.data
}

export const deleteInventario = async (id) => {
  const response = await api.delete(`/inventario/${id}`)
  return response.data
}

// Funciones para mantenimiento
export const getMantenimiento = async () => {
  const response = await api.get("/mantenimiento")
  return response.data
}

export const addMantenimiento = async (mantenimientoData) => {
  const response = await api.post("/mantenimiento", mantenimientoData)
  return response.data
}

// Funciones para alertas
export const getAlertasInventario = async () => {
  const response = await api.get("/alertas/inventario")
  return response.data
}

export const getAlertasVencimientos = async () => {
  const response = await api.get("/alertas/vencimientos")
  return response.data
}

export default api
