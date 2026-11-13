const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM items');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM items WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Item not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { itemName, Specification, unitMeasure, Quantity, unitPrice, TotalQuantity } = req.body;
        if (!itemName) return res.status(400).json({ error: 'itemName is required' });
        const [result] = await db.query(
            'INSERT INTO items (itemName, Specification, unitMeasure, Quantity, unitPrice, TotalQuantity) VALUES (?, ?, ?, ?, ?, ?)',
            [itemName, Specification, unitMeasure, Quantity ?? 0, unitPrice ?? 0, TotalQuantity ?? 0]
        );
        res.status(201).json({ message: 'Item created', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { itemName, Specification, unitMeasure, Quantity, unitPrice, TotalQuantity } = req.body;
        if (!itemName) return res.status(400).json({ error: 'itemName is required' });
        await db.query(
            'UPDATE items SET itemName=?, Specification=?, unitMeasure=?, Quantity=?, unitPrice=?, TotalQuantity=? WHERE id=?',
            [itemName, Specification, unitMeasure, Quantity ?? 0, unitPrice ?? 0, TotalQuantity ?? 0, req.params.id]
        );
        res.json({ message: 'Item updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM items WHERE id = ?', [req.params.id]);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
