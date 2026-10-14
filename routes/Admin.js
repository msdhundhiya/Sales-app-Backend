// routes/admin.js
const express = require('express');
const adminRouter = express.Router();
const bcrypt = require('bcrypt');
const {userModel} = require('../models/User');
const {middleware} = require('../middleware/middleware'); 
const isAdmin = require('../middleware/isAdmin'); 

// POST /api/admin/create-asm
const middle = middleware(process.env.JWT_SEC_USER);

adminRouter.post('/create-asm', middle, isAdmin, async (req, res) => {
    try {
        const { name,mobile, email, password } = req.body;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        } 

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAsm = new userModel({
            name,
            mobile,
            email,
            password: hashedPassword,
            role: 'asm',
            companyId: req.user.companyId,
            managerId: null
        });

        await newAsm.save();

        res.status(201).json({ 
            message: "ASM created successfully", 
            asmId: newAsm._id 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/admin/all-asms
adminRouter.get('/all-asms', middle, isAdmin, async (req, res) => {
    try {
        const asms = await userModel
            .find({ role: 'asm' })
            .select('-password');
        res.status(200).json(asms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/admin/update-asm/:id
adminRouter.put('/update-asm/:id', middle, isAdmin, async (req, res) => {
    try {
        const { name, mobile, email, password } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (mobile) updateData.mobile = mobile;
        if (email) updateData.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const asm = await userModel.findOneAndUpdate(
            { _id: req.params.id, role: 'asm' },
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!asm) return res.status(404).json({ message: "ASM not found" });

        res.status(200).json({ message: "ASM updated successfully", user: asm });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/admin/delete-asm/:id
adminRouter.delete('/delete-asm/:id', middle, isAdmin, async (req, res) => {
    try {
        const asm = await userModel.findOneAndDelete({ _id: req.params.id, role: 'asm' });
        if (!asm) return res.status(404).json({ message: "ASM not found" });
        res.status(200).json({ message: "ASM deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = {adminRouter};