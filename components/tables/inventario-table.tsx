"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Datos de ejemplo para el inventario
const inventarioInicial = [
  { id: "1", nombre: "Cemento", cantidad: 150, unidad: "Sacos", minimo: 50 },
  { id: "2", nombre: "Arena", cantidad: 80, unidad: "m³", minimo: 30 },
  { id: "3", nombre: "Grava", cantidad: 65, unidad: "m³", minimo: 25 },
  { id: "4", nombre: "Aditivo", cantidad: 20, unidad: "Galones", minimo: 10 },
  { id: "5", nombre: "Acero", cantidad: 200, unidad: "Varillas", minimo: 50 },
]

export function InventarioTable() {
  const { toast } = useToast()
  const [inventario, setInventario] = useState(inventarioInicial)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    cantidad: "",
    unidad: "",
    minimo: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddItem = async () => {
    setIsLoading(true)

    try {
      // Simulación de envío de datos - en producción, esto sería una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newItem = {
        id: isEditing ? formData.id : Date.now().toString(),
        nombre: formData.nombre,
        cantidad: Number.parseInt(formData.cantidad),
        unidad: formData.unidad,
        minimo: Number.parseInt(formData.minimo),
      }

      if (isEditing) {
        // Actualizar item existente
        setInventario((prev) => prev.map((item) => (item.id === formData.id ? newItem : item)))
        toast({
          title: "Item actualizado",
          description: "El item ha sido actualizado exitosamente.",
        })
      } else {
        // Agregar nuevo item
        setInventario((prev) => [...prev, newItem])
        toast({
          title: "Item agregado",
          description: "El item ha sido agregado exitosamente.",
        })
      }

      // Limpiar formulario y cerrar diálogo
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error al procesar item:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar el item.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditItem = (item: (typeof inventarioInicial)[0]) => {
    setFormData({
      id: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad.toString(),
      unidad: item.unidad,
      minimo: item.minimo.toString(),
    })
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm("¿Está seguro que desea eliminar este item?")) {
      try {
        // Simulación de envío de datos - en producción, esto sería una llamada a la API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setInventario((prev) => prev.filter((item) => item.id !== id))
        toast({
          title: "Item eliminado",
          description: "El item ha sido eliminado exitosamente.",
        })
      } catch (error) {
        console.error("Error al eliminar item:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al eliminar el item.",
          variant: "destructive",
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      id: "",
      nombre: "",
      cantidad: "",
      unidad: "",
      minimo: "",
    })
    setIsEditing(false)
  }

  const handleOpenDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Inventario</h2>
        <Button onClick={handleOpenDialog}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Agregar Item
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead>Mínimo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventario.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.nombre}</TableCell>
              <TableCell>{item.cantidad}</TableCell>
              <TableCell>{item.unidad}</TableCell>
              <TableCell>{item.minimo}</TableCell>
              <TableCell>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                    item.cantidad <= item.minimo
                      ? "bg-red-100 text-red-800"
                      : item.cantidad <= item.minimo * 1.5
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {item.cantidad <= item.minimo ? "Crítico" : item.cantidad <= item.minimo * 1.5 ? "Bajo" : "Normal"}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Item" : "Agregar Nuevo Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre:</Label>
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad:</Label>
                <Input
                  id="cantidad"
                  name="cantidad"
                  type="number"
                  value={formData.cantidad}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidad">Unidad:</Label>
                <Input id="unidad" name="unidad" value={formData.unidad} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimo">Cantidad Mínima:</Label>
              <Input id="minimo" name="minimo" type="number" value={formData.minimo} onChange={handleChange} required />
            </div>

            <Button className="w-full mt-4" onClick={handleAddItem} disabled={isLoading}>
              {isLoading ? "Procesando..." : isEditing ? "Actualizar" : "Agregar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
