"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, UserPlus, Users, Plus, Pill, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MedicineAutocomplete } from "@/components/ui/medicine-autocomplete"

interface PatientData {
  id: string
  firstName: string
  lastName: string
  age: string
  gender: string
  phone: string
  email: string
  address: string
  // emergencyContact: string
  // emergencyPhone: string
  bloodType: string
  allergies: string
  medicalHistory: string
  dateOfVisit: string
}

interface Prescription {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  medications: {
    name: string
    dosage: string
    frequency: string[] // Changed from string to string array
    duration: string
    instructions: string
  }[]
  diagnosis: string
  notes: string
  prescriptionDate: string
  status: "Active" | "Completed" | "Cancelled"
}

export default function PatientRegistration() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    // emergencyContact: "",
    // emergencyPhone: "",
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    dateOfVisit: new Date().toISOString().split("T")[0], // Auto-fill with today's date
  })

  const [totalPatients, setTotalPatients] = useState(0)
  const [showPrescription, setShowPrescription] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [prescriptionNotes, setPrescriptionNotes] = useState("")
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
    const patients = JSON.parse(localStorage.getItem("patients") || "[]")
    setTotalPatients(patients.length)
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

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
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
    const requiredFields = [
      "firstName",
      "lastName",
      "age",
      "gender",
      "phone",
      "address",
      // "emergencyContact",
      // "emergencyPhone",
    ]
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])
    if (missingFields.length > 0) {
      alert("Please fill in all required fields.")
      return
    }

    if (showPrescription) {
      if (!selectedDoctor || !diagnosis) {
        alert("Please fill in doctor and diagnosis for the prescription.")
        return
      }
      const validMedications = medications.filter((med) => med.name.trim() !== "")
      if (validMedications.length === 0) {
        alert("Please add at least one medication for the prescription.")
        return
      }
    }

    try {
      const newPatient: PatientData = {
        id: `PAT-${Date.now()}`,
        ...formData,
        registrationDate: new Date().toLocaleString(),
      }

      const existingPatients = JSON.parse(localStorage.getItem("patients") || "[]")
      const updatedPatients = [...existingPatients, newPatient]
      localStorage.setItem("patients", JSON.stringify(updatedPatients))

      if (showPrescription && selectedDoctor && diagnosis) {
        const newPrescription: Prescription = {
          id: Date.now().toString(),
          patientId: newPatient.id,
          patientName: `${formData.firstName} ${formData.lastName}`,
          doctorName: selectedDoctor,
          medications: medications.filter((med) => med.name.trim() !== ""),
          diagnosis,
          notes: prescriptionNotes,
          prescriptionDate: new Date().toISOString().split("T")[0],
          status: "Active",
        }

        const existingPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
        const updatedPrescriptions = [...existingPrescriptions, newPrescription]
        localStorage.setItem("prescriptions", JSON.stringify(updatedPrescriptions))

        // Dispatch event to update medicine suggestions
        window.dispatchEvent(new CustomEvent("prescriptionAdded"))
      }

      setTotalPatients(updatedPatients.length)
      window.dispatchEvent(new CustomEvent("patientAdded"))

      const successMessage =
        showPrescription && selectedDoctor
          ? `Patient ${formData.firstName} ${formData.lastName} registered successfully with prescription! Total patients: ${updatedPatients.length}`
          : `Patient ${formData.firstName} ${formData.lastName} registered successfully! Total patients: ${updatedPatients.length}`

      alert(successMessage)

      setFormData({
        firstName: "",
        lastName: "",
        age: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        // emergencyContact: "",
        // emergencyPhone: "",
        bloodType: "",
        allergies: "",
        medicalHistory: "",
        dateOfVisit: new Date().toISOString().split("T")[0], // Auto-fill with today's date
      })

      setSelectedDoctor("")
      setDiagnosis("")
      setPrescriptionNotes("")
      setMedications([{ name: "", dosage: "", frequency: [], duration: "", instructions: "" }])
      setShowPrescription(false)

      console.log("New patient registered:", newPatient)
    } catch (error) {
      console.error("Error saving patient data:", error)
      alert("There was an error registering the patient. Please try again.")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <UserPlus className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Registration</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Register a new patient in GOSAI CLINIC management system.
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4" />
                <span>Total Patients: {totalPatients}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic patient details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Current Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter age in years"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      required
                      min="0"
                      max="150"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfVisit">Date of Visit</Label>
                  <Input
                    id="dateOfVisit"
                    type="date"
                    value={formData.dateOfVisit}
                    onChange={(e) => handleInputChange("dateOfVisit", e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Automatically filled with today's date</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
                <CardDescription>Patient medical details and history</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select value={formData.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Known Allergies</Label>
                  <Textarea
                    id="allergies"
                    placeholder="List any known allergies (medications, food, environmental, etc.)"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Textarea
                    id="medicalHistory"
                    placeholder="Previous medical conditions, surgeries, chronic illnesses, etc."
                    value={formData.medicalHistory}
                    onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Pill className="h-5 w-5 text-blue-600" />
                      <span>Prescription (Optional)</span>
                    </CardTitle>
                    <CardDescription>Add prescription during patient registration</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={() => setShowPrescription(!showPrescription)}>
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
                      <Label htmlFor="doctor">Doctor</Label>
                      <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
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
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Input
                        id="diagnosis"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Enter diagnosis"
                      />
                    </div>
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
                              <MedicineAutocomplete
                                value={medication.name}
                                onChange={(value) => updateMedication(index, "name", value)}
                                placeholder="e.g., Paracetamol 500mg"
                              />
                            </div>
                            <div>
                              <Label>Dosage</Label>
                              <Input
                                value={medication.dosage}
                                onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                                placeholder="e.g., 500mg"
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

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/">Cancel</Link>
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="mr-2 h-4 w-4" />
                {showPrescription && selectedDoctor ? "Register Patient & Create Prescription" : "Register Patient"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
