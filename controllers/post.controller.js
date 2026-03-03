import Post from '../models/post.model.js';
import { errorHandler } from '../utils/errorHandler.js';

// 1. CREAR PRODUCTO (Cualquier usuario autenticado puede)
export const create = async (req, res, next) => {
  const { name, description, price } = req.body;
  
  if (!name || !description || !price) {
    return next(errorHandler(400, 'Por favor, completa todos los campos obligatorios'));
  }

  const slug = name
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '') 
    + '-' + Math.random().toString(36).slice(2, 7);

  const newPost = new Post({
    ...req.body,
    price: Number(price), 
    slug,
    userId: req.user.id, // Guardamos el ID del creador
    isSold: false, // Aseguramos que nace disponible
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

// 2. OBTENER PRODUCTOS (Público)
export const getposts = async (req, res, next) => {
  try {
    // Buscamos todos los posts, ordenados por los más recientes
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json({
      posts,
      totalPosts: posts.length
    });
  } catch (error) {
    next(error);
  }
};

// 3. ELIMINAR PRODUCTO (Solo dueño o Admin)
export const deletepost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return next(errorHandler(404, 'Producto no encontrado'));
    }

    if (!req.user.isAdmin && post.userId !== req.user.id) {
      return next(errorHandler(403, 'No tienes permiso para eliminar este producto'));
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json('El producto ha sido eliminado correctamente');

  } catch (error) {
    next(error);
  }
};

// 4. ACTUALIZAR PRODUCTO (Solo dueño o Admin)
export const updatepost = async (req, res, next) => {
  try {
    const postToUpdate = await Post.findById(req.params.postId);

    if (!postToUpdate) {
      return next(errorHandler(404, 'Producto no encontrado'));
    }

    if (!req.user.isAdmin && postToUpdate.userId !== req.user.id) {
      return next(errorHandler(403, 'No tienes permiso para editar este producto'));
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          name: req.body.name,
          category: req.body.category,
          description: req.body.description,
          price: Number(req.body.price),
          image: req.body.image,
          isSold: req.body.isSold, // Permitimos editar el estado de stock
        },
      },
      { new: true }
    );
    
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

// 5. MARCAR COMO VENDIDO (Lógica de Compra)
export const sellpost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return next(errorHandler(404, 'Producto no encontrado'));
    }

    // Opcional: Impedir que el dueño se compre a sí mismo a nivel servidor
    if (post.userId === req.user.id) {
      return next(errorHandler(400, 'No puedes comprar tu propio producto'));
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: { isSold: true },
      },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};