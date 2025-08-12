"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  Calendar,
  User,
  Activity,
  Pill,
  TestTube,
  Heart,
  Brain,
} from "lucide-react"
import Link from "next/link"

// Mock medical records data
const mockRecords = [
  {
    id: 1,
    patientId: 1,
    patientName: "John Smith",
    age: 45,
    recordType: "Diagnosis",
    title: "Hypertension Management",
    doctor: "Dr. Sarah Wilson",
    date: "2024-01-15",
    department: "Cardiology",
    status: "Active",
    priority: "Medium",
    summary: "Patient diagnosed with stage 1 hypertension. Started on ACE inhibitor therapy.",
  },
  {
    id: 2,
    patientId: 2,
    patientName: "Sarah Johnson",
    age: 32,
    recordType: "Lab Result",
    title: "Blood Glucose Test",
    doctor: "Dr. Robert Taylor",
    date: "2024-01-14",
    department: "Endocrinology",
    status: "Reviewed",
    priority: "High",
    summary: "HbA1c levels elevated at 8.2%. Diabetes management plan updated.",
  },
  {
    id: 3,
    patientId: 3,
    patientName: "Mike Davis",
    age: 28,
    recordType: "Emergency",
    title: "Chest Pain Evaluation",
    doctor: "Dr. Michael Chen",
    date: "2024-01-16",
    department: "Emergency",
    status: "Active",
    priority: "High",
    summary: "Patient presented with acute chest pain. ECG and cardiac enzymes ordered.",
  },
  {
    id: 4,
    patientId: 4,
    patientName: "Emily Brown",
    age: 55,
    recordType: "Prescription",
    title: "Arthritis Medication",
    doctor: "Dr. Lisa Anderson",
    date: "2024-01-10",
    department: "Rheumatology",
    status: "Active",
    priority: "Low",
    summary: "Prescribed methotrexate 15mg weekly for rheumatoid arthritis management.",
  },
  {
    id: 5,
    patientId: 5,
    patientName: "Robert Wilson",
    age: 62,
    recordType: "Surgery",
    title: "Cardiac Catheterization",
    doctor: "Dr. James Brown",
    date: "2024-01-12",
    department: "Cardiology",
    status: "Completed",
    priority: "High",
    summary: "Successful cardiac catheterization. 2 stents placed in LAD artery.",
  },
]

const recordTypes = ["All Types", "Diagnosis", "Lab Result", "Prescription", "Surgery", "Emergency", "Follow-up"]
const departments = ["All Departments", "Cardiology", "Endocrinology", "Emergency", "Rheumatology", "General Medicine"]

export default function MedicalRecords() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("All Types")
  const [departmentFilter, setDepartmentFilter] = useState("All Departments")
  const [statusFilter, setStatusFilter] = useState("All Status")

  const filteredRecords = mockRecords.filter((record) => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "All Types" || record.recordType === typeFilter
    const matchesDepartment = departmentFilter === "All Departments" || record.department === departmentFilter
    const matchesStatus = statusFilter === "All Status" || record.status === statusFilter
    return matchesSearch && matchesType && matchesDepartment && matchesStatus
  })

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "Diagnosis":
        return <Activity className="h-4 w-4" />
      case "Lab Result":
        return <TestTube className="h-4 w-4" />
      case "Prescription":
        return <Pill className="h-4 w-4" />
      case "Surgery":
        return <Heart className="h-4 w-4" />
      case "Emergency":
        return <Brain className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Completed":
        return "bg-blue-100 text-blue-800"
      case "Reviewed":
        return "bg-gray-100 text-gray-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
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
                <FileText className="h-8 w-8 text-blue-600" />
                <span>Medical Records</span>
              </h1>
              <p className="text-gray-600 mt-2">Manage patient medical records and documentation</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/records/new">
                <Plus className="h-4 w-4 mr-2" />
                New Record
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockRecords.length}</div>
              <p className="text-xs text-gray-600 mt-1">All patient records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockRecords.filter((record) => record.status === "Active").length}
              </div>
              <p className="text-xs text-green-600 mt-1">Ongoing treatments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <Brain className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockRecords.filter((record) => record.priority === "High").length}
              </div>
              <p className="text-xs text-red-600 mt-1">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Records</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockRecords.filter((record) => new Date(record.date) >= new Date("2024-01-15")).length}
              </div>
              <p className="text-xs text-purple-600 mt-1">Last 3 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recordTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Reviewed">Reviewed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setTypeFilter("All Types")
                  setDepartmentFilter("All Departments")
                  setStatusFilter("All Status")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Records ({filteredRecords.length})</CardTitle>
            <CardDescription>Patient medical records and documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      {getRecordIcon(record.recordType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{record.title}</h3>
                        <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                        <Badge className={getPriorityColor(record.priority)}>{record.priority}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>
                            {record.patientName} ({record.age}y)
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{record.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-3 w-3" />
                          <span>{record.doctor}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span>{record.department}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{record.summary}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/records/${record.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
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
