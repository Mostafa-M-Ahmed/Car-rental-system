import { Router } from "express";
import * as userController from "./user.controller.js";
import { authenticateToken } from '../../../Middleware/auth.js';
const router = Router();


router.post('/signup', userController.signUp)
router.post('/signin', userController.signIn)
router.get('/:_id', userController.getUser)
router.get('/', userController.getAllUsers)
router.put('/update/', authenticateToken, userController.updateUser)
router.delete('/delete', authenticateToken, userController.deleteUser)


export default router
