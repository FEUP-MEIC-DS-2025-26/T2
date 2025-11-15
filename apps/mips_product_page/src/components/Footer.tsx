import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import PinterestIcon from '@mui/icons-material/Pinterest';

// Link reutilizável (colunas de texto)
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    underline="none"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      color: '#24352C',
      fontSize: { xs: '1rem', md: '1.05rem' },
      fontWeight: 400,
      letterSpacing: '0.01em',
      transition: 'color 0.2s ease, transform 0.2s ease, text-decoration-color 0.2s ease',
      textDecoration: 'underline',
      textDecorationColor: 'transparent',
      textUnderlineOffset: '4px',
      '&:hover': {
        color: '#1f2c24',
        transform: 'translateY(-2px)',
        textDecorationColor: '#1f2c24',
      },
    }}
  >
    {children}
  </Link>
);

// Título de coluna
const ColumnTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    component="h3"
    sx={{
      fontWeight: 700,
      color: '#2f3f35',
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      fontSize: { xs: '0.95rem', md: '1.05rem' },
      mb: { xs: 2.5, md: 3.5 },
      textAlign: { xs: 'center', md: 'left' },
    }}
  >
    {children}
  </Typography>
);

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        width: '100%',
        bgcolor: '#DAD7CD',
        
        pt: { xs: 7, md: 9 },
        pb: { xs: 6, md: 8 },
      }}
    >
      {/* Bloco central ao centro */}
      <Box
        sx={{
          position: 'relative',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 1200,
          px: { xs: 3, sm: 6, md: 10 },
        }}
      >
        {/* Colunas principais */}
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          justifyContent="space-between"
          sx={{ mb: 5 }}
        >
          {/* Coluna 1 */}
          <Grid item xs={12} sm={6} md={3}>
            <ColumnTitle>Sobre Nós</ColumnTitle>
            <Stack spacing={1.4} alignItems={{ xs: 'center', md: 'flex-start' }}>
              <FooterLink href="/about">A nossa história</FooterLink>
              <FooterLink href="/contact">Contactos</FooterLink>
              <FooterLink href="/careers">Carreiras</FooterLink>
            </Stack>
          </Grid>

          {/* Coluna 2 */}
          <Grid item xs={12} sm={6} md={3}>
            <ColumnTitle>Apoio ao Cliente</ColumnTitle>
            <Stack spacing={1.4} alignItems={{ xs: 'center', md: 'flex-start' }}>
              <FooterLink href="/faq">FAQ</FooterLink>
              <FooterLink href="/shipping">Envios e Devoluções</FooterLink>
              <FooterLink href="/policy">Política de Privacidade</FooterLink>
            </Stack>
          </Grid>

          {/* Coluna 3 */}
          <Grid item xs={12} sm={6} md={3}>
            <ColumnTitle>Vender</ColumnTitle>
            <Stack spacing={1.4} alignItems={{ xs: 'center', md: 'flex-start' }}>
              <FooterLink href="/sell">Como Vender</FooterLink>
              <FooterLink href="/seller-portal">Portal do Vendedor</FooterLink>
            </Stack>
          </Grid>

          {/* Coluna 4 */}
          <Grid item xs={12} sm={6} md={3}>
            <ColumnTitle>Siga-nos</ColumnTitle>

            <Stack spacing={1.6} alignItems={{ xs: 'center', md: 'flex-start' }}>
              <Link
                href="#"
                underline="none"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  color: '#1f2c24',
                  fontSize: '1.05rem',
                  fontWeight: 400,
                  transition: 'all 0.2s ease',
                  textDecoration: 'underline',
                  textDecorationColor: 'transparent',
                  textUnderlineOffset: '4px',
                  '&:hover': {
                    textDecorationColor: '#1f2c24',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <InstagramIcon sx={{ fontSize: 22, opacity: 0.8 }} />
                Instagram
              </Link>

              <Link
                href="#"
                underline="none"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  color: '#1f2c24',
                  fontSize: '1.05rem',
                  fontWeight: 400,
                  transition: 'all 0.2s ease',
                  textDecoration: 'underline',
                  textDecorationColor: 'transparent',
                  textUnderlineOffset: '4px',
                  '&:hover': {
                    textDecorationColor: '#1f2c24',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <FacebookIcon sx={{ fontSize: 22, opacity: 0.8 }} />
                Facebook
              </Link>

              <Link
                href="#"
                underline="none"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  color: '#1f2c24',
                  fontSize: '1.05rem',
                  fontWeight: 400,
                  transition: 'all 0.2s ease',
                  textDecoration: 'underline',
                  textDecorationColor: 'transparent',
                  textUnderlineOffset: '4px',
                  '&:hover': {
                    textDecorationColor: '#1f2c24',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <PinterestIcon sx={{ fontSize: 22, opacity: 0.8 }} />
                Pinterest
              </Link>
            </Stack>
          </Grid>

        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            textAlign: 'center',
            color: '#3A5A40',
            fontSize: '0.95rem',
            opacity: 0.9,
          }}
        >
          © {new Date().getFullYear()} madeinportugal.store. Todos os direitos reservados.
        </Box>
      </Box>
    </Box>
  );
}
