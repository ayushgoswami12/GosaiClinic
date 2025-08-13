"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Users, Download, Eye, Edit, Phone, Mail, MapPin, Calendar, Pill, X, Printer } from "lucide-react"
import * as XLSX from "xlsx"
import Head from "next/head"

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
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Patient | null>(null)

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

  // Ensure edit form syncs with selected patient when entering edit mode
  useEffect(() => {
    if (isEditing && selectedPatient) {
      setEditForm({ ...selectedPatient })
    }
  }, [isEditing, selectedPatient])

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

  const startEdit = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsEditing(true)
    setEditForm({ ...patient })
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditForm(null)
  }

  const updateEditField = (field: keyof Patient, value: string) => {
    if (!editForm) return
    setEditForm({ ...editForm, [field]: value })
  }

  const saveEditedPatient = () => {
    if (!editForm) return
    // Basic validation
    if (!editForm.firstName || !editForm.lastName || !editForm.phone) {
      alert("First name, last name and phone are required")
      return
    }

    const updatedPatients = patients.map((p) => (p.id === editForm.id ? { ...p, ...editForm } : p))
    setPatients(updatedPatients)
    localStorage.setItem("patients", JSON.stringify(updatedPatients))
    setSelectedPatient(editForm)
    setIsEditing(false)
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
    // Get medications for the patient using the helper function
    const patientPrescriptions = getMedicationsForPatient(patient.id)
    setSelectedPatientMedications(patientPrescriptions)
    setSelectedPatient(patient)
    setShowMedicationModal(true)
  }

  // Function to handle printing patient medication details
  const handlePrint = () => {
    // Show the print-friendly section and hide the regular content when printing
    const printSection = document.querySelector('.print-section');
    if (printSection) {
      printSection.classList.remove('hidden');
      printSection.classList.add('block');
      
      // Print the document
      window.print();
      
      // After printing, hide the print section again
      setTimeout(() => {
        printSection.classList.remove('block');
        printSection.classList.add('hidden');
      }, 500);
    } else {
      window.print();
    }
  };
  
  // Function to get medications for a specific patient
  const getMedicationsForPatient = (patientId: string): Prescription[] => {
    const storedPrescriptions = localStorage.getItem("prescriptions")
    if (storedPrescriptions) {
      const prescriptions: Prescription[] = JSON.parse(storedPrescriptions)
      return prescriptions.filter((prescription) => prescription.patientId === patientId)
    }
    return []
  }

  // Function to directly show print layout without showing the modal
  const directPrint = (patient: Patient) => {
    setSelectedPatient(patient)
    // Fetch medications for the patient
    const medications = getMedicationsForPatient(patient.id)
    setSelectedPatientMedications(medications)

    // Wait for state updates to complete
    setTimeout(() => {
      // Show the global print-friendly section
      const printSection = document.querySelector('.print-section-global')
      if (printSection) {
        printSection.classList.remove('hidden')
        printSection.classList.add('block')

        // Print the document
        window.print()

        // After printing, hide the print section again
        setTimeout(() => {
          printSection.classList.remove('block')
          printSection.classList.add('hidden')
        }, 500)
      } else {
        window.print()
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-section, .print-section * {
              visibility: visible;
            }
            .print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background-color: white !important;
              color: black !important;
              padding: 20px;
              font-size: 12pt;
            }
            .print-section .no-print {
              display: none !important;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #000;
            }
            .print-header h1 {
              font-size: 24pt;
              margin-bottom: 5px;
            }
            .print-header h2 {
              font-size: 18pt;
            }
            .print-patient-info {
              margin-bottom: 30px;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 5px;
              background-color: #f9f9f9;
            }
            .print-patient-info h3 {
              font-size: 16pt;
              margin-bottom: 10px;
            }
            .print-patient-info p {
              margin-bottom: 5px;
              font-size: 12pt;
            }
            .print-prescription {
              page-break-inside: avoid;
              margin-bottom: 30px;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .print-prescription h4 {
              font-size: 14pt;
              margin-bottom: 5px;
            }
            .print-medication {
              margin-bottom: 15px;
              padding: 10px;
              border: 1px solid #eee;
              border-radius: 5px;
              page-break-inside: avoid;
            }
            .print-medication h5 {
              font-size: 13pt;
              margin-bottom: 5px;
            }
            .print-medication p {
              margin-bottom: 3px;
              font-size: 11pt;
            }
          }
        `}</style>
      </Head>
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
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 lg:flex-none bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-800 dark:text-blue-400"
                              onClick={(e) => {
                                e.stopPropagation()
                                directPrint(patient)
                              }}
                            >
                              <Printer className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                              <span className="text-xs lg:text-sm">Print</span>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 lg:flex-none bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEdit(patient)
                                // Scroll to patient details section on mobile
                                if (window.innerWidth < 1024) {
                                  const detailsCard = document.querySelector('.lg\\:col-span-1 .card')
                                  if (detailsCard) {
                                    ;(detailsCard as HTMLElement).scrollIntoView({ behavior: 'smooth' })
                                  }
                                }
                              }}
                            >
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
                    {!isEditing && (
                      <>
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
                          <Button className="w-full" asChild>
                            <a href={`/appointments/book?patientId=${selectedPatient.id}`}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Appointment
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full bg-transparent dark:bg-transparent"
                            onClick={() => startEdit(selectedPatient)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Update Information
                          </Button>
                          <Button 
                            variant="secondary" 
                            className="w-full"
                            onClick={() => directPrint(selectedPatient)}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Print Details
                          </Button>
                        </div>
                      </>
                    )}

                    {isEditing && editForm && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium">First Name</label>
                            <Input value={editForm.firstName} onChange={(e) => updateEditField("firstName", e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Last Name</label>
                            <Input value={editForm.lastName} onChange={(e) => updateEditField("lastName", e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Date of Birth</label>
                            <Input type="date" value={editForm.dateOfBirth} onChange={(e) => updateEditField("dateOfBirth", e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Gender</label>
                            <Select value={editForm.gender} onValueChange={(v) => updateEditField("gender", v)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-xs font-medium">Phone</label>
                            <Input value={editForm.phone} onChange={(e) => updateEditField("phone", e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Email</label>
                            <Input type="email" value={editForm.email || ""} onChange={(e) => updateEditField("email", e.target.value)} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium">Address</label>
                            <Input value={editForm.address} onChange={(e) => updateEditField("address", e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Blood Type</label>
                            <Input value={editForm.bloodType || ""} onChange={(e) => updateEditField("bloodType", e.target.value)} />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Allergies</label>
                            <Input value={editForm.allergies || ""} onChange={(e) => updateEditField("allergies", e.target.value)} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium">Medical History</label>
                            <Input value={editForm.medicalHistory || ""} onChange={(e) => updateEditField("medicalHistory", e.target.value)} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={saveEditedPatient} className="flex-1">Save</Button>
                          <Button variant="outline" onClick={cancelEdit} className="flex-1">Cancel</Button>
                        </div>
                      </div>
                    )}
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
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-800 dark:text-blue-400"
                      onClick={handlePrint}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowMedicationModal(false)} className="no-print">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Print-friendly version that will only be visible when printing */}
                <div className="print-section hidden">
                  
                  <div className="print-patient-info">
                    <h3 className="text-lg font-bold mb-2">Patient Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p><strong>Name:</strong> {selectedPatient?.firstName} {selectedPatient?.lastName}</p>
                        <p><strong>ID:</strong> {selectedPatient?.id}</p>
                        <p><strong>Gender:</strong> {selectedPatient?.gender}</p>
                        <p><strong>Date of Birth:</strong> {formatDate(selectedPatient?.dateOfBirth || '')}</p>
                        <p><strong>Age:</strong> {calculateAge(selectedPatient?.dateOfBirth || '')} years</p>
                      </div>
                      <div>
                        <p><strong>Phone:</strong> {selectedPatient?.phone}</p>
                        <p><strong>Email:</strong> {selectedPatient?.email || 'Not provided'}</p>
                        <p><strong>Address:</strong> {selectedPatient?.address}</p>
                        <p><strong>Blood Type:</strong> {selectedPatient?.bloodType || 'Not specified'}</p>
                        <p><strong>Allergies:</strong> {selectedPatient?.allergies || 'None reported'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedPatientMedications.length === 0 ? (
                    <div className="text-center py-6">
                      <h3 className="text-lg font-medium mb-2">No medications found</h3>
                      <p>This patient has no prescription history yet</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-bold mb-4">Medication History</h3>
                      {selectedPatientMedications.map((prescription) => (
                        <div key={prescription.id} className="print-prescription">
                          <div className="mb-2 pb-2 border-b">
                            <h4 className="text-lg font-semibold">Prescription #{prescription.id}</h4>
                            <p>Prescribed by {prescription.doctorName} on {new Date(prescription.date).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="space-y-4">
                            {prescription.medications.map((medication, index) => (
                              <div key={index} className="print-medication">
                                <h5 className="font-semibold text-base mb-2">{medication.name}</h5>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p><strong>Dosage:</strong> {medication.dosage}</p>
                                    <p><strong>Duration:</strong> {medication.duration}</p>
                                  </div>
                                  <div>
                                    <p><strong>Frequency:</strong> {medication.frequency.join(', ')}</p>
                                    {medication.instructions && (
                                      <p><strong>Instructions:</strong> {medication.instructions}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {/* Notes intentionally omitted for print: only details and medications */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Regular view for screen display */}
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

        {/* Global print-only section for direct printing from top-level Print buttons */}
        {selectedPatient && (
          <div className="print-section-global hidden">

            <div className="print-patient-info">
              <h3 className="text-lg font-bold mb-2">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Name:</strong> {selectedPatient.firstName} {selectedPatient.lastName}</p>
                  <p><strong>ID:</strong> {selectedPatient.id}</p>
                  <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                  <p><strong>Date of Birth:</strong> {formatDate(selectedPatient.dateOfBirth)}</p>
                  <p><strong>Age:</strong> {calculateAge(selectedPatient.dateOfBirth)} years</p>
                </div>
                <div>
                  <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                  <p><strong>Email:</strong> {selectedPatient.email || 'Not provided'}</p>
                  <p><strong>Address:</strong> {selectedPatient.address}</p>
                  <p><strong>Blood Type:</strong> {selectedPatient.bloodType || 'Not specified'}</p>
                  <p><strong>Allergies:</strong> {selectedPatient.allergies || 'None reported'}</p>
                </div>
              </div>
            </div>

            {selectedPatientMedications.length === 0 ? (
              <div className="text-center py-6">
                <h3 className="text-lg font-medium mb-2">No medications found</h3>
                <p>This patient has no prescription history yet</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold mb-4">Medication History</h3>
                {selectedPatientMedications.map((prescription) => (
                  <div key={prescription.id} className="print-prescription">
                    <div className="mb-2 pb-2 border-b">
                      <h4 className="text-lg font-semibold">Prescription #{prescription.id}</h4>
                      <p>Prescribed by {prescription.doctorName} on {new Date(prescription.date).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-4">
                      {prescription.medications.map((medication, index) => (
                        <div key={index} className="print-medication">
                          <h5 className="font-semibold text-base mb-2">{medication.name}</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p><strong>Dosage:</strong> {medication.dosage}</p>
                              <p><strong>Duration:</strong> {medication.duration}</p>
                            </div>
                            <div>
                              <p><strong>Frequency:</strong> {medication.frequency.join(', ')}</p>
                              {medication.instructions && (
                                <p><strong>Instructions:</strong> {medication.instructions}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

