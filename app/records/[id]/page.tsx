"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  ArrowLeft,
  Edit,
  Download,
  Plus,
  Calendar,
  User,
  Activity,
  Pill,
  TestTube,
  Heart,
  AlertCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"

// Mock detailed patient record data
const mockPatientRecord = {
  id: 1,
  patientName: "John Smith",
  age: 45,
  gender: "Male",
  bloodType: "A+",
  allergies: ["Penicillin", "Shellfish"],
  emergencyContact: "Jane Smith - (555) 123-4567",
  primaryDoctor: "Dr. Sarah Wilson",
  department: "Cardiology",
}

const mockMedicalHistory = [
  {
    id: 1,
    date: "2024-01-15",
    type: "Diagnosis",
    title: "Hypertension Stage 1",
    doctor: "Dr. Sarah Wilson",
    department: "Cardiology",
    status: "Active",
    description: "Patient diagnosed with stage 1 hypertension. Blood pressure readings consistently above 140/90 mmHg.",
    treatment: "Started on ACE inhibitor (Lisinopril 10mg daily). Lifestyle modifications recommended.",
    followUp: "2024-02-15",
  },
  {
    id: 2,
    date: "2024-01-10",
    type: "Lab Result",
    title: "Comprehensive Metabolic Panel",
    doctor: "Dr. Sarah Wilson",
    department: "Laboratory",
    status: "Reviewed",
    description: "Routine blood work to assess overall health and monitor cardiovascular risk factors.",
    results: "Total cholesterol: 220 mg/dL (High), LDL: 150 mg/dL (High), HDL: 40 mg/dL (Low)",
    followUp: "2024-04-10",
  },
  {
    id: 3,
    date: "2024-01-05",
    type: "Prescription",
    title: "Cardiovascular Medications",
    doctor: "Dr. Sarah Wilson",
    department: "Cardiology",
    status: "Active",
    description: "Prescribed medications for hypertension and cholesterol management.",
    medications: "Lisinopril 10mg daily, Atorvastatin 20mg daily",
    followUp: "2024-02-05",
  },
]

const mockVitals = [
  { date: "2024-01-15", bloodPressure: "145/92", heartRate: "78", temperature: "98.6°F", weight: "185 lbs" },
  { date: "2024-01-10", bloodPressure: "142/88", heartRate: "82", temperature: "98.4°F", weight: "186 lbs" },
  { date: "2024-01-05", bloodPressure: "148/94", heartRate: "76", temperature: "98.7°F", weight: "184 lbs" },
]

export default function PatientRecord() {
  const [newNote, setNewNote] = useState("")

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Diagnosis":
        return <Activity className="h-4 w-4 text-blue-600" />
      case "Lab Result":
        return <TestTube className="h-4 w-4 text-green-600" />
      case "Prescription":
        return <Pill className="h-4 w-4 text-purple-600" />
      case "Surgery":
        return <Heart className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Completed":
        return "bg-blue-100 text-blue-800"
      case "Reviewed":
        return "bg-gray-100 text-gray-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/records">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Records
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <span>Medical Record - {mockPatientRecord.patientName}</span>
              </h1>
              <p className="text-gray-600 mt-2">Comprehensive medical history and records</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Record
              </Button>
            </div>
          </div>
        </div>

        {/* Patient Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Patient Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900">{mockPatientRecord.patientName}</h4>
                <p className="text-sm text-gray-600">
                  {mockPatientRecord.age} years old, {mockPatientRecord.gender}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Blood Type</h4>
                <p className="text-sm text-gray-600">{mockPatientRecord.bloodType}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Primary Doctor</h4>
                <p className="text-sm text-gray-600">{mockPatientRecord.primaryDoctor}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Department</h4>
                <p className="text-sm text-gray-600">{mockPatientRecord.department}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Known Allergies</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockPatientRecord.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Emergency Contact</h4>
                  <p className="text-sm text-gray-600">{mockPatientRecord.emergencyContact}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="history">Medical History</TabsTrigger>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Medical History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Medical History</CardTitle>
                    <CardDescription>Complete medical history and treatment records</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockMedicalHistory.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(entry.type)}
                          <h3 className="font-semibold text-lg">{entry.title}</h3>
                          <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{entry.date}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Doctor:</span>
                          <p className="text-gray-600">{entry.doctor}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Department:</span>
                          <p className="text-gray-600">{entry.department}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">Description:</span>
                          <p className="text-gray-600 text-sm">{entry.description}</p>
                        </div>
                        {entry.treatment && (
                          <div>
                            <span className="font-medium text-gray-700">Treatment:</span>
                            <p className="text-gray-600 text-sm">{entry.treatment}</p>
                          </div>
                        )}
                        {entry.results && (
                          <div>
                            <span className="font-medium text-gray-700">Results:</span>
                            <p className="text-gray-600 text-sm">{entry.results}</p>
                          </div>
                        )}
                        {entry.medications && (
                          <div>
                            <span className="font-medium text-gray-700">Medications:</span>
                            <p className="text-gray-600 text-sm">{entry.medications}</p>
                          </div>
                        )}
                        {entry.followUp && (
                          <div className="flex items-center space-x-1 text-sm">
                            <Clock className="h-3 w-3 text-blue-600" />
                            <span className="font-medium text-gray-700">Follow-up:</span>
                            <span className="text-blue-600">{entry.followUp}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vital Signs Tab */}
          <TabsContent value="vitals">
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs History</CardTitle>
                <CardDescription>Patient vital signs and measurements over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Date</th>
                        <th className="text-left p-3 font-semibold">Blood Pressure</th>
                        <th className="text-left p-3 font-semibold">Heart Rate</th>
                        <th className="text-left p-3 font-semibold">Temperature</th>
                        <th className="text-left p-3 font-semibold">Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockVitals.map((vital, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3">{vital.date}</td>
                          <td className="p-3 font-medium">{vital.bloodPressure}</td>
                          <td className="p-3">{vital.heartRate} bpm</td>
                          <td className="p-3">{vital.temperature}</td>
                          <td className="p-3">{vital.weight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clinical Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Notes</CardTitle>
                <CardDescription>Add and view clinical notes and observations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <Textarea
                      placeholder="Add a new clinical note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="mb-3"
                    />
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Dr. Sarah Wilson</span>
                        <span className="text-sm text-gray-500">2024-01-15 10:30 AM</span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Patient shows good compliance with medication regimen. Blood pressure readings have improved
                        since last visit. Continue current treatment plan and monitor closely.
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Dr. Sarah Wilson</span>
                        <span className="text-sm text-gray-500">2024-01-10 2:15 PM</span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Initial consultation for hypertension. Patient reports occasional headaches and fatigue.
                        Recommended lifestyle modifications including diet and exercise changes.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Medical Documents</CardTitle>
                    <CardDescription>Patient medical documents and files</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">ECG Report - 2024-01-15</p>
                        <p className="text-sm text-gray-600">Electrocardiogram results</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TestTube className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Lab Results - 2024-01-10</p>
                        <p className="text-sm text-gray-600">Comprehensive metabolic panel</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
