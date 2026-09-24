const fs = require("fs");
const Contact = require("../models/Contact.js");
const cloudinary = require("../config/coudinary.js");

// Image Cloudinary pe upload karo aur temp file (uploads/ folder se) hata do
const uploadImage = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.path);
        return result.secure_url;
    } finally {
        fs.unlink(file.path, () => { });
    }
};

// User ka search text regex me safe banane ke liye
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


const getMyData = async (req, res) => {
    try {
        const allContact = await Contact.find({ user: req.user._id }).lean();
        return res.status(200).json({ allContact });
    }
    catch (error) {
        return res.status(500).json({ message: "something went wrong in finding contact" });
    }
};

const addMyData = async (req, res) => {
    try {
        const { name, phone, email, notes } = req.body;

        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadImage(req.file);
        }

        const contact = await Contact.create({
            name,
            phone,
            email,
            notes,
            imageUrl,
            user: req.user._id
        });

        return res.status(201).json(contact);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "something went wrong in adding contact",
            error: error.message
        });
    }
};

const updateMyData = async (req, res) => {
    try {
        const contact = await Contact.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        if (req.file) {
            contact.imageUrl = await uploadImage(req.file);
        }

        // "!== undefined" se email/notes ko khali karna bhi possible hai
        const { name, phone, email, notes } = req.body;
        if (name !== undefined) contact.name = name;
        if (phone !== undefined) contact.phone = phone;
        if (email !== undefined) contact.email = email;
        if (notes !== undefined) contact.notes = notes;

        const updatedContact = await contact.save();
        return res.status(200).json(updatedContact);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong in updating" });
    }
};

const deleteMyData = async (req, res) => {
    try {
        const contact = await Contact.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        return res.status(200).json({ message: "Contact deleted successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong in deleting" });
    }
};

const searchData = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();

        const contacts = await Contact.find({
            user: req.user._id,
            name: { $regex: escapeRegex(search), $options: "i" }
        }).lean();

        return res.status(200).json(contacts);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { getMyData, updateMyData, deleteMyData, addMyData, searchData };
