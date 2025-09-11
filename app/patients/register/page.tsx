"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, UserPlus, Users, Pill, ChevronDown, ChevronUp, CheckCircle, Trash2, Languages, Edit } from "lucide-react"
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
  profileImage?: string
  additionalImages?: string[] // Array to store multiple images
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
  const [isEditMode, setIsEditMode] = useState(false)
  const [patientId, setPatientId] = useState<string | null>(null)

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
    profileImage: "" as string,
    additionalImages: [] as string[],
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
    id: "",
    name: "",
    dose: "",
    qty: "",
  })
  const [isEditingMedication, setIsEditingMedication] = useState(false)
  const [customDose, setCustomDose] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  
  // Load patient data if patientId is provided in URL
  useEffect(() => {
    // Get patientId from URL query parameters
    const queryParams = new URLSearchParams(window.location.search)
    const id = queryParams.get('patientId')
    
    if (id) {
      setPatientId(id)
      setIsEditMode(true)
      
      // Load patient data from localStorage
      const storedPatients = JSON.parse(localStorage.getItem("patients") || "[]")
      const patient = storedPatients.find((p: PatientData) => p.id === id)
      
      if (patient) {
        // Pre-fill form with patient data
        setFormData({
          firstName: patient.firstName,
          lastName: patient.lastName,
          age: patient.age,
          gender: patient.gender,
          phone: patient.phone,
          address: patient.address,
          bloodType: patient.bloodType || "",
          allergies: patient.allergies || "",
          medicalHistory: patient.medicalHistory || "",
          dateOfVisit: new Date().toISOString().split("T")[0],
          profileImage: patient.profileImage || "",
          additionalImages: patient.additionalImages || [],
        })
        
        // Load existing prescriptions for this patient
        const storedPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
        const patientPrescriptions = storedPrescriptions.filter(
          (prescription: Prescription) => prescription.patientId === id
        )
        
        // If patient has prescriptions, load the most recent one's medications
        if (patientPrescriptions.length > 0) {
          // Sort by date descending to get the most recent prescription
          patientPrescriptions.sort((a: Prescription, b: Prescription) => 
            new Date(b.prescriptionDate).getTime() - new Date(a.prescriptionDate).getTime()
          )
          
          const latestPrescription = patientPrescriptions[0]
          if (latestPrescription.medications && latestPrescription.medications.length > 0) {
            setMedicationTable(latestPrescription.medications)
            setShowPrescription(true)
            setSelectedDoctor(latestPrescription.doctorName)
            setDiagnosis(latestPrescription.diagnosis || "")
            setInvestigation(latestPrescription.investigation || "")
            setFee(latestPrescription.fee || "")
            setPrescriptionNotes(latestPrescription.notes || "")
          }
        }
      }
    }
    
    // Load total patients count
    const storedPatients = JSON.parse(localStorage.getItem("patients") || "[]")
    setTotalPatients(storedPatients.length)
  }, [])

  const doctors = ["Dr. Tansukh Gosai", "Dr. Devang Gosai", "Dr. Dhara Gosai"]

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

  useEffect(() => {
    const patients = JSON.parse(localStorage.getItem("patients") || "[]")
    setTotalPatients(patients.length)
  }, [])

  const addMedicationToTable = () => {
    if (!currentMedication.name.trim()) {
      alert("Please enter a medicine name")
      return
    }

    const doseToUse = currentMedication.dose === "CUSTOM" ? customDose : currentMedication.dose

    if (isEditingMedication && currentMedication.id) {
      // Update existing medication
      const updatedMedicationTable = medicationTable.map(med => {
        if (med.id === currentMedication.id) {
          return {
            ...med,
            name: currentMedication.name,
            dose: doseToUse,
            qty: currentMedication.qty
          }
        }
        return med
      })
      
      setMedicationTable(updatedMedicationTable)
      setIsEditingMedication(false)
    } else {
      // Add new medication
      const newMedication: MedicationEntry = {
        id: Date.now().toString(),
        name: currentMedication.name,
        dose: doseToUse,
        qty: currentMedication.qty,
      }

      setMedicationTable([...medicationTable, newMedication])
    }
    
    // Reset form
    setCurrentMedication({ id: "", name: "", dose: "", qty: "" })
    setCustomDose("")
  }

  const removeMedicationFromTable = (id: string) => {
    setMedicationTable(medicationTable.filter((med) => med.id !== id))
  }
  
  const editMedicationInTable = (medication: MedicationEntry) => {
    setCurrentMedication({
      id: medication.id,
      name: medication.name,
      dose: medication.dose === "CUSTOM" ? "CUSTOM" : medication.dose,
      qty: medication.qty
    })
    
    if (medication.dose !== "CUSTOM" && !frequencyOptions.includes(medication.dose)) {
      setCurrentMedication(prev => ({ ...prev, dose: "CUSTOM" }))
      setCustomDose(medication.dose)
    }
    
    setIsEditingMedication(true)
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
      if (!selectedDoctor) {
        alert("Please select a doctor for the prescription.")
        return
      }
    }

    try {
      const existingPatients = JSON.parse(localStorage.getItem("patients") || "[]")
      let updatedPatients;
      let patientForPrescription;
      
      if (isEditMode && patientId) {
        // Update existing patient
        updatedPatients = existingPatients.map((patient: PatientData) => {
          if (patient.id === patientId) {
            patientForPrescription = {
              ...patient,
              ...formData
            };
            return patientForPrescription;
          }
          return patient;
        });
        
        setSuccessMessage(`Patient ${formData.firstName} ${formData.lastName} updated successfully!`);
      } else {
        // Create new patient
        const newPatient: PatientData = {
          id: `PAT-${Date.now()}`,
          ...formData,
          registrationDate: new Date().toLocaleString(),
        }
        
        patientForPrescription = newPatient;
        updatedPatients = [...existingPatients, newPatient];
        
        setSuccessMessage(`Patient ${formData.firstName} ${formData.lastName} registered successfully! Total patients: ${updatedPatients.length}`);
      }
      
      localStorage.setItem("patients", JSON.stringify(updatedPatients))

      if (showPrescription && selectedDoctor) {
        const existingPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
        let updatedPrescriptions;
        
        if (isEditMode) {
          // Check if there's an existing prescription for this patient from today
          const today = new Date().toISOString().split("T")[0];
          const existingPrescriptionIndex = existingPrescriptions.findIndex(
            (p: Prescription) => p.patientId === patientId && p.prescriptionDate === today
          );
          
          if (existingPrescriptionIndex >= 0) {
            // Update existing prescription from today
            updatedPrescriptions = existingPrescriptions.map((p: Prescription, index: number) => {
              if (index === existingPrescriptionIndex) {
                return {
                  ...p,
                  patientName: `${formData.firstName} ${formData.lastName}`,
                  doctorName: selectedDoctor,
                  medications: medicationTable,
                  diagnosis,
                  investigation,
                  fee,
                  notes: prescriptionNotes,
                }
              }
              return p;
            });
          } else {
            // Create a new prescription for this patient
            const newPrescription: Prescription = {
              id: Date.now().toString(),
              patientId: patientForPrescription.id,
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
            updatedPrescriptions = [...existingPrescriptions, newPrescription];
          }
        } else {
          // Create a new prescription for a new patient
          const newPrescription: Prescription = {
            id: Date.now().toString(),
            patientId: patientForPrescription.id,
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
          updatedPrescriptions = [...existingPrescriptions, newPrescription];
        }
        
        localStorage.setItem("prescriptions", JSON.stringify(updatedPrescriptions))

        window.dispatchEvent(new CustomEvent("prescriptionAdded"))
        
        if (isEditMode) {
          setSuccessMessage(`Patient ${formData.firstName} ${formData.lastName} updated successfully with prescription!`);
        } else {
          setSuccessMessage(`Patient ${formData.firstName} ${formData.lastName} registered successfully with prescription! Total patients: ${updatedPatients.length}`);
        }
      }

      setTotalPatients(updatedPatients.length)
      window.dispatchEvent(new CustomEvent("patientAdded"))
      setShowSuccessPopup(true)

      setTimeout(() => {
        router.push("/patients")
      }, 2000)

      console.log(isEditMode ? "Patient updated:" : "New patient registered:", patientForPrescription)
    } catch (error) {
      console.error("Error saving patient data:", error)
      alert("There was an error " + (isEditMode ? "updating" : "registering") + " the patient. Please try again.")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const translateToGujarati = async (text: string) => {
    if (!text.trim()) return ""

    setIsTranslating(true)
    try {
      // Using Google Translate API via a proxy service
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|gu`,
      )
      const data = await response.json()

      if (data.responseStatus === 200 && data.responseData) {
        return data.responseData.translatedText
      } else {
        // Fallback: Simple transliteration mapping for common medical terms
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
      return text // Return original text if translation fails
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

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return
    
    try {
      // Convert FileList to array for easier handling
      const fileArray = Array.from(files)
      
      // Limit to processing at most 4 files
      const filesToProcess = fileArray.slice(0, 4)
      
      // Process the first file as the main profile image if we don't have one yet
      if (!formData.profileImage && filesToProcess.length > 0) {
        const mainImageDataUrl = await readAndCompressImage(filesToProcess[0])
        
        // If we have more than one file, process the rest as additional images
        if (filesToProcess.length > 1) {
          const additionalFiles = filesToProcess.slice(1)
          const additionalDataUrls = await Promise.all(
            additionalFiles.map(file => readAndCompressImage(file))
          )
          
          setFormData(prev => ({
            ...prev,
            profileImage: mainImageDataUrl,
            additionalImages: [...(prev.additionalImages || []), ...additionalDataUrls]
          }))
        } else {
          // Just set the main profile image
          setFormData(prev => ({ ...prev, profileImage: mainImageDataUrl }))
        }
      } else {
        // We already have a main image, so add these as additional images
        const additionalDataUrls = await Promise.all(
          filesToProcess.map(file => readAndCompressImage(file))
        )
        
        // Make sure we don't exceed 4 images total (1 main + 3 additional)
        const currentImages = formData.additionalImages || []
        const totalImagesCount = 1 + currentImages.length + additionalDataUrls.length // 1 for main image
        
        if (totalImagesCount > 4) {
          const spaceLeft = 4 - (1 + currentImages.length)
          const newImages = additionalDataUrls.slice(0, Math.max(0, spaceLeft))
          
          setFormData(prev => ({
            ...prev,
            additionalImages: [...(prev.additionalImages || []), ...newImages]
          }))
          
          if (spaceLeft < additionalDataUrls.length) {
            alert(`Only added ${spaceLeft} image(s). Maximum of 4 images total allowed.`)
          }
        } else {
          setFormData(prev => ({
            ...prev,
            additionalImages: [...(prev.additionalImages || []), ...additionalDataUrls]
          }))
        }
      }
    } catch (err) {
      console.error("[v0] Error reading images:", err)
      alert("Unable to process one or more selected images. Please try different files.")
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    await handleFiles(e.target.files)
    if (e.currentTarget) e.currentTarget.value = ""
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    const { files } = e.dataTransfer
    if (files && files.length > 0) {
      await handleFiles(files)
    }
  }

  const openFilePicker = () => document.getElementById("patient-image-input")?.click()

  async function readAndCompressImage(file: File): Promise<string> {
    const baseDataUrl = await fileToDataURL(file)
    const resized = await resizeDataURL(baseDataUrl, 1400) // larger for print
    return resized
  }

  function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (e) => reject(e)
      reader.readAsDataURL(file)
    })
  }

  function resizeDataURL(dataUrl: string, maxSize: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const { width, height } = img
        const scale = Math.min(1, maxSize / Math.max(width, height))
        const targetW = Math.round(width * scale)
        const targetH = Math.round(height * scale)
        const canvas = document.createElement("canvas")
        canvas.width = targetW
        canvas.height = targetH
        const ctx = canvas.getContext("2d")
        if (!ctx) return resolve(dataUrl)
        ctx.drawImage(img, 0, 0, targetW, targetH)
        const out = canvas.toDataURL("image/jpeg", 0.85)
        resolve(out)
      }
      img.onerror = () => resolve(dataUrl) // fallback to original if any error
      img.src = dataUrl
    })
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
                {isEditMode ? (
                  <Edit className="h-8 w-8 text-blue-600" />
                ) : (
                  <UserPlus className="h-8 w-8 text-blue-600" />
                )}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isEditMode ? "Edit Patient" : "Patient Registration"}
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {isEditMode 
                  ? "Update patient information in GOSAI CLINIC management system."
                  : "Register a new patient in GOSAI CLINIC management system."}
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

                  <div className="space-y-2">
                    <Label htmlFor="profileImage">Patient Photo / Report Image</Label>
                    <Input
                      id="patient-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                      multiple
                    />
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Upload image by clicking or dragging and dropping"
                      onClick={openFilePicker}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openFilePicker()}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      className={`relative w-full border-2 border-dashed rounded-lg transition-colors
                        ${isDragActive ? "border-blue-500 bg-blue-50/40 dark:bg-blue-900/10" : "border-gray-300 dark:border-gray-600"}
                        ${formData.profileImage ? "bg-white" : "bg-gray-50 dark:bg-gray-800"}`}
                      style={{ minHeight: 280 }}
                    >
                      {formData.profileImage ? (
                        <div className="p-3 flex flex-col gap-3">
                          <div className="grid grid-cols-2 gap-2">
                            {/* Main profile image */}
                            <div className="col-span-2 aspect-[4/3] max-h-[280px] flex items-center justify-center bg-white rounded-md overflow-hidden">
                              <img
                                src={formData.profileImage || "/placeholder.svg"}
                                alt="Main image preview"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            
                            {/* Additional images */}
                            {formData.additionalImages && formData.additionalImages.map((img, index) => (
                              <div key={index} className="relative aspect-[4/3] flex items-center justify-center bg-white rounded-md overflow-hidden border border-gray-200">
                                <img
                                  src={img}
                                  alt={`Additional image ${index + 1}`}
                                  className="max-w-full max-h-full object-contain"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const updatedImages = [...(formData.additionalImages || [])];
                                    updatedImages.splice(index, 1);
                                    setFormData(prev => ({ ...prev, additionalImages: updatedImages }));
                                  }}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                            
                            {/* Placeholder slots for remaining images */}
                            {Array.from({ length: Math.max(0, 3 - (formData.additionalImages?.length || 0)) }).map((_, index) => (
                              <div 
                                key={`empty-${index}`} 
                                className="aspect-[4/3] flex items-center justify-center bg-gray-50 rounded-md border border-dashed border-gray-300 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFilePicker();
                                }}
                              >
                                <span className="text-gray-400 text-sm">Add image</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              type="button" 
                              variant="secondary" 
                              onClick={(e) => {
                                e.stopPropagation();
                                openFilePicker();
                              }}
                            >
                              Add Images
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setFormData((prev) => ({ ...prev, profileImage: "", additionalImages: [] }))
                              }}
                            >
                              Remove All
                            </Button>
                            <span className="text-xs text-gray-500">
                              Tip: Up to 4 images total. Images will be properly arranged in print.
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full min-h-[280px] flex flex-col items-center justify-center gap-3 text-center p-6">
                          <img src="/images/upload-dropzone.png" alt="Upload placeholder" className="w-32 opacity-75" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PNG/JPG preferred. We’ll auto-resize for printing.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      The uploaded images will appear in print preview and the printed report, scaled to fit without
                      cropping.
                    </p>
                    <style jsx global>{`
                      @media print {
                        .grid-cols-2 {
                          display: grid;
                          grid-template-columns: repeat(2, 1fr);
                          gap: 12px;
                          page-break-inside: avoid;
                          margin-bottom: 15px;
                        }
                        img {
                          max-height: 280px !important;
                          object-fit: contain;
                          width: 100%;
                        }
                      }
                    `}</style>
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
                            className={`${isEditingMedication ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} w-full`}
                          >
                            {isEditingMedication ? "Update" : "Add"}
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
                                    <div className="flex space-x-2">
                                      <Button
                                        type="button"
                                        onClick={() => editMedicationInTable(medication)}
                                        variant="outline"
                                        size="sm"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        onClick={() => removeMedicationFromTable(medication.id)}
                                        variant="destructive"
                                        size="sm"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
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
                {isEditMode ? (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    {showPrescription && selectedDoctor ? "Update Patient & Create Prescription" : "Update Patient"}
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {showPrescription && selectedDoctor ? "Register Patient & Create Prescription" : "Register Patient"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
