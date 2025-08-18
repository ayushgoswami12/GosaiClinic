"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Users, Download, Edit, Phone, MapPin, Calendar, Pill, X, Printer } from "lucide-react"
import * as XLSX from "xlsx"

interface Patient {
  id: string
  firstName: string
  lastName: string
  age: string
  gender: string
  phone: string
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
        patient.phone.includes(searchTerm) ||
        patient.age.includes(searchTerm)
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

    // Get all prescriptions from localStorage
    const storedPrescriptions = localStorage.getItem("prescriptions")
    const allPrescriptions: Prescription[] = storedPrescriptions ? JSON.parse(storedPrescriptions) : []

    // Create export data with only required fields
    const exportData: any[] = []

    // Process all patients regardless of whether they have medications
    patients.forEach((patient) => {
      // Find all prescriptions for this patient
      const patientPrescriptions = allPrescriptions.filter((p) => p.patientId === patient.id)

      // Extract all medications for this patient
      const medications: string[] = []
      patientPrescriptions.forEach((prescription) => {
        prescription.medications.forEach((medication) => {
          medications.push(medication.name)
        })
      })

      // Create a row with only the required fields
      exportData.push({
        Name: `${patient.firstName} ${patient.lastName}`,
        Age: patient.age,
        Gender: patient.gender,
        Place: patient.address,
        "Ph No": patient.phone,
        Complain: patient.medicalHistory || "None reported",
        Reports: patient.allergies || "None",
        Treatment: medications.join(", ") || "None",
      })
    })

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
    if (printWindow) {
      printWindow.document.write(generatePrintHTML())
      printWindow.document.close()
      printWindow.focus()

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const generatePrintHTML = () => {
    if (!selectedPatient) return ""

    const prescriptionGroups: Array<{ prescription: Prescription; medications: Medication[] }> = []
    selectedPatientMedications.forEach((prescription) => {
      prescriptionGroups.push({
        prescription,
        medications: prescription.medications,
      })
    })

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Patient  - ${selectedPatient.firstName} ${selectedPatient.lastName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 10pt;
            line-height: 1.3;
            color: #333;
            background: white;
            padding: 10px;
            max-width: 210mm;
            margin: 0 auto;
        }
        
        .clinic-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 10px;
            border-bottom: 2px solid #3b82f6;
            margin-bottom: 10px;
        }
        
        .clinic-branding {
            display: flex;
            flex-direction: column;
        }
        
        .clinic-title {
            font-size: 18pt;
            font-weight: bold;
            color: #1e40af;
            line-height: 1;
        }
        
        .clinic-subtitle {
            font-size: 9pt;
            color: #6b7280;
            font-style: italic;
        }
        
        .clinic-contact {
            font-size: 8pt;
            color: #6b7280;
            text-align: right;
        }
        
        .patient-card {
            display: flex;
            justify-content: space-between;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 8px;
            margin-bottom: 10px;
        }
        
        .patient-primary-info {
            flex: 1;
        }
        
        .patient-name {
            font-size: 12pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 2px;
        }
        
        .patient-id {
            font-size: 8pt;
            color: #6b7280;
            margin-bottom: 5px;
        }
        
        .patient-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5px;
            font-size: 8pt;
        }
        
        .detail-item {
            display: flex;
            align-items: baseline;
        }
        
        .detail-label {
            font-weight: bold;
            color: #6b7280;
            margin-right: 4px;
        }
        
        .detail-value {
            color: #1f2937;
        }
        
        .detail-highlight {
            font-weight: bold;
            color: #1e40af;
            display: inline-block;
            margin-left: 5px;
        }
        
        .medications-section {
            margin-top: 10px;
        }
        
        .section-title {
            font-size: 11pt;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
            padding-bottom: 3px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .medication-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
            margin-bottom: 8px;
        }
        
        .medication-table th {
            background: #f1f5f9;
            color: #1f2937;
            font-weight: bold;
            text-align: left;
            padding: 4px;
            border: 1px solid #e2e8f0;
        }
        
        .medication-table td {
            padding: 4px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
        }
        
        .medication-table tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .medication-name {
            font-weight: bold;
            color: #1f2937;
            font-size: 9pt;
        }
        
        .medication-dose {
            color: #059669;
            font-size: 8pt;
        }
        
        .medication-qty {
            color: #dc2626;
            font-size: 8pt;
            text-align: center;
        }
        
        .no-medications {
            text-align: center;
            padding: 30px;
            color: #6b7280;
            font-style: italic;
            font-size: 10pt;
            background-color: #f9fafb;
            border-radius: 4px;
            margin: 10px 0;
        }
        
        .prescription-info {
            display: flex;
            justify-content: space-between;
            font-size: 8pt;
            margin: 5px 0;
            padding: 4px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
        }
        
        .doctor-info {
            display: flex;
            align-items: center;
        }
        
        .doctor-name {
            font-weight: bold;
            margin-right: 5px;
            font-size: 9pt;
            color: #1e40af;
        }
        
        .prescription-date {
            color: #6b7280;
            font-size: 8pt;
        }
        
        .diagnosis-section {
            font-size: 8pt;
            padding: 4px;
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 4px;
            margin-bottom: 5px;
        }
        
        .diagnosis-title {
            font-weight: bold;
            color: #92400e;
            display: inline;
            margin-right: 5px;
        }
        
        .diagnosis-content {
            color: #78350f;
            display: inline;
        }
        
        .fee-section {
            text-align: right;
            font-weight: bold;
            font-size: 10pt;
            margin-top: 5px;
            padding: 4px;
            border-top: 1px solid #e2e8f0;
        }
        
        .page-footer {
            margin-top: 10px;
            text-align: center;
            font-size: 7pt;
            color: #9ca3af;
            border-top: 1px solid #e2e8f0;
            padding-top: 5px;
        }
        
        .print-date {
            font-size: 7pt;
            color: #6b7280;
            text-align: right;
            margin-bottom: 5px;
        }
        
        @media print {
            body { 
                margin: 0; 
                padding: 5px; 
            }
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            table { page-break-inside: avoid; }
            tr { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="clinic-header">
        <div class="clinic-branding">
            <div class="clinic-title">GOSAI CLINIC</div>
            <div class="clinic-subtitle">Complete Healthcare Solutions</div>
        </div>
        <div class="clinic-contact">
            <div>📍 Opp. Taluka Panchayat, Shiv Nagar, Bhanvad, Gujarat 360510</div>
            <div>📞 9426953220</div>
        </div>
    </div>
    
    <div class="print-date">
        Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })} ${new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
    </div>
    
    <div class="patient-card">
        <div class="patient-primary-info">
            <div class="patient-name">${selectedPatient.firstName} ${selectedPatient.lastName}</div>
            <div class="patient-id">ID: ${selectedPatient.id}</div>
            
            <div class="patient-details">
                <div class="detail-item">
                    <span class="detail-label">Age:</span>
                    <span class="detail-value">${selectedPatient.age} yrs</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Gender:</span>
                    <span class="detail-value">${selectedPatient.gender?.charAt(0).toUpperCase() + selectedPatient.gender?.slice(1) || "Not specified"}</span>
                </div>
                ${
                  selectedPatient.bloodType
                    ? `
                <div class="detail-item">
                    <span class="detail-label">Blood:</span>
                    <span class="detail-value" style="color: #dc2626; font-weight: bold;">${selectedPatient.bloodType}</span>
                </div>
                `
                    : ""
                }
                <div class="detail-item">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${selectedPatient.phone}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${selectedPatient.address}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Visit:</span>
                    <span class="detail-value">${selectedPatient.dateOfVisit || "Not specified"}</span>
                </div>
            </div>
        </div>
    </div>
        
    ${
      selectedPatient.allergies
        ? `
    <div class="diagnosis-section" style="background: #fee2e2; border-color: #ef4444;">
        <span class="diagnosis-title" style="color: #dc2626;">⚠️ Allergies:</span>
        <span class="diagnosis-content" style="color: #991b1b;">${selectedPatient.allergies}</span>
    </div>
    `
        : ""
    }
    
    ${
      selectedPatient.medicalHistory
        ? `
    <div class="diagnosis-section" style="background: #f0f9ff; border-color: #0ea5e9;">
        <span class="diagnosis-title" style="color: #0c4a6e;">Medical History:</span>
        <span class="diagnosis-content" style="color: #075985;">${selectedPatient.medicalHistory}</span>
    </div>
    `
        : ""
    }
    </div>
    
    <div class="medications-section">
        <div class="section-title">Prescribed Medications</div>
        
        ${
          prescriptionGroups.length > 0
            ? prescriptionGroups
                .map(
                  (group, index) => `
            ${
              group.prescription.diagnosis
                ? `
            <div class="diagnosis-section">
                <span class="diagnosis-title">Diagnosis:</span>
                <span class="diagnosis-content">${group.prescription.diagnosis}</span>
            </div>
            `
                : ""
            }
            
            <div class="prescription-info">
                <div class="doctor-info">
                    <span class="doctor-name">${
                      group.prescription.doctorName?.startsWith("Dr.")
                        ? group.prescription.doctorName
                        : `Dr. ${group.prescription.doctorName || "Not Specified"}`
                    }</span>
                    <span class="prescription-date">Prescribed: ${group.prescription.prescriptionDate || "Date not specified"}</span>
                </div>
            </div>
            
            ${
              group.prescription.investigation
                ? `
            <div class="diagnosis-section" style="background: #f0fdf4; border-color: #22c55e;">
                <span class="diagnosis-title" style="color: #15803d;">Investigation:</span>
                <span class="diagnosis-content" style="color: #166534;">${group.prescription.investigation}</span>
            </div>
            `
                : ""
            }
            
            <table class="medication-table">
                <thead>
                    <tr>
                        <th style="width: 8%;">No</th>
                        <th style="width: 45%;">Medicine</th>
                        <th style="width: 30%;">Dosage</th>
                        <th style="width: 17%;">Qty</th>
                    </tr>
                </thead>
                <tbody>
                    ${group.medications
                      .map(
                        (medication, medIndex) => `
                        <tr>
                            <td style="text-align: center;">${medIndex + 1}</td>
                            <td>
                                <div class="medication-name">${medication.name}</div>
                            </td>
                            <td>
                                <div class="medication-dose">${medication.dose || "As directed"}</div>
                            </td>
                            <td>
                                <div class="medication-qty">${medication.qty || "As needed"}</div>
                            </td>
                        </tr>
                    `,
                      )
                      .join("")}
                    </tbody>
                </table>
                
                ${
                  group.prescription.fee
                    ? `
                <div class="fee-section">
                    <span class="diagnosis-title" style="color: #92400e;">Consultation Fee:</span>
                    <span class="diagnosis-content" style="color: #92400e; font-weight: 600;">₹${group.prescription.fee}</span>
                </div>
                `
                    : ""
                }
                
                ${
                  group.prescription.notes
                    ? `
                <div class="diagnosis-section" style="background: #f3f4f6; border-color: #6b7280;">
                    <span class="diagnosis-title" style="color: #374151;">Notes:</span>
                    <span class="diagnosis-content" style="color: #4b5563;">${group.prescription.notes}</span>
                </div>
                `
                    : ""
                }
            </div>
        `,
                )
                .join("")
            : `
            <div class="no-medications">
                <div>No medications prescribed for this patient</div>
                <div style="font-size: 9pt; margin-top: 5px; color: #9ca3af;">Please consult with the doctor for medical advice</div>
            </div>
        `
        }
    </div>
    
    <div class="page-footer">
        <div><strong>GOSAI CLINIC</strong> - Your Trusted Healthcare Partner</div>
        <div style="font-size: 8pt;">This is a computer-generated report. For queries, contact: 9426953220</div>
        <div style="font-size: 8pt;">Report ID: ${selectedPatient.id}-${Date.now()}</div>
    </div>
</body>
</html>`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
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
            <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <div className="flex flex-col space-y-4">
                  <div>
                    <CardTitle className="text-lg lg:text-xl dark:text-white">Patient Database</CardTitle>
                    <CardDescription className="text-sm lg:text-base dark:text-gray-300">
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
                                  <strong>Age:</strong> {patient.age} years
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
            <Card className="lg:sticky lg:top-8 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl dark:text-white">Patient Details</CardTitle>
                <CardDescription className="text-sm lg:text-base dark:text-gray-300">
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
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 lg:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[95vh] lg:max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-xl">
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
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-800/40 dark:text-blue-300 dark:border-blue-800/50"
                      onClick={printDocument}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMedicationModal(false)}
                      className="no-print dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedPatientMedications.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Pill className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No medications found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      This patient has no prescription history yet
                    </p>
                    <Button asChild className="dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white">
                      <a href="/prescriptions">Create New Prescription</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedPatientMedications.map((prescription) => (
                      <Card
                        key={prescription.id}
                        className="border-l-4 border-l-green-500 dark:border-l-green-600 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg lg:text-xl dark:text-white">
                                Prescription #{prescription.id}
                              </CardTitle>
                              <CardDescription className="dark:text-gray-300">
                                Prescribed by {prescription.doctorName} on{" "}
                                {new Date(prescription.date).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
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
                                <div
                                  key={index}
                                  className="p-4 bg-gray-50 dark:bg-gray-700/80 rounded-lg border border-gray-200 dark:border-gray-600"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-semibold text-base lg:text-lg text-gray-900 dark:text-white">
                                      {medication.name}
                                    </h4>
                                    <Badge
                                      className="text-xs text-white font-medium dark:bg-opacity-80 dark:border dark:border-opacity-30"
                                      style={{ backgroundColor: category.color }}
                                    >
                                      {category.category}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2 text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                                    {medication.instructions && <p>{medication.instructions}</p>}
                                    <p>
                                      <strong>Frequency:</strong>{" "}
                                      {Array.isArray(medication.frequency)
                                        ? medication.frequency.join(", ")
                                        : medication.frequency || "Not specified"}
                                    </p>
                                    <p>
                                      <strong>Duration:</strong> {medication.duration}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                            {prescription.notes && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
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
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Print Preview</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Patient Report - {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 ml-8">
                    <Button
                      onClick={printDocument}
                      className="bg-blue-600 hover:bg-blue-700 px-6 py-2 text-sm dark:bg-blue-700 dark:hover:bg-blue-800 shadow-lg"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Document
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPrintPreview(false)}
                      className="p-2.5 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 border-gray-300 ml-2"
                      aria-label="Close print preview"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
                <div
                  className="active-print p-8 bg-white text-black"
                  dangerouslySetInnerHTML={{ __html: generatePrintHTML() }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
