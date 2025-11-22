import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { getJumpsellerApi, JumpsellerReview } from '../services/jumpsellerApi';

type ProductSpecification = {
  title: string;
  description: string;
};

type ProductPhoto = {
  photo_url: string;
  alt_text: string | null;
};

type ProductFromApi = {
  id: number;
  title: string;
  storytelling: string | null;
  description: string | null;
  price: number;
  avg_score: number;
  reviewCount: number;
  mainPhoto: ProductPhoto | null;
  photos: ProductPhoto[];
  specifications: ProductSpecification[] | null;
  brand?: string | null; // <-- Add brand field
};

// Product ID to fetch - Galo de Barcelos
const GALO_PRODUCT_ID = 32614736;

// Helper function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

// Helper function to calculate average rating from reviews
const calculateAverageRating = (reviews: JumpsellerReview[]): number => {
  if (reviews.length === 0) return 0;
  
  const validReviews = reviews.filter(review => {
    const rating = Number(review.rating);
    return !isNaN(rating) && rating >= 1 && rating <= 5;
  });
  
  if (validReviews.length === 0) return 0;
  
  const sum = validReviews.reduce((acc, review) => acc + Number(review.rating), 0);
  return Math.round((sum / validReviews.length) * 10) / 10;
};

// Map Jumpseller product to ProductFromApi format
const mapJumpsellerToProduct = (
  jumpsellerProduct: any,
  reviews: JumpsellerReview[]
): ProductFromApi => {
  const product = jumpsellerProduct.product || jumpsellerProduct;
  
  // Convert custom fields to specifications
  const customFieldsSpecs = product.fields
    ? product.fields.map((field: any) => ({
        title: field.label,
        description: stripHtmlTags(field.value),
      }))
    : [];
  
  // Calculate average rating from reviews
  const avgRating = calculateAverageRating(reviews);
  
  return {
    id: product.id,
    title: product.name || 'Produto sem nome',
    storytelling: stripHtmlTags(product.description || 'Descrição não disponível.'),
    description: stripHtmlTags(product.description || 'Descrição não disponível.'),
    price: typeof product.price === 'number' ? product.price : parseFloat(product.price || '0'),
    avg_score: avgRating,
    reviewCount: reviews.length,
    photos: product.images && product.images.length > 0 
      ? product.images.map((img: any) => ({
          photo_url: img.url,
          alt_text: img.description || product.name,
        }))
      : [],
    mainPhoto: product.images?.[0]
      ? {
          photo_url: product.images[0].url,
          alt_text: product.images[0].description || product.name,
        }
      : null,
    specifications: customFieldsSpecs,
    brand: product.brand || null,
  };
};

const renderStars = (score: number) =>
  Array.from({ length: 5 }, (_, i) => {
    const id = `star-half-clip-${i}`;
    const full = i < Math.floor(score);
    const half = !full && score > i && score < i + 1;
    
    return (
      <svg
        key={i}
        viewBox="0 0 24 24"
        style={{ width: 32, height: 32, marginRight: 2, display: 'block' }}
      >
        {half && (
          <>
            <defs>
              <clipPath id={id}>
                <rect x="0" y="0" width="12" height="24" />
              </clipPath>
            </defs>
            <path
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              fill="#181818"
              stroke="none"
              style={{ clipPath: `url(#${id})` }}
            />
          </>
        )}
        <path
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          fill={full ? '#181818' : 'none'}
          stroke="#181818"
          strokeWidth={2}
        />
      </svg>
    );
  });

export default function ProductDetail() {
  const [product, setProduct] = useState<ProductFromApi | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'jumpseller' | 'database'>('jumpseller');

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Fetching Galo product (ID: ${GALO_PRODUCT_ID}) from Jumpseller API...`);
      
      try {
        const api = getJumpsellerApi();
        
        // Fetch product data by ID directly
        const jumpsellerProduct = await api.getProduct(GALO_PRODUCT_ID);
        
        if (!isMounted) return;
        
        console.log('✅ Galo product found:', jumpsellerProduct.name);
        
        // Fetch reviews for the product
        console.log(`🔍 Fetching reviews for product ID: ${jumpsellerProduct.id}...`);
        let reviews: JumpsellerReview[] = [];
        try {
          reviews = await api.getProductReviews(jumpsellerProduct.id);
          console.log(`✅ Loaded ${reviews.length} reviews from Jumpseller`);
        } catch (reviewError) {
          console.warn('⚠️ Could not fetch reviews, using 0 reviews', reviewError);
          reviews = [];
        }
        
        // Map product with reviews
        const mappedProduct = mapJumpsellerToProduct({ product: jumpsellerProduct }, reviews);
        
        console.log('✅ Product loaded from Jumpseller:', mappedProduct.title);
        console.log(`   Reviews: ${mappedProduct.reviewCount}, Avg Rating: ${mappedProduct.avg_score.toFixed(1)}`);
        
        setProduct(mappedProduct);
        setSource('jumpseller');
        setLoading(false);
        
      } catch (jumpsellerError: any) {
        console.warn(`⚠️ Jumpseller API failed for product ID ${GALO_PRODUCT_ID}, falling back to database...`, jumpsellerError);
        
        if (!isMounted) return;
        
        // Fallback to database - find product by jumpseller_id
        try {
          console.log(`🔍 Attempting to fetch product from database (Jumpseller ID: ${GALO_PRODUCT_ID})...`);
          
          // FIXED: Use correct backend port (3002) and correct endpoint
          const res = await fetch(`http://localhost:3103/products/jumpseller/${GALO_PRODUCT_ID}`);
          
          if (!isMounted) return;
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao carregar produto da base de dados');
          }
          
          const dbProduct: ProductFromApi = await res.json();
          
          console.log('✅ Product loaded from database:', dbProduct.title);
          setProduct(dbProduct);
          setSource('database');
          
        } catch (dbError: any) {
          console.error('❌ Database fetch also failed:', dbError);
          if (isMounted) {
            setError(dbError.message || `Erro ao carregar produto ${GALO_PRODUCT_ID}`);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 3
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            color: '#344E41',
          }} 
        />
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#344E41',
            fontWeight: 500
          }}
        >
          A carregar Galo de Barcelos...
        </Typography>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '40vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Typography 
          variant="h5" 
          color="error" 
          sx={{ fontWeight: 'bold' }}
        >
          ❌ Erro ao carregar produto
        </Typography>
        <Typography variant="body1" color="error">
          {error || `Produto Galo de Barcelos não encontrado.`}
        </Typography>
      </Box>
    );
  }

  const photos = product.photos || [];
  const reviewCount = product.reviewCount ?? 0;

  return (
    <Box sx={{ py: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 1.5, sm: 3, md: 0 },
        }}
      >
        {/* Debug badge to show data source */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              bgcolor: source === 'jumpseller' ? '#4caf50' : '#ff9800',
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 'bold',
            }}
          >
            📦 Fonte: {source === 'jumpseller' ? 'Jumpseller API' : 'Base de Dados'} | ID: {GALO_PRODUCT_ID}
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: '#E4E1D6',
            borderRadius: '24px',
            p: { xs: 2, sm: 3, md: 4 },
            boxShadow:
              '0 10px 15px -3px rgba(0,0,0,0.12), 0 4px 6px -2px rgba(0,0,0,0.06)',
          }}
        >
          <Grid
            container
            columnSpacing={{ xs: 2, md: 2 }}
            rowSpacing={isSmallScreen ? 2 : 0}
            sx={{
              alignItems: 'strech',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
            }}
          >
            {/* LEFT – IMAGEM */}
            <Grid
              item
              xs={12}
              md={3}
              sx={{
                display: 'flex',
                minWidth: 0,
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <Box
                sx={{
                  bgcolor: '#274836',
                  borderRadius: '16px',
                  p: 2,
                  width: { md: 450 },
                  height: { md: 550 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    bgcolor: 'white',
                    borderRadius: '8px',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    component="img"
                    src={
                      photos[selectedPhotoIndex]?.photo_url ||
                      product.mainPhoto?.photo_url ||
                      '/galo.png'
                    }
                    alt={
                      photos[selectedPhotoIndex]?.alt_text ||
                      product.mainPhoto?.alt_text ||
                      product.title
                    }
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', e.currentTarget.src);
                      e.currentTarget.src = '/galo.png';
                    }}
                  />
                </Box>

                {photos.length > 1 && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      mt: 0,
                      justifyContent: 'center',
                    }}
                  >
                    {photos.map((p, i) => (
                      <Box
                        key={i}
                        onClick={() => setSelectedPhotoIndex(i)}
                        sx={{
                          width: { xs: 60, sm: 60 },
                          height: { xs: 60, sm: 60 },
                          borderRadius: 2,
                          overflow: 'hidden',
                          border:
                            i === selectedPhotoIndex
                              ? '2.5px solid #344E41'
                              : '2.5px solid transparent',
                          cursor: 'pointer',
                          bgcolor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow:
                            i === selectedPhotoIndex
                              ? '0 0 0 3px white, 0 0 10px 2px rgba(255,255,255,0.6)'
                              : 'none',
                          transition: 'all 0.18s',
                        }}
                      >
                        <Box
                          component="img"
                          src={p.photo_url}
                          alt={p.alt_text || product.title}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/galo.png';
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>

            {/* RIGHT – INFO */}
            <Grid
              item
              xs={12}
              md={9}
              sx={{
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                pl: { md: 3 },
                flex: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'space-between',
                  gap: 3,
                }}
              >
                {/* Título + descrição */}
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1,
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                          fontSize: {
                            xs: '2rem',
                            sm: '2.25rem',
                            lg: '2.5rem',
                          },
                          fontWeight: 'bold',
                          color: '#344E41',
                          lineHeight: 1.1,
                          wordBreak: 'break-word',
                        }}
                      >
                        {product.title}
                      </Typography>
                      {product.brand && (
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: '#588157',
                            fontWeight: 600,
                            fontSize: { xs: '1.05rem', sm: '1.15rem' },
                            mt: 0.5,
                            fontStyle: 'italic',
                          }}
                        >
                          {product.brand}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      aria-label="Adicionar à wishlist"
                      sx={{
                        p: 1,
                        '&:hover': {
                          transform: 'scale(1.05)',
                          '& svg': { fill: '#344E41' },
                        },
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="40"
                        height="40"
                        fill="none"
                        stroke="#344E41"
                        strokeWidth={2.2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      maxHeight: 400,
                      overflowY: 'auto',
                      mb: 1.5,
                      pr: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '1.05rem', sm: '1.12rem' },
                        color: 'black',
                        lineHeight: 1.7,
                      }}
                    >
                      {product.storytelling}
                    </Typography>
                  </Box>
                </Box>

                {/* Preço + rating */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: {
                          xs: '2rem',
                          sm: '2.25rem',
                          lg: '2.5rem',
                        },
                        fontWeight: 'bold',
                        color: 'black',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {Number(product.price).toFixed(2)} €
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap',
                        flexGrow: 1,
                      }}
                    >
                      {/* Only show stars if there are reviews */}
                      {reviewCount > 0 && (
                        <>
                          <Box sx={{ display: 'flex', gap: 0.25 }}>
                            {renderStars(product.avg_score)}
                          </Box>
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: {
                                xs: '1rem',
                                sm: '1.1rem',
                              },
                              fontWeight: 500,
                              color: '#3A5A40',
                            }}
                          >
                            {product.avg_score.toFixed(1)} ({reviewCount} avaliaç{reviewCount > 1 ? 'ões' : 'ão'})
                          </Typography>
                        </>
                      )}
                      {reviewCount === 0 && (
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: {
                              xs: '1rem',
                              sm: '1.1rem',
                            },
                            fontWeight: 500,
                            color: '#999',
                          }}
                        >
                          Sem avaliações
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Botões */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      minWidth: 160,
                      bgcolor: '#344E41',
                      color: 'white',
                      p: { xs: '10px 20px', sm: '14px 28px' },
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: { xs: '0.98rem', sm: '1.05rem' },
                      '&:hover': {
                        bgcolor: '#A3B18A',
                        color: 'black',
                      },
                      gap: 1.5,
                      boxShadow:
                        '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Comprar
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      bgcolor: '#588157',
                      color: 'white',
                      ml: { sm: 2 },
                      p: { xs: '10px 20px', sm: '14px 28px' },
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: { xs: '0.98rem', sm: '1.05rem' },
                      '&:hover': {
                        bgcolor: '#A3B18A',
                        color: 'black',
                      },
                      gap: 1.5,
                      boxShadow:
                        '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Falar com o Vendedor
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* História do Produto Section */}
          <Box
            sx={{
              bgcolor: '#F5F5F5',
              borderRadius: '16px',
              mt: 4,
              p: { xs: 2, sm: 3 },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: '#344E41',
                mb: 1,
                fontSize: { xs: '1.2rem', sm: '1.35rem' },
              }}
            >
              História do Produto
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1.02rem', sm: '1.1rem' },
                fontWeight: 600,
                color: 'black',
                whiteSpace: 'pre-line',
                lineHeight: 1.7,
              }}
            >
              {product.description}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ height: '1px', bgcolor: 'rgba(52, 78, 65, 0.3)', my: 3 }} />
      </Box>
    </Box>
  );
}

/**
 * ProductSpecifications - Fetches specs for Galo de Barcelos
 */
export function ProductSpecifications() {
  const [product, setProduct] = useState<ProductFromApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'jumpseller' | 'database'>('jumpseller');

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      
      console.log(`🔍 Fetching specs for Galo (ID: ${GALO_PRODUCT_ID}) from Jumpseller API...`);
      
      try {
        const api = getJumpsellerApi();
        const jumpsellerProduct = await api.getProduct(GALO_PRODUCT_ID);
        
        if (!isMounted) return;
        
        // Fetch reviews
        let reviews: JumpsellerReview[] = [];
        try {
          reviews = await api.getProductReviews(jumpsellerProduct.id);
        } catch {
          reviews = [];
        }
        
        const mappedProduct = mapJumpsellerToProduct({ product: jumpsellerProduct }, reviews);
        
        console.log('✅ Specs loaded from Jumpseller');
        setProduct(mappedProduct);
        setSource('jumpseller');
        setLoading(false);
        
      } catch (jumpsellerError) {
        console.warn('⚠️ Jumpseller specs failed, falling back to database...');
        
        if (!isMounted) return;
        
        try {
          // FIXED: Use correct backend port (3103)
          const res = await fetch(`http://localhost:3103/products/jumpseller/${GALO_PRODUCT_ID}`);

          if (!isMounted) return;
          
          if (res.ok) {
            const dbProduct: ProductFromApi = await res.json();
            setProduct(dbProduct);
            setSource('database');
          }
        } catch {
          // Silently fail
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          py: 4 
        }}
      >
        <CircularProgress 
          size={40} 
          sx={{ color: '#344E41' }} 
        />
      </Box>
    );
  }

  if (!product) return null;

  const specifications = Array.isArray(product.specifications)
    ? product.specifications
    : [];

  if (specifications.length === 0) return null;

  return (
    <>
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 1.5, sm: 3, md: 0 },
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          pb: 4,
        }}
      >
        {specifications.map((spec, index) => (
          <React.Fragment key={index}>
            <Box
              sx={{
                bgcolor: '#E4E1D6',
                borderRadius: '16px',
                p: { xs: 2.5, sm: 3, md: 3.5 },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.3rem', sm: '1.6rem' },
                  fontWeight: 'bold',
                  color: 'black',
                  mb: 1.25,
                }}
              >
                {spec.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'black',
                  fontSize: { xs: '1.05rem', sm: '1.12rem' },
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  pl: { xs: 1, sm: 2 },
                }}
              >
                {spec.description}
              </Typography>
            </Box>

            {index < specifications.length - 1 && (
              <Box
                sx={{ height: '1px', bgcolor: 'rgba(52, 78, 65, 0.3)', my: 3 }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>

      <Box sx={{ height: '1px', bgcolor: 'rgba(52, 78, 65, 0.3)', my: 3 }} />
    </>
  );
}
