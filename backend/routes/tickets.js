const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// Create a new ticket
router.post('/', async (req, res) => {
  try {
    const ticket=new Ticket(req.body);
    await ticket.save();
    console.log('Ticket created:', ticket);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching ticket' });
  }
});

// Get ticket by passenger name
router.get('/name/:name', async (req, res) => {
  try {
    
    const ticket = await Ticket.findOne({ name: req.params.name });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching ticket by name' });
  }
});

module.exports = router;
