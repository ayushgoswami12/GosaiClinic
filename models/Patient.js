import { Schema, model, models } from 'mongoose';

const PatientSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: false
  },
  bloodType: {
    type: String,
    required: false
  },
  allergies: {
    type: String,
    required: false
  },
  medicalHistory: {
    type: String,
    required: false
  },
  dateOfVisit: {
    type: String,
    required: false
  },
  registrationDate: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    required: false
  },
  visits: {
    type: Number,
    default: 1
  },
  visitRecords: {
    type: Array,
    default: []
  }
});

export default models.Patient || model('Patient', PatientSchema);