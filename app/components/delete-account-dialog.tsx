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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"

interface DeleteAccountDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  userEmail: string
}

export function DeleteAccountDialog({ isOpen, onOpenChange, onConfirm, userEmail }: DeleteAccountDialogProps) {
  const [confirmEmail, setConfirmEmail] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const isConfirmed = confirmEmail === userEmail

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
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
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4 mt-4">
            <div>
              <p className="font-semibold text-red-600 mb-2">This action cannot be undone.</p>
              <p className="text-sm text-gray-600">Deleting your account will permanently remove:</p>
              <ul className="text-sm text-gray-600 list-disc list-inside mt-2 space-y-1">
                <li>Your user account</li>
                <li>All registered patients</li>
                <li>All prescriptions and medical records</li>
                <li>All appointments and visit history</li>
              </ul>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="confirm-email" className="text-gray-700">
                Type your email to confirm deletion:
              </Label>
              <Input
                id="confirm-email"
                type="email"
                placeholder={userEmail}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-gray-500">
                Enter <span className="font-mono font-semibold">{userEmail}</span> to confirm
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex gap-3 justify-end">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
