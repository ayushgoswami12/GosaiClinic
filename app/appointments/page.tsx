"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  XCircle,
  Check,
} from "lucide-react"

const mockAppointments = [
  {
    id: 1,
    patient: "John Smith",
    doctor: "Dr. Tansukh Gosai",
    date: new Date().toISOString().split("T")[0], // Today's date
    time: "09:00",
    duration: 30,
    type: "Consultation",
    status: "confirmed",
    department: "General Physician",
  },
  {
    id: 2,
    patient: "Emily Brown",
    doctor: "Dr. Devang Gosai",
    date: new Date().toISOString().split("T")[0], // Today's date
    time: "10:30",
    duration: 45,
    type: "Follow-up",
    status: "done",
    department: "Ano Rectal Expert",
  },
  {
    id: 3,
    patient: "Mike Davis",
    doctor: "Dr. Dhara Gosai",
    date: new Date().toISOString().split("T")[0], // Today's date
    time: "11:15",
    duration: 60,
    type: "Emergency",
    status: "urgent",
    department: "Dental Surgeon",
  },
  {
    id: 4,
    patient: "Sarah Johnson",
    doctor: "Dr. Tansukh Gosai",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Tomorrow
    time: "14:00",
    duration: 30,
    type: "Follow-up",
    status: "pending",
    department: "General Physician",
  },
  {
    id: 5,
    patient: "David Wilson",
    doctor: "Dr. Devang Gosai",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Tomorrow
    time: "15:30",
    duration: 30,
    type: "Consultation",
    status: "confirmed",
    department: "Ano Rectal Expert",
  },
]

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
]

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [viewMode, setViewMode] = useState<"day" | "week">("day")
  const [statusFilter, setStatusFilter] = useState("all")
  const [appointments, setAppointments] = useState<any[]>([])

  // Load appointments from localStorage with error handling
  const loadAppointments = () => {
    try {
      const storedAppointments = localStorage.getItem("appointments")
      if (storedAppointments) {
        const parsedAppointments = JSON.parse(storedAppointments)
        setAppointments(parsedAppointments)
      } else {
        // Initialize empty appointments array if none exists
        localStorage.setItem("appointments", JSON.stringify([]))
        setAppointments([])
      }
    } catch (error) {
      console.error("Error loading appointments:", error)
      // Reset to empty array if there's an error
      localStorage.setItem("appointments", JSON.stringify([]))
      setAppointments([])
    }
  }

  useEffect(() => {
    loadAppointments()

    // Listen for new appointments and updates
    const handleAppointmentAdded = () => {
      loadAppointments()
    }

    const handleAppointmentUpdated = () => {
      loadAppointments()
    }

    // Also listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "appointments") {
        loadAppointments()
      }
    }

    window.addEventListener("appointmentAdded", handleAppointmentAdded)
    window.addEventListener("appointmentUpdated", handleAppointmentUpdated)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("appointmentAdded", handleAppointmentAdded)
      window.removeEventListener("appointmentUpdated", handleAppointmentUpdated)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setSelectedDate(today)

    // Update date daily at midnight
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const timeUntilMidnight = tomorrow.getTime() - now.getTime()

    const timer = setTimeout(() => {
      setSelectedDate(new Date().toISOString().split("T")[0])
      // Set up daily interval
      const dailyInterval = setInterval(
        () => {
          setSelectedDate(new Date().toISOString().split("T")[0])
        },
        24 * 60 * 60 * 1000,
      )

      return () => clearInterval(dailyInterval)
    }, timeUntilMidnight)

    return () => clearTimeout(timer)
  }, [])

  const updateAppointmentStatus = (appointmentId: number, newStatus: string) => {
    setAppointments((prev) => {
      const updatedAppointments = prev.map((apt) => 
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      )
      
      // Save to localStorage
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments))
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("appointmentUpdated"))
      
      return updatedAppointments
    })
  }

  const markAsDone = (appointmentId: number) => {
    updateAppointmentStatus(appointmentId, "done")
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesDate = viewMode === "day" ? appointment.date === selectedDate : true
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
    return matchesDate && matchesStatus
  })

  const todaysCompletedAppointments = appointments.filter(
    (apt) => apt.date === new Date().toISOString().split("T")[0] && apt.status === "done",
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      case "done":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "urgent":
        return <AlertCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "done":
        return <Check className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const navigateDate = (direction: "prev" | "next") => {
    const currentDate = new Date(selectedDate)
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1))
    setSelectedDate(newDate.toISOString().split("T")[0])
  }

  const isToday = selectedDate === new Date().toISOString().split("T")[0]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-500" />
                <span>GOSAI CLINIC - Appointments</span>
              </h1>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-2">
                {isToday ? "Today's Schedule" : "Manage hospital appointments and schedules"}
              </p>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Link href="/appointments/book">
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Link>
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
                <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
              <div className="text-sm lg:text-lg font-semibold min-w-32 text-center dark:text-white">
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {isToday && <span className="text-blue-600 text-xs lg:text-sm ml-2">(Today)</span>}
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
                <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant={viewMode === "day" ? "default" : "outline"} size="sm" onClick={() => setViewMode("day")} className="text-xs lg:text-sm">
                Day
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("week")}
                className="text-xs lg:text-sm"
              >
                Week
              </Button>
            </div>
          </div>

          <div className="flex items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                <SelectValue className="text-xs lg:text-sm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs lg:text-sm">All Status</SelectItem>
                <SelectItem value="confirmed" className="text-xs lg:text-sm">Confirmed</SelectItem>
                <SelectItem value="pending" className="text-xs lg:text-sm">Pending</SelectItem>
                <SelectItem value="urgent" className="text-xs lg:text-sm">Urgent</SelectItem>
                <SelectItem value="done" className="text-xs lg:text-sm">Completed</SelectItem>
                <SelectItem value="cancelled" className="text-xs lg:text-sm">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Time Schedule */}
          <div className="lg:col-span-3">
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Daily Schedule</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  {viewMode === "day"
                    ? `Appointments for ${new Date(selectedDate).toLocaleDateString()}`
                    : "Weekly appointment overview"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {timeSlots.map((timeSlot) => {
                    const appointmentsAtTime = filteredAppointments.filter((apt) => apt.time === timeSlot)
                    return (
                      <div
                        key={timeSlot}
                        className="flex items-center space-x-2 sm:space-x-4 py-2 border-b border-gray-100 dark:border-gray-700"
                      >
                        <div className="w-12 sm:w-16 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{timeSlot}</div>
                        <div className="flex-1">
                          {appointmentsAtTime.length > 0 ? (
                            <div className="space-y-2">
                              {appointmentsAtTime.map((appointment) => (
                                <div
                                  key={appointment.id}
                                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                      {getStatusIcon(appointment.status)}
                                      <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                                    </div>
                                    <div>
                                      <div className="text-sm sm:text-base font-medium dark:text-white">{appointment.patient}</div>
                                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        {appointment.type} • {appointment.duration} min • {appointment.department}
                                      </div>
                                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                                        <Stethoscope className="h-3 w-3" />
                                        <span>{appointment.doctor}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-1 sm:space-x-2">
                                    {appointment.status !== "done" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => markAsDone(appointment.id)}
                                        className="text-xs sm:text-sm bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                      >
                                        <Check className="h-3 w-3 mr-1" />
                                        Done
                                      </Button>
                                    )}
                                    <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                                      Edit
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                                      View
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-xs sm:text-sm italic">No appointments</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointment Summary */}
          <div className="lg:col-span-1">
            <div className="space-y-4 lg:space-y-6">
              {/* Today's Stats */}
              <Card className="dark:bg-gray-800">
                <CardHeader className="py-3 lg:py-4">
                  <CardTitle className="text-base lg:text-lg dark:text-white">Today's Summary</CardTitle>
                </CardHeader>
                <CardContent className="py-2 lg:py-3">
                  <div className="space-y-2 lg:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Total Appointments</span>
                      <span className="text-xs lg:text-sm font-semibold dark:text-white">{filteredAppointments.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Confirmed</span>
                      <span className="text-xs lg:text-sm font-semibold text-green-600">
                        {filteredAppointments.filter((apt) => apt.status === "confirmed").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Completed</span>
                      <span className="text-xs lg:text-sm font-semibold text-blue-600">
                        {filteredAppointments.filter((apt) => apt.status === "done").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Pending</span>
                      <span className="text-xs lg:text-sm font-semibold text-yellow-600">
                        {filteredAppointments.filter((apt) => apt.status === "pending").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Urgent</span>
                      <span className="text-xs lg:text-sm font-semibold text-red-600">
                        {filteredAppointments.filter((apt) => apt.status === "urgent").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {todaysCompletedAppointments.length > 0 && (
                <Card className="dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg dark:text-white flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span>Today's Completed</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {todaysCompletedAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                        >
                          <div className="font-medium text-sm dark:text-white">{appointment.patient}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {appointment.time} • {appointment.type}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center space-x-1 mt-1">
                            <Stethoscope className="h-3 w-3" />
                            <span>{appointment.doctor}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="dark:bg-gray-800">
                <CardHeader className="py-3 lg:py-4">
                  <CardTitle className="text-base lg:text-lg dark:text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="py-2 lg:py-3">
                  <div className="space-y-2 lg:space-y-3">
                    <Button asChild className="w-full justify-start bg-transparent text-xs lg:text-sm py-1 lg:py-2" variant="outline">
                      <Link href="/appointments/book">
                        <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                        Book Appointment
                      </Link>
                    </Button>
                    <Button className="w-full justify-start bg-transparent text-xs lg:text-sm py-1 lg:py-2" variant="outline">
                      <Calendar className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                      View Calendar
                    </Button>
                    <Button className="w-full justify-start bg-transparent text-xs lg:text-sm py-1 lg:py-2" variant="outline">
                      <User className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                      Patient Search
                    </Button>
                    <Button className="w-full justify-start bg-transparent text-xs lg:text-sm py-1 lg:py-2" variant="outline">
                      <Stethoscope className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                      Doctor Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card className="dark:bg-gray-800">
                <CardHeader className="py-3 lg:py-4">
                  <CardTitle className="text-base lg:text-lg dark:text-white">Next Appointments</CardTitle>
                </CardHeader>
                <CardContent className="py-2 lg:py-3">
                  <div className="space-y-2 lg:space-y-3">
                    {filteredAppointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="font-medium text-xs lg:text-sm dark:text-white">{appointment.patient}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {appointment.time} • {appointment.type}
                        </div>
                        <div className="flex items-center mt-1">
                          <Badge className={`${getStatusColor(appointment.status)} text-xs`}>{appointment.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
