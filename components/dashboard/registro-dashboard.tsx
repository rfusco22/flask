"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DespachoForm } from "../forms/despacho-form"
import { ClienteForm } from "../forms/cliente-form"

export function RegistroDashboard() {
  const [activeTab, setActiveTab] = useState("despachos")

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar activeItem={activeTab} onItemClick={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userName="Usuario de Registro" userRole="Registro" />

        <main className="flex-1 overflow-y-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="despachos">Despachos</TabsTrigger>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
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
          </Tabs>
        </main>
      </div>
    </div>
  )
}
