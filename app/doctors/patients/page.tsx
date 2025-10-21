"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Users, Eye, Edit, Calendar, FileText, Phone, Mail, MapPin, Trash2 } from "lucide-react"
import { DeletePatientDialog } from "@/components/delete-patient-dialog"
import { usePatients } from "@/app/hooks/use-patients"

// Extended mock patient data
const mockPatients = [
  {
    id: 1,
    name: "John Smith",
    age: 45,
    gender: "Male",
    phone: "+1 (555) 123-4567",
    email: "john.smith@email.com",
    address: "123 Main St, City, State",
    condition: "Hypertension",
    lastVisit: "2024-01-15",
    status: "stable",
    bloodType: "A+",
    nextAppointment: "2024-01-22",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    age: 32,
    gender: "Female",
    phone: "+1 (555) 234-5678",
    email: "sarah.johnson@email.com",
    address: "456 Oak Ave, City, State",
    condition: "Diabetes Type 2",
    lastVisit: "2024-01-14",
    status: "monitoring",
    bloodType: "O-",
    nextAppointment: "2024-01-20",
  },
  {
    id: 3,
    name: "Mike Davis",
    age: 28,
    gender: "Male",
    phone: "+1 (555) 345-6789",
    email: "mike.davis@email.com",
    address: "789 Pine St, City, State",
    condition: "Chest Pain",
    lastVisit: "2024-01-16",
    status: "critical",
    bloodType: "B+",
    nextAppointment: "2024-01-18",
  },
  {
    id: 4,
    name: "Emily Brown",
    age: 55,
    gender: "Female",
    phone: "+1 (555) 456-7890",
    email: "emily.brown@email.com",
    address: "321 Elm St, City, State",
    condition: "Arthritis",
    lastVisit: "2024-01-10",
    status: "stable",
    bloodType: "AB+",
    nextAppointment: "2024-01-25",
  },
  {
    id: 5,
    name: "Robert Wilson",
    age: 62,
    gender: "Male",
    phone: "+1 (555) 567-8901",
    email: "robert.wilson@email.com",
    address: "654 Maple Dr, City, State",
    condition: "Heart Disease",
    lastVisit: "2024-01-12",
    status: "monitoring",
    bloodType: "O+",
    nextAppointment: "2024-01-19",
  },
]

export default function DoctorPatients() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState<(typeof mockPatients)[0] | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<(typeof mockPatients)[0] | null>(null)
  const { deletePatient } = usePatients()

  const filteredPatients = mockPatients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "monitoring":
        return "bg-yellow-100 text-yellow-800"
      case "stable":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDeletePatient = async () => {
    if (!patientToDelete) return
    try {
      await deletePatient(patientToDelete.id.toString())
      setSelectedPatient(null)
      setPatientToDelete(null)
    } catch (error) {
      console.error("Failed to delete patient:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Users className="h-8 w-8 text-blue-600" />
            <span>My Patients</span>
          </h1>
          <p className="text-gray-600 mt-2">Manage and view your patient information</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Patient List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <CardTitle>Patient List</CardTitle>
                    <CardDescription>All patients under your care</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedPatient?.id === patient.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{patient.name}</h3>
                            <span className="text-sm text-gray-500">
                              {patient.age}y, {patient.gender}
                            </span>
                            <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <strong>Condition:</strong> {patient.condition}
                            </p>
                            <p>
                              <strong>Last Visit:</strong> {patient.lastVisit}
                            </p>
                            <p>
                              <strong>Next Appointment:</strong> {patient.nextAppointment}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPatientToDelete(patient)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Details */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Patient Details</CardTitle>
                <CardDescription>
                  {selectedPatient ? "Detailed information" : "Select a patient to view details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3">{selectedPatient.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Age:</span>
                          <span>{selectedPatient.age} years</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Gender:</span>
                          <span>{selectedPatient.gender}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Blood Type:</span>
                          <span>{selectedPatient.bloodType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Status:</span>
                          <Badge className={getStatusColor(selectedPatient.status)}>{selectedPatient.status}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                      <h5 className="font-medium mb-2">Contact Information</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{selectedPatient.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{selectedPatient.email}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span>{selectedPatient.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Medical Info */}
                    <div>
                      <h5 className="font-medium mb-2">Medical Information</h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Primary Condition:</span>
                          <p className="text-gray-600">{selectedPatient.condition}</p>
                        </div>
                        <div>
                          <span className="font-medium">Last Visit:</span>
                          <p className="text-gray-600">{selectedPatient.lastVisit}</p>
                        </div>
                        <div>
                          <span className="font-medium">Next Appointment:</span>
                          <p className="text-gray-600">{selectedPatient.nextAppointment}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Appointment
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        <FileText className="h-4 w-4 mr-2" />
                        View Medical Records
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Edit className="h-4 w-4 mr-2" />
                        Update Information
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setPatientToDelete(selectedPatient)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Patient
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a patient from the list to view their detailed information</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <DeletePatientDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeletePatient}
        patientName={patientToDelete?.name || ""}
      />
    </div>
  )
}
