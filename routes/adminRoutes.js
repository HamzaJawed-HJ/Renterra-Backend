import express from 'express';
const router = express.Router();
import {
    loginAdmin, getAllUsers, getUser, createAdmin,
    getAllRenters, getRenter,
    getAllRentalRequestsAdmin,
    getAllProductsWithOwnerDetails,
    toggleBlockUser,
    toggleBlockOwner

} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';


router.post("/createAdmin", authMiddleware, createAdmin);

router.post("/createFirstAdmin", createAdmin);


router.post("/login", loginAdmin)

router.get("/getAllUsers", authMiddleware, getAllUsers);

router.get("/getUser/:id", authMiddleware, getUser);


//renter routes

router.get("/getAllRenter", authMiddleware, getAllRenters);

router.get("/getRenter/:id", authMiddleware, getRenter);


//rental Request Routes

router.get("/getAllRenterRequest", authMiddleware, getAllRentalRequestsAdmin);


//Product gets
router.get("/getAllProductsWithOwnerDetails",
     authMiddleware, getAllProductsWithOwnerDetails);



     // Block/unblock routes
router.patch('/toggleBlockOwner/:id', authMiddleware, toggleBlockUser);
router.patch('/toggleBlockUser/:id', authMiddleware, toggleBlockOwner);






export default router;