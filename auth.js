const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const bcrypt  = require('bcryptjs');
const { body, validationResult } = require('express-validator');

router.post('/register', [
  body('name').trim().notEmpty().isLength({ min: 2, max: 150 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Invalid input data.' });

  const { name, email, password } = req.body;
  try {
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed]);
    res.status(201).json({ success: true, message: 'Account created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.post('/login', [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Invalid email or password.' });

  const { email, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    res.json({ success: true, user: { id: rows[0].id, name: rows[0].name, email: rows[0].email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;