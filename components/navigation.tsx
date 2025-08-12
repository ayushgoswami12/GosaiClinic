"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Stethoscope, Users, Calendar, Home, UserPlus, User, LogOut, Moon, Sun, Pill } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Prescriptions", href: "/prescriptions", icon: Pill },
]

interface UserSession {
  email: string
  role: string
  name: string
  loginTime: string
}

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<UserSession | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("hospitalUser")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("hospitalUser")
    setUser(null)
    router.push("/login")
  }

  return (
    <nav className="bg-white dark:bg-slate-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-700/50 pb-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <Stethoscope className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">GOSAI CLINIC</span>
            </Link>

            <div className="hidden md:flex space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.name}
                    variant={pathname === item.href ? "default" : "ghost"}
                    asChild
                    className={cn(
                      "flex items-center justify-center space-x-2 transition-all duration-200 px-4 py-2",
                      pathname === item.href 
                        ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg" 
                        : "hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
                    )}
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="bg-transparent border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 h-9 w-9 p-0 flex items-center justify-center"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-600 dark:text-slate-400" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-400" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-2 text-sm">
                  <span className="text-gray-600 dark:text-slate-400">Welcome,</span>
                  <span className="font-medium dark:text-slate-100">{user.name}</span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                    {user.role}
                  </span>
                </div>
                <Button variant="outline" asChild className="border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 h-9 px-3">
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleLogout} className="bg-transparent border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 h-9 px-3">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="px-3 sm:px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg transition-all duration-200 h-9">
                <Link href="/patients/register">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Register Patient</span>
                  <span className="hidden sm:inline md:hidden ml-2">Register</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
