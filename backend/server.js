const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express(); // <-- Make sure this is before any app.get/app.use

const ticketRoutes = require('./routes/tickets');
const Ticket = require('./models/Ticket'); // ensure this path is correct

app.use(cors());
app.use(express.json());

// Connect to MongoDB


// Use ticket routes
app.use('/api/tickets', ticketRoutes);

// Search ticket by passenger name
app.get("/api/tickets/name/:name", async (req, res) => {
  try {
    const name = req.params.name;
    const ticket = await Ticket.findOne({ name: name }).sort({ timestamp: -1 });
    if (!ticket) return res.status(404).send("Ticket not found");
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving ticket", error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
   await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://rudrayya24cs:rudra%402209@cluster0.bc89hmo.mongodb.net/tickets', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));
});