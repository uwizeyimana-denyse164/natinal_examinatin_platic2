const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM sales ORDER BY SaleDate DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM sales WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Sale not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { SaleDate, CustomerName, TotalPrice } = req.body;
        if (!SaleDate || !CustomerName) return res.status(400).json({ error: 'SaleDate and CustomerName are required' });
        const [result] = await db.query(
            'INSERT INTO sales (SaleDate, CustomerName, TotalPrice) VALUES (?, ?, ?)',
            [SaleDate, CustomerName, TotalPrice ?? 0]
        );
        res.status(201).json({ message: 'Sale created', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { SaleDate, CustomerName, TotalPrice } = req.body;
        if (!SaleDate || !CustomerName) return res.status(400).json({ error: 'SaleDate and CustomerName are required' });
        await db.query(
            'UPDATE sales SET SaleDate=?, CustomerName=?, TotalPrice=? WHERE id=?',
            [SaleDate, CustomerName, TotalPrice ?? 0, req.params.id]
        );
        res.json({ message: 'Sale updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM sales WHERE id = ?', [req.params.id]);
        res.json({ message: 'Sale deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
