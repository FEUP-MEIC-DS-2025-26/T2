// apps/mips_product_page/src/__tests__/ProductDetail.test.tsx

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductDetail from '../components/ProductDetail';

// --- ADD MOCKS FOR JUMPSELLER API ---
// This file was missing this entire block
const mockGetProduct = jest.fn();
const mockGetProductReviews = jest.fn(() => Promise.resolve([]));

jest.mock('../services/jumpsellerApi', () => ({
  getJumpsellerApi: jest.fn(() => ({
    getProduct: mockGetProduct,
    getProductReviews: mockGetProductReviews,
  })),
}));

// Mock muito simples do matchMedia usado pelo MUI
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

// Helper for SUCCESS (Jumpseller fails, DB succeeds)
const mockFallbackSuccess = () => {
  // 1. Mock Jumpseller to FAIL
  mockGetProduct.mockImplementation(() =>
    Promise.reject(new Error('Mocked Jumpseller failure'))
  );

  // 2. Mock 'fetch' (database) to SUCCEED
  (global as any).fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    })
  );
};

// Helper for ERROR (Jumpseller fails, DB also fails)
const mockFallbackError = () => {
  // 1. Mock Jumpseller to FAIL
  mockGetProduct.mockImplementation(() =>
    Promise.reject(new Error('Mocked Jumpseller failure'))
  );

  // 2. Mock 'fetch' (database) to FAIL
  (global as any).fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      // FIX: You must provide a .json() method for the error path
      json: () => Promise.resolve({ message: 'Database is down' }),
    })
  );
};

describe('ProductDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('mostra o texto de loading enquanto carrega o produto', async () => {
    mockFallbackSuccess();
    render(<ProductDetail />);

    // 1) FIX: The regex was wrong. It needs to match the actual text.
    expect(
      screen.getByText(/A carregar Galo de Barcelos.../i)
    ).toBeInTheDocument();

    // 2) Wait for the loading to disappear
    await waitFor(() =>
      expect(
        screen.queryByText(/A carregar Galo de Barcelos.../i)
      ).not.toBeInTheDocument()
    );
  });

  test('renderiza título, descrição e preço quando o produto é carregado', async () => {
    mockFallbackSuccess(); // This sets up the fallback path
    render(<ProductDetail />);

    // This test should now pass because the mocks are correct
    const title = await screen.findByRole('heading', {
      name: /Galo de Barcelos/i,
    });
    expect(title).toBeInTheDocument();

    expect(
      screen.getByText(/Descrição do produto para testar./i)
    ).toBeInTheDocument();
    expect(screen.getByText('25.00 €')).toBeInTheDocument();
    expect(screen.getByText(/\(3 avaliações\)/i)).toBeInTheDocument();
  });

  test('mostra mensagem de erro se o fetch falhar', async () => {
    mockFallbackError(); // Use the fixed error mock
    render(<ProductDetail />);

    // This assertion should now pass by finding the static error title
    const errorMsg = await screen.findByText(/Erro ao carregar produto/i);
    expect(errorMsg).toBeInTheDocument();

    // You could also assert on the specific error message
    expect(await screen.findByText(/Database is down/i)).toBeInTheDocument();
  });

  test('permite trocar a foto ao clicar nas miniaturas', async () => {
    mockFallbackSuccess();
    render(<ProductDetail />);

    const [mainImgBefore] = await screen.findAllByAltText(/Foto principal/i);
    expect((mainImgBefore as HTMLImageElement).src).toContain('main.jpg');

    const thumbExtra = await screen.findByRole('img', { name: /Foto extra/i });
    fireEvent.click(thumbExtra);

    await waitFor(() => {
      const [mainImgAfter] = screen.getAllByAltText(/Foto extra/i);
      expect((mainImgAfter as HTMLImageElement).src).toContain('extra.jpg');
    });
  });
});
