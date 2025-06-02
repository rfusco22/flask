"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Datos de ejemplo para las alertas
const alertasIniciales = [
  { id: "1", item: "Cemento", cantidad: 45, minimo: 50, nivel: "crítico" },
  { id: "2", item: "Arena", cantidad: 35, minimo: 30, nivel: "bajo" },
  { id: "3", item: "Aditivo", cantidad: 8, minimo: 10, nivel: "crítico" },
]

export function AlertasInventario() {
  const [alertas, setAlertas] = useState(alertasIniciales)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Alertas de Inventario</h3>

      {alertas.length === 0 ? (
        <p className="text-gray-500">No hay alertas de inventario actualmente.</p>
      ) : (
        <div className="space-y-3">
          {alertas.map((alerta) => (
            <Alert
              key={alerta.id}
              variant={alerta.nivel === "crítico" ? "destructive" : "default"}
              className={alerta.nivel === "bajo" ? "border-yellow-500 text-yellow-800" : ""}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{alerta.nivel === "crítico" ? "Nivel Crítico" : "Nivel Bajo"}</AlertTitle>
              <AlertDescription>
                {alerta.item} - Cantidad actual: {alerta.cantidad} (Mínimo requerido: {alerta.minimo})
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  )
}
