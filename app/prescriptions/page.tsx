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
import { Search, Plus, User, Pill, Download } from "lucide-react"
import * as XLSX from "xlsx"

interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  registrationDate: string
}

interface Prescription {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  medications: {
    name: string
    dosage: string
    frequency: string[] // Changed from string to string array for multiple frequencies
    duration: string
    instructions: string
  }[]
  diagnosis: string
  notes: string
  prescriptionDate: string
  status: "Active" | "Completed" | "Cancelled"
}

export default function PrescriptionsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewPrescription, setShowNewPrescription] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [notes, setNotes] = useState("")
  const [medications, setMedications] = useState([
    {
      name: "",
      dosage: "",
      frequency: [], // Changed from empty string to empty array
      duration: "",
      instructions: "",
    },
  ])

  const doctors = ["Dr. Tansukh Gosai", "Dr. Devang Gosai", "Dr. Dhara Gosai"]
  const frequencyOptions = [
    "સવારે જમ્યા પહેલા",
    "સવારે જમ્યા પછી",
    "બપોરે જમ્યા પહેલા",
    "બપોરે જમ્યા પછી",
    "રાત્રે જમ્યા પહેલા",
    "રાત્રે જમ્યા પછી",
  ]

  useEffect(() => {
    // Load patients from localStorage
    const storedPatients = localStorage.getItem("patients")
    if (storedPatients) {
      setPatients(JSON.parse(storedPatients))
    }

    // Load prescriptions from localStorage
    const storedPrescriptions = localStorage.getItem("prescriptions")
    if (storedPrescriptions) {
      setPrescriptions(JSON.parse(storedPrescriptions))
    }
  }, [])

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        name: "",
        dosage: "",
        frequency: [], // Changed from empty string to empty array
        duration: "",
        instructions: "",
      },
    ])
  }

  const updateMedication = (index: number, field: string, value: string | string[]) => {
    const updatedMedications = medications.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    setMedications(updatedMedications)
  }

  const toggleFrequency = (medicationIndex: number, frequency: string) => {
    const currentFrequencies = medications[medicationIndex].frequency
    const updatedFrequencies = currentFrequencies.includes(frequency)
      ? currentFrequencies.filter((f) => f !== frequency)
      : [...currentFrequencies, frequency]

    updateMedication(medicationIndex, "frequency", updatedFrequencies)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedPatientData = patients.find((p) => p.id === selectedPatient)
    if (!selectedPatientData) return

    const newPrescription: Prescription = {
      id: Date.now().toString(),
      patientId: selectedPatient,
      patientName: `${selectedPatientData.firstName} ${selectedPatientData.lastName}`,
      doctorName: selectedDoctor,
      medications: medications.filter((med) => med.name.trim() !== ""),
      diagnosis,
      notes,
      prescriptionDate: new Date().toISOString().split("T")[0],
      status: "Active",
    }

    const updatedPrescriptions = [...prescriptions, newPrescription]
    setPrescriptions(updatedPrescriptions)
    localStorage.setItem("prescriptions", JSON.stringify(updatedPrescriptions))

    // Reset form
    setSelectedPatient("")
    setSelectedDoctor("")
    setDiagnosis("")
    setNotes("")
    setMedications([{ name: "", dosage: "", frequency: [], duration: "", instructions: "" }])
    setShowNewPrescription(false)
  }

  const exportToExcel = () => {
    const exportData = prescriptions.map((prescription) => ({
      "Prescription ID": prescription.id,
      "Patient Name": prescription.patientName,
      Doctor: prescription.doctorName,
      Diagnosis: prescription.diagnosis,
      Medications: prescription.medications
        .map((med) => `${med.name} - ${med.dosage} - ${med.frequency.join(", ")} for ${med.duration}`)
        .join("; "),
      "Prescription Date": prescription.prescriptionDate,
      Status: prescription.status,
      Notes: prescription.notes,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Prescriptions")
    XLSX.writeFile(wb, `GOSAI_CLINIC_Prescriptions_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const removeMedication = (index: number) => {
    const updatedMedications = medications.filter((_, i) => i !== index)
    setMedications(updatedMedications)
  }

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Prescriptions</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage patient prescriptions and medications</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={exportToExcel} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
              <Button onClick={() => setShowNewPrescription(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Prescription
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {showNewPrescription && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>New Prescription</CardTitle>
              <CardDescription>Create a new prescription for a patient</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient">Patient</Label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="doctor">Doctor</Label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor} required>
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
                </div>

                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Enter diagnosis"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Medications</Label>
                    <Button type="button" onClick={addMedication} variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Medication
                    </Button>
                  </div>
                  {medications.map((medication, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label>Medication Name</Label>
                            <Input
                              value={medication.name}
                              onChange={(e) => updateMedication(index, "name", e.target.value)}
                              placeholder="e.g., Paracetamol"
                              required
                            />
                          </div>
                          <div>
                            <Label>Dosage</Label>
                            <Input
                              value={medication.dosage}
                              onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                              placeholder="e.g., 500mg"
                              required
                            />
                          </div>
                          <div className="md:col-span-3">
                            <Label>Frequency (Select Multiple)</Label>
                            <div className="mt-2">
                              <div className="grid grid-cols-3 gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                                {frequencyOptions.map((option) => (
                                  <div
                                    key={option}
                                    onClick={() => toggleFrequency(index, option)}
                                    className={`
                                      flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 text-sm font-medium min-h-[60px]
                                      ${
                                        medication.frequency.includes(option)
                                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md transform scale-105"
                                          : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:shadow-sm"
                                      }
                                    `}
                                  >
                                    <div className="flex flex-col items-center space-y-2">
                                      <div
                                        className={`
                                          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                          ${
                                            medication.frequency.includes(option)
                                              ? "border-blue-500 bg-blue-500 shadow-sm"
                                              : "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"
                                          }
                                        `}
                                      >
                                        {medication.frequency.includes(option) && (
                                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                      <span className="text-center leading-tight text-xs">{option}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {medication.frequency.length > 0 && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                      Selected Frequencies ({medication.frequency.length}):
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {medication.frequency.map((freq) => (
                                      <Badge
                                        key={freq}
                                        className="bg-white dark:bg-gray-800 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-600 px-3 py-1.5 shadow-sm"
                                      >
                                        {freq}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Duration</Label>
                            <Input
                              value={medication.duration}
                              onChange={(e) => updateMedication(index, "duration", e.target.value)}
                              placeholder="e.g., 7 days"
                              required
                            />
                          </div>
                          <div>
                            <Label>Instructions</Label>
                            <Input
                              value={medication.instructions}
                              onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                              placeholder="e.g., Take after meals"
                            />
                          </div>
                        </div>
                        {medications.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeMedication(index)}
                            variant="destructive"
                            size="sm"
                            className="mt-4"
                          >
                            Remove Medication
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional instructions or notes"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button type="submit">Create Prescription</Button>
                  <Button type="button" variant="outline" onClick={() => setShowNewPrescription(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {filteredPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Pill className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No prescriptions found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? "No prescriptions match your search." : "Start by creating your first prescription."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <span>{prescription.patientName}</span>
                      </CardTitle>
                      <CardDescription>
                        Prescribed by {prescription.doctorName} on {prescription.prescriptionDate}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        prescription.status === "Active"
                          ? "default"
                          : prescription.status === "Completed"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {prescription.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Diagnosis</h4>
                      <p className="text-gray-600 dark:text-gray-400">{prescription.diagnosis}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Medications</h4>
                      <div className="space-y-2">
                        {prescription.medications.map((medication, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">{medication.name}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{medication.dosage}</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {medication.frequency.join(", ")} for {medication.duration}
                              {medication.instructions && ` - ${medication.instructions}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {prescription.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
                        <p className="text-gray-600 dark:text-gray-400">{prescription.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
