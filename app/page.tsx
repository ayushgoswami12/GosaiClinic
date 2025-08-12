"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Home,
  Users,
  Calendar,
  FileText,
  AlertTriangle,
  CalendarDays,
  UserPlus,
  Bed,
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export default function HomePage() {
  const [totalPatients, setTotalPatients] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const patients = JSON.parse(localStorage.getItem("patients") || "[]")
    setTotalPatients(patients.length)

    // Listen for storage changes to update count in real-time
    const handleStorageChange = () => {
      const updatedPatients = JSON.parse(localStorage.getItem("patients") || "[]")
      setTotalPatients(updatedPatients.length)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("patientAdded", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("patientAdded", handleStorageChange)
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 w-80 lg:w-80 bg-white dark:bg-gray-800 shadow-sm border-r dark:border-gray-700 flex flex-col h-full`}
      >
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">GOSAI CLINIC</h1>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Clinic Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 w-8 p-0"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="h-8 w-8 p-0 lg:hidden">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/" className="flex items-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-lg">
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            href="/patients"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <Users className="w-5 h-5" />
            <span>Patients</span>
          </Link>

          <Link
            href="/appointments"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <Calendar className="w-5 h-5" />
            <span>Appointments</span>
          </Link>

          <Link
            href="/records"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <FileText className="w-5 h-5" />
            <span>Medical Records</span>
          </Link>

          {/* Quick Actions Section */}
          <div className="pt-6 border-t dark:border-gray-700 mt-6">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </p>

            <Link
              href="/patients/register"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <UserPlus className="w-5 h-5" />
              <span>Register New Patient</span>
            </Link>

            <button
              onClick={() => {
                const patients = JSON.parse(localStorage.getItem("patients") || "[]")
                if (patients.length === 0) {
                  alert("No patients to export")
                  return
                }

                // Simple CSV export
                const csvContent =
                  "data:text/csv;charset=utf-8," +
                  "Name,Phone,Email,Age,Gender,Address,Emergency Contact,Emergency Phone,Medical History\n" +
                  patients
                    .map(
                      (p) =>
                        `"${p.firstName} ${p.lastName}","${p.phone}","${p.email}","${p.age}","${p.gender}","${p.address}","${p.emergencyContact}","${p.emergencyPhone}","${p.medicalHistory}"`,
                    )
                    .join("\n")

                const encodedUri = encodeURI(csvContent)
                const link = document.createElement("a")
                link.setAttribute("href", encodedUri)
                link.setAttribute("download", `GOSAI_CLINIC_Patients_${new Date().toISOString().split("T")[0]}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                setSidebarOpen(false)
              }}
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 rounded-lg transition-colors w-full text-left"
            >
              <FileText className="w-5 h-5" />
              <span>Export Patient Data</span>
            </button>

            <Link
              href="/appointments/book"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <CalendarDays className="w-5 h-5" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">Hospital Dashboard</h1>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                  Welcome back! Here's what's happening at our clinic today.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-3">
              <Button
                variant="outline"
                className="hidden sm:flex items-center space-x-2 bg-transparent text-xs lg:text-sm"
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden md:inline">View Schedule</span>
              </Button>
              <Link href="/patients/register">
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center space-x-2 text-xs lg:text-sm">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Patient</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Patients</p>
                    <p className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">{totalPatients}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">from</span>
                      <div className="flex items-center ml-1">
                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-500">registered</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1">Available Beds</p>
                    <p className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">12</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">from</span>
                      <div className="flex items-center ml-1">
                        <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                        <span className="text-xs text-red-500">-2 last week</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Bed className="w-4 h-4 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1">Today's Appointments</p>
                    <p className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">18</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">from</span>
                      <div className="flex items-center ml-1">
                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-500">+3 last week</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1">Active Doctors</p>
                    <p className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">3</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">from</span>
                      <div className="flex items-center ml-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">0 last week</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 lg:w-6 lg:h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Recent Patient Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
                  <Users className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>Recent Patient Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">Sarah Johnson</p>
                      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Routine Checkup</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">10:30 AM • Dr. T</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full"></div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs"
                    >
                      Stable
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">Michael Chen</p>
                      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Emergency</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4 text-red-500" />
                    <Badge variant="destructive" className="text-xs">
                      Critical
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
                  <Calendar className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>Today's Appointments</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600 dark:text-blue-400 font-semibold text-center">
                      <div className="text-xs lg:text-sm">9:00 AM</div>
                    </div>
                    <div>
                      <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">Alice Cooper</p>
                      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Dr. T</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Consultation
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600 dark:text-blue-400 font-semibold text-center">
                      <div className="text-xs lg:text-sm">10:30</div>
                      <div className="text-xs lg:text-sm">AM</div>
                    </div>
                    <div>
                      <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">Bob Anderson</p>
                      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Dr. Dev</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Follow-up
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
