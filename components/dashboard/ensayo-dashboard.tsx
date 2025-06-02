"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"
import { InventarioTable } from "../tables/inventario-table"
import { AlertasInventario } from "../alertas/alertas-inventario"

export function EnsayoDashboard() {
  const [activeTab, setActiveTab] = useState("inventario")

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar activeItem={activeTab} onItemClick={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userName="Usuario de Ensayo" userRole="Ensayo" />

        <main className="flex-1 overflow-y-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-1 mb-4">
              <TabsTrigger value="inventario">Inventario</TabsTrigger>
            </TabsList>

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
