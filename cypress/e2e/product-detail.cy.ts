/// <reference types="cypress" />

// Mock da API que o ProductDetail chama
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

describe('ProductDetail — Testes de Aceitação', () => {

  beforeEach(() => {
    // Interceta o fetch que o componente faz ao backend real
    cy.intercept(
      'GET',
      'http://localhost:4000/products/1',
      {
        statusCode: 200,
        body: mockProduct,
      }
    ).as('getProduct');
  });

  it('carrega a página e mostra título, descrição e preço', () => {
    cy.visit('/product/1');    

    cy.wait('@getProduct');

    cy.findByRole('heading', { name: /Galo de Barcelos/i }).should('exist');
    cy.contains('Descrição do produto para testar.').should('exist');
    cy.contains('25.00 €').should('exist');
  });

  it('mostra as estrelas e número de avaliações', () => {
    cy.visit('/product/1');
    cy.wait('@getProduct');

    cy.contains('(3 avaliações)').should('exist');
  });

  it('mostra imagem principal e miniaturas', () => {
    cy.visit('/product/1');
    cy.wait('@getProduct');

    cy.get('img[alt="Foto principal"]').should('exist');
    cy.get('img[alt="Foto extra"]').should('exist');
  });

  it('troca a foto quando se clica numa miniatura', () => {
    cy.visit('/product/1');
    cy.wait('@getProduct');

    // primeira imagem deve ser a foto principal
    cy.get('img[alt="Foto principal"]').first()
      .should('have.attr', 'src')
      .and('include', 'main.jpg');

    // clicar na miniatura extra
    cy.get('img[alt="Foto extra"]').click();

    // imagem principal deve atualizar
    cy.get('img[alt="Foto extra"]').first()
      .should('have.attr', 'src')
      .and('include', 'extra.jpg');
  });
});
