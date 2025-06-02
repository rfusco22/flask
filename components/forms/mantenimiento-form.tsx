"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function MantenimientoForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    camion: "",
    fecha: "",
    descripcion: "",
    costo: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  // Datos de ejemplo para los selects
  const camiones = [
    { id: "1", placa: "ABC-123", modelo: "Ford F-350" },
    { id: "2", placa: "XYZ-789", modelo: "Chevrolet NPR" },
    { id: "3", placa: "DEF-456", modelo: "Iveco Daily" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        title: "Mantenimiento registrado",
        description: "El mantenimiento ha sido registrado exitosamente.",
      })

      // Limpiar formulario
      setFormData({
        camion: "",
        fecha: "",
        descripcion: "",
        costo: "",
      })
    } catch (error) {
      console.error("Error al registrar mantenimiento:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar el mantenimiento.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Registrar Mantenimiento de Camión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="camion">Camión:</Label>
            <Select value={formData.camion} onValueChange={(value) => handleSelectChange("camion", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione camión" />
              </SelectTrigger>
              <SelectContent>
                {camiones.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.placa} - {c.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha:</Label>
            <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} required />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="descripcion">Descripción:</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              placeholder="Detalles del mantenimiento"
              value={formData.descripcion}
              onChange={handleChange}
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="costo">Monto:</Label>
            <Input
              id="costo"
              name="costo"
              type="number"
              placeholder="Ingrese el monto"
              value={formData.costo}
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
