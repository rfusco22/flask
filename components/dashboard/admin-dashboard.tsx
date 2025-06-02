"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DespachoForm } from "../forms/despacho-form"
import { ClienteForm } from "../forms/cliente-form"
import { CamionForm } from "../forms/camion-form"
import { ChoferForm } from "../forms/chofer-form"
import { VendedorForm } from "../forms/vendedor-form"
import { MantenimientoForm } from "../forms/mantenimiento-form"
import { InventarioTable } from "../tables/inventario-table"
import { AlertasInventario } from "../alertas/alertas-inventario"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("despachos")

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar activeItem={activeTab} onItemClick={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userName="Administrador" userRole="Admin" />

        <main className="flex-1 overflow-y-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-7 mb-4">
              <TabsTrigger value="despachos">Despachos</TabsTrigger>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
              <TabsTrigger value="camiones">Camiones</TabsTrigger>
              <TabsTrigger value="choferes">Choferes</TabsTrigger>
              <TabsTrigger value="vendedores">Vendedores</TabsTrigger>
              <TabsTrigger value="mantenimiento">Mantenimiento</TabsTrigger>
              <TabsTrigger value="inventario">Inventario</TabsTrigger>
            </TabsList>

            <TabsContent value="despachos" className="space-y-4">
              <Card className="p-4">
                <DespachoForm />
              </Card>
            </TabsContent>

            <TabsContent value="clientes" className="space-y-4">
              <Card className="p-4">
                <ClienteForm />
              </Card>
            </TabsContent>

            <TabsContent value="camiones" className="space-y-4">
              <Card className="p-4">
                <CamionForm />
              </Card>
            </TabsContent>

            <TabsContent value="choferes" className="space-y-4">
              <Card className="p-4">
                <ChoferForm />
              </Card>
            </TabsContent>

            <TabsContent value="vendedores" className="space-y-4">
              <Card className="p-4">
                <VendedorForm />
              </Card>
            </TabsContent>

            <TabsContent value="mantenimiento" className="space-y-4">
              <Card className="p-4">
                <MantenimientoForm />
              </Card>
            </TabsContent>

            <TabsContent value="inventario" className="space-y-4">
              <AlertasInventario />
              <Card className="p-4">
                <InventarioTable />
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
