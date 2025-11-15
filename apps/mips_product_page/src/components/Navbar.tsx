import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';

const HamburgerIcon = () => (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 28, height: 28 }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const dummyUser = {
  first_name: 'Diddy',
  photo_url: '/default-avatar.png',
};

export default function Navbar() {
  const user = dummyUser;

  return (
    <Box
      component="nav"
      sx={{
        bgcolor: '#DAD7CD',
        borderTop: '1px solid rgba(0,0,0,0.6)',
        borderBottom: '1px solid rgba(0,0,0,0.6)',
        px: { xs: 2, sm: 3 },
        py: 1.8,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* Esquerda – Hamburger */}
        <Box sx={{ justifySelf: 'start' }}>
          <IconButton
            aria-label="Toggle menu"
            disableRipple
            sx={{
              p: 0,
              color: '#000000',
              '&:hover': {
                bgcolor: 'transparent',
              },
            }}
          >
            <HamburgerIcon />
          </IconButton>
        </Box>

        {/* Centro – Logo */}
        <Box sx={{ justifySelf: 'center' }}>
          <Link
            href="/"
            underline="none"
            sx={{
              fontSize: { xs: '1rem', sm: '1.5rem' },
              fontWeight: 700,
              fontStyle: 'italic',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'baseline',
              color: 'inherit',
              '& span:not(.store)': {
                fontSize: 'inherit',
                lineHeight: 1,
              },
            }}
          >
            {/* made */}
            <Typography component="span" sx={{ color: '#b22222', fontWeight: 700 }}>
              made
            </Typography>

            {/* in */}
            <Typography
              component="span"
              sx={{ color: '#ecbd04ff', fontWeight: 700 }}
            >
              in
            </Typography>

            {/* portugal */}
            <Typography component="span" sx={{ color: '#2e8b57', fontWeight: 700 }}>
              portugal
            </Typography>

            {/* .store */}
            <Typography
              component="span"
              className="store"
              sx={{
                color: '#4B5563',
                fontWeight: 600,
                fontStyle: 'normal',
                fontSize: '1rem',
                ml: 0.3,
                position: 'relative',
                top: '-0.1em',
              }}
            >
              .store
            </Typography>

          </Link>
        </Box>

        {/* Direita */}
        <Box sx={{ justifySelf: 'end' }}>
          <Link
            href="/profile"
            underline="none"
            sx={{
              color: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#000000',
              }}
            >
              <PersonIcon
                sx={{
                  fontSize: 20,
                  color: '#FFFFFF',
                }}
              />
            </Avatar>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}