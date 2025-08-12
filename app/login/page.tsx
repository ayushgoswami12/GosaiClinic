"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Stethoscope, Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock user credentials for demo
const mockUsers = [
  { email: "admin@gosaiclinic.com", password: "admin123", role: "Administrator", name: "Clinic Admin" },
  { email: "tansukh@gosaiclinic.com", password: "doctor123", role: "Doctor", name: "Dr. Tansukh Gosai" },
  { email: "devang@gosaiclinic.com", password: "doctor123", role: "Doctor", name: "Dr. Devang Gosai" },
  { email: "dhara@gosaiclinic.com", password: "doctor123", role: "Doctor", name: "Dr. Dhara Gosai" },
  { email: "nurse@gosaiclinic.com", password: "nurse123", role: "Nurse", name: "Nurse Jennifer Adams" },
  { email: "staff@gosaiclinic.com", password: "staff123", role: "Staff", name: "Reception Staff" },
]

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check credentials
    const user = mockUsers.find(
      (u) => u.email === formData.email && u.password === formData.password && u.role === formData.role,
    )

    if (user) {
      // Store user session (in real app, use proper session management)
      localStorage.setItem(
        "hospitalUser",
        JSON.stringify({
          email: user.email,
          role: user.role,
          name: user.name,
          loginTime: new Date().toISOString(),
        }),
      )

      // Redirect based on role
      switch (user.role) {
        case "Administrator":
          router.push("/admin")
          break
        case "Doctor":
          router.push("/doctors")
          break
        case "Nurse":
          router.push("/patients")
          break
        case "Staff":
          router.push("/appointments")
          break
        default:
          router.push("/")
      }
    } else {
      setError("Invalid credentials. Please check your email, password, and role.")
    }

    setIsLoading(false)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Stethoscope className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GOSAI CLINIC</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Staff Login Portal</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <span>Staff Login</span>
            </CardTitle>
            <CardDescription>Enter your credentials to access the hospital management system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-8 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Doctor">Doctor</SelectItem>
                    <SelectItem value="Nurse">Nurse</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Remember me
                </Label>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6 bg-gray-50 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-sm dark:text-white">Demo Credentials</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 dark:text-gray-300">
            <div>
              <strong>Administrator:</strong> admin@gosaiclinic.com / admin123
            </div>
            <div>
              <strong>Dr. Tansukh:</strong> tansukh@gosaiclinic.com / doctor123
            </div>
            <div>
              <strong>Dr. Devang:</strong> devang@gosaiclinic.com / doctor123
            </div>
            <div>
              <strong>Dr. Dhara:</strong> dhara@gosaiclinic.com / doctor123
            </div>
            <div>
              <strong>Nurse:</strong> nurse@gosaiclinic.com / nurse123
            </div>
            <div>
              <strong>Staff:</strong> staff@gosaiclinic.com / staff123
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
          <p>© 2024 GOSAI CLINIC. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link href="/privacy" className="hover:text-blue-600">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-blue-600">
              Terms of Service
            </Link>
            <Link href="/support" className="hover:text-blue-600">
              Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
