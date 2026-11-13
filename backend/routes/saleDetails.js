const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT sd.*, i.itemName 
            FROM saledetail sd
            JOIN items i ON sd.ItemID = i.id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/sale/:saleId', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT sd.*, i.itemName 
            FROM saledetail sd
            JOIN items i ON sd.ItemID = i.id
            WHERE sd.SaleID = ?
        `, [req.params.saleId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { SaleID, ItemID, QuantitySold, SubTotalPrice } = req.body;
        if (!SaleID || !ItemID || !QuantitySold) return res.status(400).json({ error: 'SaleID, ItemID, and QuantitySold are required' });
        const [result] = await db.query(
            'INSERT INTO saledetail (SaleID, ItemID, QuantitySold, SubTotalPrice) VALUES (?, ?, ?, ?)',
            [SaleID, ItemID, QuantitySold, SubTotalPrice ?? 0]
        );
        res.status(201).json({ message: 'Sale detail created', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { SaleID, ItemID, QuantitySold, SubTotalPrice } = req.body;
        if (!SaleID || !ItemID || !QuantitySold) return res.status(400).json({ error: 'SaleID, ItemID, and QuantitySold are required' });
        await db.query(
            'UPDATE saledetail SET SaleID=?, ItemID=?, QuantitySold=?, SubTotalPrice=? WHERE id=?',
            [SaleID, ItemID, QuantitySold, SubTotalPrice ?? 0, req.params.id]
        );
        res.json({ message: 'Sale detail updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM saledetail WHERE id = ?', [req.params.id]);
        res.json({ message: 'Sale detail deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
