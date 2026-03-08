const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user addresses
router.get('/:userId/addresses', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.address || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new address
router.post('/:userId/addresses', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.address.length >= 3) {
      return res.status(400).json({ 
        message: 'You can only save up to 3 addresses' 
      });
    }

    const newAddress = req.body;
    
    if (user.address.length === 0) {
      newAddress.isDefault = true;
    }
    
    user.address.push(newAddress);
    await user.save();
    
    res.status(201).json(user.address[user.address.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update address
router.put('/:userId/addresses/:addressId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = user.address.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    
    Object.assign(address, req.body);
    await user.save();
    
    res.json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Set default address
router.put('/:userId/addresses/:addressId/default', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.address.forEach(addr => {
      addr.isDefault = false;
    });
    
    const address = user.address.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    
    address.isDefault = true;
    await user.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Delete address
router.delete('/:userId/addresses/:addressId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.address = user.address.filter(addr => 
      addr._id.toString() !== req.params.addressId
    );
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


module.exports = router;