"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Users, Download, Edit, Phone, Mail, MapPin, Calendar, Pill, X, Printer } from "lucide-react"
import * as XLSX from "xlsx"

interface Patient {
  id: string
  firstName: string
  lastName: string
  age: string
  gender: string
  phone: string
  email: string
  address: string
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
  const [showPrintPreview, setShowPrintPreview] = useState(false)

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

  useEffect(() => {
    if (isEditing && selectedPatient) {
      setEditForm({ ...selectedPatient })
    }
  }, [isEditing, selectedPatient])

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid date"
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  // Function to determine medicine category based on name
  const getMedicineCategory = (medicineName: string): { category: string; color: string } => {
    const name = medicineName.toLowerCase()

    if (
      name.includes("amoxicillin") ||
      name.includes("azithromycin") ||
      name.includes("antibiotic") ||
      name.includes("cephalexin") ||
      name.includes("doxycycline")
    ) {
      return { category: "Antibiotic", color: "#3b82f6" }
    }
    if (
      name.includes("paracetamol") ||
      name.includes("ibuprofen") ||
      name.includes("aspirin") ||
      name.includes("pain") ||
      name.includes("acetaminophen")
    ) {
      return { category: "Pain Relief", color: "#10b981" }
    }
    if (
      name.includes("omeprazole") ||
      name.includes("pantoprazole") ||
      name.includes("ranitidine") ||
      name.includes("antacid") ||
      name.includes("stomach")
    ) {
      return { category: "Stomach Protection", color: "#8b5cf6" }
    }
    if (
      name.includes("vitamin") ||
      name.includes("calcium") ||
      name.includes("iron") ||
      name.includes("supplement") ||
      name.includes("multivitamin")
    ) {
      return { category: "Supplement", color: "#f59e0b" }
    }
    if (
      name.includes("cough") ||
      name.includes("syrup") ||
      name.includes("expectorant") ||
      name.includes("bronchodilator")
    ) {
      return { category: "Cough/Cold", color: "#06b6d4" }
    }
    if (
      name.includes("insulin") ||
      name.includes("metformin") ||
      name.includes("diabetes") ||
      name.includes("glipizide")
    ) {
      return { category: "Diabetes", color: "#ef4444" }
    }
    if (
      name.includes("amlodipine") ||
      name.includes("atenolol") ||
      name.includes("pressure") ||
      name.includes("hypertension")
    ) {
      return { category: "Blood Pressure", color: "#dc2626" }
    }

    return { category: "Medicine", color: "#6b7280" }
  }

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
      Age: patient.age,
      Gender: patient.gender,
      Phone: patient.phone,
      Email: patient.email || "Not provided",
      Address: patient.address,
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
    if (!editForm.firstName || !editForm.lastName || !editForm.phone || !editForm.age) {
      alert("First name, last name, phone, and age are required")
      return
    }

    // Validate age
    const ageNum = Number.parseInt(editForm.age)
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      alert("Please enter a valid age between 0 and 150.")
      return
    }

    const updatedPatients = patients.map((p) => (p.id === editForm.id ? { ...p, ...editForm } : p))
    setPatients(updatedPatients)
    localStorage.setItem("patients", JSON.stringify(updatedPatients))
    setSelectedPatient(editForm)
    setIsEditing(false)
  }

  const showPatientMedications = (patient: Patient) => {
    const patientPrescriptions = getMedicationsForPatient(patient.id)
    setSelectedPatientMedications(patientPrescriptions)
    setSelectedPatient(patient)
    setShowMedicationModal(true)
  }

  const getMedicationsForPatient = (patientId: string): Prescription[] => {
    const storedPrescriptions = localStorage.getItem("prescriptions")
    if (storedPrescriptions) {
      const prescriptions: Prescription[] = JSON.parse(storedPrescriptions)
      return prescriptions.filter((prescription) => prescription.patientId === patientId)
    }
    return []
  }

  const handlePrintPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    const medications = getMedicationsForPatient(patient.id)
    setSelectedPatientMedications(medications)
    setShowPrintPreview(true)
  }

  const printDocument = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = generatePrintHTML()

    printWindow.document.write(printContent)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  const generatePrintHTML = () => {
    if (!selectedPatient) return ""

    // Get all medications from all prescriptions
    const allMedications: Array<{ medication: Medication; prescription: Prescription }> = []
    selectedPatientMedications.forEach((prescription) => {
      prescription.medications.forEach((medication) => {
        allMedications.push({ medication, prescription })
      })
    })

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Patient Report - ${selectedPatient.firstName} ${selectedPatient.lastName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #000;
            background: white;
            padding: 20px;
        }
        
        .clinic-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            border: 3px solid #1e40af;
            border-radius: 10px;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        }
        
        .clinic-title {
            font-size: 36pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        
        .clinic-subtitle {
            font-size: 16pt;
            color: #374151;
            font-style: italic;
            margin-bottom: 10px;
        }
        
        .clinic-contact {
            font-size: 12pt;
            color: #6b7280;
            border-top: 2px solid #93c5fd;
            padding-top: 10px;
            margin-top: 10px;
        }
        
        .patient-info {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .patient-info h2 {
            color: #1e40af;
            font-size: 18pt;
            margin-bottom: 15px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 5px;
        }
        
        .patient-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            font-size: 14pt;
        }
        
        .detail-item {
            margin-bottom: 8px;
        }
        
        .detail-label {
            font-weight: bold;
            color: #374151;
            display: inline-block;
            width: 100px;
        }
        
        .detail-value {
            color: #1f2937;
        }
        
        .medications-section {
            margin-top: 30px;
        }
        
        .medications-title {
            color: #1f2937;
            font-size: 20pt;
            font-weight: 600;
            margin-bottom: 25px;
        }
        
        .medication-item {
            margin-bottom: 25px;
            padding: 0;
            background: white;
            border-radius: 0;
            position: relative;
        }
        
        .medication-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }
        
        .medication-name {
            font-size: 16pt;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
        }
        
        .medication-category {
            font-size: 11pt;
            font-weight: 500;
            padding: 4px 12px;
            border-radius: 12px;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .medication-instructions {
            color: #6b7280;
            font-size: 13pt;
            margin-bottom: 4px;
            line-height: 1.3;
        }
        
        .medication-duration {
            color: #6b7280;
            font-size: 13pt;
            line-height: 1.3;
        }
        
        .no-medications {
            text-align: center;
            padding: 40px;
            background: #f9fafb;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            color: #6b7280;
            font-size: 14pt;
        }
        
        .page-footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10pt;
            color: #6b7280;
            border-top: 1px solid #d1d5db;
            padding-top: 10px;
        }
        
        @media print {
            body { 
                margin: 0; 
                padding: 15px; 
            }
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
        }
    </style>
</head>
<body>
    <div class="clinic-header">
        <div class="clinic-title">GOSAI CLINIC</div>
        <div class="clinic-subtitle">Complete Healthcare Solutions</div>
        <div class="clinic-contact">
            📍 Opp. Taluka Panchayat, Shiv Nagar, Bhanvad, Gujarat 360510<br>
            📞 9426953220 | ✉️ info@gosaiclinic.com
        </div>
    </div>
    
    <div class="patient-info">
        <h2>📋 Patient Information</h2>
        <div class="patient-details">
            <div>
                <div class="detail-item">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${selectedPatient.firstName} ${selectedPatient.lastName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">ID:</span>
                    <span class="detail-value">${selectedPatient.id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Age:</span>
                    <span class="detail-value">${selectedPatient.age} years</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Gender:</span>
                    <span class="detail-value">${selectedPatient.gender}</span>
                </div>
            </div>
            <div>
                <div class="detail-item">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${selectedPatient.phone}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${selectedPatient.address}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${new Date().toLocaleDateString("en-US")}</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="medications-section">
        <div class="medications-title">Prescribed Medications</div>
        
        ${
          allMedications.length === 0
            ? `
            <div class="no-medications">
                <div style="font-weight: bold; margin-bottom: 10px; font-size: 16pt;">No Medications Prescribed</div>
                <div>This patient currently has no medication history.</div>
            </div>
        `
            : `
            ${allMedications
              .map((item) => {
                const category = getMedicineCategory(item.medication.name)
                const frequencyText = item.medication.frequency.join(", ")
                const instructionText = item.medication.instructions || frequencyText

                return `
                <div class="medication-item">
                    <div class="medication-header">
                        <div class="medication-name">${item.medication.name}</div>
                        <div class="medication-category" style="background-color: ${category.color};">
                            ${category.category}
                        </div>
                    </div>
                    <div class="medication-instructions">${instructionText}</div>
                    <div class="medication-duration">Duration: ${item.medication.duration}</div>
                </div>
            `
              })
              .join("")}
        `
        }
    </div>
    
    <div class="page-footer">
        <strong>GOSAI CLINIC</strong> - Your Health, Our Priority | 
        Confidential Medical Document - Handle with Care | 
        For queries: 9426953220
    </div>
</body>
</html>
    `
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
                    {filteredPatients.map((patient) => {
                      return (
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
                                    {patient.age} years, {patient.gender}
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
                                  handlePrintPatient(patient)
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
                                  if (window.innerWidth < 1024) {
                                    const detailsCard = document.querySelector(".lg\\:col-span-1 .card")
                                    if (detailsCard) {
                                      ;(detailsCard as HTMLElement).scrollIntoView({ behavior: "smooth" })
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
                      )
                    })}
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
                              <span className="font-semibold text-blue-600">{selectedPatient.age} years</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Gender:</span>
                              <span>{selectedPatient.gender}</span>
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
                            onClick={() => handlePrintPatient(selectedPatient)}
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
                            <Input
                              value={editForm.firstName}
                              onChange={(e) => updateEditField("firstName", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Last Name</label>
                            <Input
                              value={editForm.lastName}
                              onChange={(e) => updateEditField("lastName", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Age (years)</label>
                            <Input
                              type="number"
                              min="0"
                              max="150"
                              value={editForm.age}
                              onChange={(e) => updateEditField("age", e.target.value)}
                            />
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
                            <Input
                              type="email"
                              value={editForm.email || ""}
                              onChange={(e) => updateEditField("email", e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium">Address</label>
                            <Input
                              value={editForm.address}
                              onChange={(e) => updateEditField("address", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Blood Type</label>
                            <Input
                              value={editForm.bloodType || ""}
                              onChange={(e) => updateEditField("bloodType", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Allergies</label>
                            <Input
                              value={editForm.allergies || ""}
                              onChange={(e) => updateEditField("allergies", e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium">Medical History</label>
                            <Input
                              value={editForm.medicalHistory || ""}
                              onChange={(e) => updateEditField("medicalHistory", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={saveEditedPatient} className="flex-1">
                            Save
                          </Button>
                          <Button variant="outline" onClick={cancelEdit} className="flex-1 bg-transparent">
                            Cancel
                          </Button>
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
                      {selectedPatient?.firstName} {selectedPatient?.lastName} - Age: {selectedPatient?.age} years - ID:{" "}
                      {selectedPatient?.id}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-800 dark:text-blue-400"
                      onClick={printDocument}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMedicationModal(false)}
                      className="no-print"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
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
                            {prescription.medications.map((medication, index) => {
                              const category = getMedicineCategory(medication.name)
                              return (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-semibold text-base lg:text-lg text-gray-900 dark:text-white">
                                      {medication.name}
                                    </h4>
                                    <Badge
                                      className="text-xs text-white font-medium"
                                      style={{ backgroundColor: category.color }}
                                    >
                                      {category.category}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2 text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                                    <p>{medication.instructions || medication.frequency.join(", ")}</p>
                                    <p>
                                      <strong>Duration:</strong> {medication.duration}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
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

        {/* Print Preview Modal */}
        {showPrintPreview && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Print Preview - Patient Report</h2>
                  <div className="flex items-center space-x-2">
                    <Button onClick={printDocument} className="bg-blue-600 hover:bg-blue-700">
                      <Printer className="h-4 w-4 mr-2" />
                      Print Document
                    </Button>
                    <Button variant="outline" onClick={() => setShowPrintPreview(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-6 bg-white">
                  {/* Preview Header */}
                  <div className="text-center mb-6 p-4 border-2 border-blue-600 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h1 className="text-2xl font-bold text-blue-700 mb-2">GOSAI CLINIC</h1>
                    <p className="text-sm text-gray-600 italic">Complete Healthcare Solutions</p>
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-300">
                      📍 Opp. Taluka Panchayat, Shiv Nagar, Bhanvad, Gujarat 360510 | 📞 9426953220
                    </div>
                  </div>

                  {/* Patient Info Preview */}
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-bold text-blue-700 mb-3 border-b-2 border-blue-600 pb-1">
                      📋 Patient Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="mb-2">
                          <strong>Name:</strong> {selectedPatient.firstName} {selectedPatient.lastName}
                        </div>
                        <div className="mb-2">
                          <strong>ID:</strong> {selectedPatient.id}
                        </div>
                        <div className="mb-2">
                          <strong>Age:</strong> {selectedPatient.age} years
                        </div>
                        <div className="mb-2">
                          <strong>Gender:</strong> {selectedPatient.gender}
                        </div>
                      </div>
                      <div>
                        <div className="mb-2">
                          <strong>Phone:</strong> {selectedPatient.phone}
                        </div>
                        <div className="mb-2">
                          <strong>Address:</strong> {selectedPatient.address}
                        </div>
                        <div className="mb-2">
                          <strong>Date:</strong> {new Date().toLocaleDateString("en-US")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medications Preview */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Prescribed Medications</h2>
                    {selectedPatientMedications.length === 0 ? (
                      <div className="text-center p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-600">No medications prescribed</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedPatientMedications.map((prescription, prescIndex) =>
                          prescription.medications.map((medication, medIndex) => {
                            const category = getMedicineCategory(medication.name)
                            return (
                              <div key={`${prescIndex}-${medIndex}`} className="border-b pb-4 last:border-b-0">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-base">{medication.name}</h3>
                                  <span
                                    className="text-xs px-2 py-1 rounded text-white font-medium"
                                    style={{ backgroundColor: category.color }}
                                  >
                                    {category.category}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  {medication.instructions || medication.frequency.join(", ")}
                                </p>
                                <p className="text-sm text-gray-600">Duration: {medication.duration}</p>
                              </div>
                            )
                          }),
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-center text-xs text-gray-500 border-t pt-3">
                    <strong>GOSAI CLINIC</strong> - Your Health, Our Priority | Confidential Medical Document
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
