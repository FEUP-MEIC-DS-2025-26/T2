// apps/mips_product_page/src/__tests__/ProductDetail.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductDetail from '../components/ProductDetail';
import { getJumpsellerApi } from '../services/jumpsellerApi';

// This is the mock data we expect from our DATABASE
const mockDbProduct = {
  id: 123,
  title: 'Galo de Barcelos (from DB)', // Use a unique title
  storytelling: 'Database storytelling...',
  description: 'Database description...',
  price: 25.99,
  avg_score: 4.5,
  reviewCount: 10,
  mainPhoto: null,
  photos: [],
  specifications: [],
};

// --- Mock the API ---
// This tells Jest "when 'getJumpsellerApi' is called, return this object"
jest.mock('../services/jumpsellerApi', () => ({
  getJumpsellerApi: jest.fn(() => ({
    getProduct: jest.fn(() => 
      Promise.reject(new Error('Mocked Jumpseller API failure'))
    ),
    getProductReviews: jest.fn(() => Promise.resolve([])),
  })),
}));

// --- Mock global 'fetch' for the database fallback ---
// Use 'jest-fetch-mock' or a similar library. Here's a manual mock:
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockDbProduct),
    })
  ) as jest.Mock;
});

// --- Your Test ---
it('should fail to fetch from Jumpseller and fall back to the database', async () => {
  render(<ProductDetail />);

  // 1. Initially, it shows the loading spinner
  expect(screen.getByText('A carregar Galo de Barcelos...')).toBeInTheDocument();

  // 2. Wait for the *final* state after all async calls are done.
  // 'findByText' is async and waits for the element to appear.
  // This automatically handles the 'act()' warnings.
  const finalTitle = await screen.findByText('Galo de Barcelos (from DB)');
  
  // 3. Assert on the final state
  expect(finalTitle).toBeInTheDocument();
  
  // You can also check that the API was called
  expect(getJumpsellerApi().getProduct).toHaveBeenCalled();
  
  // And that the database fetch was called
  expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:3002/products/jumpseller/32614736'
  );
  
  // Check that the loading spinner is gone
  expect(screen.queryByText('A carregar Galo de Barcelos...')).not.toBeInTheDocument();
  
  // Check the data source badge
  expect(await screen.findByText(/Fonte: Base de Dados/)).toBeInTheDocument();
});