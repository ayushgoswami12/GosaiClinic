"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, UserPlus, Users, Pill, ChevronDown, ChevronUp, CheckCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { MedicineAutocomplete } from "@/components/ui/medicine-autocomplete"
import { useRouter } from "next/navigation"

interface PatientData {
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
  dateOfVisit: string
  registrationDate: string
}

interface MedicationEntry {
  id: string
  name: string
  dose: string
  qty: string
}

interface Prescription {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  medications: MedicationEntry[]
  diagnosis: string
  investigation: string
  fee: string
  notes: string
  prescriptionDate: string
  status: "Active" | "Completed" | "Cancelled"
}

export default function PatientRegistration() {
  const router = useRouter()
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    dateOfVisit: new Date().toISOString().split("T")[0],
  })

  const [totalPatients, setTotalPatients] = useState(0)
  const [showPrescription, setShowPrescription] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [investigation, setInvestigation] = useState("")
  const [fee, setFee] = useState("")
  const [prescriptionNotes, setPrescriptionNotes] = useState("")

  const [medicationTable, setMedicationTable] = useState<MedicationEntry[]>([])
  const [currentMedication, setCurrentMedication] = useState({
    name: "",
    dose: "",
    qty: "",
  })

  const doctors = ["Dr. Tansukh Gosai", "Dr. Devang Gosai", "Dr. Dhara Gosai"]

  const frequencyOptions = [
    "સાવરે જામ્યા પહેલા",
    "સવારે જમ્યા પછી",
    "સાવરે બાપોરે જામ્યા પહેલા",
    "સાવરે બાપોરે જામ્યા પછી",
    "સાવરે સાંજે જામ્યા પહેલા",
    "સાવરે સાંજે જામ્યા પછી",
    "બોપોર જમ્યા પહેલા",
    "બોપોર જમ્યા પછી",
    "સાંજે જમ્યા પહેલા",
    "સાંજે જમ્યા પછી",
    "સાવરે બોપોર સાંજે જમ્યા પહેલા",
    "સાવરે બોપોર સાંજે જમ્યા પછી",
  ]

  useEffect(() => {
    const patients = JSON.parse(localStorage.getItem("patients") || "[]")
    setTotalPatients(patients.length)
  }, [])

  const addMedicationToTable = () => {
    if (!currentMedication.name.trim()) {
      alert("Please enter a medicine name")
      return
    }

    const newMedication: MedicationEntry = {
      id: Date.now().toString(),
      name: currentMedication.name,
      dose: currentMedication.dose,
      qty: currentMedication.qty,
    }

    setMedicationTable([...medicationTable, newMedication])
    setCurrentMedication({ name: "", dose: "", qty: "" })
  }

  const removeMedicationFromTable = (id: string) => {
    setMedicationTable(medicationTable.filter((med) => med.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const requiredFields = ["firstName", "lastName", "age", "gender", "phone", "address"]
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])
    if (missingFields.length > 0) {
      alert("Please fill in all required fields.")
      return
    }

    const ageNum = Number.parseInt(formData.age)
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      alert("Please enter a valid age between 0 and 150.")
      return
    }

    if (showPrescription) {
      if (!selectedDoctor || !diagnosis) {
        alert("Please fill in doctor and diagnosis for the prescription.")
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
          medications: medicationTable,
          diagnosis,
          investigation,
          fee,
          notes: prescriptionNotes,
          prescriptionDate: new Date().toISOString().split("T")[0],
          status: "Active",
        }

        const existingPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
        const updatedPrescriptions = [...existingPrescriptions, newPrescription]
        localStorage.setItem("prescriptions", JSON.stringify(updatedPrescriptions))

        window.dispatchEvent(new CustomEvent("prescriptionAdded"))
      }

      setTotalPatients(updatedPatients.length)
      window.dispatchEvent(new CustomEvent("patientAdded"))

      const message =
        showPrescription && selectedDoctor
          ? `Patient ${formData.firstName} ${formData.lastName} registered successfully with prescription! Total patients: ${updatedPatients.length}`
          : `Patient ${formData.firstName} ${formData.lastName} registered successfully! Total patients: ${updatedPatients.length}`

      setSuccessMessage(message)
      setShowSuccessPopup(true)

      setTimeout(() => {
        router.push("/patients")
      }, 2000)

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
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Registration Successful!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{successMessage}</p>
            <div className="text-sm text-gray-500 dark:text-gray-400">Redirecting to patients page...</div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <Label htmlFor="age">Age (in years) *</Label>
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
                      <Label htmlFor="doctor">Checked by</Label>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Textarea
                        id="diagnosis"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Enter diagnosis"
                        rows={3}
                      />
                    </div>
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
                    <div>
                      <Label htmlFor="fee">Fee</Label>
                      <Input
                        id="fee"
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                        placeholder="Enter fee amount"
                        type="number"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Enter List of Medicine:</Label>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium mb-3 block">Dose</Label>
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
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
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
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
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
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
