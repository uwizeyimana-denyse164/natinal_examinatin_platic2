const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/inventory', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, itemName, Specification, unitMeasure, Quantity, unitPrice, TotalQuantity FROM items ORDER BY itemName ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/sales', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, SaleDate, CustomerName, TotalPrice FROM sales ORDER BY SaleDate DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/sales-details', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT sd.id, sd.SaleID, s.SaleDate, s.CustomerName, sd.ItemID, i.itemName, sd.QuantitySold, sd.SubTotalPrice
            FROM saledetail sd
            JOIN sales s ON sd.SaleID = s.id
            JOIN items i ON sd.ItemID = i.id
            ORDER BY s.SaleDate DESC, sd.id DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
