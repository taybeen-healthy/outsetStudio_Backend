const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  quote: { type: String, required: true },
  avatar: { type: String, default: '' },
  image: { type: String, default: '' },
  active: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
  initials: { type: String, default: '' },
  project: { type: String, default: '' },
  typology: { type: String, default: '' },
  email: { type: String, default: '' },
  completionDate: { type: String, default: '' },
  categories: { type: [String], default: [] },
  consent: { type: Boolean, default: false },
  files: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
