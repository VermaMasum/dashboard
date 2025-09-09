const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Daily Report' },
  details: { type: String },
  hoursWorked: { type: Number },
});

module.exports = mongoose.model('Report', reportSchema);
