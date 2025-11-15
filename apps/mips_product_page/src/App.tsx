import React from "react";
import Box from "@mui/material/Box";
import "./App.css";

// Importar os componentes de layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
// 1. MUDAR A IMPORTAÇÃO DE 'ProductPage' PARA 'ProductDetail'
import ProductDetail from "./components/ProductDetail";
import { ProductSpecifications } from "./components/ProductDetail";

// O harness escuro já não é necessário, pois o ProductDetail
// tem o seu próprio fundo claro (#DAD7CD).
// Podemos de-comentar isto se quiser manter o "harness"
// const harnessStyles: React.CSSProperties = {
//   padding: "1rem",
//   backgroundColor: "#17181aff",
//   border: "1px solid #ccc",
//   borderRadius: "8px",
//   margin: "1rem",
// };

// (Os 'types' Product e CartItem podem ser removidos se o ProductDetail
// não precisar da função onAddToCart, mas vamos mantê-los por agora)
export interface Product {
  id: string;
  name: string;
  price: number;
}
export interface CartItem {
  instanceId: string;
  product: Product;
}

const App = () => {
  // A função onAddToCart já não é usada pelo ProductDetail,
  // mas podemos mantê-la aqui para o futuro.
  const handleAddToCart = (product: Product) => {
    console.log("Adicionado ao carrinho (local):", product);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // 2. MUDAR O FUNDO. O fundo escuro foi removido.
          // O ProductDetail e o Footer já definem o fundo #DAD7CD.
          // Vamos usar um fundo neutro para o 'main'
          bgcolor: '#DAD7CD', // Este é o fundo principal do seu site
        }}
      >
        {/* 3. SUBSTITUIR O ProductPage PELO ProductDetail */}
        <ProductDetail />
        <ProductSpecifications />
      </Box>

      <Footer />
    </Box>
  );
};

export default App;