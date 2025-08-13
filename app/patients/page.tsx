"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Users, Download, Eye, Edit, Phone, Mail, MapPin, Calendar, Pill, X } from "lucide-react"
import * as XLSX from "xlsx"

interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phone: string
  email: string
  address: string
  // emergencyContact: string
  // emergencyPhone: string
  bloodType: string
  allergies: string
  medicalHistory: string
  registrationDate: string
}

interface Medication {
  name: string
  dosage: string
  frequency: string[]
  duration: string
  instructions: string
}

interface Prescription {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  medications: Medication[]
  notes: string
  date: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showMedicationModal, setShowMedicationModal] = useState(false)
  const [selectedPatientMedications, setSelectedPatientMedications] = useState<Prescription[]>([])

  const loadPatients = () => {
    const storedPatients = localStorage.getItem("patients")
    if (storedPatients) {
      setPatients(JSON.parse(storedPatients))
    }
  }

  useEffect(() => {
    loadPatients()

    const handlePatientAdded = () => {
      loadPatients()
    }

    window.addEventListener("patientAdded", handlePatientAdded)

    return () => {
      window.removeEventListener("patientAdded", handlePatientAdded)
    }
  }, [])

  const filteredPatients = patients
    .filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      const matchesGender = genderFilter === "all" || patient.gender.toLowerCase() === genderFilter.toLowerCase()
      return matchesSearch && matchesGender
    })
    .sort((a, b) => {
      // Sort by registration date, newest first
      return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
    })

  const exportToExcel = () => {
    if (patients.length === 0) {
      alert("No patients to export!")
      return
    }

    const exportData = patients.map((patient) => ({
      "Patient ID": patient.id,
      "First Name": patient.firstName,
      "Last Name": patient.lastName,
      "Full Name": `${patient.firstName} ${patient.lastName}`,
      "Date of Birth": patient.dateOfBirth,
      Age: calculateAge(patient.dateOfBirth),
      Gender: patient.gender,
      Phone: patient.phone,
      Email: patient.email || "Not provided",
      Address: patient.address,
      // "Emergency Contact": patient.emergencyContact,
      // "Emergency Phone": patient.emergencyPhone,
      "Blood Type": patient.bloodType || "Not specified",
      Allergies: patient.allergies || "None reported",
      "Medical History": patient.medicalHistory || "None reported",
      "Registration Date": patient.registrationDate,
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "GOSAI CLINIC Patients")

    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }))
    worksheet["!cols"] = colWidths

    const fileName = `GOSAI_CLINIC_All_Patients_${new Date().toISOString().split("T")[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const showPatientMedications = (patient: Patient) => {
    const storedPrescriptions = localStorage.getItem("prescriptions")
    if (storedPrescriptions) {
      const prescriptions: Prescription[] = JSON.parse(storedPrescriptions)
      const patientPrescriptions = prescriptions.filter((prescription) => prescription.patientId === patient.id)
      setSelectedPatientMedications(patientPrescriptions)
      setSelectedPatient(patient)
      setShowMedicationModal(true)
    } else {
      setSelectedPatientMedications([])
      setSelectedPatient(patient)
      setShowMedicationModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-500" />
                <span>All Patients - GOSAI CLINIC</span>
              </h1>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-2">
                Total registered patients:{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-500">{patients.length}</span>
              </p>
            </div>
            <Button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col space-y-4">
                  <div>
                    <CardTitle className="text-lg lg:text-xl">Patient Database</CardTitle>
                    <CardDescription className="text-sm lg:text-base">
                      All registered patients in the system
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full"
                      />
                    </div>
                    <Select value={genderFilter} onValueChange={setGenderFilter}>
                      <SelectTrigger className="w-full sm:w-32">
                        <Filter className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Gender</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {patients.length === 0 ? (
                  <div className="text-center py-8 lg:py-12">
                    <Users className="h-12 w-12 lg:h-16 lg:w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No patients registered yet
                    </h3>
                    <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-4">
                      Start by registering your first patient
                    </p>
                    <Button asChild className="w-full sm:w-auto">
                      <a href="/patients/register">Register New Patient</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-3 lg:p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          selectedPatient?.id === patient.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                              <h3 className="font-semibold text-base lg:text-lg">
                                {patient.firstName} {patient.lastName}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                                  {calculateAge(patient.dateOfBirth)}y, {patient.gender}
                                </span>
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 text-xs">
                                  ID: {patient.id}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p>
                                <strong>Phone:</strong> {patient.phone}
                              </p>
                              <p>
                                <strong>Email:</strong> {patient.email || "Not provided"}
                              </p>
                              <p>
                                <strong>Registered:</strong> {formatDate(patient.registrationDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
                            <Button size="sm" variant="outline" className="flex-1 lg:flex-none bg-transparent">
                              <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                              <span className="text-xs lg:text-sm">View</span>
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 lg:flex-none bg-transparent">
                              <Edit className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                              <span className="text-xs lg:text-sm">Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                showPatientMedications(patient)
                              }}
                              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-800 dark:text-green-400 flex-1 lg:flex-none"
                            >
                              <Pill className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                              <span className="text-xs lg:text-sm">Medication</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-8">
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">Patient Details</CardTitle>
                <CardDescription className="text-sm lg:text-base">
                  {selectedPatient ? "Detailed information" : "Select a patient to view details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  <div className="space-y-4 lg:space-y-6">
                    <div>
                      <h4 className="font-semibold text-base lg:text-lg mb-3">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </h4>
                      <div className="space-y-2 text-xs lg:text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Patient ID:</span>
                          <span>{selectedPatient.id}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Age:</span>
                          <span>{calculateAge(selectedPatient.dateOfBirth)} years</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Gender:</span>
                          <span>{selectedPatient.gender}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">DOB:</span>
                          <span>{formatDate(selectedPatient.dateOfBirth)}</span>
                        </div>
                        {selectedPatient.bloodType && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Blood Type:</span>
                            <span>{selectedPatient.bloodType}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2 text-sm lg:text-base">Contact Information</h5>
                      <div className="space-y-2 text-xs lg:text-sm">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 dark:text-gray-500" />
                          <span>{selectedPatient.phone}</span>
                        </div>
                        {selectedPatient.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 dark:text-gray-500" />
                            <span>{selectedPatient.email}</span>
                          </div>
                        )}
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                          <span>{selectedPatient.address}</span>
                        </div>
                      </div>
                    </div>

               

                    <div>
                      <h5 className="font-medium mb-2 text-sm lg:text-base">Medical Information</h5>
                      <div className="space-y-2 text-xs lg:text-sm">
                        <div>
                          <span className="font-medium">Medical History:</span>
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedPatient.medicalHistory || "None reported"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Allergies:</span>
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedPatient.allergies || "None reported"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Appointment
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent dark:bg-transparent">
                        <Edit className="h-4 w-4 mr-2" />
                        Update Information
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8 lg:py-12">
                    <Users className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>Select a patient from the list to view their detailed information</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {showMedicationModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 lg:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[95vh] lg:max-h-[90vh] overflow-y-auto">
              <div className="p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                      <Pill className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-green-600 dark:text-green-500" />
                      Medication History
                    </h2>
                    <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                      {selectedPatient?.firstName} {selectedPatient?.lastName} - ID: {selectedPatient?.id}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowMedicationModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {selectedPatientMedications.length === 0 ? (
                  <div className="text-center py-12">
                    <Pill className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No medications found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      This patient has no prescription history yet
                    </p>
                    <Button asChild>
                      <a href="/prescriptions">Create New Prescription</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedPatientMedications.map((prescription) => (
                      <Card key={prescription.id} className="border-l-4 border-l-green-500 dark:border-l-green-600">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg lg:text-xl">Prescription #{prescription.id}</CardTitle>
                              <CardDescription>
                                Prescribed by {prescription.doctorName} on{" "}
                                {new Date(prescription.date).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              {prescription.medications.length} medication
                              {prescription.medications.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {prescription.medications.map((medication, index) => (
                              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-base lg:text-lg text-gray-900 dark:text-white mb-2">
                                      {medication.name}
                                    </h4>
                                    <div className="space-y-1 text-xs lg:text-sm">
                                      <p>
                                        <span className="font-medium">Dosage:</span> {medication.dosage}
                                      </p>
                                      <p>
                                        <span className="font-medium">Duration:</span> {medication.duration}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="mb-2">
                                      <span className="font-medium text-xs lg:text-sm">Frequency:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {medication.frequency.map((freq, freqIndex) => (
                                          <Badge
                                            key={freqIndex}
                                            variant="secondary"
                                            className="text-xs dark:bg-gray-700 dark:text-gray-300"
                                          >
                                            {freq}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    {medication.instructions && (
                                      <div>
                                        <span className="font-medium text-xs lg:text-sm">Instructions:</span>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                          {medication.instructions}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {prescription.notes && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <span className="font-medium text-xs lg:text-sm">Doctor's Notes:</span>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{prescription.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
