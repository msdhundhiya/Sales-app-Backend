const express = require('express');
const loginRouter = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userModel } = require('../models/User'); // Adjust import as needed

// POST /api/login
loginRouter.post('/login', async (req, res) => {
    try {
        const { email, password, deviceId } = req.body;
        if (!deviceId) {
            return res.status(400).json({ message: "Device ID is required" });
        }

        // 1. Find the user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email" });
        }

        // 2. Check the password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Wrong Password" });
        }
        if (user.role === 'salesman') {

            // 1. Ensure Flutter sent the device ID
            if (!deviceId) {
                return res.status(400).json({ message: "Device ID is required for salesmen" });
            }

            // 2. Check the binding
            if (!user.deviceId) {
                // First time logging in: Bind this device!
                user.deviceId = deviceId;
                await user.save();
            } else if (user.deviceId !== deviceId) {
                // Bound to another phone: Block login!
                return res.status(403).json({
                    message: "Account is bound to another device. Contact your ASM to reset your device."
                });
            }
        }

        // 3. Create the JWT Payload (CRITICAL: Include the role!)
        const tokenPayload = {
            id: user._id,
            role: user.role, // admin, asm, or salesman
            managerId: user.managerId,
            companyId: user.companyId
        };

        // 4. Generate the Token
        const token = jwt.sign(tokenPayload, process.env.JWT_SEC_USER
            , { expiresIn: '30d' });

        // 5. Send the response back to Flutter
        res.status(200).json({
            success: true,
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during login" });
    }
});

module.exports = { loginRouter };