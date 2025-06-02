"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function DespachoForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    fecha: "",
    guia: "",
    m3: "",
    resistencia: "",
    cliente: "",
    direccion: "",
    chofer: "",
    vendedor: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  // Datos de ejemplo para los selects
  const resistencias = ["210", "250", "280", "350"]
  const clientes = [
    { id: "1", nombre: "Constructora ABC", direccion: "Av. Principal #123" },
    { id: "2", nombre: "Edificaciones XYZ", direccion: "Calle 45 #67-89" },
    { id: "3", nombre: "Inmobiliaria Delta", direccion: "Carrera 12 #34-56" },
  ]
  const choferes = [
    { id: "1", nombre: "Juan Pérez" },
    { id: "2", nombre: "Carlos Rodríguez" },
    { id: "3", nombre: "Miguel González" },
  ]
  const vendedores = [
    { id: "1", nombre: "Ana Martínez" },
    { id: "2", nombre: "Luis Sánchez" },
    { id: "3", nombre: "María López" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-fill dirección when cliente is selected
    if (name === "cliente") {
      const selectedCliente = clientes.find((c) => c.id === value)
      if (selectedCliente) {
        setFormData((prev) => ({ ...prev, direccion: selectedCliente.direccion }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulación de envío de datos - en producción, esto sería una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Despacho registrado",
        description: "El despacho ha sido registrado exitosamente.",
      })

      // Limpiar formulario
      setFormData({
        fecha: "",
        guia: "",
        m3: "",
        resistencia: "",
        cliente: "",
        direccion: "",
        chofer: "",
        vendedor: "",
      })
    } catch (error) {
      console.error("Error al registrar despacho:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar el despacho.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Registrar Despacho</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha:</Label>
            <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guia">N° Guía:</Label>
            <Input
              id="guia"
              name="guia"
              type="text"
              placeholder="ID de Guía"
              value={formData.guia}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="m3">M3:</Label>
            <Input
              id="m3"
              name="m3"
              type="number"
              placeholder="Ingrese los M3"
              value={formData.m3}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resistencia">Resistencia:</Label>
            <Select value={formData.resistencia} onValueChange={(value) => handleSelectChange("resistencia", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione resistencia" />
              </SelectTrigger>
              <SelectContent>
                {resistencias.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente:</Label>
            <Select value={formData.cliente} onValueChange={(value) => handleSelectChange("cliente", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección:</Label>
            <Input
              id="direccion"
              name="direccion"
              type="text"
              placeholder="Dirección"
              value={formData.direccion}
              onChange={handleChange}
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chofer">Chofer:</Label>
            <Select value={formData.chofer} onValueChange={(value) => handleSelectChange("chofer", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione chofer" />
              </SelectTrigger>
              <SelectContent>
                {choferes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
