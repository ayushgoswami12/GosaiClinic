# SMS Integration Setup Instructions

## Overview
The GOSAI CLINIC system now includes real SMS functionality to send appointment reminders and messages to patients.

## Current Status
- ✅ SMS API routes created (`/api/send-sms` and `/api/send-bulk-sms`)
- ✅ Frontend integration completed
- ✅ Message templates and UI ready
- ⚠️ **Currently in simulation mode** - no actual SMS sent yet

## To Enable Real SMS Sending

### Option 1: Twilio Integration (Recommended)

1. **Sign up for Twilio**
   - Go to https://www.twilio.com/
   - Create a free account (includes $15 credit)
   - Get a phone number

2. **Get Your Credentials**
   - Account SID
   - Auth Token
   - Twilio Phone Number

3. **Install Twilio SDK**
   \`\`\`bash
   npm install twilio
   \`\`\`

4. **Update Environment Variables**
   \`\`\`env
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   \`\`\`

5. **Uncomment Twilio Code**
   - In `app/api/send-sms/route.ts`
   - Uncomment the Twilio integration section
   - Comment out the simulation code

### Option 2: Other SMS Providers

You can also use:
- **MessageBird** - European SMS provider
- **Nexmo/Vonage** - Global SMS service
- **AWS SNS** - Amazon's SMS service
- **Fast2SMS** - Indian SMS provider

## Features Included

### 1. Individual SMS
- Send reminders to specific patients
- Customizable message templates
- Real-time delivery status
- Character count and SMS segment calculation

### 2. Bulk SMS
- Send messages to multiple patients at once
- Personalized messages with patient details
- Batch processing with error handling

### 3. Message Templates
- Pre-written professional templates
- Auto-fill patient, doctor, date, time details
- Customizable for different scenarios

### 4. Tracking & Analytics
- Track which patients received SMS
- Visual indicators in the UI
- SMS count statistics
- Delivery confirmation

## Usage

### From Appointments Page
1. Click "Send SMS" button next to any appointment
2. Choose a template or write custom message
3. Click "Send SMS" to deliver

### From Doctor Dashboard
1. Use SMS button on appointment cards
2. Send messages to patients from patient list
3. Bulk SMS option for multiple patients

## Phone Number Format
- Supports Indian numbers (+91)
- Auto-formats numbers correctly
- Handles various input formats

## Cost Considerations
- Twilio: ~$0.0075 per SMS in India
- Most providers charge per message
- Consider SMS length (160 chars = 1 SMS)

## Security & Compliance
- Patient phone numbers are handled securely
- Messages include clinic branding
- Professional medical communication standards
