"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MedicineAutocomplete } from "@/components/ui/medicine-autocomplete"
import {
  User,
  FileText,
  Pill,
  Plus,
  Save,
  ArrowLeft,
  Stethoscope,
  Languages,
  Trash2,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
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
  visits?: number
  visitRecords?: VisitRecord[]
}

interface VisitRecord {
  id: string
  date: string
  notes: string
  medications: Medication[]
  diagnosis: string
  doctorName: string
  followUpDate?: string
}

interface Medication {
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
  medications: Medication[]
  notes: string
  date: string
  investigation?: string
  diagnosis?: string
  prescriptionDate?: string
  fee?: string
}

export default function FullScreenVisitPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.patientId as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [currentPatientIndex, setCurrentPatientIndex] = useState(0)
  const [visitNotes, setVisitNotes] = useState("")
  const [visitDiagnosis, setVisitDiagnosis] = useState("")
  const [visitDoctor, setVisitDoctor] = useState("")
  const [visitFollowUp, setVisitFollowUp] = useState("")
  const [visitMedications, setVisitMedications] = useState<Medication[]>([])
  const [currentMedication, setCurrentMedication] = useState({
    name: "",
    dose: "",
    qty: "",
  })
  const [customDose, setCustomDose] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [showAddMedication, setShowAddMedication] = useState(false)
  const [showPreviousMedications, setShowPreviousMedications] = useState(false)
  const [investigation, setInvestigation] = useState("")
  const [fee, setFee] = useState("")
  const [prescriptionNotes, setPrescriptionNotes] = useState("")
  const [isPrintMode, setIsPrintMode] = useState(false)
  const [printType, setPrintType] = useState<"general" | "medication">("general")

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

  const doctors = ["Dr. Tansukh Gosai", "Dr. Devang Gosai", "Dr. Dhara Gosai"]

  useEffect(() => {
    const storedPatients = localStorage.getItem("patients")
    if (storedPatients) {
      const patients: Patient[] = JSON.parse(storedPatients)
      setAllPatients(patients)
      const foundPatientIndex = patients.findIndex((p) => p.id === patientId)
      if (foundPatientIndex !== -1) {
        setPatient(patients[foundPatientIndex])
        setCurrentPatientIndex(foundPatientIndex)
      }
    }
  }, [patientId])

  const navigateToPatient = (direction: "prev" | "next") => {
    if (allPatients.length === 0) return

    let newIndex
    if (direction === "prev") {
      newIndex = currentPatientIndex > 0 ? currentPatientIndex - 1 : allPatients.length - 1
    } else {
      newIndex = currentPatientIndex < allPatients.length - 1 ? currentPatientIndex + 1 : 0
    }

    const newPatient = allPatients[newIndex]
    setCurrentPatientIndex(newIndex)
    setPatient(newPatient)

    // Update URL without page reload
    window.history.replaceState({}, "", `/patients/visit/${newPatient.id}`)

    // Reset form data for new patient
    setVisitNotes("")
    setVisitDiagnosis("")
    setVisitDoctor("")
    setVisitFollowUp("")
    setVisitMedications([])
    setCurrentMedication({ name: "", dose: "", qty: "" })
    setCustomDose("")
    setShowAddMedication(false)
    setShowPreviousMedications(false)
    setInvestigation("")
    setFee("")
    setPrescriptionNotes("")
  }

  const handlePrint = () => {
    setIsPrintMode(true)
    setTimeout(() => {
      window.print()
      setIsPrintMode(false)
    }, 100)
  }

  const translateToGujarati = async (text: string) => {
    if (!text.trim()) return ""

    setIsTranslating(true)
    try {
      console.log("[v0] Starting translation for:", text)

      const response = await fetch("https://google-translate1.p.rapidapi.com/language/translate/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept-Encoding": "application/gzip",
          "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "your-rapidapi-key-here",
          "X-RapidAPI-Host": "google-translate1.p.rapidapi.com",
        },
        body: new URLSearchParams({
          q: text,
          target: "gu",
          source: "en",
        }),
      })

      const data = await response.json()
      console.log("[v0] Translation response:", data)

      if (data.data && data.data.translations && data.data.translations[0]) {
        const translatedText = data.data.translations[0].translatedText
        console.log("[v0] Translation successful:", translatedText)
        return translatedText
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("[v0] Translation error:", error)

      console.log("[v0] Using fallback transliteration")

      const transliterationMap: { [key: string]: string } = {
        a: "અ",
        aa: "આ",
        i: "ઇ",
        ii: "ઈ",
        u: "ઉ",
        uu: "ઊ",
        e: "એ",
        ai: "ઐ",
        o: "ઓ",
        au: "ઔ",
        k: "ક",
        kh: "ખ",
        g: "ગ",
        gh: "ઘ",
        ng: "ઙ",
        ch: "ચ",
        chh: "છ",
        j: "જ",
        jh: "ઝ",
        ny: "ઞ",
        t: "ત",
        th: "થ",
        d: "દ",
        dh: "ધ",
        n: "ન",
        p: "પ",
        ph: "ફ",
        b: "બ",
        bh: "ભ",
        m: "મ",
        y: "ય",
        r: "ર",
        l: "લ",
        v: "વ",
        w: "વ",
        s: "સ",
        sh: "શ",
        h: "હ",
        tta: "ટ",
        ttha: "ઠ",
        dda: "ડ",
        ddha: "ઢ",
        nna: "ણ",
        ksha: "ક્ષ",
        gya: "જ્ઞ",
        savare: "સવારે",
        savar: "સવાર",
        morning: "સવારે",
        sanje: "સાંજે",
        evening: "સાંજે",
        saanj: "સાંજ",
        ratre: "રાત્રે",
        night: "રાત્રે",
        raat: "રાત",
        bapore: "બપોરે",
        bapur: "બપોર",
        afternoon: "બપોરે",
        jamne: "જમીને",
        "after food": "જમીને",
        jamike: "જમીને",
        "bhukhya pate": "ભૂખ્યા પેટે",
        "before food": "ભૂખ્યા પેટે",
        goli: "ગોળી",
        tablet: "ગોળી",
        pill: "ગોળી",
        var: "વાર",
        times: "વાર",
        vaar: "વાર",
        jarur: "જરૂર",
        need: "જરૂર",
        jaroor: "જરૂર",
        pade: "પડે",
        pada: "પડે",
        fall: "પડે",
        to: "તો",
        then: "તો",
        toh: "તો",
      }

      let result = text.toLowerCase()
      const sortedKeys = Object.keys(transliterationMap).sort((a, b) => b.length - a.length)

      for (const english of sortedKeys) {
        const gujarati = transliterationMap[english]
        const regex = new RegExp(`\\b${english}\\b`, "gi")
        result = result.replace(regex, gujarati)
      }

      if (result === text.toLowerCase()) {
        result = text
          .toLowerCase()
          .split("")
          .map((char) => transliterationMap[char] || char)
          .join("")
      }

      console.log("[v0] Fallback transliteration result:", result)
      return result
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

  const addMedication = () => {
    if (!currentMedication.name.trim()) {
      alert("Please enter a medicine name")
      return
    }

    const doseToUse = currentMedication.dose === "CUSTOM" ? customDose : currentMedication.dose

    const newMedication: Medication = {
      id: `MED-${Date.now()}`,
      name: currentMedication.name,
      dose: doseToUse,
      qty: currentMedication.qty,
    }

    setVisitMedications([...visitMedications, newMedication])
    setCurrentMedication({ name: "", dose: "", qty: "" })
    setCustomDose("")
    setShowAddMedication(false)
  }

  const removeMedication = (id: string) => {
    setVisitMedications(visitMedications.filter((med) => med.id !== id))
  }

  const saveNewVisit = () => {
    if (!patient) return
    if (!visitDoctor) {
      alert("Please select a doctor for this visit")
      return
    }

    const newVisitRecord: VisitRecord = {
      id: `VISIT-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      notes: visitNotes,
      medications: visitMedications,
      diagnosis: visitDiagnosis,
      doctorName: visitDoctor,
      followUpDate: visitFollowUp || undefined,
    }

    const storedPatients = localStorage.getItem("patients")
    if (storedPatients) {
      const patients: Patient[] = JSON.parse(storedPatients)
      const updatedPatients = patients.map((p) => {
        if (p.id === patient.id) {
          const currentVisits = p.visits || 1
          const visitRecords = p.visitRecords || []

          return {
            ...p,
            visits: currentVisits + 1,
            visitRecords: [...visitRecords, newVisitRecord],
          }
        }
        return p
      })

      localStorage.setItem("patients", JSON.stringify(updatedPatients))

      if (visitFollowUp) {
        const newAppointment = {
          id: `APT-${Date.now()}`,
          patient: `${patient.firstName} ${patient.lastName}`,
          patientName: `${patient.firstName} ${patient.lastName}`,
          doctor: visitDoctor,
          date: visitFollowUp,
          time: "09:00",
          duration: 30,
          type: "Follow-up",
          status: "confirmed",
          department: visitDoctor.includes("Tansukh")
            ? "General Physician"
            : visitDoctor.includes("Devang")
              ? "Ano Rectal Expert"
              : visitDoctor.includes("Dhara")
                ? "Dental Surgeon"
                : "General Physician",
          phone: patient.phone,
          patientId: patient.id,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        }

        const existingAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
        const updatedAppointments = [...existingAppointments, newAppointment]
        localStorage.setItem("appointments", JSON.stringify(updatedAppointments))

        window.dispatchEvent(new CustomEvent("appointmentAdded"))

        console.log("[v0] Auto-created follow-up appointment for", visitFollowUp)
      }

      if (visitMedications.length > 0) {
        const newPrescription: Prescription = {
          id: `PRESC-${Date.now()}`,
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          date: new Date().toISOString(),
          doctorName: visitDoctor,
          medications: visitMedications,
          notes: visitNotes,
          investigation: investigation,
          diagnosis: visitDiagnosis,
          prescriptionDate: new Date().toISOString(),
          fee: fee,
        }

        const prescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
        prescriptions.push(newPrescription)
        localStorage.setItem("prescriptions", JSON.stringify(prescriptions))
      }

      let successMessage = "Visit recorded successfully!"
      if (visitFollowUp) {
        successMessage += ` Follow-up appointment automatically scheduled for ${new Date(visitFollowUp).toLocaleDateString()}.`
      }

      alert(successMessage)
      window.close()
    }
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading patient information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: white !important;
          }
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .print-prescription {
            page-break-inside: avoid;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>

      <div className="print-only print-header">
        <h1 className="text-2xl font-bold">MedCare Clinic</h1>
        <p>Dr. Tansukh Gosai | Dr. Devang Gosai | Dr. Dhara Gosai</p>
        <p>Phone: +91 98765 43210 | Email: info@medcareclinic.com</p>
      </div>

      <div
        className={`bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 ${isPrintMode ? "no-print" : ""}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.close()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Close</span>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToPatient("prev")}
                  disabled={allPatients.length <= 1}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Prev</span>
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentPatientIndex + 1} of {allPatients.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToPatient("next")}
                  disabled={allPatients.length <= 1}
                  className="flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
                New Visit Record
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="printType" className="text-sm">
                  Print:
                </Label>
                <Select value={printType} onValueChange={(value: "general" | "medication") => setPrintType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handlePrint} variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
              <Button onClick={saveNewVisit} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Save Visit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-1 ${printType === "medication" && isPrintMode ? "no-print" : ""}`}>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="print-only">
                  <h2 className="text-lg font-bold mb-4">Patient Details</h2>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <p className="text-lg font-semibold">
                    {patient.firstName} {patient.lastName}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Age</Label>
                    <p className="font-medium">{patient.age}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Gender</Label>
                    <p className="font-medium">{patient.gender}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="font-medium">{patient.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Blood Type</Label>
                  <p className="font-medium">{patient.bloodType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Allergies</Label>
                  <p className="text-sm text-red-600 dark:text-red-400">{patient.allergies || "None"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Medical History</Label>
                  <p className="text-sm">{patient.medicalHistory || "None"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Previous Visits</Label>
                  <p className="font-medium">{patient.visits || 1}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-6">
              <Card className={`${printType === "medication" && isPrintMode ? "no-print" : ""}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-green-600" />
                      Visit Details
                    </CardTitle>
                    <div className={`flex space-x-2 ${isPrintMode ? "no-print" : ""}`}>
                      {patient.visitRecords && patient.visitRecords.length > 0 && (
                        <Button
                          onClick={() => setShowPreviousMedications(true)}
                          variant="outline"
                          size="sm"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Previous Medications
                        </Button>
                      )}
                      <Button onClick={() => setShowAddMedication(true)} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medication
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="doctor">Checked by *</Label>
                      <Select value={visitDoctor} onValueChange={setVisitDoctor}>
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
                      <Label htmlFor="followup">Follow-up Date</Label>
                      <Input
                        id="followup"
                        type="date"
                        className="mt-1"
                        value={visitFollowUp}
                        onChange={(e) => setVisitFollowUp(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Textarea
                        id="diagnosis"
                        value={visitDiagnosis}
                        onChange={(e) => setVisitDiagnosis(e.target.value)}
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

                  <div>
                    <Label htmlFor="notes">Visit Notes</Label>
                    <Textarea
                      id="notes"
                      className="mt-1"
                      value={visitNotes}
                      onChange={(e) => setVisitNotes(e.target.value)}
                      rows={4}
                      placeholder="Enter detailed visit notes..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className={`print-prescription ${printType === "general" && isPrintMode ? "no-print" : ""}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Pill className="h-5 w-5 mr-2 text-purple-600" />
                      Enter List of Medicine: ({visitMedications.length})
                    </CardTitle>
                    <Button
                      onClick={() => setShowAddMedication(true)}
                      variant="outline"
                      size="sm"
                      className={isPrintMode ? "no-print" : ""}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="print-only mb-6">
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-bold">PRESCRIPTION</h2>
                      <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <strong>Patient:</strong> {patient.firstName} {patient.lastName}
                        <br />
                        <strong>Age:</strong> {patient.age} | <strong>Gender:</strong> {patient.gender}
                        <br />
                        <strong>Phone:</strong> {patient.phone}
                      </div>
                      <div>
                        <strong>Doctor:</strong> {visitDoctor}
                        <br />
                        {visitDiagnosis && (
                          <>
                            <strong>Diagnosis:</strong> {visitDiagnosis}
                            <br />
                          </>
                        )}
                        {fee && (
                          <>
                            <strong>Fee:</strong> ₹{fee}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {visitMedications.length > 0 && (
                    <div className="mb-6">
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
                              <th
                                className={`px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100 ${isPrintMode ? "no-print" : ""}`}
                              >
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {visitMedications.map((medication, index) => (
                              <tr key={medication.id}>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                  {medication.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                  {medication.dose}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{medication.qty}</td>
                                <td className={`px-4 py-3 text-sm ${isPrintMode ? "no-print" : ""}`}>
                                  <Button
                                    type="button"
                                    onClick={() => removeMedication(medication.id)}
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

                  <div className="print-only mt-8">
                    <div className="grid grid-cols-2 gap-8 mt-12">
                      <div>
                        <div className="border-t border-gray-400 pt-2">
                          <p className="text-sm text-center">Patient Signature</p>
                        </div>
                      </div>
                      <div>
                        <div className="border-t border-gray-400 pt-2">
                          <p className="text-sm text-center">Doctor Signature</p>
                        </div>
                      </div>
                    </div>
                    {prescriptionNotes && (
                      <div className="mt-4">
                        <strong>Additional Notes:</strong>
                        <p className="text-sm mt-1">{prescriptionNotes}</p>
                      </div>
                    )}
                  </div>

                  {showAddMedication && (
                    <div className="mt-6 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <h4 className="font-semibold mb-4">Add New Medication</h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="dose">Dose</Label>
                          <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-2">
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
                                  placeholder="Enter dose instructions (e.g., 'savare ane sanje jamike')"
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  onClick={handleTranslateCustomDose}
                                  disabled={isTranslating}
                                  variant="outline"
                                  size="sm"
                                  className="px-4 bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300"
                                  title="Translate to Gujarati"
                                >
                                  {isTranslating ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                                  ) : (
                                    <>
                                      <Languages className="h-4 w-4 mr-1" />
                                      <span className="text-xs">ગુજ</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                Go to{" "}
                                <a
                                  href="https://www.easygujaratityping.com/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 font-medium hover:underline hover:text-blue-800"
                                >
                                  easygujaratityping.com
                                </a>{" "}
                                for accurate Gujarati script conversion
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
                              onClick={addMedication}
                              className="bg-green-600 hover:bg-green-700 w-full"
                            >
                              Add
                            </Button>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <Button variant="outline" onClick={() => setShowAddMedication(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`mt-6 ${isPrintMode ? "no-print" : ""}`}>
                    <Label htmlFor="prescriptionNotes">Additional Notes</Label>
                    <Textarea
                      id="prescriptionNotes"
                      value={prescriptionNotes}
                      onChange={(e) => setPrescriptionNotes(e.target.value)}
                      placeholder="Any additional instructions or notes"
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {showPreviousMedications && patient && patient.visitRecords && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <FileText className="h-6 w-6 mr-3 text-blue-600" />
                    Previous Visit Medications
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Compare medications from previous visits for {patient.firstName} {patient.lastName}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreviousMedications(false)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {patient.visitRecords
                  .filter((visit) => visit.medications && visit.medications.length > 0)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((visit, index) => (
                    <Card key={visit.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="bg-blue-50 dark:bg-blue-900/20 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center">
                              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                              Visit #{patient.visitRecords.length - index} - {new Date(visit.date).toLocaleDateString()}
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <Stethoscope className="h-4 w-4 inline mr-1" />
                              {visit.doctorName}
                              {visit.diagnosis && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="font-medium">Diagnosis:</span> {visit.diagnosis}
                                </>
                              )}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {visit.medications.length} medication{visit.medications.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                  S.No
                                </th>
                                <th className="text-left py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                  Medicine Name
                                </th>
                                <th className="text-left py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                  Dose Instructions
                                </th>
                                <th className="text-left py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                  Quantity
                                </th>
                                <th className="text-left py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {visit.medications.map((medication, medIndex) => (
                                <tr
                                  key={medIndex}
                                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <td className="py-3 px-3 text-sm text-gray-900 dark:text-gray-100">{medIndex + 1}</td>
                                  <td className="py-3 px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {medication.name}
                                  </td>
                                  <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300">
                                    {medication.dose}
                                  </td>
                                  <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300">
                                    {medication.qty}
                                  </td>
                                  <td className="py-3 px-3">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const newMed: Medication = {
                                          id: `MED-${Date.now()}-${medIndex}`,
                                          name: medication.name,
                                          dose: medication.dose,
                                          qty: medication.qty,
                                        }
                                        setVisitMedications((prev) => [...prev, newMed])
                                        setShowPreviousMedications(false)
                                        alert(`Added "${medication.name}" to current prescription`)
                                      }}
                                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add to Current
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {visit.notes && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-sm">
                              <span className="font-medium text-gray-900 dark:text-gray-100">Visit Notes:</span>
                              <span className="text-gray-700 dark:text-gray-300 ml-2">{visit.notes}</span>
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                {patient.visitRecords.filter((visit) => visit.medications && visit.medications.length > 0).length ===
                  0 && (
                  <div className="text-center py-12">
                    <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Previous Medications</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This patient has no previous medication history to compare.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
