// Agrega deleteUser a la lista de importaciones
import { getUser, test, updateUser, deleteUser } from '../controllers/user.controller.js'; 
import { verifyToken } from '../utils/verifyToken.js';
import express from 'express';

const router = express.Router();

router.get('/test', test);
router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);

export default router;