"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Search,
  Plus,
  Eye,
  UserCheck,
  Pill,
  ChevronDown,
  ChevronUp,
  Trash2,
  Languages,
  Printer,
  X,
} from "lucide-react"
import Link from "next/link"
import { MedicineAutocomplete } from "@/components/ui/medicine-autocomplete"

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

interface MedicationEntry {
  id: string
  name: string
  dose: string
  qty: string
}

interface Visit {
  id: string
  patientId: string
  patientName: string
  visitDate: string
  visitTime: string
  visitType: string
  diagnosis: string
  symptoms: string
  treatment: string
  followUpDate?: string
  doctorName: string
  fee: string
  status: "completed" | "in-progress" | "scheduled"
  notes: string
  createdAt: string
  prescriptionId?: string
  medications?: MedicationEntry[]
  investigation?: string
  prescriptionNotes?: string
}

export default function VisitsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showNewVisitForm, setShowNewVisitForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [showVisitDetails, setShowVisitDetails] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [selectedVisitForPrint, setSelectedVisitForPrint] = useState<Visit | null>(null)

  const [showPrescription, setShowPrescription] = useState(false)
  const [investigation, setInvestigation] = useState("")
  const [prescriptionNotes, setPrescriptionNotes] = useState("")
  const [medicationTable, setMedicationTable] = useState<MedicationEntry[]>([])
  const [currentMedication, setCurrentMedication] = useState({
    name: "",
    dose: "",
    qty: "",
  })
  const [customDose, setCustomDose] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)

  const [visitForm, setVisitForm] = useState({
    visitDate: new Date().toISOString().split("T")[0],
    visitTime: new Date().toTimeString().slice(0, 5),
    visitType: "",
    diagnosis: "",
    symptoms: "",
    treatment: "",
    followUpDate: "",
    doctorName: "",
    fee: "",
    status: "in-progress" as const,
    notes: "",
  })

  const doctors = ["Dr. Tansukh Gosai", "Dr. Devang Gosai", "Dr. Dhara Gosai"]
  const visitTypes = [
    "Follow-up",
    "Routine Check-up",
    "Emergency",
    "Consultation",
    "Treatment",
    "Diagnostic",
    "Vaccination",
    "Other",
  ]

  const frequencyOptions = [
    "સવારે ભૂખ્યા પેટે ",
    "સવારે જમીને",
    "સવાર સાંજ ભૂખ્યા પેટે",
    "સવાર બપોરે સાંજ ભૂખ્યા પેટે",
    "બપોરે ભૂખ્યા પેટે",
    "બપોરે જમીને",
    "સવાર સાંજ જમીને ",
    "સવાર બપોરે સાંજ જમીને",
    "રાત્રે  ભૂખ્યા પેટે",
    "રાત્રે જમીને",
    "જરૃર પડે તો ",
    "CUSTOM",
  ]

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const storedPatients = localStorage.getItem("patients")
        if (storedPatients) {
          setPatients(JSON.parse(storedPatients))
        }

        const storedVisits = localStorage.getItem("visits")
        if (storedVisits) {
          setVisits(JSON.parse(storedVisits))
        }
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()

    // Listen for patient updates
    const handlePatientAdded = () => {
      loadData()
    }

    window.addEventListener("patientAdded", handlePatientAdded)
    return () => {
      window.removeEventListener("patientAdded", handlePatientAdded)
    }
  }, [])

  // Filter visits based on search and status
  const filteredVisits = visits.filter((visit) => {
    const matchesSearch =
      visit.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.treatment.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || visit.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const addMedicationToTable = () => {
    if (!currentMedication.name.trim()) {
      alert("Please enter a medicine name")
      return
    }

    const doseToUse = currentMedication.dose === "CUSTOM" ? customDose : currentMedication.dose

    const newMedication: MedicationEntry = {
      id: Date.now().toString(),
      name: currentMedication.name,
      dose: doseToUse,
      qty: currentMedication.qty,
    }

    setMedicationTable([...medicationTable, newMedication])
    setCurrentMedication({ name: "", dose: "", qty: "" })
    setCustomDose("")
  }

  const removeMedicationFromTable = (id: string) => {
    setMedicationTable(medicationTable.filter((med) => med.id !== id))
  }

  const translateToGujarati = async (text: string) => {
    if (!text.trim()) return ""

    setIsTranslating(true)
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|gu`,
      )
      const data = await response.json()

      if (data.responseStatus === 200 && data.responseData) {
        return data.responseData.translatedText
      } else {
        const commonTranslations: { [key: string]: string } = {
          morning: "સવારે",
          evening: "સાંજે",
          night: "રાત્રે",
          "before food": "ભૂખ્યા પેટે",
          "after food": "જમીને",
          tablet: "ગોળી",
          capsule: "કેપ્સ્યુલ",
          syrup: "સીરપ",
          drops: "ટીપાં",
          times: "વાર",
          daily: "દરરોજ",
          twice: "બે વાર",
          thrice: "ત્રણ વાર",
          "as needed": "જરૂર પડે તો",
        }

        let translatedText = text.toLowerCase()
        Object.entries(commonTranslations).forEach(([english, gujarati]) => {
          translatedText = translatedText.replace(new RegExp(english, "gi"), gujarati)
        })

        return translatedText
      }
    } catch (error) {
      console.error("Translation error:", error)
      return text
    } finally {
      setIsTranslating(false)
    }
  }

  const handleTranslateCustomDose = async () => {
    if (customDose.trim()) {
      const translated = await translateToGujarati(customDose)
      setCustomDose(translated)
    }
  }

  const handleSubmitVisit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatient) {
      alert("Please select a patient first")
      return
    }

    if (!visitForm.visitType || !visitForm.diagnosis || !visitForm.doctorName) {
      alert("Please fill in all required fields")
      return
    }

    const newVisit: Visit = {
      id: `VISIT-${Date.now()}`,
      patientId: selectedPatient.id,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      ...visitForm,
      createdAt: new Date().toISOString(),
      ...(showPrescription && {
        prescriptionId: `PRESC-${Date.now()}`,
        medications: medicationTable,
        investigation,
        prescriptionNotes,
      }),
    }

    try {
      const updatedVisits = [...visits, newVisit]
      setVisits(updatedVisits)
      localStorage.setItem("visits", JSON.stringify(updatedVisits))

      if (visitForm.followUpDate) {
        const newAppointment = {
          id: `APT-${Date.now()}`,
          patient: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
          doctor: visitForm.doctorName,
          date: visitForm.followUpDate,
          time: "10:00", // Default follow-up time
          duration: 30,
          type: "Follow-up",
          status: "confirmed",
          department: getDepartmentByDoctor(visitForm.doctorName),
          phone: selectedPatient.phone,
          patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
          patientPhone: selectedPatient.phone,
          patientEmail: "",
          appointmentType: "Follow-up",
          notes: `Auto-generated from visit ${newVisit.id} - Follow-up for: ${visitForm.diagnosis}`,
          createdAt: new Date().toISOString(),
          patientId: selectedPatient.id,
          lastUpdated: new Date().toISOString(),
        }

        // Get existing appointments and add the new one
        const existingAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
        const updatedAppointments = [...existingAppointments, newAppointment]
        localStorage.setItem("appointments", JSON.stringify(updatedAppointments))

        // Dispatch event to notify appointment system
        window.dispatchEvent(new CustomEvent("appointmentAdded"))
      }

      if (showPrescription && medicationTable.length > 0) {
        const prescription = {
          id: newVisit.prescriptionId,
          patientId: selectedPatient.id,
          patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
          doctorName: visitForm.doctorName,
          medications: medicationTable,
          diagnosis: visitForm.diagnosis,
          investigation,
          fee: visitForm.fee,
          notes: prescriptionNotes,
          prescriptionDate: visitForm.visitDate,
          status: "Active",
          visitId: newVisit.id,
        }

        const existingPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
        const updatedPrescriptions = [...existingPrescriptions, prescription]
        localStorage.setItem("prescriptions", JSON.stringify(updatedPrescriptions))
        window.dispatchEvent(new CustomEvent("prescriptionAdded"))
      }

      setVisitForm({
        visitDate: new Date().toISOString().split("T")[0],
        visitTime: new Date().toTimeString().slice(0, 5),
        visitType: "",
        diagnosis: "",
        symptoms: "",
        treatment: "",
        followUpDate: "",
        doctorName: "",
        fee: "",
        status: "in-progress",
        notes: "",
      })
      setSelectedPatient(null)
      setShowNewVisitForm(false)
      setShowPrescription(false)
      setInvestigation("")
      setPrescriptionNotes("")
      setMedicationTable([])
      setCurrentMedication({ name: "", dose: "", qty: "" })
      setCustomDose("")

      let message = `Visit recorded successfully for ${newVisit.patientName}`
      if (showPrescription && medicationTable.length > 0) {
        message += " with prescription"
      }
      if (visitForm.followUpDate) {
        message += ` and follow-up appointment scheduled for ${formatDate(visitForm.followUpDate)}`
      }
      message += "!"

      alert(message)
    } catch (error) {
      console.error("Error saving visit:", error)
      alert("Error saving visit. Please try again.")
    }
  }

  const getDepartmentByDoctor = (doctorName: string) => {
    const doctorDepartments: { [key: string]: string } = {
      "Dr. Tansukh Gosai": "General Physician",
      "Dr. Devang Gosai": "Ano Rectal Expert",
      "Dr. Dhara Gosai": "Dental Surgeon",
    }
    return doctorDepartments[doctorName] || "General Physician"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
      case "scheduled":
        return <Badge className="bg-yellow-100 text-yellow-700">Scheduled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getPatientVisitCount = (patientId: string) => {
    return visits.filter((visit) => visit.patientId === patientId).length
  }

  const handlePrintVisit = (visit: Visit) => {
    setSelectedVisitForPrint(visit)
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
    if (!selectedVisitForPrint) return ""

    // Get patient details
    const patient = patients.find((p) => p.id === selectedVisitForPrint.patientId)
    const patientImages: string[] = patient && Array.isArray((patient as any).images) ? (patient as any).images : []

    const imagePages: string[][] = []
    for (let i = 0; i < patientImages.length; i += 4) {
      imagePages.push(patientImages.slice(i, i + 4))
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Visit Report - ${selectedVisitForPrint.patientName}</title>
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
        
        .visit-card {
            display: flex;
            justify-content: space-between;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .visit-primary-info {
            flex: 1;
        }
        
        .patient-name {
            font-size: 14pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 4px;
            letter-spacing: -0.3px;
        }
        
        .visit-id {
            font-size: 9pt;
            color: #6b7280;
            margin-bottom: 8px;
        }
        
        .visit-details {
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
        
        .section-title {
            font-size: 12pt;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e5e7eb;
            letter-spacing: -0.3px;
        }
        
        .visit-info-section {
            margin-top: 10px;
            padding: 15px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            font-size: 9pt;
        }
        
        .info-item {
            padding: 8px;
            background: white;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
        }
        
        .info-label {
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 4px;
        }
        
        .info-content {
            color: #1f2937;
        }
        
        .medications-section {
            margin-top: 10px;
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
            .visit-card { box-shadow: none; }
            .medication-table { box-shadow: none; }
            .diagnosis-section { box-shadow: none; }
            .visit-info-section { box-shadow: none; }
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
    
    <div class="visit-card">
        <div class="visit-primary-info">
            <div class="patient-name">${selectedVisitForPrint.patientName}</div>
            <div class="visit-id">Visit ID: ${selectedVisitForPrint.id}</div>
            
            <div class="visit-details">
                <div class="detail-item">
                    <span class="detail-label">Visit Date:</span>
                    <span class="detail-value">${formatDate(selectedVisitForPrint.visitDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${selectedVisitForPrint.visitTime}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">${selectedVisitForPrint.visitType}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Doctor:</span>
                    <span class="detail-value">Dr. ${selectedVisitForPrint.doctorName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">${selectedVisitForPrint.status}</span>
                </div>
                ${
                  patient
                    ? `
                <div class="detail-item">
                    <span class="detail-label">Age:</span>
                    <span class="detail-value">${patient.age} years</span>
                </div>
                `
                    : ""
                }
            </div>
        </div>
    </div>
    
    <div class="visit-info-section">
        <div class="section-title">Visit Information</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Diagnosis</div>
                <div class="info-content">${selectedVisitForPrint.diagnosis || "Not specified"}</div>
            </div>
            ${
              selectedVisitForPrint.followUpDate
                ? `
            <div class="info-item">
                <div class="info-label">Follow-up Date</div>
                <div class="info-content">${formatDate(selectedVisitForPrint.followUpDate)}</div>
            </div>
            `
                : ""
            }
        </div>
        
        ${
          selectedVisitForPrint.investigation
            ? `
        <div class="diagnosis-section" style="background: #f0fdf4; border-color: #22c55e;">
            <span class="diagnosis-title" style="color: #15803d;">Investigation:</span>
            <span class="diagnosis-content" style="color: #166534;">${selectedVisitForPrint.investigation}</span>
        </div>
        `
            : ""
        }
    </div>
    
    <div class="medications-section">
        <div class="section-title">Prescribed Medications</div>
        
        ${
          selectedVisitForPrint.medications && selectedVisitForPrint.medications.length > 0
            ? `
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
                ${selectedVisitForPrint.medications
                  .map(
                    (medication, index) => `
                    <tr>
                        <td style="text-align: center;">${index + 1}</td>
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
        `
            : `
        <div class="no-medications">
            <div>No medications prescribed for this visit</div>
            <div style="font-size: 9pt; margin-top: 5px; color: #9ca3af;">Please consult with the doctor for medical advice</div>
        </div>
        `
        }
        
        ${
          selectedVisitForPrint.prescriptionNotes
            ? `
        <div class="diagnosis-section" style="background: #f3f4f6; border-color: #6b7280;">
            <span class="diagnosis-title" style="color: #374151;">Prescription Notes:</span>
            <span class="diagnosis-content" style="color: #4b5563;">${selectedVisitForPrint.prescriptionNotes}</span>
        </div>
        `
            : ""
        }
    </div>

    
    images rendered as 4-per-page on subsequent pages 
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
    
    ${
      selectedVisitForPrint.fee
        ? `
    <div class="fee-section">
        <span class="diagnosis-title" style="color: #92400e;">Consultation Fee:</span>
        <span class="diagnosis-content" style="color: #92400e; font-weight: 600;">₹${selectedVisitForPrint.fee}</span>
    </div>
    `
        : ""
    }
    
    ${
      selectedVisitForPrint.notes
        ? `
    <div class="diagnosis-section" style="background: #f3f4f6; border-color: #6b7280; margin-top: 15px;">
        <span class="diagnosis-title" style="color: #374151;">Visit Notes:</span>
        <span class="diagnosis-content" style="color: #4b5563;">${selectedVisitForPrint.notes}</span>
    </div>
    `
        : ""
    }
    
    <div class="page-footer">
        <div><strong>GOSAI CLINIC</strong> - Your Trusted Healthcare Partner</div>
        <div style="font-size: 8pt;">This is a computer-generated report. For queries, contact: 9426953220</div>
        <div style="font-size: 8pt;">Report ID: ${selectedVisitForPrint.id}-${Date.now()}</div>
    </div>
</body>
</html>`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <UserCheck className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Visits</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage visits for registered patients</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                <div>Total Visits: {visits.length}</div>
                <div>Registered Patients: {patients.length}</div>
              </div>
              <Button onClick={() => setShowNewVisitForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                New Visit
              </Button>
            </div>
          </div>
        </div>

        {/* New Visit Form Modal */}
        {showNewVisitForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Record New Visit</h2>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowNewVisitForm(false)
                      setSelectedPatient(null)
                    }}
                  >
                    ×
                  </Button>
                </div>

                <form onSubmit={handleSubmitVisit} className="space-y-6">
                  {/* Patient Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Patient</CardTitle>
                      <CardDescription>Choose an existing registered patient</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!selectedPatient ? (
                        <div className="space-y-4">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Search patients by name..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-8"
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {patients
                              .filter((patient) =>
                                `${patient.firstName} ${patient.lastName}`
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()),
                              )
                              .map((patient) => (
                                <div
                                  key={patient.id}
                                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                  onClick={() => setSelectedPatient(patient)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium">
                                        {patient.firstName} {patient.lastName}
                                      </h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {patient.age}y, {patient.gender} • {patient.phone}
                                      </p>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                      <div>Previous visits: {getPatientVisitCount(patient.id)}</div>
                                      <div>ID: {patient.id}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                                {selectedPatient.firstName} {selectedPatient.lastName}
                              </h4>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                {selectedPatient.age}y, {selectedPatient.gender} • {selectedPatient.phone}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Previous visits: {getPatientVisitCount(selectedPatient.id)}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>
                              Change Patient
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Visit Details */}
                  {selectedPatient && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Visit Details</CardTitle>
                        <CardDescription>Record the visit information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="visitDate">Visit Date *</Label>
                            <Input
                              id="visitDate"
                              type="date"
                              value={visitForm.visitDate}
                              onChange={(e) => setVisitForm((prev) => ({ ...prev, visitDate: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="visitTime">Visit Time</Label>
                            <Input
                              id="visitTime"
                              type="time"
                              value={visitForm.visitTime}
                              onChange={(e) => setVisitForm((prev) => ({ ...prev, visitTime: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="visitType">Visit Type *</Label>
                            <Select
                              value={visitForm.visitType}
                              onValueChange={(value) => setVisitForm((prev) => ({ ...prev, visitType: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select visit type" />
                              </SelectTrigger>
                              <SelectContent>
                                {visitTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="doctorName">Doctor *</Label>
                            <Select
                              value={visitForm.doctorName}
                              onValueChange={(value) => setVisitForm((prev) => ({ ...prev, doctorName: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select doctor" />
                              </SelectTrigger>
                              <SelectContent>
                                {doctors.map((doctor) => (
                                  <SelectItem key={doctor} value={doctor}>
                                    {doctor}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="fee">Consultation Fee</Label>
                            <Input
                              id="fee"
                              type="number"
                              placeholder="Enter fee amount"
                              value={visitForm.fee}
                              onChange={(e) => setVisitForm((prev) => ({ ...prev, fee: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="diagnosis">Diagnosis *</Label>
                          <Textarea
                            id="diagnosis"
                            placeholder="Primary diagnosis for the visit"
                            value={visitForm.diagnosis}
                            onChange={(e) => setVisitForm((prev) => ({ ...prev, diagnosis: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="symptoms">Symptoms</Label>
                          <Textarea
                            id="symptoms"
                            placeholder="Describe symptoms observed"
                            value={visitForm.symptoms}
                            onChange={(e) => setVisitForm((prev) => ({ ...prev, symptoms: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="treatment">Treatment/Prescription</Label>
                          <Textarea
                            id="treatment"
                            placeholder="Treatment provided or prescribed"
                            value={visitForm.treatment}
                            onChange={(e) => setVisitForm((prev) => ({ ...prev, treatment: e.target.value }))}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="followUpDate">Follow-up Date</Label>
                            <Input
                              id="followUpDate"
                              type="date"
                              value={visitForm.followUpDate}
                              onChange={(e) => setVisitForm((prev) => ({ ...prev, followUpDate: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={visitForm.status}
                              onValueChange={(value: "completed" | "in-progress" | "scheduled") =>
                                setVisitForm((prev) => ({ ...prev, status: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="notes">Additional Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Any additional notes or observations"
                            value={visitForm.notes}
                            onChange={(e) => setVisitForm((prev) => ({ ...prev, notes: e.target.value }))}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedPatient && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              <Pill className="h-5 w-5 text-blue-600" />
                              <span>Prescription (Optional)</span>
                            </CardTitle>
                            <CardDescription>Add prescription during patient visit</CardDescription>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPrescription(!showPrescription)}
                          >
                            {showPrescription ? (
                              <>
                                <ChevronUp className="mr-2 h-4 w-4" />
                                Hide Prescription
                              </>
                            ) : (
                              <>
                                <ChevronDown className="mr-2 h-4 w-4" />
                                Add Prescription
                              </>
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      {showPrescription && (
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="investigation">Investigation</Label>
                              <Textarea
                                id="investigation"
                                value={investigation}
                                onChange={(e) => setInvestigation(e.target.value)}
                                placeholder="Enter investigation details"
                                rows={3}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Label className="text-lg font-semibold">Enter List of Medicine:</Label>

                            <div className="space-y-4">
                              <div>
                                <Label className="text-base font-medium mb-3 block">Dose</Label>
                                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                                  {frequencyOptions.map((option) => (
                                    <div
                                      key={option}
                                      className={`flex flex-col items-center space-y-2 p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
                                        currentMedication.dose === option
                                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                                      }`}
                                      onClick={() => setCurrentMedication((prev) => ({ ...prev, dose: option }))}
                                    >
                                      <div
                                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                          currentMedication.dose === option
                                            ? "border-blue-500 bg-blue-500"
                                            : "border-gray-400 bg-white dark:bg-gray-700"
                                        }`}
                                      >
                                        {currentMedication.dose === option && (
                                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white"></div>
                                        )}
                                      </div>
                                      <span className="text-xs sm:text-sm text-center text-gray-700 dark:text-gray-300 leading-tight font-medium">
                                        {option === "CUSTOM" ? "Custom" : option}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {currentMedication.dose === "CUSTOM" && (
                                  <div className="mt-4">
                                    <Label htmlFor="customDose">Enter Custom Dose</Label>
                                    <div className="flex gap-2 mt-2">
                                      <Input
                                        id="customDose"
                                        value={customDose}
                                        onChange={(e) => setCustomDose(e.target.value)}
                                        placeholder="Enter custom dose instructions in English"
                                        className="flex-1"
                                      />
                                      <Button
                                        type="button"
                                        onClick={handleTranslateCustomDose}
                                        disabled={isTranslating || !customDose.trim()}
                                        variant="outline"
                                        size="sm"
                                        className="px-3 bg-transparent"
                                      >
                                        {isTranslating ? (
                                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                                        ) : (
                                          <Languages className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      For Accurate Results go to This Website{" "}
                                      <a
                                        href="https://www.easygujaratityping.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline"
                                      >
                                        https://www.easygujaratityping.com/
                                      </a>
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-3 gap-4 items-end">
                                <div>
                                  <Label htmlFor="medicineName">Medicine</Label>
                                  <MedicineAutocomplete
                                    value={currentMedication.name}
                                    onChange={(value) => setCurrentMedication((prev) => ({ ...prev, name: value }))}
                                    placeholder="Enter medicine name"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="qty">Qty</Label>
                                  <Input
                                    id="qty"
                                    value={currentMedication.qty}
                                    onChange={(e) => setCurrentMedication((prev) => ({ ...prev, qty: e.target.value }))}
                                    placeholder="e.g., 10"
                                  />
                                </div>
                                <div>
                                  <Button
                                    type="button"
                                    onClick={addMedicationToTable}
                                    className="bg-green-600 hover:bg-green-700 w-full"
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {medicationTable.length > 0 && (
                              <div className="mt-6">
                                <div className="border rounded-lg overflow-hidden">
                                  <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                                          Sno
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                                          Medicine
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                                          Dose
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                                          Qty
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                                          Action
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                      {medicationTable.map((medication, index) => (
                                        <tr key={medication.id}>
                                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {index + 1}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {medication.name}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {medication.dose}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {medication.qty}
                                          </td>
                                          <td className="px-4 py-3 text-sm">
                                            <Button
                                              type="button"
                                              onClick={() => removeMedicationFromTable(medication.id)}
                                              variant="destructive"
                                              size="sm"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="prescriptionNotes">Additional Notes</Label>
                            <Textarea
                              id="prescriptionNotes"
                              value={prescriptionNotes}
                              onChange={(e) => setPrescriptionNotes(e.target.value)}
                              placeholder="Any additional instructions or notes"
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Form Actions */}
                  {selectedPatient && (
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowNewVisitForm(false)
                          setSelectedPatient(null)
                          setShowPrescription(false)
                          setInvestigation("")
                          setPrescriptionNotes("")
                          setMedicationTable([])
                          setCurrentMedication({ name: "", dose: "", qty: "" })
                          setCustomDose("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        <UserCheck className="mr-2 h-4 w-4" />
                        {showPrescription && medicationTable.length > 0
                          ? "Record Visit & Create Prescription"
                          : "Record Visit"}
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Visits List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle>Recent Visits</CardTitle>
                <CardDescription>All patient visits and consultations</CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search visits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredVisits.length > 0 ? (
              <div className="space-y-4">
                {filteredVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{visit.patientName}</h3>
                          {getStatusBadge(visit.status)}
                          <Badge variant="outline">{visit.visitType}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <strong>Date:</strong> {formatDate(visit.visitDate)}
                          </div>
                          <div>
                            <strong>Time:</strong> {visit.visitTime}
                          </div>
                          <div>
                            <strong>Doctor:</strong> {visit.doctorName}
                          </div>
                          <div>
                            <strong>Fee:</strong> {visit.fee ? `₹${visit.fee}` : "N/A"}
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <strong>Diagnosis:</strong> {visit.diagnosis}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-800 dark:text-blue-400"
                          onClick={() => handlePrintVisit(visit)}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedVisit(visit)
                            setShowVisitDetails(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No visits found</p>
                <p className="text-sm">Record your first patient visit to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visit Details Modal */}
        {showVisitDetails && selectedVisit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visit Details</h2>
                  <Button variant="ghost" onClick={() => setShowVisitDetails(false)}>
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Patient Name</Label>
                      <p className="text-gray-900 dark:text-gray-100">{selectedVisit.patientName}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Visit ID</Label>
                      <p className="text-gray-600 dark:text-gray-400">{selectedVisit.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Date & Time</Label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {formatDate(selectedVisit.visitDate)} at {selectedVisit.visitTime}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Visit Type</Label>
                      <p className="text-gray-900 dark:text-gray-100">{selectedVisit.visitType}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Doctor</Label>
                      <p className="text-gray-900 dark:text-gray-100">{selectedVisit.doctorName}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedVisit.status)}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium">Diagnosis</Label>
                    <p className="text-gray-900 dark:text-gray-100 mt-1">{selectedVisit.diagnosis}</p>
                  </div>

                  {selectedVisit.symptoms && (
                    <div>
                      <Label className="font-medium">Symptoms</Label>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{selectedVisit.symptoms}</p>
                    </div>
                  )}

                  {selectedVisit.treatment && (
                    <div>
                      <Label className="font-medium">Treatment/Prescription</Label>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{selectedVisit.treatment}</p>
                    </div>
                  )}

                  {selectedVisit.followUpDate && (
                    <div>
                      <Label className="font-medium">Follow-up Date</Label>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{formatDate(selectedVisit.followUpDate)}</p>
                    </div>
                  )}

                  {selectedVisit.fee && (
                    <div>
                      <Label className="font-medium">Consultation Fee</Label>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">₹{selectedVisit.fee}</p>
                    </div>
                  )}

                  {selectedVisit.notes && (
                    <div>
                      <Label className="font-medium">Additional Notes</Label>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{selectedVisit.notes}</p>
                    </div>
                  )}

                  {selectedVisit.medications && selectedVisit.medications.length > 0 && (
                    <div>
                      <Label className="font-medium">Prescribed Medications</Label>
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-3 py-2 text-left">Medicine</th>
                              <th className="px-3 py-2 text-left">Dose</th>
                              <th className="px-3 py-2 text-left">Qty</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {selectedVisit.medications.map((medication, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2">{medication.name}</td>
                                <td className="px-3 py-2">{medication.dose}</td>
                                <td className="px-3 py-2">{medication.qty}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedVisit.investigation && (
                    <div>
                      <Label className="font-medium">Investigation</Label>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{selectedVisit.investigation}</p>
                    </div>
                  )}

                  {selectedVisit.prescriptionNotes && (
                    <div>
                      <Label className="font-medium">Prescription Notes</Label>
                      <p className="text-gray-900 dark:text-gray-100 mt-1">{selectedVisit.prescriptionNotes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={() => setShowVisitDetails(false)}>Close</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPrintPreview && selectedVisitForPrint && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl">
              <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Print Preview</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Visit Report - {selectedVisitForPrint.patientName}
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
