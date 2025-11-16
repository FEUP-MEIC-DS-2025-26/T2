import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Jumpseller API client
const jumpsellerClient = axios.create({
  baseURL: 'https://api.jumpseller.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: process.env.JUMPSELLER_LOGIN || '',
    password: process.env.JUMPSELLER_TOKEN || '',
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
    
    console.log(`   📋 Raw reviews response:`, JSON.stringify(reviewsData, null, 2));
    
    // Unwrap the review from the nested structure and filter valid ratings
    const unwrappedReviews = reviewsData
      .map(item => item.review || item) // Unwrap nested review object
      .filter(review => {
        const rating = Number(review.rating);
        const isValid = !isNaN(rating) && rating >= 1 && rating <= 5;
        
        if (!isValid) {
          console.log(`   ⚠️ Skipping review with invalid rating: ${review.rating}`);
        }
        
        return isValid;
      });
    
    console.log(`   ✅ Valid reviews after filtering: ${unwrappedReviews.length}`);
    return unwrappedReviews;
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`   ℹ️ No reviews endpoint found for product ${productId}`);
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
  return Math.round((sum / validReviews.length) * 10) / 10; // Round to 1 decimal
}

// Sync products and reviews to database
async function syncToDatabase() {
  console.log('🔄 Starting Jumpseller → Database Sync\n');
  console.log('='.repeat(60));

  try {
    // 1. Ensure we have a default user for created_by_user_id
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
      console.log('⚠️ No products found in Jumpseller');
      return;
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
      console.log(`   📊 Found ${reviews.length} valid reviews`);

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
      if (isNaN(price)) {
        console.warn(`   ⚠️ Invalid price for product: ${jsProduct.price}, defaulting to 0`);
      }

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
        // Create new product with relation
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
        // Delete old photos
        await prisma.productPhoto.deleteMany({
          where: { product_id: product.id },
        });

        // Create new photos
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
        
        // Skip invalid ratings (double-check)
        if (isNaN(rating) || rating < 1 || rating > 5) {
          console.warn(`   ⚠️ Skipping invalid review rating: ${jsReview.rating}`);
          reviewsSkipped++;
          continue;
        }

        // Check if review already exists
        const existingReview = await prisma.review.findUnique({
          where: { jumpseller_id: jsReview.id },
        });

        if (!existingReview) {
          try {
            // Extract customer email from the review
            const reviewerEmail = jsReview.customer_email || '';
            const reviewerName = reviewerEmail.split('@')[0] || 'Anonymous'; // Use email prefix as name
            
            await prisma.review.create({
              data: {
                jumpseller_id: jsReview.id,
                score: rating,
                comment: jsReview.review || '', // Note: field is "review" not "comment"
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
        } else {
          console.log(`   ℹ️ Review #${jsReview.id} already exists, skipping`);
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
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncToDatabase()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });