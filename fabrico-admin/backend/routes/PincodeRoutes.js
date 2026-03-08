import express from 'express';
import Pincode from '../models/Pincode.js';

const router = express.Router();

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

// Add these new routes for full CRUD operations
router.get('/', async (req, res) => {
  try {
    const pincodes = await Pincode.find();
    res.json(pincodes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const pincode = new Pincode(req.body);
  try {
    const newPincode = await pincode.save();
    res.status(201).json(newPincode);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Pincode.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pincode deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;