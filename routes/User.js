const express = require("express");
const userRoute = express.Router();
const { userModel } = require('../models/User');
const { customerModel } = require('../models/Customer');
const { productModel } = require('../models/Product');
const { saleModel } = require('../models/Sale');
const Visit = require('../models/Visit');
const DeliveryFollowup = require('../models/DeliveryFollowup');
const { middleware } = require('../middleware/middleware');
const middle = middleware(process.env.JWT_SEC_USER);
require('dotenv').config();

const processBulkUpsert = async (Model, items, currentUserId, companyId, userRole) => {
    if (!items || items.length === 0) return;

    const bulkOps = items.map((item) => {
        const { id, ...data } = item;

        const updateFields = { ...data };
        // If non-admin or userId not provided, bind to authenticated user
        if (userRole !== 'admin' || !updateFields.userId) {
            updateFields.userId = currentUserId;
        }
        if (companyId) {
            updateFields.companyId = companyId;
        }

        return {
            updateOne: {
                filter: { _id: id },
                update: { $set: updateFields },
                upsert: true
            }
        };
    });

    await Model.bulkWrite(bulkOps);
};

userRoute.post('/sync', middle, async (req, res) => {
    try {
        const { lastSyncTimestamp, changes = {} } = req.body;
        const { customers = [], products = [], sales = [], visits = [], deliveryFollowups = [] } = changes;
        const syncDate = new Date(lastSyncTimestamp || 0);

        // Retrieve fresh user details from DB to guarantee companyId & role
        const authUser = await userModel.findById(req.user.id);
        const currentUserId = authUser ? authUser._id : req.user.id;
        const companyId = authUser?.companyId || req.user.companyId;
        const userRole = authUser?.role || req.user.role;
        const isAdmin = (userRole === 'admin');

        // Step 1: Bulk Upsert Client's Changes
        await Promise.all([
            processBulkUpsert(customerModel, customers, currentUserId, companyId, userRole),
            processBulkUpsert(productModel, products, currentUserId, companyId, userRole)
        ]);

        await Promise.all([
            processBulkUpsert(saleModel, sales, currentUserId, companyId, userRole),
            processBulkUpsert(Visit, visits, currentUserId, companyId, userRole)
        ]);

        await processBulkUpsert(DeliveryFollowup, deliveryFollowups, currentUserId, companyId, userRole);

        // Step 2: Build Scoped Query Filters
        // Base filter for company-wide entities (customers, products)
        let companyBaseFilter = { updatedAt: { $gt: syncDate } };
        if (companyId) {
            companyBaseFilter.$or = [
                { companyId: companyId },
                { companyId: { $exists: false } },
                { companyId: null }
            ];
        }

        // Activity filter for transactions (sales, visits, delivery followups)
        let activityFilter = { ...companyBaseFilter };
        if (userRole === 'asm') {
            const team = await userModel.find({ managerId: currentUserId }).select('_id');
            const teamIds = team.map(member => member._id);
            const allowedUserIds = [currentUserId, ...teamIds];
            activityFilter.userId = { $in: allowedUserIds };
        } else if (userRole === 'salesman') {
            activityFilter.userId = currentUserId;
        }

        // Step 3: Fetch Server's Changes (Delta)
        const serverChanges = {
            customers: await customerModel.find(companyBaseFilter),
            products: await productModel.find(companyBaseFilter),
            sales: await saleModel.find(activityFilter),
            visits: await Visit.find(activityFilter),
            deliveryFollowups: await DeliveryFollowup.find(activityFilter)
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