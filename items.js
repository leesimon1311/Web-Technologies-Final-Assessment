const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { itemValidationRules, statusValidationRules, validate } = require('../middleware/validation');

// GET /api/items - Get all items (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = 'SELECT * FROM items WHERE 1=1';
    const params = [];

    if (category && ['Lost', 'Found'].includes(category)) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (status && ['Active', 'Claimed', 'Resolved'].includes(status)) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search && typeof search === 'string') {
      const safeSearch = `%${search.replace(/[%_\\]/g, '\\$&').substring(0, 100)}%`;
      query += ' AND (title LIKE ? OR description LIKE ? OR location LIKE ?)';
      params.push(safeSearch, safeSearch, safeSearch);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching items' });
  }
});

// GET /api/items/:id - Get single item
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const [rows] = await db.execute('SELECT * FROM items WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching item' });
  }
});

// POST /api/items - Create new item report
router.post('/', itemValidationRules, validate, async (req, res) => {
  try {
    const {
      title, description, category, item_category,
      location, date_reported, contact_name,
      contact_email, contact_phone, status = 'Active'
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO items (title, description, category, item_category, location, date_reported,
       contact_name, contact_email, contact_phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, item_category, location, date_reported,
       contact_name, contact_email, contact_phone || null, status]
    );

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ success: false, message: 'Server error while creating report' });
  }
});

// PUT /api/items/:id - Update full item
router.put('/:id', itemValidationRules, validate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const {
      title, description, category, item_category,
      location, date_reported, contact_name,
      contact_email, contact_phone, status
    } = req.body;

    const [result] = await db.execute(
      `UPDATE items SET title=?, description=?, category=?, item_category=?, location=?,
       date_reported=?, contact_name=?, contact_email=?, contact_phone=?, status=?
       WHERE id=?`,
      [title, description, category, item_category, location, date_reported,
       contact_name, contact_email, contact_phone || null, status || 'Active', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ success: false, message: 'Server error while updating item' });
  }
});

// PATCH /api/items/:id/status - Update item status only
router.patch('/:id/status', statusValidationRules, validate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const { status } = req.body;
    const [result] = await db.execute(
      'UPDATE items SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Server error while updating status' });
  }
});

// DELETE /api/items/:id - Delete item
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const [result] = await db.execute('DELETE FROM items WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting item' });
  }
});

module.exports = router;
