const express = require("express");
const router = express.Router();
const rateService = require("../services/rateService");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const { gold24, gold22, gold18, silver } = req.body;

    if (!gold24 || !gold22 || !gold18 || !silver) {
      return res.status(400).json({ msg: "Please provide rates for gold24, gold22, gold18 and silver" });
    }

    const savedRate = await rateService.createRate(req.body);

    // Emit event to all connected clients
    req.io.emit('rateUpdated', savedRate);

    res.json(savedRate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/", async (req, res) => {
  try {
    const ratesData = await rateService.getLatestRates();

    if (!ratesData) {
      return res.status(404).json({ msg: "No rates found" });
    }

    res.json(ratesData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
