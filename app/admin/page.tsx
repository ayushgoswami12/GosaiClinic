"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Progress } from "@/components/ui/progress"
import {
  Settings,
  Users,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  UserPlus,
  Calendar,
  FileText,
  BarChart3,
  Shield,
  Database,
} from "lucide-react"
import Link from "next/link"

// Mock admin data
const hospitalStats = {
  totalPatients: 1247,
  totalStaff: 89,
  totalDoctors: 24,
  totalNurses: 45,
  occupancyRate: 78,
  monthlyRevenue: 485000,
  appointmentsToday: 67,
  emergencyCases: 12,
}

const departmentStats = [
  { name: "Emergency", patients: 45, staff: 12, occupancy: 85, status: "High" },
  { name: "Cardiology", patients: 32, staff: 8, occupancy: 65, status: "Normal" },
  { name: "Orthopedics", patients: 28, staff: 6, occupancy: 70, status: "Normal" },
  { name: "Pediatrics", patients: 22, staff: 7, occupancy: 55, status: "Low" },
  { name: "General Medicine", patients: 38, staff: 10, occupancy: 75, status: "Normal" },
]

const recentAlerts = [
  { id: 1, type: "Critical", message: "ICU bed capacity at 95%", time: "5 min ago", status: "active" },
  { id: 2, type: "Warning", message: "Staff shortage in Emergency dept", time: "15 min ago", status: "active" },
  { id: 3, type: "Info", message: "System backup completed successfully", time: "1 hour ago", status: "resolved" },
  { id: 4, type: "Warning", message: "Equipment maintenance due", time: "2 hours ago", status: "pending" },
]

const recentActivities = [
  { id: 1, action: "New patient registered", user: "Reception Desk 1", time: "2 min ago" },
  { id: 2, action: "Doctor schedule updated", user: "Dr. Sarah Wilson", time: "8 min ago" },
  { id: 3, action: "Emergency case admitted", user: "Emergency Dept", time: "12 min ago" },
  { id: 4, action: "Lab results uploaded", user: "Lab Technician", time: "18 min ago" },
  { id: 5, action: "Prescription issued", user: "Dr. Michael Chen", time: "25 min ago" },
]

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("today")

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "Critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "Warning":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "Info":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "Warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Info":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Normal":
        return "bg-green-100 text-green-800"
      case "Low":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <Settings className="h-8 w-8 text-blue-600" />
                <span>Hospital Administration</span>
              </h1>
              <p className="text-gray-600 mt-2">Comprehensive hospital management and oversight</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href="/admin/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Reports
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hospitalStats.totalPatients.toLocaleString()}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hospital Staff</CardTitle>
              <UserPlus className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hospitalStats.totalStaff}</div>
              <p className="text-xs text-gray-600 mt-1">
                {hospitalStats.totalDoctors} doctors, {hospitalStats.totalNurses} nurses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Building2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hospitalStats.occupancyRate}%</div>
              <Progress value={hospitalStats.occupancyRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${hospitalStats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Department Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Department Overview</CardTitle>
                    <CardDescription>Current status of all hospital departments</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/admin/departments">
                      <Building2 className="h-4 w-4 mr-2" />
                      Manage Departments
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentStats.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{dept.name}</h3>
                          <Badge className={getStatusColor(dept.status)}>{dept.status}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Patients:</span> {dept.patients}
                          </div>
                          <div>
                            <span className="font-medium">Staff:</span> {dept.staff}
                          </div>
                          <div>
                            <span className="font-medium">Occupancy:</span> {dept.occupancy}%
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Progress value={dept.occupancy} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Alerts */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>System Alerts</span>
                </CardTitle>
                <CardDescription>Recent system notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${getAlertColor(alert.type)} ${
                        alert.status === "active" ? "border-l-4" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs opacity-75 mt-1">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  View All Alerts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline" asChild>
                  <Link href="/admin/staff">
                    <Users className="h-6 w-6" />
                    <span>Manage Staff</span>
                  </Link>
                </Button>
                <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline" asChild>
                  <Link href="/admin/departments">
                    <Building2 className="h-6 w-6" />
                    <span>Departments</span>
                  </Link>
                </Button>
                <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline" asChild>
                  <Link href="/admin/reports">
                    <BarChart3 className="h-6 w-6" />
                    <span>Reports</span>
                  </Link>
                </Button>
                <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline" asChild>
                  <Link href="/admin/settings">
                    <Settings className="h-6 w-6" />
                    <span>Settings</span>
                  </Link>
                </Button>
                <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
                  <Shield className="h-6 w-6" />
                  <span>Security</span>
                </Button>
                <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline">
                  <Database className="h-6 w-6" />
                  <span>Backup</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest system activities and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-600">
                        by {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View Activity Log
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Today's Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
            <CardDescription>Key metrics and activities for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold">{hospitalStats.appointmentsToday}</div>
                <p className="text-sm text-gray-600">Appointments Today</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold">{hospitalStats.emergencyCases}</div>
                <p className="text-sm text-gray-600">Emergency Cases</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold">45</div>
                <p className="text-sm text-gray-600">Completed Procedures</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold">128</div>
                <p className="text-sm text-gray-600">Records Updated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
