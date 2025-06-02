"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export function ForgotPasswordForm() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulación de envío de correo - en producción, esto sería una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsSubmitted(true)
      toast({
        title: "Correo enviado",
        description: "Se ha enviado un enlace de recuperación a tu correo electrónico.",
      })
    } catch (error) {
      console.error("Error al enviar correo:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar el correo de recuperación.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Recuperar Contraseña</CardTitle>
        <CardDescription className="text-center">
          {isSubmitted
            ? "Revisa tu correo electrónico para continuar con el proceso de recuperación."
            : "Ingresa tu correo electrónico para recibir un enlace de recuperación."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico:</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Enlace de Recuperación"}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Hemos enviado un correo electrónico a <strong>{email}</strong> con instrucciones para recuperar tu
              contraseña.
            </p>
            <p className="text-sm text-gray-500">
              Si no recibes el correo en unos minutos, revisa tu carpeta de spam o intenta nuevamente.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-center">
          <Link href="/" className="text-primary hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
