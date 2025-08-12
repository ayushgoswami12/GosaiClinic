"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { ArrowLeft, Calendar, Clock, User, Stethoscope } from "lucide-react"
import Link from "next/link"

const departments = [
  "General Physician",
  "Ano Rectal Expert",
  "Dental Surgeon",
]

const doctors = [
  { id: 1, name: "Dr. Tansukh Gosai", department: "General Physician", available: true },
  { id: 2, name: "Dr. Devang Gosai", department: "Ano Rectal Expert", available: true },
  { id: 3, name: "Dr. Dhara Gosai", department: "Dental Surgeon", available: true },
]

const appointmentTypes = ["Consultation", "Follow-up", "Emergency"]

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
]

export default function BookAppointment() {
  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    department: "",
    doctor: "",
    appointmentType: "",
    date: "",
    time: "",
    duration: "30",
    notes: "",
  })

  const [availableDoctors, setAvailableDoctors] = useState(doctors)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Create new appointment object
      const newAppointment = {
        id: `APT-${Date.now()}`,
        ...formData,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        patientId: `PAT-${Date.now()}`, // Generate a temporary patient ID
        lastUpdated: new Date().toISOString(), // Track last update
      }

      // Get existing appointments from localStorage
      const existingAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
      const updatedAppointments = [...existingAppointments, newAppointment]
      
      // Save to localStorage
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments))
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("appointmentAdded"))
      
      alert(`Appointment booked successfully for ${formData.patientName}!`)
      
      // Reset form
      setFormData({
        patientName: "",
        patientPhone: "",
        patientEmail: "",
        department: "",
        doctor: "",
        appointmentType: "",
        date: "",
        time: "",
        duration: "30",
        notes: "",
      })
      
      // Redirect to appointments list
      window.location.href = "/appointments"
      
    } catch (error) {
      console.error("Error booking appointment:", error)
      alert("There was an error booking the appointment. Please try again.")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // If changing department, always clear the doctor first
    if (field === "department") {
      setFormData((prev) => ({ ...prev, [field]: value, doctor: "" }))
      
      const filtered = doctors.filter((doctor) => doctor.department === value && doctor.available)
      setAvailableDoctors(filtered)
      
      // Auto-select the doctor for the new department
      if (filtered.length === 1) {
        setTimeout(() => {
          setFormData((prev) => ({ ...prev, doctor: filtered[0].name }))
        }, 0)
      }
    } else {
      // For other fields, just update normally
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/appointments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Appointments
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Book New Appointment</h1>
          </div>
          <p className="text-gray-600 mt-2 dark:text-gray-400">Schedule a new appointment for a patient</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Patient Information</span>
                </CardTitle>
                <CardDescription>Enter patient details for the appointment</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Patient Name *</Label>
                    <Input
                      id="patientName"
                      value={formData.patientName}
                      onChange={(e) => handleInputChange("patientName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientPhone">Phone Number *</Label>
                    <Input
                      id="patientPhone"
                      type="tel"
                      value={formData.patientPhone}
                      onChange={(e) => handleInputChange("patientPhone", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientEmail">Email Address</Label>
                  <Input
                    id="patientEmail"
                    type="email"
                    value={formData.patientEmail}
                    onChange={(e) => handleInputChange("patientEmail", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                  <span>Appointment Details</span>
                </CardTitle>
                <CardDescription>Select department, doctor, and appointment type</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleInputChange("department", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Doctor *</Label>
                    <Select
                      value={formData.doctor}
                      onValueChange={(value) => handleInputChange("doctor", value)}
                      disabled={!formData.department}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDoctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.name}>
                            {doctor.name} - {doctor.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointmentType">Appointment Type *</Label>
                  <Select
                    value={formData.appointmentType}
                    onValueChange={(value) => handleInputChange("appointmentType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span>Schedule</span>
                </CardTitle>
                <CardDescription>Choose date, time, and duration for the appointment</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements or notes for the appointment..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/appointments">Cancel</Link>
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
