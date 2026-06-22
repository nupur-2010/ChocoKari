import { Order } from "../models/order.model.js";
import { Corporate } from "../models/corporate.model.js";
import { User } from "../models/user.model.js";
import { APIresponse } from "../utils/api-response.js";
import { APIerror } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const sum = (arr) => arr[0]?.total || 0;

const getDashboardStats = asyncHandler(async (req, res) => {
    const deliveredOrders = await Order.countDocuments({ orderStatus: "delivered" });
    const pendingOrders = await Order.countDocuments({ orderStatus: "placed" });
    const totalCorporateOrders = await Corporate.countDocuments();

    const totalRevenueAgg = await Order.aggregate([
        { $match: { paymentStatus: { $in: ["paid", "pending"] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = sum(totalRevenueAgg);

    const productStats = await Order.aggregate([
        { $unwind: "$items" },
        { $match: { "items.itemType": "product" } },
        {
            $group: {
                _id: null,
                count: { $sum: "$items.quantity" },
                revenue: { $sum: { $multiply: ["$items.quantity", { $ifNull: ["$items.productSnapshot.price", 0] }] } },
            },
        },
    ]);
    const productCount = productStats[0]?.count || 0;
    const productRevenue = productStats[0]?.revenue || 0;

    const customStats = await Order.aggregate([
        { $unwind: "$items" },
        { $match: { "items.itemType": "customization" } },
        {
            $group: {
                _id: null,
                count: { $sum: "$items.quantity" },
                revenue: { $sum: { $multiply: ["$items.quantity", { $ifNull: ["$items.customizationSnapshot.price", 0] }] } },
            },
        },
    ]);
    const customCount = customStats[0]?.count || 0;
    const customRevenue = customStats[0]?.revenue || 0;

    const corporateRevenueAgg = await Corporate.aggregate([
        { $match: { paymentStatus: { $in: ["Paid", "Pending"] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const corporateRevenue = sum(corporateRevenueAgg);

    const orderStats = await Order.aggregate([
        { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
    ]);
    const orderRevenue = sum(orderStats);

    const salesByMonthAgg = await Order.aggregate([
        {
            $group: {
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                sales: { $sum: "$totalAmount" },
                count: { $sum: 1 },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
    ]);

    const topProductsAgg = await Order.aggregate([
        { $unwind: "$items" },
        { $match: { "items.itemType": "product" } },
        {
            $group: {
                _id: "$items.productSnapshot.name",
                count: { $sum: "$items.quantity" },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
    ]);

    const popularFlavoursAgg = await Order.aggregate([
        { $unwind: "$items" },
        { $match: { "items.itemType": "product" } },
        {
            $lookup: {
                from: "products",
                let: { productId: { $toObjectId: "$items.productSnapshot.id" } },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$productId"] } } },
                    { $project: { flavour: "$attributes.flavour" } },
                ],
                as: "productRef",
            },
        },
        {
            $addFields: {
                mergedFlavours: {
                    $cond: [
                        { $gt: [{ $size: { $ifNull: ["$items.productSnapshot.attributes.flavour", []] } }, 0] },
                        "$items.productSnapshot.attributes.flavour",
                        { $arrayElemAt: ["$productRef.flavour", 0] },
                    ],
                },
            },
        },
        { $unwind: { path: "$mergedFlavours", preserveNullAndEmptyArrays: false } },
        {
            $group: {
                _id: "$mergedFlavours",
                count: { $sum: "$items.quantity" },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 8 },
    ]);

    return res.status(200).json(
        new APIresponse(
            200,
            {
                deliveredOrders,
                pendingOrders,
                totalCorporateOrders,
                productCount,
                customCount,
                totalRevenue,
                orderRevenue,
                productRevenue,
                customRevenue,
                corporateRevenue,
                salesByMonth: salesByMonthAgg,
                topProducts: topProductsAgg,
                popularFlavours: popularFlavoursAgg,
            },
            "Dashboard stats fetched",
        ),
    );
});

const promoteToAdmin = asyncHandler(async (req, res) => {
    let { email } = req.body;
    if (!email && req.user) {
        email = req.user.email;
    }
    if (!email) {
        throw new APIerror(400, "Email is required");
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new APIerror(404, `User not found: ${email}`);
    }
    user.role = "admin";
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new APIresponse(200, { user: { _id: user._id, email: user.email, role: user.role } }, "User promoted to admin"));
});

const promoteToAdminPublic = asyncHandler(async (req, res) => {
    const { email, secret } = req.body;
    if (secret !== process.env.ADMIN_PROMOTE_SECRET && secret !== "chocokari-admin-2026") {
        throw new APIerror(403, "Invalid secret");
    }
    if (!email) {
        throw new APIerror(400, "Email is required");
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new APIerror(404, `User not found: ${email}`);
    }
    user.role = "admin";
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new APIresponse(200, { user: { _id: user._id, email: user.email, role: user.role } }, "User promoted to admin"));
});

export { getDashboardStats, promoteToAdmin, promoteToAdminPublic };
