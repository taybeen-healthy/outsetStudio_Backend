const { copyFileSync, mkdtempSync } = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Testimonial = require('../models/Testimonial');
const Industry = require('../models/Industry');

const FRONTEND_DATA = path.resolve(__dirname, '../../OutsetStudio/src/lib/data.js');

async function loadFrontendData() {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'outset-migrate-'));
  const tmpFile = path.join(tmpDir, 'data.mjs');
  copyFileSync(FRONTEND_DATA, tmpFile);
  return import(pathToFileURL(tmpFile).href);
}

async function migrateProjects(ourWorkData) {
  let created = 0;
  const projects = ourWorkData.projects || [];
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const { id, ...rest } = p;
    const exists = await Project.findOne({ slug: p.slug }).lean();
    if (exists) {
      await Project.updateOne(
        { slug: p.slug },
        { $setOnInsert: { ...rest, type: 'portfolio', active: true, order: id || i + 1 } }
      );
      continue;
    }
    await Project.create({ ...rest, type: 'portfolio', active: true, order: id || i + 1 });
    created++;
  }
  console.log(`Projects: ${created} created, ${projects.length - created} already existed`);
}

async function migrateTestimonials(testimonialsData) {
  const list = testimonialsData.testimonials || [];
  let created = 0;
  for (const t of list) {
    const { id, ...rest } = t;
    const exists = await Testimonial.findOne({ name: t.name, quote: t.quote }).lean();
    if (exists) continue;
    await Testimonial.create({ ...rest, status: 'approved', active: true, order: id || 0 });
    created++;
  }
  console.log(`Testimonials: ${created} created, ${list.length - created} already existed`);
}

async function migrateIndustries(industriesData) {
  const list = industriesData.industries || [];
  let created = 0;
  for (let i = 0; i < list.length; i++) {
    const ind = list[i];
    const { id, ...rest } = ind;
    const exists = await Industry.findOne({ name: ind.name }).lean();
    if (exists) continue;
    await Industry.create({ ...rest, active: true, order: i + 1 });
    created++;
  }
  console.log(`Industries: ${created} created, ${list.length - created} already existed`);
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for content migration...');
    const { ourWorkData, testimonialsData, industriesData } = await loadFrontendData();
    await migrateProjects(ourWorkData);
    await migrateTestimonials(testimonialsData);
    await migrateIndustries(industriesData);
    console.log('Content migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
