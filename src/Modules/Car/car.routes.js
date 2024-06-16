import { Router } from "express";
import * as carController from "./car.controller.js";
import { authenticateToken } from '../../../Middleware/auth.js';
const router = Router();


router.post('/add', authenticateToken, carController.addCar)
router.get('/:_id', carController.getCar)
router.get('/', carController.getAllCars)
router.put('/update/:_id', authenticateToken, carController.updateCar)
router.delete('/delete/:_id', authenticateToken, carController.deleteCar)

// ===================== special endpoints =============================
router.post('/', carController.getAllCarsWithModels)
router.get('/av/model', carController.getAvModel)
router.get('/re/model', carController.getRentedModel)
router.post('/filter', carController.getFilteredCars)




export default router