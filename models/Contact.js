const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  message: { type: String, default: '' },
  read: { type: Boolean, default: false },
  status: { type: String, enum: ['NEW', 'IN DISCUSSION', 'CONFIRMED', 'ARCHIVED'], default: 'NEW' },
  org: { type: String, default: '' },
  service: { type: String, default: '' },
  scope: { type: String, default: '' },
  location: { type: String, default: '' },
  typology: { type: String, default: '' },
  footprint: { type: String, default: '' },
  budget: { type: String, default: '' },
  brief: { type: String, default: '' },
  address: { type: String, default: '' },
  ref: { type: String, default: '' },
  assignee: {
    initials: { type: String, default: '' },
    name: { type: String, default: '' },
    role: { type: String, default: '' },
  },
  ip: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
