const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const Testimonial = require('../models/Testimonial');
const Industry = require('../models/Industry');
const Contact = require('../models/Contact');
const Vendor = require('../models/Vendor');
const Setting = require('../models/Setting');
const Admin = require('../models/Admin');

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'outset_jwt_secret');
    req.adminId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Admin login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'outset_jwt_secret', { expiresIn: '24h' });
    res.json({ token, email: admin.email, name: admin.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== PUBLIC API (Frontend) ==========

router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({ active: true }).sort({ order: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/projects/:slug', async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug, active: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ active: true }).sort({ order: 1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/industries', async (req, res) => {
  try {
    const industries = await Industry.find({ active: true }).sort({ order: 1 });
    res.json(industries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/settings/:key', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contact form submission (public)
router.post('/contacts', async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ message: 'Inquiry submitted successfully', id: contact._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Vendor form submission (public)
router.post('/vendors', async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);
    res.status(201).json({ message: 'Vendor registration submitted', id: vendor._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Review / testimonial submission (public) — goes to admin as pending
router.post('/testimonials', async (req, res) => {
  try {
    const { fullName, email, brand, completionDate, categories, rating, review, consent, files } = req.body;
    const parts = (fullName || '').trim().split(/\s+/);
    const initials = ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'CL';
    const item = await Testimonial.create({
      name: fullName,
      company: brand,
      email,
      rating,
      quote: review,
      status: 'pending',
      active: false,
      initials,
      project: completionDate || '—',
      typology: (categories || []).join(', '),
      consent: !!consent,
      completionDate: completionDate || '',
      categories: categories || [],
      files: files || [],
    });
    res.status(201).json({ message: 'Review submitted for verification', id: item._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== ADMIN API (CRUD) ==========

// Projects
router.get('/admin/projects', auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/projects', auth, async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/admin/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/admin/projects/:id', auth, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Testimonials
router.get('/admin/testimonials', auth, async (req, res) => {
  try {
    const items = await Testimonial.find().sort({ order: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/testimonials', auth, async (req, res) => {
  try {
    const item = await Testimonial.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/admin/testimonials/:id', auth, async (req, res) => {
  try {
    const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/admin/testimonials/:id', auth, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Industries
router.get('/admin/industries', auth, async (req, res) => {
  try {
    const items = await Industry.find().sort({ order: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/industries', auth, async (req, res) => {
  try {
    const item = await Industry.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/admin/industries/:id', auth, async (req, res) => {
  try {
    const item = await Industry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/admin/industries/:id', auth, async (req, res) => {
  try {
    await Industry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contacts
router.get('/admin/contacts', auth, async (req, res) => {
  try {
    const items = await Contact.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/contacts/:id/read', auth, async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/contacts/:id', auth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vendors
router.get('/admin/vendors', auth, async (req, res) => {
  try {
    const items = await Vendor.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/vendors/:id/read', auth, async (req, res) => {
  try {
    await Vendor.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/vendors/:id', auth, async (req, res) => {
  try {
    await Vendor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settings
router.get('/admin/settings', auth, async (req, res) => {
  try {
    const settings = await Setting.find();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/settings/:key', auth, async (req, res) => {
  try {
    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
