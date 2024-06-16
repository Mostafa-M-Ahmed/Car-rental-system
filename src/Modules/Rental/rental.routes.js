import { Router } from "express";
import * as rentalController from "./rental.controller.js";
const router = Router();

router.post('/create',  rentalController.addRental)
router.get('/:_id', rentalController.getRental)
router.get('/', rentalController.getAllRentals)
router.put('/update/:_id',  rentalController.updateRental)
router.delete('/delete/:_id',  rentalController.deleteRental)

export default router