const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, required: true },
  tickets: { type: Number, required: true },
  totalFare: { type: Number, required: true },
  ticketId: { type: String, required: true },
  timestamp: { type: String, required: true } // Store as string if you want to keep the formatted date
});

module.exports = mongoose.model('Ticket', ticketSchema);
