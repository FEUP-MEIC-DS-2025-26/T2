import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductDetail from '../components/ProductDetail';

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

// helper para mockar o fetch com sucesso
const mockFetchSuccess = () => {
  (global as any).fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    }),
  );
};

// helper para mockar erro no fetch
const mockFetchError = () => {
  (global as any).fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
    }),
  );
};

describe('ProductDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('mostra o texto de loading enquanto carrega o produto', async () => {
    mockFetchSuccess();

    render(<ProductDetail />);

    // 1) primeiro vê o loading
    expect(screen.getByText(/A carregar produto/i)).toBeInTheDocument();

    // 2) depois deixa de ver o loading quando o fetch resolve
    await waitFor(() =>
      expect(
        screen.queryByText(/A carregar produto/i),
      ).not.toBeInTheDocument(),
    );
  });

  test('renderiza título, descrição e preço quando o produto é carregado', async () => {
    mockFetchSuccess();

    render(<ProductDetail />);

    // esperar que o título apareça
    const title = await screen.findByRole('heading', {
      name: /Galo de Barcelos/i,
    });
    expect(title).toBeInTheDocument();

    expect(
      screen.getByText(/Descrição do produto para testar./i),
    ).toBeInTheDocument();

    // preço formatado com 2 casas decimais
    expect(screen.getByText('25.00 €')).toBeInTheDocument();

    // texto de avaliações
    expect(screen.getByText(/\(3 avaliações\)/i)).toBeInTheDocument();
  });

  test('mostra mensagem de erro se o fetch falhar', async () => {
    mockFetchError();

    render(<ProductDetail />);

    const errorMsg = await screen.findByText(/Erro ao carregar produto/i);
    expect(errorMsg).toBeInTheDocument();
  });

    test('permite trocar a foto ao clicar nas miniaturas', async () => {
    mockFetchSuccess();

    render(<ProductDetail />);

    // há duas imagens "Foto principal": main + thumbnail
    const [mainImgBefore] = await screen.findAllByAltText(/Foto principal/i);
    expect(mainImgBefore).toBeInTheDocument();
    expect((mainImgBefore as HTMLImageElement).src).toContain(
      'https://example.com/main.jpg',
    );

    // clicar na miniatura "Foto extra"
    const thumbExtra = await screen.findByRole('img', { name: /Foto extra/i });
    fireEvent.click(thumbExtra);

    // depois de clicar, a imagem principal deve passar a ser "Foto extra"
    await waitFor(() => {
      const [mainImgAfter] = screen.getAllByAltText(/Foto extra/i);
      expect((mainImgAfter as HTMLImageElement).src).toContain(
        'https://example.com/extra.jpg',
      );
    });
  });

});
