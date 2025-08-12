"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
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
  { id: 1, patient: "John Smith", time: "09:00 AM", type: "Consultation", status: "confirmed" },
  { id: 2, patient: "Sarah Johnson", time: "10:30 AM", type: "Follow-up", status: "confirmed" },
  { id: 3, patient: "Mike Davis", time: "11:15 AM", type: "Emergency", status: "urgent" },
  { id: 4, patient: "Emily Brown", time: "02:00 PM", type: "Consultation", status: "pending" },
  { id: 5, patient: "David Wilson", time: "03:30 PM", type: "Check-up", status: "confirmed" },
]

const mockPatients = [
  { id: 1, name: "John Smith", age: 45, condition: "Hypertension", lastVisit: "2024-01-15", status: "stable" },
  { id: 2, name: "Sarah Johnson", age: 32, condition: "Diabetes", lastVisit: "2024-01-14", status: "monitoring" },
  { id: 3, name: "Mike Davis", age: 28, condition: "Chest Pain", lastVisit: "2024-01-16", status: "critical" },
  { id: 4, name: "Emily Brown", age: 55, condition: "Arthritis", lastVisit: "2024-01-10", status: "stable" },
]

export default function DoctorDashboard() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPatients = mockPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Welcome back, Dr. Tansukh Gosai. Here's your overview for today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalPatients}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>Today's Appointments</span>
                  </CardTitle>
                  <CardDescription>Your scheduled appointments for today</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Appointment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium">{appointment.patient}</div>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {appointment.time} • {appointment.type}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      {appointment.status === "confirmed" && (
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
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
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
