import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import React from 'react';

const dummyProduct = {
  id: 3,
  title: 'Galo de Barcelos',
  storytelling:
    'Símbolo lendário de fé, sorte e perseverança, o Galo de Barcelos é uma das expressões mais emblemáticas da cultura popular portuguesa. Inspirado na famosa lenda do peregrino injustamente acusado, este galo ergue-se como um emblema de justiça e esperança. Cada detalhe do seu design reflete séculos de tradição passada entre gerações de artesãos que mantêm viva a alma do folclore português. Ao adquirir esta peça, apoia diretamente o trabalho manual local e contribui para a preservação das nossas raízes culturais.',
  description:
    'Este Galo de Barcelos é cuidadosamente moldado em cerâmica e pintado à mão por artesãos experientes de Barcelos, norte de Portugal. O processo de produção combina técnicas tradicionais com um toque moderno, garantindo uma peça vibrante, cheia de cor e caráter. Cada exemplar é único — pequenas variações na pintura e na textura conferem-lhe autenticidade e charme artesanal. Representando a célebre lenda em que um galo milagrosamente prova a inocência de um viajante, esta escultura é mais do que um objeto decorativo: é um símbolo de fé, justiça e boa sorte. Ideal para oferecer ou decorar espaços que valorizam cultura e identidade portuguesa. ',
  price: 29.99,
  avg_score: 4.5,
  reviewCount: 3,
  photos: [
    { photo_url: '/galo1.png', alt_text: 'Galo de Barcelos1' },
    { photo_url: '/galo2.png', alt_text: 'Galo de Barcelos2' },
  ],
  mainPhoto: {
    photo_url: '/galo.png',
    alt_text: 'Galo de Barcelos',
  },
  specifications: [
    { title: 'Material', description: 'Cerâmica pintada à mão' },
    { title: 'Dimensões', description: '25cm x 15cm' },
    { title: 'Peso', description: '0.8 kg' },
    { title: 'Origem', description: 'Barcelos, Portugal' },
    { title: 'Ano de produção', description: '2025' },
    { title: 'Acabamento', description: 'Verniz protetor com brilho' },
    {
      title: 'Cuidados',
      description: 'Limpar com pano seco; evitar produtos abrasivos',
    },
    { title: 'Uso recomendado', description: 'Decoração interior' },
    { title: 'Cor predominante', description: 'Preto com detalhes multicoloridos' },
    {
      title: 'Certificação',
      description: 'Produto artesanal certificado (Licença IPHAN)',
    },
  ],
};

export default function ProductDetail() {
  const product = dummyProduct;
  const photos = product.photos || [];
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const { reviewCount } = product;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const renderStars = (score) => Array.from({length:5},(_,i)=>{
    const id = `star-half-clip-${i}`;
    const full = i < Math.floor(score);
    const half = !full && score > i && score < i+1;
    return (
      <svg key={i} viewBox="0 0 24 24" style={{width:32,height:32,marginRight:2,display:"block"}}>
        {/* Meia estrela: preenche a esquerda, outline visível */}
        {half && (
          <>
            <defs>
              <clipPath id={id}>
                <rect x="0" y="0" width="12" height="24"/>
              </clipPath>
            </defs>
            <path
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              fill="#181818"
              stroke="none"
              style={{clipPath:`url(#${id})`}}
            />
          </>
        )}
        {/* Star border - visível em todos os casos */}
        <path
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          fill={full?"#181818":"none"}
          stroke="#181818"
          strokeWidth={2}
        />
      </svg>
    );
  });

  return (
    <Box sx={{ py: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 1.5, sm: 3, md: 0 },
        }}
      >
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
               flexWrap: { xs: 'wrap', md: 'nowrap' }
            }}
          >
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
                      product.mainPhoto.photo_url
                    }
                    alt={photos[selectedPhotoIndex]?.alt_text || product.title}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  />
                </Box>

                {photos.length > 1 && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 0, justifyContent: 'center' }}>
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
                          alt={p.alt_text}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
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
                pl: { md: 3},
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
                      {product.description}
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
                        {reviewCount === 0
                          ? 'Sem avaliações'
                          : `(${reviewCount} avaliaç${
                              reviewCount > 1 ? 'ões' : 'ão'
                            })`}
                      </Typography>
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
                    justifyContent: { xs: 'center', sm: 'flex-start' }
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
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

          {/* Storytelling */}
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
              {product.storytelling}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ height: '1px', bgcolor: 'rgba(52, 78, 65, 0.3)', my: 3 }} />
      </Box>
    </Box>
  );
}

export function ProductSpecifications() {
  const product = dummyProduct;

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
        {product.specifications.map((spec, index) => (
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

            {index < product.specifications.length - 1 && (
              <Box sx={{ height: '1px', bgcolor: 'rgba(52, 78, 65, 0.3)', my: 3 }} />
            )}
          </React.Fragment>
        ))}
      </Box>

      <Box sx={{ height: '1px', bgcolor: 'rgba(52, 78, 65, 0.3)', my: 3 }} />
    </>
  );
}