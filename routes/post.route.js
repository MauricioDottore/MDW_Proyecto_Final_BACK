import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { create, getposts, deletepost, updatepost} from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', verifyToken, create);
router.get('/getposts', getposts);

// Asegúrate de que esta línea esté al final o bien escrita
router.delete('/deletepost/:postId', verifyToken, deletepost);
router.put('/updatepost/:postId', verifyToken, updatepost);

export default router;