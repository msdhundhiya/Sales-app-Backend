const express = require("express");
const userRoute = express.Router();
const zod = require('zod');
const { userModel } = require('../models/User');
const {customerModel} = require('../models/Customer');
const {productModel} = require('../models/Product');
const {saleModel} = require('../models/Sale');
const Visit = require('../models/Visit');
const DeliveryFollowup = require('../models/DeliveryFollowup');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { middleware } = require('../middleware/middleware');
const middle = middleware(process.env.JWT_SEC_USER);
require('dotenv').config();

userRoute.post("/signup", async function (req, res) {
    const requirebody = zod.object({
        email: zod.email(),
        password: zod.string().min(8).max(50).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
    });
    const parseddata = requirebody.safeParse(req.body);
    if (!parseddata.success) {
        return res.json({
            message: "incorrect data format",
            error: parseddata.error
        })
    }
    const { email, password } = req.body;
    const hashedpass = await bcrypt.hash(password, 6);
    let errorthrown = false;
    try {
        await userModel.create({
            email: email,
            password: hashedpass,
        });
    } catch (error) {
        errorthrown = true;
        return res.json({
            message: "User already exists!",
        });

    }
    if (!errorthrown) {
        res.json({
            message: "you are signed up"
        });
    }
});

userRoute.post("/login", async function (req, res) {
    const { email, password } = req.body;
    const user = await userModel.findOne({
        email
    });

    // console.log(user);
    const passwordmatch = await bcrypt.compare(password, user.password);
    if (passwordmatch) {
        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SEC_USER);
        res.json({
            token
        });
    } else {
        res.status(403).json({
            message: "invalid credentials"
        });
    }
});
const processBulkUpsert = async (Model, items, userId) => {
    if (!items || items.length === 0) return;

    const bulkOps = items.map((item) => {
        // Extract the 'id' (from sqflite) and the rest of the fields
        const { id, ...data } = item;

        return {
            updateOne: {
                filter: { _id: id, userId: userId },
                update: { $set: { ...data } },

                upsert: true
            }
        };
    });

    await Model.bulkWrite(bulkOps);
};

userRoute.post('/sync', middle, async (req, res) => {
    try {
        const userId = req.userId;

        // Step 1: Parse the incoming payload
        const { lastSyncTimestamp, changes } = req.body;
        const { customers, products, sales, visits, deliveryFollowups } = changes;

        // Step 2: Process the Client's Changes (Upserts)
        await Promise.all([
            processBulkUpsert(customerModel, customers, userId),
            processBulkUpsert(productModel, products, userId)
        ]);

        await Promise.all([
            processBulkUpsert(saleModel, sales, userId),
            processBulkUpsert(Visit, visits, userId)
        ]);

        await processBulkUpsert(DeliveryFollowup, deliveryFollowups, userId);

        // Step 3: Fetch the Server's Changes (Delta)
        const syncDate = new Date(lastSyncTimestamp || 0);

        const serverChanges = {
            customers: await customerModel.find({ userId, updatedAt: { $gt: syncDate } }),
            products: await productModel.find({ userId, updatedAt: { $gt: syncDate } }),
            sales: await saleModel.find({ userId, updatedAt: { $gt: syncDate } }),
            visits: await Visit.find({ userId, updatedAt: { $gt: syncDate } }),
            deliveryFollowups: await DeliveryFollowup.find({ userId, updatedAt: { $gt: syncDate } })
        };

        // Step 4: Send Response
        res.status(200).json({
            success: true,
            serverTimestamp: Date.now(), 
            serverChanges
        });

    } catch (error) {
        console.error("Sync Error:", error);
        res.status(500).json({ success: false, message: 'Sync failed', error: error.message });
    }
});

module.exports = {
    userRoute
};