"use client"

import { UserCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  userName: string
  userRole: string
}

export function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    // Lógica de cierre de sesión
    router.push("/")
  }

  return (
    <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
      <div className="flex items-center">
        <img src="/placeholder.svg?height=40&width=120" alt="Prealca Logo" className="h-10" />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <UserCircle className="h-8 w-8 text-gray-500 mr-2" />
          <div>
            <p className="font-medium">{userName}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Cerrar sesión</span>
        </Button>
      </div>
    </header>
  )
}
