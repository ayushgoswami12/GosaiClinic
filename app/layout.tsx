import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
<<<<<<< HEAD
=======
import { AuthProvider } from "@/app/lib/auth-context"
>>>>>>> cb041d0 (Updated features and fixes)

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gosai Clinic",
  description: "Modern Hospital Management System",
  generator: "v0.dev",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
<<<<<<< HEAD
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "white" }, { media: "(prefers-color-scheme: dark)", color: "#0f172a" }]
=======
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
>>>>>>> cb041d0 (Updated features and fixes)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}

* {
  box-sizing: border-box;
}
        `}</style>
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
<<<<<<< HEAD
          {children}
=======
          <AuthProvider>{children}</AuthProvider>
>>>>>>> cb041d0 (Updated features and fixes)
        </ThemeProvider>
      </body>
    </html>
  )
}
