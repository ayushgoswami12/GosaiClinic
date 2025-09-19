"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown } from "lucide-react"

interface MedicineAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function MedicineAutocomplete({
  value,
  onChange,
  placeholder = "Type medicine name...",
}: MedicineAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Default medicine database
  const defaultMedicines = [
    "Paracetamol 500mg",
    "Ibuprofen 400mg",
    "Amoxicillin 500mg",
    "Azithromycin 250mg",
    "Omeprazole 20mg",
    "Pantoprazole 40mg",
    "Cetirizine 10mg",
    "Loratadine 10mg",
    "Metformin 500mg",
    "Amlodipine 5mg",
    "Atenolol 50mg",
    "Aspirin 75mg",
    "Clopidogrel 75mg",
    "Simvastatin 20mg",
    "Atorvastatin 20mg",
    "Levothyroxine 50mcg",
    "Prednisolone 5mg",
    "Dexamethasone 0.5mg",
    "Salbutamol 100mcg",
    "Montelukast 10mg",
    "Ranitidine 150mg",
    "Domperidone 10mg",
    "Loperamide 2mg",
    "Multivitamin",
    "Vitamin D3 1000IU",
    "Calcium Carbonate 500mg",
    "Iron Sulfate 200mg",
    "Folic Acid 5mg",
    "Vitamin B12 1000mcg",
    "Cough Syrup",
    "Expectorant Syrup",
    "Antacid Syrup",
    "ORS Powder",
    "Zinc Sulfate 20mg",
    "Diclofenac 50mg",
    "Tramadol 50mg",
    "Gabapentin 300mg",
    "Fluconazole 150mg",
    "Ciprofloxacin 500mg",
    "Norfloxacin 400mg",
    "Doxycycline 100mg",
    "Erythromycin 250mg",
    "Clarithromycin 500mg",
    "Furosemide 40mg",
    "Spironolactone 25mg",
    "Digoxin 0.25mg",
    "Warfarin 5mg",
    "Heparin 5000IU",
    "Insulin Glargine",
    "Insulin Aspart",
    "Glimepiride 2mg",
    "Gliclazide 80mg",
  ]

  // Load suggestions from localStorage and merge with defaults
  useEffect(() => {
    const loadSuggestions = () => {
      try {
        const storedPrescriptions = localStorage.getItem("prescriptions")
        const customMedicines = new Set<string>()

        if (storedPrescriptions) {
          const prescriptions = JSON.parse(storedPrescriptions)
          prescriptions.forEach((prescription: any) => {
            prescription.medications?.forEach((medication: any) => {
              if (medication.name && medication.name.trim()) {
                customMedicines.add(medication.name.trim())
              }
            })
          })
        }

        // Combine default medicines with custom ones, remove duplicates
        const allMedicines = [...new Set([...defaultMedicines, ...Array.from(customMedicines)])]
        setSuggestions(allMedicines.sort())
      } catch (error) {
        console.error("Error loading medicine suggestions:", error)
        setSuggestions(defaultMedicines)
      }
    }

    loadSuggestions()

    // Listen for prescription updates
    const handlePrescriptionAdded = () => {
      loadSuggestions()
    }
    
    // Listen for patient updates (for edit mode)
    const handlePatientAdded = () => {
      loadSuggestions()
    }

    window.addEventListener("prescriptionAdded", handlePrescriptionAdded)
    window.addEventListener("patientAdded", handlePatientAdded)
    
    // Force immediate refresh when component mounts
    loadSuggestions()
    
    return () => {
      window.removeEventListener("prescriptionAdded", handlePrescriptionAdded)
      window.removeEventListener("patientAdded", handlePatientAdded)
    }
  }, [])

  // Filter suggestions based on input
  useEffect(() => {
    if (!value.trim()) {
      setFilteredSuggestions(suggestions.slice(0, 10)) // Show first 10 when empty
    } else {
      const filtered = suggestions
        .filter((medicine) => medicine.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10) // Limit to 10 suggestions
      setFilteredSuggestions(filtered)
    }
  }, [value, suggestions])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setIsOpen(true)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-8"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span>{suggestion}</span>
              {value === suggestion && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            </div>
          ))}

          {!filteredSuggestions.some((s) => s.toLowerCase() === value.toLowerCase()) && value.trim() && (
            <div
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm border-t border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 font-medium"
              onClick={() => handleSuggestionClick(value)}
            >
              + Add "{value}" as new medicine
            </div>
          )}
        </div>
      )}
    </div>
  )
}
