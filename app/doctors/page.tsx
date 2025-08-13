"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import {
  Users,
  Calendar,
  Clock,
  FileText,
  Search,
  Plus,
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from "lucide-react"

// Mock data for demonstration
const mockStats = {
  totalPatients: 156,
  todayAppointments: 12,
  pendingReports: 8,
  emergencyCases: 3,
}

const mockAppointments = [
  {
    id: 1,
    patient: "John Smith",
    time: "09:00 AM",
    type: "Consultation",
    status: "confirmed",
    doctor: "Dr. Tansukh Gosai",
    department: "General Physician",
    phone: "+91 98765 43210",
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: 2,
    patient: "Sarah Johnson",
    time: "10:30 AM",
    type: "Follow-up",
    status: "confirmed",
    doctor: "Dr. Devang Gosai",
    department: "Ano Rectal Expert",
    phone: "+91 87654 32109",
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: 3,
    patient: "Mike Davis",
    time: "11:15 AM",
    type: "Emergency",
    status: "urgent",
    doctor: "Dr. Dhara Gosai",
    department: "Dental Surgeon",
    phone: "+91 76543 21098",
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: 4,
    patient: "Emily Brown",
    time: "02:00 PM",
    type: "Follow-up",
    status: "pending",
    doctor: "Dr. Tansukh Gosai",
    department: "General Physician",
    phone: "+91 65432 10987",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
  {
    id: 5,
    patient: "David Wilson",
    time: "03:30 PM",
    type: "Follow-up",
    status: "confirmed",
    doctor: "Dr. Devang Gosai",
    department: "Ano Rectal Expert",
    phone: "+91 54321 09876",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
]

const mockPatients = [
  {
    id: 1,
    name: "John Smith",
    age: 45,
    condition: "Hypertension",
    lastVisit: "2024-01-15",
    status: "stable",
    phone: "+91 98765 43210",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    age: 32,
    condition: "Diabetes",
    lastVisit: "2024-01-14",
    status: "monitoring",
    phone: "+91 87654 32109",
  },
  {
    id: 3,
    name: "Mike Davis",
    age: 28,
    condition: "Chest Pain",
    lastVisit: "2024-01-16",
    status: "critical",
    phone: "+91 76543 21098",
  },
  {
    id: 4,
    name: "Emily Brown",
    age: 55,
    condition: "Arthritis",
    lastVisit: "2024-01-10",
    status: "stable",
    phone: "+91 65432 10987",
  },
]

export default function DoctorDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [appointments, setAppointments] = useState(mockAppointments)

  // Load appointments from localStorage with error handling
  useEffect(() => {
    const loadAppointments = () => {
      try {
        const storedAppointments = localStorage.getItem("appointments")
        if (storedAppointments) {
          const parsedAppointments = JSON.parse(storedAppointments)
          setAppointments(parsedAppointments)
        } else {
          // Initialize with mock data if none exists
          localStorage.setItem("appointments", JSON.stringify(mockAppointments))
          setAppointments(mockAppointments)
        }
      } catch (error) {
        console.error("Error loading appointments:", error)
        // Reset to mock data if there's an error
        localStorage.setItem("appointments", JSON.stringify(mockAppointments))
        setAppointments(mockAppointments)
      }
    }

    loadAppointments()

    // Listen for new appointments and updates
    const handleAppointmentAdded = () => {
      loadAppointments()
    }

    const handleAppointmentUpdated = () => {
      loadAppointments()
    }

    // Also listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "appointments") {
        loadAppointments()
      }
    }

    window.addEventListener("appointmentAdded", handleAppointmentAdded)
    window.addEventListener("appointmentUpdated", handleAppointmentUpdated)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("appointmentAdded", handleAppointmentAdded)
      window.removeEventListener("appointmentUpdated", handleAppointmentUpdated)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const filteredPatients = mockPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const updateAppointmentStatus = (appointmentId: number, newStatus: string) => {
    setAppointments((prev) => {
      const updatedAppointments = prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt))

      // Save to localStorage
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments))

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("appointmentUpdated"))

      return updatedAppointments
    })
  }

  const markAppointmentAsDone = (appointmentId: number) => {
    updateAppointmentStatus(appointmentId, "done")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "monitoring":
        return "bg-yellow-100 text-yellow-800"
      case "stable":
        return "bg-green-100 text-green-800"
      case "urgent":
        return "bg-red-100 text-red-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Doctor Dashboard</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-3">
            Welcome back, Dr. Tansukh Gosai (General Physician). Here's your overview for today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-white dark:bg-slate-900/50 border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-slate-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-slate-200">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-slate-100">{mockStats.totalPatients}</div>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.todayAppointments}</div>
              <p className="text-xs text-gray-600 mt-1">5 completed, 7 remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.pendingReports}</div>
              <p className="text-xs text-orange-600 mt-1">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emergency Cases</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.emergencyCases}</div>
              <p className="text-xs text-red-600 mt-1">Immediate attention needed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Today's Appointments */}
          <Card className="bg-white dark:bg-slate-900/50 border-gray-200 dark:border-slate-700/50 shadow-sm dark:shadow-slate-900/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 dark:text-slate-100">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>Today's Appointments</span>
                  </CardTitle>
                  <CardDescription className="dark:text-slate-400">
                    Your scheduled appointments for today
                  </CardDescription>
                </div>
                <Button size="sm" asChild>
                  <Link href="/appointments/book">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Appointment
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments
                  .filter((apt) => apt.date === new Date().toISOString().split("T")[0])
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="font-medium dark:text-slate-100">{appointment.patient}</div>
                          <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          {appointment.time} • {appointment.type} • {appointment.doctor}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 font-mono">
                          📱 {appointment.phone}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        {appointment.status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() => markAppointmentAsDone(appointment.id)}
                            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {appointment.status === "done" && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Done
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span>Recent Patients</span>
                  </CardTitle>
                  <CardDescription>Patients you've seen recently</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-40"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium">{patient.name}</div>
                        <span className="text-sm text-gray-500">Age {patient.age}</span>
                        <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {patient.condition} • Last visit: {patient.lastVisit}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5 font-mono">📱 {patient.phone}</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Records
                      </Button>
                      <Button size="sm">Consult</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
                <Plus className="h-6 w-6" />
                <span>New Prescription</span>
              </Button>
              <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
                <FileText className="h-6 w-6" />
                <span>Medical Report</span>
              </Button>
              <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
                <Calendar className="h-6 w-6" />
                <span>Schedule Follow-up</span>
              </Button>
              <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
                <AlertCircle className="h-6 w-6" />
                <span>Emergency Alert</span>
              </Button>
              <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
                <Users className="h-6 w-6" />
                <span>Patient Records</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
