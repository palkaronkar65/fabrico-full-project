const express = require('express');
const router = express.Router();
const Pincode = require('../models/Pincode');

router.get('/check/:pincode', async (req, res) => {
  try {
    const pincode = await Pincode.findOne({ 
      pincode: req.params.pincode,
      deliveryAvailable: true
    });

    if (pincode) {
      res.json({
        valid: true,
        city: pincode.city,
        taluka: pincode.taluka,
        district: pincode.district,
        state: pincode.state
      });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;