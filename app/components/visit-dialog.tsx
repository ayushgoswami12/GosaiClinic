"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MedicineAutocomplete } from "@/components/ui/medicine-autocomplete"
import { Pill, Trash, ChevronUp, ChevronDown } from "lucide-react"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string[]
  duration: string
  instructions: string
}

interface VisitDialogProps {
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
}

export function VisitDialog({
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
}: VisitDialogProps) {
  const [currentMedication, setCurrentMedication] = useState({ 
    name: '', 
    dosage: '', 
    frequency: [''], 
    duration: '', 
    instructions: '' 
  })
  const [showAddMedication, setShowAddMedication] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Record Patient Visit</DialogTitle>
          <DialogDescription>
            Enter details about this patient visit.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Visit Details</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doctor" className="text-right">
                  Doctor *
                </Label>
                <Input
                  id="doctor"
                  value={visitDoctor}
                  onChange={(e) => setVisitDoctor(e.target.value)}
                  className="col-span-3"
                  placeholder="Doctor's name"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="diagnosis" className="text-right">
                  Diagnosis
                </Label>
                <Input
                  id="diagnosis"
                  value={visitDiagnosis}
                  onChange={(e) => setVisitDiagnosis(e.target.value)}
                  className="col-span-3"
                  placeholder="Primary diagnosis"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  className="col-span-3"
                  placeholder="Visit notes"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="followUp" className="text-right">
                  Follow-up
                </Label>
                <Input
                  id="followUp"
                  type="date"
                  value={visitFollowUp}
                  onChange={(e) => setVisitFollowUp(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="medications" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Pill className="h-5 w-5 text-blue-600" />
                      <span>Medications</span>
                    </CardTitle>
                    <CardDescription>Add medications for this visit</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Medication List */}
                  {visitMedications.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medicine</TableHead>
                            <TableHead>Dosage</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {visitMedications.map((med) => (
                            <TableRow key={med.id}>
                              <TableCell>{med.name}</TableCell>
                              <TableCell>{med.dosage}</TableCell>
                              <TableCell>{med.frequency.join(', ')}</TableCell>
                              <TableCell>{med.duration}</TableCell>
                              <TableCell>
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
                    </div>
                  ) : (
                    <div className="flex h-[100px] flex-col items-center justify-center rounded-md border border-dashed">
                      <p className="text-sm text-muted-foreground">No medications added</p>
                    </div>
                  )}

                  {/* Add Medication Form */}
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium">Add Medication</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddMedication(!showAddMedication)}
                      >
                        {showAddMedication ? (
                          <>
                            <ChevronUp className="mr-2 h-4 w-4" />
                            Hide Form
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-2 h-4 w-4" />
                            Show Form
                          </>
                        )}
                      </Button>
                    </div>

                    {showAddMedication && (
                      <div className="space-y-4 rounded-md border p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="medicine-name">Medicine Name</Label>
                            <MedicineAutocomplete
                              value={currentMedication.name}
                              onChange={(value) =>
                                setCurrentMedication({ ...currentMedication, name: value })
                              }
                              placeholder="Type medicine name..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dosage">Dosage</Label>
                            <Input
                              id="dosage"
                              value={currentMedication.dosage}
                              onChange={(e) =>
                                setCurrentMedication({ ...currentMedication, dosage: e.target.value })
                              }
                              placeholder="e.g., 500mg"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="frequency">Frequency</Label>
                            <Select
                              onValueChange={(value) =>
                                setCurrentMedication({
                                  ...currentMedication,
                                  frequency: [value],
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Once daily">Once daily</SelectItem>
                                <SelectItem value="Twice daily">Twice daily</SelectItem>
                                <SelectItem value="Three times daily">Three times daily</SelectItem>
                                <SelectItem value="Four times daily">Four times daily</SelectItem>
                                <SelectItem value="As needed">As needed</SelectItem>
                                <SelectItem value="Before meals">Before meals</SelectItem>
                                <SelectItem value="After meals">After meals</SelectItem>
                                <SelectItem value="At bedtime">At bedtime</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input
                              id="duration"
                              value={currentMedication.duration}
                              onChange={(e) =>
                                setCurrentMedication({ ...currentMedication, duration: e.target.value })
                              }
                              placeholder="e.g., 7 days"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="instructions">Special Instructions</Label>
                          <Textarea
                            id="instructions"
                            value={currentMedication.instructions}
                            onChange={(e) =>
                              setCurrentMedication({ ...currentMedication, instructions: e.target.value })
                            }
                            placeholder="Any special instructions for taking this medication"
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={() => {
                            if (!currentMedication.name) {
                              alert('Please enter a medicine name');
                              return;
                            }
                            
                            const newMed: Medication = {
                              id: Date.now().toString(),
                              name: currentMedication.name,
                              dosage: currentMedication.dosage,
                              frequency: currentMedication.frequency,
                              duration: currentMedication.duration,
                              instructions: currentMedication.instructions
                            };
                            
                            setVisitMedications([...visitMedications, newMed]);
                            setCurrentMedication({ 
                              name: '', 
                              dosage: '', 
                              frequency: [''], 
                              duration: '', 
                              instructions: '' 
                            });
                          }}
                        >
                          Add Medication
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button type="submit" onClick={onSave}>Save Visit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
