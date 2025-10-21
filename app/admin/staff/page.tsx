"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  UserX,
  ArrowLeft,
  Stethoscope,
  Heart,
  Activity,
} from "lucide-react"
import Link from "next/link"

// Mock staff data
const mockStaff = [
  {
    id: 1,
    name: "Dr. Tansukh Gosai",
    role: "Doctor",
    department: "Cardiology",
    specialization: "Interventional Cardiology",
    email: "tansukh.gosai@gosaiclinic.com",
    phone: "+1 (555) 123-4567",
    status: "Active",
    joinDate: "2020-03-15",
    patients: 45,
    schedule: "Mon-Fri 8:00-17:00",
  },
  {
    id: 2,
    name: "Dr. Devang Gosai",
    role: "Doctor",
    department: "Orthopedics",
    specialization: "Sports Medicine",
    email: "devang.gosai@gosaiclinic.com",
    phone: "+1 (555) 234-5678",
    status: "Active",
    joinDate: "2019-08-22",
    patients: 38,
    schedule: "Mon-Fri 9:00-18:00",
  },
  {
    id: 3,
    name: "Nurse Jennifer Adams",
    role: "Nurse",
    department: "Emergency",
    specialization: "Emergency Care",
    email: "jennifer.adams@gosaiclinic.com",
    phone: "+1 (555) 345-6789",
    status: "Active",
    joinDate: "2021-01-10",
    patients: 0,
    schedule: "Rotating Shifts",
  },
  {
    id: 4,
    name: "Dr. Dhara Gosai",
    role: "Doctor",
    department: "General Medicine",
    specialization: "Internal Medicine",
    email: "dhara.gosai@gosaiclinic.com",
    phone: "+1 (555) 456-7890",
    status: "Active",
    joinDate: "2018-05-30",
    patients: 42,
    schedule: "Mon-Fri 8:00-16:00",
  },
  {
    id: 5,
    name: "Dr. Robert Taylor",
    role: "Doctor",
    department: "General Medicine",
    specialization: "Internal Medicine",
    email: "robert.taylor@gosaiclinic.com",
    phone: "+1 (555) 456-7890",
    status: "On Leave",
    joinDate: "2018-05-30",
    patients: 42,
    schedule: "Mon-Fri 8:00-16:00",
  },
  {
    id: 6,
    name: "Dr. Lisa Anderson",
    role: "Doctor",
    department: "Dermatology",
    specialization: "Dermatopathology",
    email: "lisa.anderson@gosaiclinic.com",
    phone: "+1 (555) 678-9012",
    status: "Active",
    joinDate: "2019-12-05",
    patients: 35,
    schedule: "Tue-Sat 10:00-19:00",
  },
]

const departments = [
  "All Departments",
  "Cardiology",
  "Orthopedics",
  "Emergency",
  "General Medicine",
  "Pediatrics",
  "Dermatology",
]
const roles = ["All Roles", "Doctor", "Nurse", "Administrator", "Technician"]

export default function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("All Departments")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [statusFilter, setStatusFilter] = useState("All Status")

  const filteredStaff = mockStaff.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === "All Departments" || staff.department === departmentFilter
    const matchesRole = roleFilter === "All Roles" || staff.role === roleFilter
    const matchesStatus = statusFilter === "All Status" || staff.status === statusFilter
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "On Leave":
        return "bg-yellow-100 text-yellow-800"
      case "Inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Doctor":
        return <Stethoscope className="h-4 w-4 text-blue-600" />
      case "Nurse":
        return <Heart className="h-4 w-4 text-red-600" />
      case "Administrator":
        return <Users className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <span>Staff Management</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage hospital staff, roles, and schedules</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStaff.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">All staff members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
              <Stethoscope className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStaff.filter((staff) => staff.role === "Doctor" && staff.status === "Active").length}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Currently working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Nurses</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStaff.filter((staff) => staff.role === "Nurse" && staff.status === "Active").length}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Currently working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Leave</CardTitle>
              <UserX className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockStaff.filter((staff) => staff.status === "On Leave").length}
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Temporary absence</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setDepartmentFilter("All Departments")
                  setRoleFilter("All Roles")
                  setStatusFilter("All Status")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Directory ({filteredStaff.length})</CardTitle>
            <CardDescription>Hospital staff members and their information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      {getRoleIcon(staff.role)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg dark:text-white">{staff.name}</h3>
                        <Badge className={getStatusColor(staff.status)}>{staff.status}</Badge>
                        <Badge variant="outline">{staff.role}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Department:</span> {staff.department}
                        </div>
                        <div>
                          <span className="font-medium">Specialization:</span> {staff.specialization}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{staff.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{staff.phone}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Joined: {staff.joinDate}</span>
                        </div>
                        <div>
                          <span className="font-medium">Schedule:</span> {staff.schedule}
                        </div>
                        {staff.patients > 0 && (
                          <div>
                            <span className="font-medium">Patients:</span> {staff.patients}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-600 bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
