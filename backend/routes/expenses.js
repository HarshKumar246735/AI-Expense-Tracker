const express = require("express");
const Expense = require("../models/Expense");
const categorize = require("../utils/categorize");

const router = express.Router();

// Get all expenses (newest first)
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add an expense (AI picks the category)
router.post("/", async (req, res) => {
  try {
    const { description, amount, date } = req.body;
    if (!description || amount === undefined) {
      return res.status(400).json({ message: "Description and amount are required" });
    }
    const category = await categorize(description);
    const expense = await Expense.create({ description, amount, date, category });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an expense
router.delete("/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
