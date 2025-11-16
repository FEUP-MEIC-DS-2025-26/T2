// apps/mips_product_page/src/api/product.ts
import express from 'express';
import cors from 'cors';
import { prisma } from '../lib/prisma';

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: 'http://localhost:3001', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

// Endpoint para ir buscar UM produto (ex: /products/1)
app.get('/products/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        photos: true,
        reviews: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Escolher a foto principal
    const mainPhoto =
      product.photos.find((p) => p.is_main) || product.photos[0] || null;

    // Mapear para o formato que o teu componente já usa
    const mapped = {
      id: product.id,
      title: product.title,
      storytelling: product.storytelling,
      description: product.description,
      price: Number(product.price),
      avg_score: product.avg_score,
      reviewCount: product.reviews.length,
      mainPhoto: mainPhoto
        ? {
            photo_url: mainPhoto.photo_url,
            alt_text: mainPhoto.alt_text ?? product.title,
          }
        : null,
      photos: product.photos
        .filter((p) => !mainPhoto || p.id !== mainPhoto.id)
        .map((p) => ({
          photo_url: p.photo_url,
          alt_text: p.alt_text ?? product.title,
        })),
      specifications: (product.specifications ?? []) as {
        title: string;
        description: string;
      }[],
    };

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar produto' });
  }
});

app.listen(port, () => {
  console.log(`API de produtos a correr em http://localhost:${port}`);
});
