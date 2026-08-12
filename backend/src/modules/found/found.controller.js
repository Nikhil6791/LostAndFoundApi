import asyncHandler from "express-async-handler";
import { createFoundItemService } from "./found.service.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";

export const createFoundItem = asyncHandler(async (req, res) => {

    const image = await uploadToCloudinary(req.file.path);

    const foundItem = await createFoundItemService({
        reporterName: req.body.reporterName,
        phone: req.body.phone,
        email: req.body.email,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        locationFound: req.body.locationFound,
        dateFound: new Date(req.body.dateFound),
        imageUrl: image.secure_url,
        imagePublicId: image.public_id
    });

    res.status(201).json({
        success: true,
        message: "Found item created successfully",
        data: foundItem
    });

});