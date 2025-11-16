import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Jumpseller API client with correct authentication
const jumpsellerClient = axios.create({
  baseURL: 'https://api.jumpseller.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: process.env.JUMPSELLER_LOGIN,
    password: process.env.JUMPSELLER_TOKEN,
  },
});

// Helper to strip HTML tags
const stripHtmlTags = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

// Fetch all products from Jumpseller
async function fetchAllProducts() {
  const allProducts = [];
  let page = 1;
  let hasMore = true;

  console.log('📦 Fetching products from Jumpseller...');

  while (hasMore) {
    try {
      const response = await jumpsellerClient.get('/products.json', {
        params: { page, limit: 50 },
      });

      const products = response.data;

      if (products && products.length > 0) {
        const unwrappedProducts = products.map((p) => p.product || p);
        allProducts.push(...unwrappedProducts);
        console.log(`   ✅ Fetched page ${page}: ${unwrappedProducts.length} products`);
        page++;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`   ❌ Error fetching products page ${page}:`, error.response?.data || error.message);
      hasMore = false;
    }
  }

  console.log(`✅ Total products fetched: ${allProducts.length}\n`);
  return allProducts;
}

// Fetch reviews for a specific product
async function fetchProductReviews(productId) {
  try {
    const response = await jumpsellerClient.get(`/products/${productId}/reviews.json`);
    const reviewsData = response.data || [];
    
    // Unwrap the review from the nested structure and filter valid ratings
    const unwrappedReviews = reviewsData
      .map(item => item.review || item)
      .filter(review => {
        const rating = Number(review.rating);
        return !isNaN(rating) && rating >= 1 && rating <= 5;
      });
    
    return unwrappedReviews;
    
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    console.error(`   ⚠️ Error fetching reviews for product ${productId}:`, error.response?.data || error.message);
    return [];
  }
}

// Calculate average rating from reviews
function calculateAverageRating(reviews) {
  if (!reviews || reviews.length === 0) return 0;
  
  const validReviews = reviews.filter(review => {
    const rating = Number(review.rating);
    return !isNaN(rating) && rating >= 1 && rating <= 5;
  });
  
  if (validReviews.length === 0) return 0;
  
  const sum = validReviews.reduce((acc, review) => acc + Number(review.rating), 0);
  return Math.round((sum / validReviews.length) * 10) / 10;
}

// Sync function
async function syncToDatabase() {
  console.log('\n🔄 Starting Jumpseller → Database Sync\n');
  console.log('='.repeat(60));

  try {
    // 1. Ensure we have a default user
    let defaultUser = await prisma.user.findUnique({
      where: { email: 'jumpseller@system.com' },
    });

    if (!defaultUser) {
      console.log('📝 Creating default system user...');
      defaultUser = await prisma.user.create({
        data: {
          username: 'jumpseller_system',
          first_name: 'Jumpseller',
          last_name: 'System',
          email: 'jumpseller@system.com',
          password_hash: 'SYSTEM_ACCOUNT_NO_LOGIN',
        },
      });
      console.log('✅ Default user created\n');
    }

    // 2. Fetch all products from Jumpseller
    const jumpsellerProducts = await fetchAllProducts();

    if (jumpsellerProducts.length === 0) {
      console.log('⚠️ No products found in Jumpseller\n');
      return {
        success: true,
        productsCreated: 0,
        productsUpdated: 0,
        reviewsCreated: 0,
        reviewsSkipped: 0,
      };
    }

    // 3. Process each product
    let productsCreated = 0;
    let productsUpdated = 0;
    let reviewsCreated = 0;
    let reviewsSkipped = 0;

    for (const jsProduct of jumpsellerProducts) {
      console.log(`\n📦 Processing: ${jsProduct.name} (SKU: ${jsProduct.sku || 'N/A'})`);

      // Fetch reviews for this product
      const reviews = await fetchProductReviews(jsProduct.id);
      if (reviews.length > 0) {
        console.log(`   📊 Found ${reviews.length} valid reviews`);
      }

      // Calculate average score
      const avgScore = calculateAverageRating(reviews);
      if (reviews.length > 0) {
        console.log(`   ⭐ Average score: ${avgScore}`);
      }

      // Convert custom fields to specifications
      const specifications = jsProduct.fields
        ? jsProduct.fields.map(field => ({
            title: field.label,
            description: stripHtmlTags(field.value),
          }))
        : [];

      // Parse price safely
      const price = parseFloat(jsProduct.price);

      // Check if product already exists
      const existingProduct = await prisma.product.findUnique({
        where: { jumpseller_id: jsProduct.id },
      });

      let product;

      const productData = {
        title: jsProduct.name || 'Untitled Product',
        description: stripHtmlTags(jsProduct.description || ''),
        storytelling: stripHtmlTags(jsProduct.description || ''),
        price: isNaN(price) ? 0 : price,
        sku: jsProduct.sku || `JS-${jsProduct.id}`,
        stock: jsProduct.stock || 0,
        permalink: jsProduct.permalink || '',
        avg_score: avgScore,
        specifications: specifications,
      };

      if (existingProduct) {
        // Update existing product
        product = await prisma.product.update({
          where: { jumpseller_id: jsProduct.id },
          data: {
            ...productData,
            updated_at: new Date(),
          },
        });
        productsUpdated++;
        console.log('   ✅ Product updated');
      } else {
        // Create new product
        product = await prisma.product.create({
          data: {
            jumpseller_id: jsProduct.id,
            ...productData,
            created_by: {
              connect: { id: defaultUser.id }
            }
          },
        });
        productsCreated++;
        console.log('   ✅ Product created');
      }

      // Sync product photos
      if (jsProduct.images && jsProduct.images.length > 0) {
        await prisma.productPhoto.deleteMany({
          where: { product_id: product.id },
        });

        const photoData = jsProduct.images.map((img, index) => ({
          product_id: product.id,
          photo_url: img.url,
          alt_text: img.description || jsProduct.name,
          is_main: img.position === 1 || index === 0,
        }));

        await prisma.productPhoto.createMany({
          data: photoData,
        });
        console.log(`   📸 Synced ${jsProduct.images.length} photos`);
      }

      // Sync reviews
      for (const jsReview of reviews) {
        const rating = Number(jsReview.rating);
        
        if (isNaN(rating) || rating < 1 || rating > 5) {
          reviewsSkipped++;
          continue;
        }

        const existingReview = await prisma.review.findUnique({
          where: { jumpseller_id: jsReview.id },
        });

        if (!existingReview) {
          try {
            const reviewerEmail = jsReview.customer_email || '';
            const reviewerName = reviewerEmail.split('@')[0] || 'Anonymous';
            
            await prisma.review.create({
              data: {
                jumpseller_id: jsReview.id,
                score: rating,
                comment: jsReview.review || '',
                reviewer_name: reviewerName,
                reviewer_email: reviewerEmail,
                product: {
                  connect: { id: product.id }
                },
                user: {
                  connect: { id: defaultUser.id }
                },
                created_at: jsReview.date ? new Date(jsReview.date) : new Date(),
                updated_at: new Date(),
              },
            });
            reviewsCreated++;
            console.log(`   ✅ Created review #${jsReview.id} (${rating}⭐)`);
          } catch (reviewError) {
            console.error(`   ❌ Failed to create review #${jsReview.id}:`, reviewError.message);
            reviewsSkipped++;
          }
        }
      }

      if (reviews.length > 0) {
        console.log(`   ⭐ Processed ${reviews.length} reviews`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Sync Complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   • Products created: ${productsCreated}`);
    console.log(`   • Products updated: ${productsUpdated}`);
    console.log(`   • Reviews created: ${reviewsCreated}`);
    console.log(`   • Reviews skipped: ${reviewsSkipped}`);
    console.log('='.repeat(60) + '\n');

    return {
      success: true,
      productsCreated,
      productsUpdated,
      reviewsCreated,
      reviewsSkipped,
    };

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message,
    };
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Get all products (with pagination)
app.get('/api/products', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    console.log(`Fetching products: page ${page}, limit ${limit}`);
    
    const response = await jumpsellerClient.get('/products.json', {
      params: { page, limit },
    });
    
    console.log('Products fetched successfully');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching products:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch products',
      details: error.response?.data || error.message,
    });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching product: ${id}`);
    
    const response = await jumpsellerClient.get(`/products/${id}.json`);
    
    console.log('Product fetched successfully');
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching product ${req.params.id}:`, error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch product',
      details: error.response?.data || error.message,
    });
  }
});

// Get product by SKU
app.get('/api/products/sku/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    console.log(`Fetching product by SKU: ${sku}`);
    
    const response = await jumpsellerClient.get('/products.json', {
      params: { sku },
    });
    
    const products = response.data;
    if (products && products.length > 0) {
      console.log('Product found by SKU');
      res.json(products[0]);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error(`Error fetching product by SKU ${req.params.sku}:`, error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch product by SKU',
      details: error.response?.data || error.message,
    });
  }
});

// Get product reviews
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching reviews for product: ${id}`);
    
    const response = await jumpsellerClient.get(`/products/${id}/reviews.json`);
    
    console.log('Reviews fetched successfully');
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching reviews for product ${req.params.id}:`, error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch product reviews',
      details: error.response?.data || error.message,
    });
  }
});

// Manual sync endpoint
app.post('/api/sync', async (req, res) => {
  console.log('\n📡 Manual sync requested via API endpoint\n');
  const result = await syncToDatabase();
  res.json(result);
});

// IMPORTANT: More specific routes MUST come before generic routes
// Get product from database by Jumpseller ID (MOVED BEFORE /products/:id)
app.get('/products/jumpseller/:jumpsellerProductId', async (req, res) => {
  try {
    const jumpsellerProductId = parseInt(req.params.jumpsellerProductId);
    
    console.log(`📦 Fetching product from DB with Jumpseller ID: ${jumpsellerProductId}`);
    
    const product = await prisma.product.findUnique({
      where: { jumpseller_id: jumpsellerProductId },
      include: {
        photos: true,
        reviews: {
          include: {
            user: {
              select: {
                username: true,
                first_name: true,
                last_name: true,
                photo_url: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!product) {
      console.log(`❌ Product with Jumpseller ID ${jumpsellerProductId} not found in database`);
      return res.status(404).json({ 
        error: 'Product not found',
        message: `Product with Jumpseller ID ${jumpsellerProductId} not found in database` 
      });
    }

    // Calculate review count and average score from database reviews
    const reviewCount = product.reviews.length;
    const avgScore = reviewCount > 0
      ? Math.round((product.reviews.reduce((sum, review) => sum + review.score, 0) / reviewCount) * 10) / 10
      : 0;

    // Format response to match the ProductFromApi structure
    const response = {
      id: product.jumpseller_id, // Use jumpseller_id for consistency
      title: product.title,
      storytelling: product.storytelling,
      description: product.description,
      price: product.price,
      avg_score: avgScore,
      reviewCount: reviewCount,
      mainPhoto: product.photos.find(p => p.is_main) || product.photos[0] || null,
      photos: product.photos.map(photo => ({
        photo_url: photo.photo_url,
        alt_text: photo.alt_text,
        is_main: photo.is_main,
      })),
      specifications: product.specifications,
      // Add reviews to response
      reviews: product.reviews.map(review => ({
        id: review.id,
        jumpseller_id: review.jumpseller_id,
        score: review.score,
        comment: review.comment,
        reviewer_name: review.reviewer_name,
        reviewer_email: review.reviewer_email,
        created_at: review.created_at,
        user: review.user ? {
          username: review.user.username,
          first_name: review.user.first_name,
          last_name: review.user.last_name,
          photo_url: review.user.photo_url,
        } : null,
      })),
    };

    console.log(`✅ Product found in database: ${product.title}`);
    console.log(`   📊 Reviews: ${reviewCount}, Avg Score: ${avgScore.toFixed(1)}`);
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error fetching product from database by Jumpseller ID:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      details: error.message 
    });
  }
});

// Get products from database by internal ID (AFTER the more specific route)
app.get('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    console.log(`📦 Fetching product from DB with internal ID: ${productId}`);
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        photos: true,
        reviews: {
          include: {
            user: {
              select: {
                username: true,
                first_name: true,
                last_name: true,
                photo_url: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate review count and average score
    const reviewCount = product.reviews.length;
    const avgScore = reviewCount > 0
      ? product.reviews.reduce((sum, review) => sum + review.score, 0) / reviewCount
      : 0;

    // Format response
    const response = {
      id: product.id,
      title: product.title,
      storytelling: product.storytelling,
      description: product.description,
      price: product.price,
      avg_score: avgScore,
      reviewCount: reviewCount,
      mainPhoto: product.photos.find(p => p.is_main) || product.photos[0] || null,
      photos: product.photos,
      specifications: product.specifications,
    };

    console.log(`✅ Product found: ${product.title}`);
    res.json(response);
  } catch (error) {
    console.error('Error fetching product from database:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Start server and run initial sync
app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Backend server running on http://localhost:' + PORT);
  console.log('='.repeat(60));
  console.log(`✅ Jumpseller Login: ${process.env.JUMPSELLER_LOGIN ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`✅ Jumpseller Token: ${process.env.JUMPSELLER_TOKEN ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log('='.repeat(60));
  
  // Run automatic sync on startup
  console.log('\n🔄 Running automatic sync on startup...\n');
  await syncToDatabase();
  
  console.log('\n💡 Server is ready to accept requests!');
  console.log(`💡 API endpoints:`);
  console.log(`   • GET  /api/health`);
  console.log(`   • GET  /api/products`);
  console.log(`   • GET  /api/products/:id`);
  console.log(`   • GET  /api/products/sku/:sku`);
  console.log(`   • GET  /api/products/:id/reviews`);
  console.log(`   • POST /api/sync`);
  console.log(`   • GET  /products/jumpseller/:jumpsellerProductId (Database fallback)`);
  console.log(`   • GET  /products/:id (Database by internal ID)`);
  console.log(`\n💡 To manually trigger sync: curl -X POST http://localhost:${PORT}/api/sync\n`);
});