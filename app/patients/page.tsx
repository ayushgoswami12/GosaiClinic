"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
  Search,
  Filter,
  Users,
  Edit,
  Phone,
  MapPin,
  Calendar,
  Pill,
  X,
  Printer,
  FileSpreadsheet,
  Clock,
  AlertCircle,
  User,
  ClipboardList,
  FileText,
  FilePlus,
} from "lucide-react"

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
  images?: string[] // newly added
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
  investigation?: string
  diagnosis?: string
  prescriptionDate?: string
  fee?: string
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

  // Excel export feature
  const exportToExcel = () => {
    if (patients.length === 0) return

    // Import xlsx dynamically to avoid SSR issues
    import("xlsx").then((XLSX) => {
      // Prepare data for export
      const data = filteredPatients.map((patient) => {
        // Get medications for this patient
        const patientPrescriptions = getMedicationsForPatient(patient.id)

        // Extract all medication names from prescriptions
        const medicationNames: string[] = []
        patientPrescriptions.forEach((prescription) => {
          prescription.medications.forEach((medication) => {
            medicationNames.push(medication.name)
          })
        })

        // Join medication names with commas
        const treatmentText = medicationNames.length > 0 ? medicationNames.join(", ") : "None"

        // Get investigation reports from prescriptions if available
        const investigationReports: string[] = []

        // Reuse the same patientPrescriptions variable we already have
        patientPrescriptions.forEach((prescription) => {
          if (prescription.investigation && prescription.investigation.trim() !== "") {
            investigationReports.push(prescription.investigation)
          }
        })

        const investigationText = investigationReports.length > 0 ? investigationReports.join(", ") : "None"

        return {
          Name: `${patient.firstName} ${patient.lastName}`,
          Age: patient.age,
          Gender: patient.gender,
          Place: patient.address,
          "Ph No": patient.phone,
          Complain: patient.medicalHistory || "None reported",
          Reports: investigationText,
          Treatment: treatmentText,
        }
      })

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(data)

      // Create workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Patients")

      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, "Patients_List.xlsx")
    })
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

  const getVisitCountForPatient = (patientId: string): number => {
    const storedVisits = localStorage.getItem("visits")
    if (storedVisits) {
      const visits = JSON.parse(storedVisits)
      const count = visits.filter((visit: any) => visit.patientId === patientId).length
      return count + 1
    }
    return 1
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

    // Consolidate all medications into a single array
    const allMedications: Medication[] = []
    const latestPrescription =
      selectedPatientMedications.length > 0 ? selectedPatientMedications[selectedPatientMedications.length - 1] : null

    // Add all medications from all prescriptions to a single array
    selectedPatientMedications.forEach((prescription) => {
      prescription.medications.forEach((medication) => {
        // Check if medication already exists to avoid duplicates
        if (!allMedications.some((med) => med.name === medication.name && med.dose === medication.dose)) {
          allMedications.push(medication)
        }
      })
    })

    const patientImages: string[] = Array.isArray((selectedPatient as any).images)
      ? (selectedPatient as any).images
      : []

    const imagePages: string[][] = []
    for (let i = 0; i < patientImages.length; i += 4) {
      imagePages.push(patientImages.slice(i, i + 4))
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Patient Bill - ${selectedPatient.firstName} ${selectedPatient.lastName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #333;
            background: white;
            padding: 15px;
            max-width: 210mm;
            margin: 0 auto;
        }
        
        .clinic-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            border-bottom: 2px solid #3b82f6;
            margin-bottom: 15px;
            background-color: #f8fafc;
            border-radius: 6px 6px 0 0;
        }
        
        .clinic-branding {
            display: flex;
            flex-direction: column;
        }
        
        .clinic-title {
            font-size: 20pt;
            font-weight: bold;
            color: #1e40af;
            line-height: 1.1;
            letter-spacing: -0.5px;
        }
        
        .clinic-subtitle {
            font-size: 10pt;
            color: #6b7280;
            font-style: italic;
            margin-top: 2px;
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
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .patient-primary-info {
            flex: 1;
        }
        
        .patient-name {
            font-size: 14pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 4px;
            letter-spacing: -0.3px;
        }
        
        .patient-id {
            font-size: 9pt;
            color: #6b7280;
            margin-bottom: 8px;
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
            font-size: 12pt;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e5e7eb;
            letter-spacing: -0.3px;
        }
        
        .medication-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
            margin-bottom: 15px;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .medication-table th {
            background: #f1f5f9;
            color: #1e40af;
            font-weight: bold;
            text-align: left;
            padding: 8px 10px;
            border: 1px solid #e2e8f0;
        }
        
        .medication-table td {
            padding: 8px 10px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
        }
        
        .medication-table tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .medication-name {
            font-weight: bold;
            color: #1f2937;
            font-size: 10pt;
        }
        
        .medication-dose {
            color: #059669;
            font-size: 9pt;
            font-weight: 500;
        }
        
        .medication-qty {
            color: #dc2626;
            font-size: 9pt;
            text-align: center;
            font-weight: 500;
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
            font-size: 9pt;
            margin: 10px 0;
            padding: 10px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .doctor-info {
            display: flex;
            align-items: center;
        }
        
        .doctor-name {
            font-weight: bold;
            margin-right: 8px;
            font-size: 10pt;
            color: #1e40af;
        }
        
        .prescription-date {
            color: #6b7280;
            font-size: 9pt;
        }
        
        .diagnosis-section {
            font-size: 9pt;
            padding: 10px 15px;
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            margin-bottom: 12px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .diagnosis-title {
            font-weight: bold;
            color: #92400e;
            display: inline;
            margin-right: 8px;
            font-size: 9pt;
        }
        
        .diagnosis-content {
            color: #78350f;
            display: inline;
            font-size: 9pt;
        }
        
        .fee-section {
            text-align: right;
            font-weight: bold;
            font-size: 11pt;
            margin-top: 10px;
            padding: 8px 10px;
            border-top: 2px solid #e2e8f0;
            color: #1e40af;
        }
        
        .page-footer {
            margin-top: 20px;
            text-align: center;
            font-size: 8pt;
            color: #9ca3af;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
        }
        
        .print-date {
            font-size: 8pt;
            color: #6b7280;
            text-align: right;
            margin-bottom: 10px;
            font-style: italic;
        }

        /* images print styles: 2x2 grid, each group on a new page */
        .images-section {
          margin-top: 12px;
        }

        .images-title {
          font-size: 12pt;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 8px;
          padding-bottom: 5px;
          border-bottom: 2px solid #e5e7eb;
          letter-spacing: -0.3px;
        }

        /* New 2-column grid to yield 4 images per page (2x2) */
        .images-grid-4 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          page-break-inside: avoid;
        }

        .image-item {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 6px;
          background: #fff;
          page-break-inside: avoid;
        }

        .image-item img {
          width: 100%;
          height: auto;
          object-fit: contain;
          border-radius: 4px;
        }

        /* Force images to start on a new page */
        .images-break-page {
          page-break-before: always;
          break-before: page;
        }
        
        @media print {
            body { 
                margin: 0; 
                padding: 10px; 
            }
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            table { page-break-inside: avoid; }
            tr { page-break-inside: avoid; }
            .clinic-header { box-shadow: none; }
            .patient-card { box-shadow: none; }
            .medication-table { box-shadow: none; }
            .diagnosis-section { box-shadow: none; }
            .prescription-info { box-shadow: none; }
            /* ensure each images page starts on a new page and avoids breaking items */
            .images-grid-4 { page-break-inside: avoid; }
            .image-item { page-break-inside: avoid; }
            .images-break-page {
              page-break-before: always;
              break-before: page;
            }
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
          latestPrescription
            ? `
            ${
              latestPrescription.diagnosis
                ? `
            <div class="diagnosis-section">
                <span class="diagnosis-title">Diagnosis:</span>
                <span class="diagnosis-content">${latestPrescription.diagnosis}</span>
            </div>
            `
                : ""
            }
            
            <div class="prescription-info">
                <div class="doctor-info">
                    <span class="doctor-name">Dr. ${latestPrescription.doctorName || "Not Specified"}</span>
                    <span class="prescription-date">Prescribed: ${latestPrescription.prescriptionDate || "Date not specified"}</span>
                </div>
            </div>
            
            ${
              latestPrescription.investigation
                ? `
            <div class="diagnosis-section" style="background: #f0fdf4; border-color: #22c55e; padding: 12px 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <span class="diagnosis-title" style="color: #15803d; font-size: 9pt; margin-right: 8px;">Investigation:</span>
                <span class="diagnosis-content" style="color: #166534; font-size: 9pt;">${latestPrescription.investigation}</span>
            </div>
            `
                : ""
            }
            
            <table class="medication-table">
                <thead>
                    <tr>
                        <th style="width: 8%;">No</th>
                        <th style="width: 50%;">Medicine</th>
                        <th style="width: 32%;">Dosage</th>
                        <th style="width: 10%;">Qty</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                      allMedications.length > 0
                        ? allMedications
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
                            .join("")
                        : `<tr><td colspan="4" style="text-align: center; padding: 10px;">No medications found</td></tr>`
                    }
                </tbody>
            </table>
                
            ${
              latestPrescription.fee
                ? `
            <div class="fee-section">
                <span class="diagnosis-title" style="color: #92400e;">Consultation Fee:</span>
                <span class="diagnosis-content" style="color: #92400e; font-weight: 600;">₹${latestPrescription.fee}</span>
            </div>
            `
                : ""
            }
                
            ${
              latestPrescription.notes
                ? `
            <div class="diagnosis-section" style="background: #f3f4f6; border-color: #6b7280;">
                <span class="diagnosis-title" style="color: #374151;">Notes:</span>
                <span class="diagnosis-content" style="color: #4b5563;">${latestPrescription.notes}</span>
            </div>
            `
                : ""
            }
        `
            : `
            <div class="no-medications" style="text-align: center; padding: 15px; color: #6b7280; font-style: italic; font-size: 9pt; border: 1px dashed #e2e8f0; border-radius: 6px; margin: 10px 0;">
                <div>No medications prescribed for this patient</div>
                <div style="font-size: 9pt; margin-top: 5px; color: #9ca3af;">Please consult with the doctor for medical advice</div>
            </div>
        `
        }
    </div>
    
    ${
      imagePages.length > 0
        ? `
          ${imagePages
            .map(
              (page, pageIndex) => `
            <div class="images-section images-break-page">
              ${pageIndex === 0 ? `<div class="images-title">Attached Reports / Images</div>` : ``}
              <div class="images-grid-4">
                ${page
                  .map(
                    (src, i) => `
                  <div class="image-item">
                    <img src="${src}" alt="Patient report ${pageIndex * 4 + i + 1}" crossOrigin="anonymous" />
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>
          `,
            )
            .join("")}
        `
        : ""
    }

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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 lg:py-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-500" />
                <span>All Patients - GOSAI CLINIC</span>
              </h1>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-2">
                Total registered patients:{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-500">{patients.length}</span>
              </p>
            </div>
            <Button
              onClick={exportToExcel}
              className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export to Excel</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
                      <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500" />
                      <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full text-sm h-9"
                      />
                    </div>
                    <Select value={genderFilter} onValueChange={setGenderFilter}>
                      <SelectTrigger className="w-full sm:w-32 h-9 text-xs sm:text-sm">
                        <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-400 dark:text-gray-500" />
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
                      const visitCount = getVisitCountForPatient(patient.id)

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
                          <div className="flex flex-col sm:flex-row sm:items-start lg:items-center lg:justify-between space-y-3 sm:space-y-0">
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
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 text-xs">
                                    {visitCount} {visitCount === 1 ? "Visit" : "Visits"}
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
                            <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
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
                                asChild
                              >
                                <Link href={`/patients/register?id=${patient.id}`}>
                                  <Edit className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                                  <span className="text-xs lg:text-sm">Edit</span>
                                </Link>
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
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
                <CardTitle className="text-base sm:text-lg lg:text-xl dark:text-white">Patient Details</CardTitle>
                <CardDescription className="text-xs sm:text-sm lg:text-base dark:text-gray-300">
                  {selectedPatient ? "Detailed information" : "Select a patient to view details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 py-3 sm:px-6 sm:py-5">
                {selectedPatient ? (
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {!isEditing && (
                      <>
                        <div>
                          <h4 className="font-semibold text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">
                            {selectedPatient.firstName} {selectedPatient.lastName}
                          </h4>
                          <div className="space-y-1.5 sm:space-y-2 text-xs lg:text-sm">
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
                          <h5 className="font-medium mb-1.5 sm:mb-2 text-xs sm:text-sm lg:text-base">
                            Contact Information
                          </h5>
                          <div className="space-y-1.5 sm:space-y-2 text-xs lg:text-sm">
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
                          <h5 className="font-medium mb-1.5 sm:mb-2 text-xs sm:text-sm lg:text-base">
                            Medical Information
                          </h5>
                          <div className="space-y-1.5 sm:space-y-2 text-xs lg:text-sm">
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
                          <Button className="w-full h-8 sm:h-9 text-xs sm:text-sm" asChild>
                            <a href={`/appointments/book?patientId=${selectedPatient.id}`}>
                              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                              Schedule Appointment
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full bg-transparent dark:bg-transparent h-8 sm:h-9 text-xs sm:text-sm"
                            asChild
                          >
                            <Link href={`/patients/register?id=${selectedPatient.id}`}>
                              <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                              Update Information
                            </Link>
                          </Button>
                          <Button
                            variant="secondary"
                            className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                            onClick={() => handlePrintPatient(selectedPatient)}
                          >
                            <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
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
          <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-2 lg:p-4 transition-all duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[95vh] lg:max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl transform transition-all duration-300">
              <div className="p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 space-y-2 sm:space-y-0">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                      <Pill className="h-6 w-6 lg:h-7 lg:w-7 mr-3 text-green-600 dark:text-green-500" />
                      <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Medication History
                      </span>
                    </h2>
                    <div className="mt-2 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 font-medium">
                        {selectedPatient?.firstName} {selectedPatient?.lastName}{" "}
                        <span className="text-gray-400 dark:text-gray-500">•</span> Age: {selectedPatient?.age}{" "}
                        <span className="text-gray-400 dark:text-gray-500">•</span> ID: {selectedPatient?.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-800/40 dark:text-blue-300 dark:border-blue-800/50 transition-all duration-200 shadow-sm hover:shadow"
                      onClick={printDocument}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMedicationModal(false)}
                      className="no-print dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-100 transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedPatientMedications.length === 0 ? (
                  <div className="text-center py-16 px-6 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 shadow-inner">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <Pill className="h-10 w-10 text-green-500 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">No medications found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      This patient has no prescription history yet. You can create a new prescription to add
                      medications.
                    </p>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <a href="/prescriptions">
                        <FilePlus className="h-4 w-4 mr-2" />
                        Create New Prescription
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <ClipboardList className="h-4 w-4 mr-2 opacity-70" />
                        Total Prescriptions: {selectedPatientMedications.length}
                      </h3>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last updated:{" "}
                        {new Date(
                          Math.max(...selectedPatientMedications.map((p) => new Date(p.date).getTime())),
                        ).toLocaleDateString()}
                      </div>
                    </div>

                    {selectedPatientMedications.map((prescription) => (
                      <Card
                        key={prescription.id}
                        className="border-l-4 border-l-green-500 dark:border-l-green-600 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden"
                      >
                        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 pb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg lg:text-xl dark:text-white flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-green-600 dark:text-green-500" />
                                Prescription #{prescription.id.slice(-4)}
                              </CardTitle>
                              <CardDescription className="dark:text-gray-300 mt-1 flex items-center">
                                <User className="h-3.5 w-3.5 mr-1.5 text-gray-400 dark:text-gray-500" />
                                Dr. {prescription.doctorName}
                                <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                                <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400 dark:text-gray-500" />
                                {new Date(prescription.date).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full">
                              {prescription.medications.length} medication
                              {prescription.medications.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-5">
                          <div className="space-y-4">
                            {prescription.medications.map((medication, index) => {
                              const category = getMedicineCategory(medication.name)
                              return (
                                <div
                                  key={index}
                                  className="p-5 bg-white dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-green-200 dark:hover:border-green-800/30 transition-all duration-200 shadow-sm hover:shadow"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-semibold text-base lg:text-lg text-gray-900 dark:text-white flex items-center">
                                      <span
                                        className="w-2 h-2 rounded-full mr-2"
                                        style={{ backgroundColor: category.color }}
                                      ></span>
                                      {medication.name}
                                    </h4>
                                    <Badge
                                      className="text-xs text-white font-medium dark:bg-opacity-80 dark:border dark:border-opacity-30 px-2.5 py-0.5 rounded-full shadow-sm"
                                      style={{ backgroundColor: category.color }}
                                    >
                                      {category.category}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-1 gap-3 text-xs lg:text-sm text-gray-600 dark:text-gray-300 mt-4">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                      <div className="flex items-center mb-2">
                                        <Clock className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 mr-1.5" />
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                          Dosage Schedule
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-2 mb-2">
                                        {Array.isArray(medication.frequency) &&
                                          medication.frequency.map((freq, i) => (
                                            <span
                                              key={i}
                                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                            >
                                              {freq}
                                            </span>
                                          ))}
                                        {(!Array.isArray(medication.frequency) ||
                                          medication.frequency.length === 0) && (
                                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                                            No frequency specified
                                          </span>
                                        )}
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex items-center">
                                          <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span>
                                          <span className="text-gray-500 dark:text-gray-400">Dosage:</span>
                                          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                                            {medication.dosage || "Not specified"}
                                          </span>
                                        </div>
                                        <div className="flex items-center">
                                          <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
                                          <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                                          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                                            {medication.duration || "Not specified"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {medication.instructions && (
                                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                        <div className="flex items-center mb-1.5">
                                          <AlertCircle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 mr-1.5" />
                                          <span className="font-medium text-amber-700 dark:text-amber-400">
                                            Special Instructions
                                          </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">{medication.instructions}</p>
                                      </div>
                                    )}
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
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl">
              <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Print Preview</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Patient Report - {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <Button
                      onClick={printDocument}
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-base rounded-lg dark:bg-blue-700 dark:hover:bg-blue-800 shadow-lg transition-all duration-200"
                    >
                      <Printer className="h-5 w-5 mr-3" />
                      Print Document
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPrintPreview(false)}
                      className="p-3 rounded-lg dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
                <div className="p-8 md:p-12 lg:p-16">
                  <div
                    className="active-print bg-white text-black rounded-lg shadow-sm border border-gray-100 p-8 md:p-12"
                    dangerouslySetInnerHTML={{ __html: generatePrintHTML() }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
