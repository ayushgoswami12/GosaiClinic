"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

interface DeletePatientDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  patientName: string
}

export function DeletePatientDialog({ isOpen, onOpenChange, onConfirm, patientName }: DeletePatientDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4 mt-4">
            <div>
              <p className="font-semibold text-red-600 mb-2">This action cannot be undone.</p>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <span className="font-semibold">{patientName}</span>?
              </p>
              <p className="text-sm text-gray-600 mt-2">Deleting this patient will remove:</p>
              <ul className="text-sm text-gray-600 list-disc list-inside mt-2 space-y-1">
                <li>Patient profile and medical records</li>
                <li>All prescriptions</li>
                <li>All appointments and visit history</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex gap-3 justify-end">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Patient"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
