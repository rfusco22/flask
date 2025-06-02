"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function VendedorForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulación de envío de datos - en producción, esto sería una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Vendedor registrado",
        description: "El vendedor ha sido registrado exitosamente.",
      })

      // Limpiar formulario
      setFormData({
        nombre: "",
        cedula: "",
      })
    } catch (error) {
      console.error("Error al registrar vendedor:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar el vendedor.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Registrar Vendedor</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre y Apellido:</Label>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Ingrese nombre completo"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula:</Label>
            <Input
              id="cedula"
              name="cedula"
              type="text"
              placeholder="Ingrese la cédula"
              value={formData.cedula}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </div>
  )
}
