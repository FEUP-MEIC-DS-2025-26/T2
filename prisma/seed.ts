// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1) User “fake” que será o criador do produto
  const user = await prisma.user.upsert({
    where: { email: 'seller@madeinportugal.store' },
    update: {},
    create: {
      username: 'madeinportugal_seller',
      first_name: 'Loja',
      last_name: 'Oficial',
      email: 'seller@madeinportugal.store',
      password_hash: 'DEV_ONLY_CHANGE_ME', // depois trocas para hash real (bcrypt)
      photo_url: null,
    },
  });

  // 2) Dados do produto (baseados no teu dummyProduct)
  const dummyProduct = {
    title: 'Galo de Barcelos',
    storytelling:
      'Símbolo lendário de fé, sorte e perseverança, o Galo de Barcelos é uma das expressões mais emblemáticas da cultura popular portuguesa. Inspirado na famosa lenda do peregrino injustamente acusado, este galo ergue-se como um emblema de justiça e esperança. Cada detalhe do seu design reflete séculos de tradição passada entre gerações de artesãos que mantêm viva a alma do folclore português. Ao adquirir esta peça, apoia diretamente o trabalho manual local e contribui para a preservação das nossas raízes culturais.',
    description:
      'Este Galo de Barcelos é cuidadosamente moldado em cerâmica e pintado à mão por artesãos experientes de Barcelos, norte de Portugal. O processo de produção combina técnicas tradicionais com um toque moderno, garantindo uma peça vibrante, cheia de cor e caráter. Cada exemplar é único — pequenas variações na pintura e na textura conferem-lhe autenticidade e charme artesanal. Representando a célebre lenda em que um galo milagrosamente prova a inocência de um viajante, esta escultura é mais do que um objeto decorativo: é um símbolo de fé, justiça e boa sorte. Ideal para oferecer ou decorar espaços que valorizam cultura e identidade portuguesa.',
    price: 29.99,
    avg_score: 4.5,
    specifications: [
      { title: 'Material', description: 'Cerâmica pintada à mão' },
      { title: 'Dimensões', description: '25cm x 15cm' },
      { title: 'Peso', description: '0.8 kg' },
      { title: 'Origem', description: 'Barcelos, Portugal' },
      { title: 'Ano de produção', description: '2025' },
      { title: 'Acabamento', description: 'Verniz protetor com brilho' },
      {
        title: 'Cuidados',
        description: 'Limpar com pano seco; evitar produtos abrasivos',
      },
      { title: 'Uso recomendado', description: 'Decoração interior' },
      { title: 'Cor predominante', description: 'Preto com detalhes multicoloridos' },
      {
        title: 'Certificação',
        description: 'Produto artesanal certificado (Licença IPHAN)',
      },
    ],
    photos: [
      { photo_url: '/galo.png', alt_text: 'Galo de Barcelos', is_main: true },
      { photo_url: '/galo1.png', alt_text: 'Galo de Barcelos1', is_main: false },
      { photo_url: '/galo2.png', alt_text: 'Galo de Barcelos2', is_main: false },
    ],
    brand: 'BarcelosBarro',
  };

  // 3) Criar o produto + fotos relacionadas
  const product = await prisma.product.create({
    data: {
      title: dummyProduct.title,
      storytelling: dummyProduct.storytelling,
      description: dummyProduct.description,
      price: dummyProduct.price,
      avg_score: dummyProduct.avg_score,
      specifications: dummyProduct.specifications as any, // campo Json no schema
      created_by_user_id: user.id,
      brand: dummyProduct.brand, // <-- Seed brand attribute
      photos: {
        create: dummyProduct.photos.map((p) => ({
          photo_url: p.photo_url,
          alt_text: p.alt_text,
          is_main: p.is_main ?? false,
        })),
      },
    },
    include: { photos: true },
  });

  console.log('Seed concluído. Produto criado:');
  console.log(product);
}

main()
  .catch((e) => {
    console.error('Erro ao fazer seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
