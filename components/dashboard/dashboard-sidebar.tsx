"use client"

import { Truck, Users, User, ShoppingBag, PenToolIcon as Tool, Package, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface DashboardSidebarProps {
  activeItem: string
  onItemClick: (item: string) => void
}

export function DashboardSidebar({ activeItem, onItemClick }: DashboardSidebarProps) {
  const router = useRouter()

  const handleLogout = () => {
    // Lógica de cierre de sesión
    router.push("/")
  }

  const menuItems = [
    { id: "despachos", label: "Despachos", icon: <Truck className="h-5 w-5" /> },
    { id: "clientes", label: "Clientes", icon: <Users className="h-5 w-5" /> },
    { id: "camiones", label: "Camiones", icon: <Truck className="h-5 w-5" /> },
    { id: "choferes", label: "Choferes", icon: <User className="h-5 w-5" /> },
    { id: "vendedores", label: "Vendedores", icon: <ShoppingBag className="h-5 w-5" /> },
    { id: "mantenimiento", label: "Mantenimiento", icon: <Tool className="h-5 w-5" /> },
    { id: "inventario", label: "Inventario", icon: <Package className="h-5 w-5" /> },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <img src="/placeholder.svg?height=50&width=150" alt="Prealca Logo" className="h-12" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Button
                variant={activeItem === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${activeItem === item.id ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => onItemClick(item.id)}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  )
}
