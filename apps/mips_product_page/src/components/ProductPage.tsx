import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

// 1. A shared type for our product.
export interface Product {
  id: string;
  name: string;
  price: number;
}

// 2. The props this component expects from the host
interface ProductPageProps {
  onAddToCart: (product: Product) => void;
}

// 3. A list of dummy products
const dummyProducts: Product[] = [
  { id: "p1", name: "MIPS T-Shirt", price: 24.99 },
  { id: "p2", name: "MIPS Hoodie", price: 49.99 },
  { id: "p3", name: "MIPS Sticker Pack", price: 9.99 },
];

// --- COMPONENT ---

const ProductPage = ({ onAddToCart = () => {} }: ProductPageProps) => {
  return (
    // Replaced main <div> with MUI Box
    <Box
      sx={{
        p: "1.5rem",
        border: "2px dashed",
        borderColor: "primary.main", // This was correct
        borderRadius: "8px",
        /*
          FIX 1: Replaced hardcoded background with 'background.paper'.
          This is the semantic token for main content surfaces and containers.
        */
        bgcolor: "background.paper",
        /*
          FIX 2: Replaced hardcoded text color with 'text.primary'.
          This ensures the text has the correct primary contrast against
          'background.paper' in *both* light and dark modes.
        */
        color: "text.primary",
        maxWidth: "800px",
        my: "1rem",
        textAlign: "left",
      }}
    >
      {/* Replaced <h2> with Typography */}
      <Typography
        variant="h4"
        component="h2"
        sx={{
          color: "primary.main", // This was correct
          mt: 0,
          fontWeight: "bold",
        }}
      >
        📦 Product Page (Loaded from Remote)
      </Typography>

      {/* Replaced <p> with Typography */}
      <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
        {/* Changed to text.secondary for slightly less emphasis, a common pattern */}
        This component lists products and calls the host's `onAddToCart`
        function.
      </Typography>

      {/* Replaced <div> with Box, kept grid styles in `sx` */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {dummyProducts.map((product) => (
          <Card
            key={product.id}
            sx={{
              /*
                FIX 3: Replaced hardcoded item background with 'background.default'.
                'background.default' is the page's main background. Using it here
                makes the card look "inset" within the 'background.paper' container,
                which is a clean, theme-aware pattern.
              */
              bgcolor: "background.default",
              color: "inherit", // This was correct
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                component="h4"
                sx={{ marginTop: 0, fontWeight: "bold" }}
              >
                {product.name}
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
                ${product.price.toFixed(2)}
              </Typography>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => onAddToCart(product)}
                sx={{
                  fontWeight: "bold",
                }}
              >
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ProductPage;