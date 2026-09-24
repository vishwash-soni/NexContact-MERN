const Contact = require("../models/Contact.js");
const AppError = require("../utils/AppError");
const { escapeRegex } = require("../utils/validators");
const { uploadImage, removeImage } = require("../utils/cloudinaryUpload");

const MAX_LIMIT = 1000;

const getMyData = async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 500, 1), MAX_LIMIT);
  const page = Math.max(Number(req.query.page) || 1, 1);

  const allContact = await Contact.find({ user: req.user._id })
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  res.status(200).json({ allContact, page, limit });
};

const addMyData = async (req, res) => {
  const { name, phone, email, notes } = req.body ?? {};

  let imageUrl = null;
  let imagePublicId = null;
  if (req.file) {
    const result = await uploadImage(req.file.buffer);
    imageUrl = result.secure_url;
    imagePublicId = result.public_id;
  }

  const contact = await Contact.create({
    name,
    phone,
    email,
    notes,
    imageUrl,
    imagePublicId,
    user: req.user._id,
  });

  res.status(201).json(contact);
};

const updateMyData = async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, user: req.user._id }).select("+imagePublicId");
  if (!contact) throw new AppError(404, "Contact not found");

  const { name, phone, email, notes } = req.body ?? {};
  // undefined check: taaki notes/email ko khali (clear) bhi kar sako
  if (name !== undefined) contact.name = name;
  if (phone !== undefined) contact.phone = phone;
  if (email !== undefined) contact.email = email;
  if (notes !== undefined) contact.notes = notes;

  let oldImageId = null;
  if (req.file) {
    const result = await uploadImage(req.file.buffer);
    oldImageId = contact.imagePublicId;
    contact.imageUrl = result.secure_url;
    contact.imagePublicId = result.public_id;
  }

  const updated = await contact.save();
  removeImage(oldImageId); // background me, wait nahi karte

  res.status(200).json(updated);
};

const deleteMyData = async (req, res) => {
  const contact = await Contact.findOneAndDelete({ _id: req.params.id, user: req.user._id }).select("+imagePublicId");
  if (!contact) throw new AppError(404, "Contact not found");

  removeImage(contact.imagePublicId);
  res.status(200).json({ message: "Contact deleted successfully" });
};

const searchData = async (req, res) => {
  const term = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";

  const filter = { user: req.user._id };
  // User ka input regex me directly nahi jaana chahiye (crash / ReDoS), isliye escape
  if (term) filter.name = { $regex: escapeRegex(term), $options: "i" };

  const contacts = await Contact.find(filter).sort({ createdAt: 1 }).limit(200).lean();
  res.status(200).json(contacts);
};

module.exports = { getMyData, updateMyData, deleteMyData, addMyData, searchData };
