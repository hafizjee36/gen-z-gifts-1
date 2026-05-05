const express = require('express');
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../public/bundles');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

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

// Image upload endpoint for bundles
router.post('/bundles/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const uploadedFile = {
      url: `/public/bundles/${req.file.filename}`,
      filename: req.file.filename
    };
    res.json({
      success: true,
      url: uploadedFile.url,
      filename: uploadedFile.filename
    });
  } catch (error) {
    console.error('Bundle upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
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


