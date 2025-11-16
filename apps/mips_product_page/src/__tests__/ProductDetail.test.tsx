import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductDetail from '../components/ProductDetail';
import { getJumpsellerApi } from '../services/jumpsellerApi';

// --- Mocks Setup ---

// 1. Mock the Jumpseller API module
// We'll create mock functions that we can reference in our tests
const mockGetProduct = jest.fn();
const mockGetProductReviews = jest.fn(() => Promise.resolve([])); // Default success for reviews

jest.mock('../services/jumpsellerApi', () => ({
  getJumpsellerApi: jest.fn(() => ({
    getProduct: mockGetProduct,
    getProductReviews: mockGetProductReviews,
  })),
}));

// 2. Mock window.matchMedia for MUI
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// 3. Mock Data
const mockProduct = {
  id: 1,
  title: 'Galo de Barcelos',
  storytelling: 'História linda do produto...',
  description: 'Descrição do produto para testar.',
  price: 25,
  avg_score: 4.5,
  reviewCount: 3,
  mainPhoto: {
    photo_url: 'https://example.com/main.jpg',
    alt_text: 'Foto principal',
  },
  photos: [
    {
      photo_url: 'https://example.com/main.jpg',
      alt_text: 'Foto principal',
    },
    {
      photo_url: 'https://example.com/extra.jpg',
      alt_text: 'Foto extra',
    },
  ],
  specifications: null,
};

// 4. Mock global fetch
// We need to mock 'fetch' for the database fallback
global.fetch = jest.fn();

// --- Test Suite ---

describe('ProductDetail', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  test('mostra o texto de loading enquanto carrega o produto', async () => {
    // Simulate the Jumpseller API failing and the database fetch being slow
    mockGetProduct.mockRejectedValue(new Error('Jumpseller down'));
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve(mockProduct),
      }), 100))
    );

    render(<ProductDetail />);

    // 1) Check for the correct loading text
    // Using findBy queries waits for the element to appear
    expect(await screen.findByText('A carregar Galo de Barcelos...')).toBeInTheDocument();

    // 2) Wait until the product is loaded and the loading text disappears
    await waitFor(() => {
      expect(
        screen.queryByText(/A carregar Galo de Barcelos.../i)
      ).not.toBeInTheDocument();
    });

    // 3) Verify the product from the database is now shown
    expect(await screen.findByText('Galo de Barcelos')).toBeInTheDocument();
  });

  test('renderiza título, descrição e preço quando o produto é carregado (via fallback)', async () => {
    // Simulate Jumpseller API failure, but database success
    mockGetProduct.mockRejectedValue(new Error('Mocked Jumpseller API failure'));
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    });

    render(<ProductDetail />);

    // Use findBy* to wait for the async operations (Jumpseller fail + fetch success)
    const title = await screen.findByRole('heading', {
      name: /Galo de Barcelos/i,
    });
    expect(title).toBeInTheDocument();

    // Check for other details
    expect(
      await screen.findByText(/Descrição do produto para testar./i)
    ).toBeInTheDocument();
    
    expect(await screen.findByText('25.00 €')).toBeInTheDocument();
    
    expect(await screen.findByText(/\(3 avaliações\)/i)).toBeInTheDocument();

    // Check that the correct source is displayed
    expect(await screen.findByText(/Fonte: Base de Dados/i)).toBeInTheDocument();

    // Check that the correct API calls were made
    expect(mockGetProduct).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3002/products/jumpseller/32614736'
    );
  });

  test('mostra mensagem de erro se o fetch do Jumpseller E da base de dados falharem', async () => {
    // 1. Mock Jumpseller API to fail
    mockGetProduct.mockRejectedValue(new Error('Jumpseller API failure'));
    
    // 2. Mock 'fetch' (database) to also fail
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Database fetch failed' }),
    });

    render(<ProductDetail />);

    // Wait for the final error message to appear
    const errorMsg = await screen.findByText(/Erro ao carregar produto/i);
    expect(errorMsg).toBeInTheDocument();
    
    // Check that the loading spinner is gone
    expect(screen.queryByText(/A carregar Galo de Barcelos.../i)).not.toBeInTheDocument();
  });

  test('permite trocar a foto ao clicar nas miniaturas', async () => {
    // Use the successful fallback mock
    mockFallbackSuccess();

    render(<ProductDetail />);

    // Wait for the component to finish loading
    await screen.findByText('Galo de Barcelos');

    // Find the main image. It should be the first one in the array.
    const mainImg = screen.getByAltText('Foto principal');
    expect(mainImg).toBeInTheDocument();
    expect((mainImg as HTMLImageElement).src).toContain('main.jpg');

    // Find the thumbnail for the second image
    // Note: The alt text "Foto extra" is on the thumbnail itself
    const thumbExtra = screen.getByRole('img', { name: /Foto extra/i });
    expect(thumbExtra).toBeInTheDocument();

    // Click the thumbnail
    fireEvent.click(thumbExtra);

    // Now the main image should have the 'alt_text' of the second photo
    const mainImgAfter = await screen.findByAltText('Foto extra');
    expect(mainImgAfter).toBeInTheDocument();
    
    // And the src should have updated
    expect((mainImgAfter as HTMLImageElement).src).toContain('extra.jpg');
  });
});