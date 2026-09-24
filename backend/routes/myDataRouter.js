const express = require("express");
const protect = require("../middleware/authMiddleware.js");
const upload = require("../middleware/upload");
const { getMyData, updateMyData, deleteMyData, addMyData, searchData } = require("../controllers/myDataController.js");

const router = express.Router();

// protect hamesha pehle: bina login ke koi file upload na kar sake
router.use(protect);

router.get("/getmycontact", getMyData);
router.post("/addcontact", upload.single("image"), addMyData);
router.put("/updatemycontact/:id", upload.single("image"), updateMyData);
router.delete("/deletemycontact/:id", deleteMyData);
router.get("/searchcontact", searchData);

module.exports = router;
