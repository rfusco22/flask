"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    correo: "",
    contrasena: "",
    rol: "",
  })
  const [foto, setFoto] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0])
    }
  }

  const handleRolChange = (value: string) => {
    setFormData((prev) => ({ ...prev, rol: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulación de registro - en producción, esto sería una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirección a la página de verificación
      router.push("/verification")
    } catch (error) {
      console.error("Error de registro:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Registro</CardTitle>
        <CardDescription className="text-center">Crea una nueva cuenta en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre:</Label>
              <Input id="nombre" name="nombre" type="text" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido:</Label>
              <Input
                id="apellido"
                name="apellido"
                type="text"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula:</Label>
            <Input id="cedula" name="cedula" type="text" value={formData.cedula} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo:</Label>
            <Input id="correo" name="correo" type="email" value={formData.correo} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrasena">Contraseña:</Label>
            <Input
              id="contrasena"
              name="contrasena"
              type="password"
              value={formData.contrasena}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foto">Foto:</Label>
            <Input id="foto" type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol:</Label>
            <Select onValueChange={handleRolChange} value={formData.rol}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registro">Registro</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
                <SelectItem value="ensayo">Ensayo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Procesando..." : "Registrarse"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-center">
          ¿Ya tienes cuenta?{" "}
          <Link href="/" className="text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
