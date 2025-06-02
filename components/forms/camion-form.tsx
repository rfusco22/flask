"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function CamionForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    placa: "",
    capacidad: "",
  })
  const [foto, setFoto] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFoto(file)

      // Crear URL para previsualización
      const fileUrl = URL.createObjectURL(file)
      setPreviewUrl(fileUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulación de envío de datos - en producción, esto sería una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Camión registrado",
        description: "El camión ha sido registrado exitosamente.",
      })

      // Limpiar formulario
      setFormData({
        marca: "",
        modelo: "",
        placa: "",
        capacidad: "",
      })
      setFoto(null)
      setPreviewUrl(null)
    } catch (error) {
      console.error("Error al registrar camión:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar el camión.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Registrar Camión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="foto">Foto del Camión:</Label>
            <Input id="foto" type="file" accept="image/*" onChange={handleFileChange} required />
            {previewUrl && (
              <div className="mt-2">
                <img src={previewUrl || "/placeholder.svg"} alt="Vista previa" className="max-h-40 rounded-md" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="marca">Marca:</Label>
            <Input
              id="marca"
              name="marca"
              type="text"
              placeholder="Ingrese la marca"
              value={formData.marca}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo:</Label>
            <Input
              id="modelo"
              name="modelo"
              type="text"
              placeholder="Ingrese el modelo"
              value={formData.modelo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="placa">N° de Placa:</Label>
            <Input
              id="placa"
              name="placa"
              type="text"
              placeholder="Ingrese el número de placa"
              value={formData.placa}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacidad">Capacidad Max de Carga (Ton):</Label>
            <Input
              id="capacidad"
              name="capacidad"
              type="number"
              placeholder="Ingrese la capacidad máxima"
              value={formData.capacidad}
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
