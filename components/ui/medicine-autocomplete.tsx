"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Check, ChevronDown } from "lucide-react"

interface MedicineAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function MedicineAutocomplete({
  value,
  onChange,
  placeholder = "Enter medicine name...",
  className,
}: MedicineAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load medicines from localStorage
  useEffect(() => {
    const loadMedicines = () => {
      const storedMedicines = localStorage.getItem("medicines")
      if (storedMedicines) {
        setSuggestions(JSON.parse(storedMedicines))
      } else {
        // Default medicines if none exist
        const defaultMedicines = [
          "Paracetamol 500mg",
          "Paracetamol 650mg",
          "Ibuprofen 400mg",
          "Amoxicillin 500mg",
          "Azithromycin 250mg",
          "Omeprazole 20mg",
          "Pantoprazole 40mg",
          "Cough Syrup 100ml",
          "Multivitamin Tablet",
          "Vitamin D3 60000 IU",
          "Iron Tablet 100mg",
          "Calcium Carbonate 500mg",
        ]
        setSuggestions(defaultMedicines)
        localStorage.setItem("medicines", JSON.stringify(defaultMedicines))
      }
    }

    loadMedicines()

    // Listen for medicine updates
    const handleMedicineUpdate = () => {
      loadMedicines()
    }

    window.addEventListener("medicineAdded", handleMedicineUpdate)
    return () => {
      window.removeEventListener("medicineAdded", handleMedicineUpdate)
    }
  }, [])

  // Filter suggestions based on input
  useEffect(() => {
    if (value.trim() === "") {
      setFilteredSuggestions([])
      return
    }

    const filtered = suggestions.filter((medicine) => medicine.toLowerCase().includes(value.toLowerCase())).slice(0, 10) // Limit to 10 suggestions

    setFilteredSuggestions(filtered)
  }, [value, suggestions])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setShowSuggestions(true)
  }

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Handle input blur
  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false)

      // Save new medicine if it doesn't exist
      if (value.trim() && !suggestions.some((med) => med.toLowerCase() === value.toLowerCase())) {
        const updatedMedicines = [...suggestions, value.trim()]
        setSuggestions(updatedMedicines)
        localStorage.setItem("medicines", JSON.stringify(updatedMedicines))

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent("medicineAdded"))
      }
    }, 200)
  }

  // Handle input focus
  const handleInputFocus = () => {
    if (filteredSuggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Handle dropdown toggle
  const handleDropdownToggle = () => {
    if (showSuggestions) {
      setShowSuggestions(false)
    } else {
      setShowSuggestions(true)
      inputRef.current?.focus()
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const isNewMedicine = value.trim() && !suggestions.some((med) => med.toLowerCase() === value.toLowerCase())

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={className}
        />
        <button
          type="button"
          onClick={handleDropdownToggle}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm"
            >
              <span>{suggestion}</span>
              {value.toLowerCase() === suggestion.toLowerCase() && <Check className="h-4 w-4 text-green-600" />}
            </div>
          ))}
        </div>
      )}

      {isNewMedicine && (
        <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
          💡 New medicine will be saved for future suggestions
        </div>
      )}
    </div>
  )
}
