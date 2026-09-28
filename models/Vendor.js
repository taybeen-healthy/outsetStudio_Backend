const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  services: [{ type: String }],
  read: { type: Boolean, default: false },
  status: { type: String, enum: ['NEW', 'UNDER SCRUTINY', 'APPROVED', 'ARCHIVED'], default: 'NEW' },
  fullName: { type: String, default: '' },
  founder: { type: String, default: '' },
  founderTitle: { type: String, default: '' },
  trade: { type: String, default: '' },
  location: { type: String, default: '' },
  workshop: [{ type: String }],
  gstinVerified: { type: Boolean, default: false },
  msme: { type: String, default: '' },
  msmeNote: { type: String, default: '' },
  capabilities: [{ type: String }],
  capacityStats: [{ type: String }],
  files: [{ name: String, size: String, icon: String }],
  checklist: [{ title: String, desc: String, checked: { type: Boolean, default: false } }],
  curator: { name: String, role: String, tier: String },
  remarks: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
