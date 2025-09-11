"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { MedicineAutocomplete } from "@/components/ui/medicine-autocomplete"
import { Pill, Trash, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, User, Phone, Calendar as CalendarIcon, Clock, Plus, Printer } from "lucide-react"
import { cn } from "@/lib/utils"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string[]
  duration: string
  instructions: string
}

interface Patient {
  id: string
  firstName: string
  lastName: string
  age: string
  gender: string
  phone: string
  address?: string
  bloodType?: string
  allergies?: string
  medicalHistory?: string
  dateOfVisit?: string
  registrationDate: string
  visits?: number
  visitRecords?: any[]
  profileImage?: string
  additionalImages?: string[]
}

interface FullVisitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visitNotes: string
  setVisitNotes: (notes: string) => void
  visitDiagnosis: string
  setVisitDiagnosis: (diagnosis: string) => void
  visitDoctor: string
  setVisitDoctor: (doctor: string) => void
  visitFollowUp: string
  setVisitFollowUp: (followUp: string) => void
  visitMedications: Medication[]
  setVisitMedications: (medications: Medication[]) => void
  onSave: () => void
  patient: Patient | null
}

export function FullVisitDialog({
  open,
  onOpenChange,
  visitNotes,
  setVisitNotes,
  visitDiagnosis,
  setVisitDiagnosis,
  visitDoctor,
  setVisitDoctor,
  visitFollowUp,
  setVisitFollowUp,
  visitMedications,
  setVisitMedications,
  onSave,
  patient
}: FullVisitDialogProps) {
  const [currentMedication, setCurrentMedication] = useState({ 
    name: '', 
    dosage: '', 
    frequency: [''], 
    duration: '', 
    instructions: '' 
  })
  const [showAddMedication, setShowAddMedication] = useState(true)
  const [selectedDose, setSelectedDose] = useState('')
  const [quantity, setQuantity] = useState('')
  const [investigation, setInvestigation] = useState('')
  const [fee, setFee] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const medicationsPerPage = 5

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
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
          .grid-cols-2 {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            page-break-inside: avoid;
          }
          img {
            max-height: 180px !important;
            object-fit: contain;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>
      <div className="bg-white dark:bg-gray-800 w-full max-w-7xl h-[90vh] rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Record Patient Visit</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="no-print" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print Current Page
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left side - Medication Management */}
          <div className="w-2/3 p-6 overflow-y-auto border-r">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-blue-600" />
                  <span>Prescription</span>
                </CardTitle>
                <CardDescription>Add prescription details for this visit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Doctor and Visit Details */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Checked by</Label>
                    <Select value={visitDoctor} onValueChange={setVisitDoctor}>
                      <SelectTrigger id="doctor">
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dr. Smith">Dr. Smith</SelectItem>
                        <SelectItem value="Dr. Johnson">Dr. Johnson</SelectItem>
                        <SelectItem value="Dr. Williams">Dr. Williams</SelectItem>
                        <SelectItem value="Dr. Brown">Dr. Brown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Textarea
                      id="diagnosis"
                      value={visitDiagnosis}
                      onChange={(e) => setVisitDiagnosis(e.target.value)}
                      placeholder="Enter diagnosis"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="investigation">Investigation</Label>
                    <Textarea
                      id="investigation"
                      value={investigation}
                      onChange={(e) => setInvestigation(e.target.value)}
                      placeholder="Enter investigation details"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee">Fee</Label>
                    <Input
                      id="fee"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      placeholder="Enter fee amount"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Enter List of Medicine:</h3>
                  
                  {/* Dose Options */}
                  <div className="space-y-2">
                    <Label>Dose</Label>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dose1"
                          name="dose"
                          className="h-4 w-4"
                          checked={selectedDose === 'સવારે ભૂખ્યા પેટે'}
                          onChange={() => setSelectedDose('સવારે ભૂખ્યા પેટે')}
                        />
                        <Label htmlFor="dose1" className="text-sm">સવારે ભૂખ્યા પેટે</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dose2"
                          name="dose"
                          className="h-4 w-4"
                          checked={selectedDose === 'સવારે જમીને'}
                          onChange={() => setSelectedDose('સવારે જમીને')}
                        />
                        <Label htmlFor="dose2" className="text-sm">સવારે જમીને</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dose3"
                          name="dose"
                          className="h-4 w-4"
                          checked={selectedDose === 'સવાર સાંજ ભૂખ્યા પેટે'}
                          onChange={() => setSelectedDose('સવાર સાંજ ભૂખ્યા પેટે')}
                        />
                        <Label htmlFor="dose3" className="text-sm">સવાર સાંજ ભૂખ્યા પેટે</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dose4"
                          name="dose"
                          className="h-4 w-4"
                          checked={selectedDose === 'સવાર બપોરે સાંજ ભૂખ્યા પેટે'}
                          onChange={() => setSelectedDose('સવાર બપોરે સાંજ ભૂખ્યા પેટે')}
                        />
                        <Label htmlFor="dose4" className="text-sm">સવાર બપોરે સાંજ ભૂખ્યા પેટે</Label>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dose5"
                          name="dose"
                          className="h-4 w-4"
                          checked={selectedDose === 'બપોરે ભૂખ્યા પેટે'}
                          onChange={() => setSelectedDose('બપોરે ભૂખ્યા પેટે')}
                        />
                        <Label htmlFor="dose5" className="text-sm">બપોરે ભૂખ્યા પેટે</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dose6"
                          name="dose"
                          className="h-4 w-4"
                          checked={selectedDose === 'બપોરે જમીને'}
                          onChange={() => setSelectedDose('બપોરે જમીને')}
                        />
                        <Label htmlFor="dose6" className="text-sm">બપોરે જમીને</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dose7"
                          name="dose"
                          className="h-4 w-4"
                          checked={selectedDose === 'સવાર સાંજ જમીને'}
                          onChange={() => setSelectedDose('સવાર સાંજ જમીને')}
                        />
                        <Label htmlFor="dose7" className="text-sm">સવાર સાંજ જમીને</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dose8"
                          name="dose"
                          className="h-4 w-4"
                          checked={selectedDose === 'સવાર બપોરે સાંજ જમીને'}
                          onChange={() => setSelectedDose('સવાર બપોરે સાંજ જમીને')}
                        />
                        <Label htmlFor="dose8" className="text-sm">સવાર બપોરે સાંજ જમીને</Label>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dose9"
                          name="dose"
                          className="h-4 w-4"
                          checked={selectedDose === 'રાત્રે ભૂખ્યા પેટે'}
                          onChange={() => setSelectedDose('રાત્રે ભૂખ્યા પેટે')}
                        />
                        <Label htmlFor="dose9" className="text-sm">રાત્રે ભૂખ્યા પેટે</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dose10"
                          name="dose"
                          className="h-4 w-4"
                          checked={selectedDose === 'રાત્રે જમીને'}
                          onChange={() => setSelectedDose('રાત્રે જમીને')}
                        />
                        <Label htmlFor="dose10" className="text-sm">રાત્રે જમીને</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dose11"
                          name="dose"
                          className="h-4 w-4"
                          checked={selectedDose === 'જરૂર પડે તો'}
                          onChange={() => setSelectedDose('જરૂર પડે તો')}
                        />
                        <Label htmlFor="dose11" className="text-sm">જરૂર પડે તો</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dose12"
                          name="dose"
                          className="h-4 w-4"
                          checked={selectedDose === 'Custom'}
                          onChange={() => setSelectedDose('Custom')}
                        />
                        <Label htmlFor="dose12" className="text-sm">Custom</Label>
                      </div>
                    </div>
                  </div>

                  {/* Medicine Selection and Add Button */}
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="medicine">Medicine</Label>
                      <MedicineAutocomplete
                        value={currentMedication.name}
                        onChange={(value) =>
                          setCurrentMedication({ ...currentMedication, name: value })
                        }
                        placeholder="Enter medicine name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Qty</Label>
                      <Input
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g., 10"
                      />
                    </div>
                    <Button 
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => {
                        if (!currentMedication.name) {
                          alert('Please enter a medicine name');
                          return;
                        }
                        
                        const newMed: Medication = {
                          id: Date.now().toString(),
                          name: currentMedication.name,
                          dosage: quantity,
                          frequency: [selectedDose],
                          duration: '',
                          instructions: visitNotes
                        };
                        
                        setVisitMedications([...visitMedications, newMed]);
                        setCurrentMedication({ 
                          name: '', 
                          dosage: '', 
                          frequency: [''], 
                          duration: '', 
                          instructions: '' 
                        });
                        setQuantity('');
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Medication List */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Current Medications</h3>
                  {visitMedications.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medicine</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead className="no-print">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {visitMedications
                            .slice(
                              (currentPage - 1) * medicationsPerPage,
                              currentPage * medicationsPerPage
                            )
                            .map((med) => (
                              <TableRow key={med.id}>
                                <TableCell>{med.name}</TableCell>
                                <TableCell>{med.dosage}</TableCell>
                                <TableCell>{med.frequency.join(', ')}</TableCell>
                                <TableCell className="no-print">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setVisitMedications(visitMedications.filter((m) => m.id !== med.id))
                                    }}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                      
                      {/* Pagination Navigation */}
                      <div className="flex items-center justify-between p-2 border-t no-print">
                        <div className="text-sm text-muted-foreground">
                          Showing page {currentPage} of {Math.ceil(visitMedications.length / medicationsPerPage)}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(visitMedications.length / medicationsPerPage)))}
                            disabled={currentPage >= Math.ceil(visitMedications.length / medicationsPerPage)}
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Print Information */}
                      <div className="print-only p-4 text-center border-t">
                        <p className="text-sm">Showing medications {(currentPage - 1) * medicationsPerPage + 1} to {Math.min(currentPage * medicationsPerPage, visitMedications.length)} of {visitMedications.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Page {currentPage} of {Math.ceil(visitMedications.length / medicationsPerPage)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-[100px] flex-col items-center justify-center rounded-md border border-dashed">
                      <p className="text-sm text-muted-foreground">No medications added</p>
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder="Any additional instructions or notes"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Patient Info and Visit Details */}
          <div className="w-1/3 p-6 overflow-y-auto">
            {/* Patient Info Card */}
            {patient && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                  </div>
                  
                  {/* Patient Images */}
                  {(patient.profileImage || (patient.additionalImages && patient.additionalImages.length > 0)) && (
                    <div className="mt-2">
                      <div className="grid grid-cols-2 gap-2">
                        {patient.profileImage && (
                          <div className="aspect-[4/3] flex items-center justify-center bg-white rounded-md overflow-hidden border border-gray-200">
                            <img
                              src={patient.profileImage}
                              alt="Patient profile"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        )}
                        {patient.additionalImages && patient.additionalImages.map((img, index) => (
                          <div key={index} className="aspect-[4/3] flex items-center justify-center bg-white rounded-md overflow-hidden border border-gray-200">
                            <img
                              src={img}
                              alt={`Additional image ${index + 1}`}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">ID:</span>
                    <span className="text-sm">{patient.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Age/Gender:</span>
                    <span className="text-sm">{patient.age} years, {patient.gender}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{patient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Registered: {new Date(patient.registrationDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Total Visits: {patient.visits || 1}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Visit Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Visit Details</CardTitle>
                <CardDescription>Enter information about this visit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Doctor *</Label>
                  <Input
                    id="doctor"
                    value={visitDoctor}
                    onChange={(e) => setVisitDoctor(e.target.value)}
                    placeholder="Doctor's name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    value={visitDiagnosis}
                    onChange={(e) => setVisitDiagnosis(e.target.value)}
                    placeholder="Primary diagnosis"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder="Visit notes"
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followUp">Follow-up Date</Label>
                  <Input
                    id="followUp"
                    type="date"
                    value={visitFollowUp}
                    onChange={(e) => setVisitFollowUp(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave}>Save Visit</Button>
        </div>
        
        {/* Print Styles */}
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
  )
}
