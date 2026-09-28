const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  titleRoman: { type: String, default: '' },
  titleItalic: { type: String, default: '' },
  subtitle: { type: String, required: true },
  image: { type: String, required: true },
  location: { type: String, required: true },
  specs: {
    type: new mongoose.Schema({
      projectName: String,
      type: String,
      location: String,
      scope: String,
    }, { _id: false, id: false }),
  },
  concept: {
    title: String,
    description: String,
  },
  keyElements: {
    material: {
      image: String,
      subtitle: String,
      title: String,
      description: String,
    },
    palette: {
      subtitle: String,
      title: String,
      swatches: [{
        name: String,
        hex: String,
        bg: String,
      }],
      bottomTag: String,
    },
    lighting: {
      image: String,
      subtitle: String,
      title: String,
      description: String,
    },
    furniture: {
      image: String,
      subtitle: String,
      title: String,
      description: String,
    },
  },
  spatialExperience: [{
    number: String,
    title: String,
    description: String,
  }],
  galleryPlates: {
    type: Map,
    of: {
      image: String,
      caption: String,
      index: String,
    },
  },
  type: { type: String, default: '' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

projectSchema.index({ slug: 1 });
projectSchema.index({ location: 1 });

module.exports = mongoose.model('Project', projectSchema);
