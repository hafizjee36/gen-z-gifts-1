const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all bundles (admin - all bundles, ordered by display_order)
router.get('/bundles', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM bundles ORDER BY display_order ASC, created_at ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bundles:', error);
    res.status(500).json({ error: 'Failed to fetch bundles' });
  }
});

// Get active bundles (frontend/public)
router.get('/bundles', async (req, res) => {
  try {
    // Note: same path, second handler for ?active=true query
    if (req.query.active === 'true') {
      const [rows] = await db.execute(
        'SELECT * FROM bundles WHERE is_active = 1 ORDER BY display_order ASC, created_at ASC'
      );
      res.json(rows);
    } else {
      // Fall through to first handler
      return;
    }
  } catch (error) {
    console.error('Error fetching active bundles:', error);
    res.status(500).json({ error: 'Failed to fetch active bundles' });
  }
});

// Create new bundle
router.post('/bundles', async (req, res) => {
  try {
    const { name, image_url, min_items, is_active, display_order } = req.body;
    
    if (!name || !image_url || min_items === undefined) {
      return res.status(400).json({ error: 'Name, image_url, and min_items are required' });
    }

    const [result] = await db.execute(
      'INSERT INTO bundles (name, image_url, min_items, is_active, display_order) VALUES (?, ?, ?, ?, ?)',
      [name, image_url, min_items, is_active || 1, display_order || 0]
    );

    const [rows] = await db.execute(
      'SELECT * FROM bundles WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating bundle:', error);
    res.status(500).json({ error: 'Failed to create bundle' });
  }
});

// Update bundle
router.put('/bundles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(updates.image_url);
    }
    if (updates.min_items !== undefined) {
      fields.push('min_items = ?');
      values.push(updates.min_items);
    }
    if (updates.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(updates.is_active);
    }
    if (updates.display_order !== undefined) {
      fields.push('display_order = ?');
      values.push(updates.display_order);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    
    const query = `UPDATE bundles SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const [result] = await db.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bundle not found' });
    }

    const [rows] = await db.execute('SELECT * FROM bundles WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating bundle:', error);
    res.status(500).json({ error: 'Failed to update bundle' });
  }
});

// Delete bundle
router.delete('/bundles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.execute(
      'DELETE FROM bundles WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bundle not found' });
    }

    res.json({ message: 'Bundle deleted successfully' });
  } catch (error) {
    console.error('Error deleting bundle:', error);
    res.status(500).json({ error: 'Failed to delete bundle' });
  }
});

module.exports = router;

