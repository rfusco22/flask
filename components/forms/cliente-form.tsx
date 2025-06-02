"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function ClienteForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    documento: "",
    vendedor: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  // Datos de ejemplo para los selects
  const vendedores = [
    { id: "1", nombre: "Ana Martínez" },
    { id: "2", nombre: "Luis Sánchez" },
    { id: "3", nombre: "María López" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulación de envío de datos - en producción, esto sería una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Cliente registrado",
        description: "El cliente ha sido registrado exitosamente.",
      })

      // Limpiar formulario
      setFormData({
        nombre: "",
        direccion: "",
        telefono: "",
        documento: "",
        vendedor: "",
      })
    } catch (error) {
      console.error("Error al registrar cliente:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar el cliente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Registrar Cliente</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre:</Label>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Ingrese el nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección:</Label>
            <Input
              id="direccion"
              name="direccion"
              type="text"
              placeholder="Ingrese la dirección"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono:</Label>
            <Input
              id="telefono"
              name="telefono"
              type="text"
              placeholder="Ingrese el teléfono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documento">Documento:</Label>
            <Input
              id="documento"
              name="documento"
              type="text"
              placeholder="Ingrese RIF o Cédula"
              value={formData.documento}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendedor">Vendedor:</Label>
            <Select value={formData.vendedor} onValueChange={(value) => handleSelectChange("vendedor", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione vendedor" />
              </SelectTrigger>
              <SelectContent>
                {vendedores.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </div>
  )
}
