const express = require('express');
const asmRouter = express.Router();
const { userModel } = require('../models/User');
const { middleware } = require('../middleware/middleware');
const isAsm = require('../middleware/isAsm');
const bcrypt = require('bcrypt');


const middle = middleware(process.env.JWT_SEC_USER);

// POST /api/asm/create-salesman
asmRouter.post('/create-salesman', middle, isAsm, async (req, res) => {
    try {
        const { name, mobile, email, password } = req.body;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newSalesman = new userModel({
            name,
            mobile,
            email,
            password: hashedPassword,
            role: 'salesman',
            managerId: req.user.id,
            companyId: req.user.companyId
        });

        await newSalesman.save();

        res.status(201).json({
            message: "Salesman created successfully",
            asmId: newSalesman._id
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/asm/my-team
asmRouter.get('/my-team', middle, isAsm, async (req, res) => {
    const team = await userModel
        .find({ managerId: req.user.id })
        .select('-password');
    res.json(team);
});

// PUT /api/asm/unbind-device/:salesmanId
asmRouter.put('/unbind-device/:salesmanId', middle, isAsm, async (req, res) => {
    try {
        const salesmanId = req.params.salesmanId;
        const asmId = req.user.id; 

        const salesman = await userModel.findOne({ 
            _id: salesmanId, 
            managerId: asmId 
        });

        if (!salesman) {
            return res.status(404).json({ 
                success: false, 
                message: "Salesman not found or does not belong to your team." 
            });
        }

        salesman.deviceId = null;
        await salesman.save();

        res.status(200).json({ 
            success: true, 
            message: `Device successfully unbound for ${salesman.name}. They can now log in on a new device.` 
        });

    } catch (error) {
        console.error("Unbind Error:", error);
        res.status(500).json({ success: false, message: "Server error during device unbind." });
    }
});

// PUT /api/asm/update-salesman/:id
asmRouter.put('/update-salesman/:id', middle, isAsm, async (req, res) => {
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

        const salesman = await userModel.findOneAndUpdate(
            { _id: req.params.id, managerId: req.user.id },
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!salesman) return res.status(404).json({ message: "Salesman not found or not in your team" });

        res.status(200).json({ message: "Salesman updated successfully", user: salesman });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/asm/delete-salesman/:id
asmRouter.delete('/delete-salesman/:id', middle, isAsm, async (req, res) => {
    try {
        const salesman = await userModel.findOneAndDelete({
            _id: req.params.id,
            managerId: req.user.id
        });
        if (!salesman) return res.status(404).json({ message: "Salesman not found or not in your team" });
        res.status(200).json({ message: "Salesman deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = { asmRouter };