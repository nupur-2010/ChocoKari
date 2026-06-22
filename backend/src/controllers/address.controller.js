import { User } from "../models/user.model.js";
import { APIresponse } from "../utils/api-response.js";
import { APIerror } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const getAddresses = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    return res
        .status(200)
        .json(new APIresponse(200, { addresses: user.address }, "Addresses fetched"));
});

const addAddress = asyncHandler(async (req, res) => {
    const address = req.body;
    if (!address.label || !address.name || !address.phone || !address.line || !address.city || !address.state || !address.pincode) {
        throw new APIerror(400, "All address fields are required");
    }
    const user = await User.findById(req.user._id);
    if (address.isDefault) {
        user.address.forEach((a) => (a.isDefault = false));
    }
    user.address.push(address);
    await user.save({ validateBeforeSave: false });
    return res
        .status(201)
        .json(new APIresponse(201, { addresses: user.address }, "Address added"));
});

const updateAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const updates = req.body;
    const user = await User.findById(req.user._id);
    const addr = user.address.id(addressId);
    if (!addr) {
        throw new APIerror(404, "Address not found");
    }
    if (updates.isDefault) {
        user.address.forEach((a) => (a.isDefault = false));
    }
    Object.assign(addr, updates);
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new APIresponse(200, { addresses: user.address }, "Address updated"));
});

const deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    user.address = user.address.filter((a) => a._id.toString() !== addressId);
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new APIresponse(200, { addresses: user.address }, "Address deleted"));
});

export { getAddresses, addAddress, updateAddress, deleteAddress };
