import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import ProductDetail, { ProductSpecifications } from '../components/ProductDetail';

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
  specifications: [
    {
      title: 'Materiais',
      description: 'Peça em cerâmica tradicional portuguesa.',
    },
  ],
};

const createFetchResponse = (data: any): Response =>
  ({
    ok: true,
    json: async () => data,
  } as unknown as Response);

describe('Integração ProductDetail + ProductSpecifications', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn().mockResolvedValue(createFetchResponse(mockProduct));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('carrega produto e mostra detalhe + especificações usando a mesma API', async () => {
    render(
      <>
        <ProductDetail />
        <ProductSpecifications />
      </>,
    );

    // 1) primeiro aparece o loading do ProductDetail
    expect(screen.getByText(/A carregar produto/i)).toBeInTheDocument();

    // 2) depois do fetch, o título do produto aparece
    const title = await screen.findByRole('heading', { name: /Galo de Barcelos/i });
    expect(title).toBeInTheDocument();

    // 3) descrição e preço renderizados (detail)
    expect(screen.getByText(/Descrição do produto para testar\./i)).toBeInTheDocument();
    expect(screen.getByText(/25\.00 €/)).toBeInTheDocument();

    // 4) especificações renderizadas (specs)
    const specTitle = await screen.findByText(/Materiais/i);
    expect(specTitle).toBeInTheDocument();
    expect(
      screen.getByText(/Peça em cerâmica tradicional portuguesa\./i),
    ).toBeInTheDocument();

    // 5) fetch foi chamado para ambos os componentes
    await waitFor(() => {
      const fetchMock = (global as any).fetch as jest.Mock;
      expect(fetchMock).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:4000/products/1');
      expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2); // Detail + Specs
    });
  });

  test('quando a API falha, ProductDetail mostra mensagem de erro', async () => {
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, json: async () => ({}) } as unknown as Response);

    render(
      <>
        <ProductDetail />
        <ProductSpecifications />
      </>,
    );

    const errorMsg = await screen.findByText(/Erro ao carregar produto/i);
    expect(errorMsg).toBeInTheDocument();

    // ProductSpecifications, em caso de erro, simplesmente não renderiza nada
    // (o próprio componente devolve null), por isso aqui não esperamos nada específico.
  });
});
