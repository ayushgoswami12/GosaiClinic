# GOSAI CLINIC Management System

## Overview
This is a [Next.js](https://nextjs.org) project for managing a medical clinic, including patient registration, appointments, prescriptions, and administrative functions.

## Important Development Rules

1. **DO NOT modify the print/print preview format** unless specifically requested
2. **DO NOT change the Excel export functionality** as it is working perfectly

## Project Structure

### Directory Structure
```
app/
├── admin/             # Admin panel and staff management
├── api/               # API endpoints (SMS, translation)
├── appointments/      # Appointment booking and management
├── components/        # Shared UI components
├── doctors/           # Doctor-specific views and patient management
├── login/             # Authentication
├── patients/          # Patient registration and management
├── prescriptions/     # Prescription management
├── profile/           # User profile management
├── visits/            # Patient visit tracking
└── unauthorized/      # Access control pages
```

### Core Modules
- **Patients Management**: Registration, records, medical history
- **Appointments**: Scheduling and management
- **Prescriptions**: Medication tracking and prescription generation
- **Admin**: Staff and clinic management

### Key Features
- Patient registration with medication tracking
- Appointment booking and management
- Prescription generation with print preview
- Excel data export
- SMS notifications

## Technical Details

### Frontend
- Built with Next.js 15.2.4 and React
- UI components from Radix UI library (extensive component set)
- Styling with Tailwind CSS and class-variance-authority
- Responsive design for desktop and mobile
- Date handling with date-fns
- Icons from Lucide React

### Data Storage
- Uses local storage for data persistence
- Structured data models for patients, medications, and appointments

### Print Functionality
- Custom print preview with clinic branding
- Structured medication tables with proper formatting
- DO NOT modify without explicit requirements

### Export Functionality
- Excel export with patient and medication data
- Maintains specific column structure
- DO NOT modify without explicit requirements

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Guidelines

### Adding New Features
1. Create components in appropriate directories
2. Follow existing code patterns and styling
3. Test thoroughly before integration

### Modifying Existing Features
1. Understand the current implementation before making changes
2. Maintain backward compatibility
3. Respect the rules regarding print and export functionality

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

## Contributing

When contributing to this project, please remember:

1. Follow the established code style and patterns
2. Create feature branches for new functionality
3. Include appropriate tests for your changes
4. **IMPORTANT**: Do not modify the print/preview functionality or Excel export unless specifically requested
