// Agrega deleteUser a la lista de importaciones
import { test, updateUser, deleteUser, signout, getUsers } from '../controllers/user.controller.js'; 
import { verifyToken } from '../utils/verifyToken.js';
import express from 'express';


const router = express.Router();

router.get('/test', test);
router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.post('/signout', signout) ;
router.get('/getusers', verifyToken, getUsers);

export default router;