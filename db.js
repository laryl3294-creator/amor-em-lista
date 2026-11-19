// db.js — SQLite persistente + schema + seed dos 60 presentes
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'amor-em-lista.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Tempo de reserva temporaria em minutos (configuravel via env / painel)
function getReservationMinutes() {
  const v = parseInt(process.env.RESERVATION_MINUTES || '30', 10);
  return Number.isFinite(v) && v > 0 ? v : 30;
}

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gifts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  value_cents INTEGER NOT NULL,
  image TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DISPONIVEL' CHECK (status IN ('DISPONIVEL','PAGO')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gift_id INTEGER NOT NULL REFERENCES gifts(id),
  guest_name TEXT DEFAULT '',
  guest_message TEXT DEFAULT '',
  value_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'AGUARDANDO'
    CHECK (status IN ('AGUARDANDO','PAGO','RECUSADO','EXPIRADO')),
  pix_code TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reserved_until TEXT NOT NULL,
  guest_marked_paid_at TEXT,
  confirmed_at TEXT,
  confirmed_by TEXT,
  recused_at TEXT,
  recused_by TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_active_order_per_gift
  ON orders(gift_id) WHERE status = 'AGUARDANDO';

CREATE TABLE IF NOT EXISTS admin_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  order_id INTEGER,
  gift_id INTEGER,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS authorized_users (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Usuarios autorizados (whitelist)
const ALLOWED_ADMINS = ['laryl3294@gmail.com', 'isaias.gestao19@gmail.com'];
const insertAdmin = db.prepare('INSERT OR IGNORE INTO authorized_users (email) VALUES (?)');
ALLOWED_ADMINS.forEach(e => insertAdmin.run(e.toLowerCase()));

function isAuthorizedAdmin(email) {
  if (!email) return false;
  const row = db.prepare('SELECT email FROM authorized_users WHERE email = ?').get(email.toLowerCase().trim());
  return !!row;
}

// ---------- SEED dos 60 presentes ----------
const CATEGORIES = [
  { name: 'Casa e Decoração', slug: 'casa-decoracao' },
  { name: 'Quarto e Conforto', slug: 'quarto-conforto' },
  { name: 'Cozinha e Utensílios', slug: 'cozinha-utensilios' },
  { name: 'Eletrodomésticos', slug: 'eletrodomesticos' },
  { name: 'Experiências a Dois', slug: 'experiencias' },
  { name: 'Viagens e Lua de Mel', slug: 'viagens-lua-de-mel' },
  { name: 'Momentos Especiais', slug: 'momentos-especiais' },
];

// value em REAIS (convertido para centavos no seed)
const GIFTS = [
  // 1. Casa e Decoração (10) — gift-01..10
  { cat: 0, name: 'Quadro Decorativo Romântico', desc: 'Quadro em moldura dourada com arte floral delicada, perfeito para a sala do novo lar.', value: 180, img: 'gift-01.jpg' },
  { cat: 0, name: 'Espelho Moldura Dourada', desc: 'Espelho oval com moldura dourada discreta, elegante para o hall de entrada.', value: 250, img: 'gift-02.jpg' },
  { cat: 0, name: 'Vaso de Flores em Cerâmica', desc: 'Vaso artesanal em tons terrosos, ideal para receber arranjos da nova casa.', value: 120, img: 'gift-03.jpg' },
  { cat: 0, name: 'Abajur de Mesa', desc: 'Abajur com cúpula em linho e luz amarelada, para noites de leitura a dois.', value: 220, img: 'gift-04.jpg' },
  { cat: 0, name: 'Tapete Macio para Sala', desc: 'Tapete felpudo em tom nude, aconchegante e elegante para a sala de estar.', value: 350, img: 'gift-05.jpg' },
  { cat: 0, name: 'Jogo de Cortinas Linho', desc: 'Par de cortinas em linho off-white com caimento leve e sofisticado.', value: 280, img: 'gift-06.jpg' },
  { cat: 0, name: 'Conjunto de Almofadas', desc: 'Kit com 4 almofadas decorativas em tons de marsala e bege.', value: 160, img: 'gift-07.jpg' },
  { cat: 0, name: 'Escultura Decorativa Minimalista', desc: 'Peça em cerâmica branca com linhas suaves, toque de charme para os ambientes.', value: 140, img: 'gift-08.jpg' },
  { cat: 0, name: 'Relógio de Parede Silencioso', desc: 'Relógio minimalista em madeira clara, funcional e decorativo.', value: 190, img: 'gift-09.jpg' },
  { cat: 0, name: 'Luminária de Chão', desc: 'Luminária de piso com luz indireta, perfeita para o canto de leitura.', value: 320, img: 'gift-10.jpg' },

  // 2. Quarto e Conforto (8) — gift-11..18
  { cat: 1, name: 'Jogo de Cama King Size', desc: 'Jogo de cama 4 peças em percal 300 fios, maciez para as noites do casal.', value: 450, img: 'gift-11.jpg' },
  { cat: 1, name: 'Par de Travesseiros de Fibra', desc: 'Travesseiros antialérgicos com toque de pluma de ganso, noites perfeitas.', value: 180, img: 'gift-12.jpg' },
  { cat: 1, name: 'Edredom Queen Inverno', desc: 'Edredom quentinho em microfibra, cor areia, para os dias frios.', value: 320, img: 'gift-13.jpg' },
  { cat: 1, name: 'Cortina Blackout', desc: 'Cortina com blecaute para noites de sono profundo no novo quarto.', value: 260, img: 'gift-14.jpg' },
  { cat: 1, name: 'Criado-Mudo Duplo', desc: 'Par de criados-mudos com gaveta, em madeira clara e design clean.', value: 550, img: 'gift-15.jpg' },
  { cat: 1, name: 'Pufe Aconchegante', desc: 'Pufe redondo em tecido aveludado cor marsala, charme para o quarto.', value: 230, img: 'gift-16.jpg' },
  { cat: 1, name: 'Manta de Sofá em Tricô', desc: 'Manta grossa em tricô off-white, para filmes e cafés no frio.', value: 150, img: 'gift-17.jpg' },
  { cat: 1, name: 'Protetor de Colchão Premium', desc: 'Capa impermeável e antialérgica, conserva o colchão novo por anos.', value: 200, img: 'gift-18.jpg' },

  // 3. Cozinha e Utensílios (12) — gift-19..30
  { cat: 2, name: 'Jogo de Panelas Antiaderente', desc: 'Conjunto com 5 peças em cerâmica, leve e fácil de limpar.', value: 380, img: 'gift-19.jpg' },
  { cat: 2, name: 'Jogo de Facas Profissional', desc: 'Conjunto com 6 facas em aço inox e bloco de madeira.', value: 290, img: 'gift-20.jpg' },
  { cat: 2, name: 'Jogo de Jantar em Porcelana', desc: '20 peças em porcelana branca com borda dourada discreta.', value: 420, img: 'gift-21.jpg' },
  { cat: 2, name: 'Jogo de Taças de Cristal', desc: '6 taças para vinho tinto em cristal, para brindes especiais.', value: 240, img: 'gift-22.jpg' },
  { cat: 2, name: 'Conjunto de Copos', desc: '12 copos em vidro transparente, altos e baixos, para o dia a dia.', value: 130, img: 'gift-23.jpg' },
  { cat: 2, name: 'Jogo Americano e Guardanapos', desc: '6 lugares americanos em tecido com guardanapos combinando, elegância à mesa.', value: 160, img: 'gift-24.jpg' },
  { cat: 2, name: 'Chaleira Inox para Indução', desc: 'Chaleira de aço inox com apito, para chás e cafés da manhã.', value: 150, img: 'gift-25.jpg' },
  { cat: 2, name: 'Formas de Bolo Antiaderentes', desc: 'Kit com 3 formas redondas e 1 assadeira retangular.', value: 120, img: 'gift-26.jpg' },
  { cat: 2, name: 'Utensílios de Silicone', desc: 'Conjunto com 10 utensílios coloridos que não riscam as panelas.', value: 90, img: 'gift-27.jpg' },
  { cat: 2, name: 'Tábua de Corte em Bambu', desc: 'Tábua grande em bambu com ranhura para sucos, higiênica e bonita.', value: 110, img: 'gift-28.jpg' },
  { cat: 2, name: 'Porta-Temperos de Vidro', desc: 'Conjunto com 12 potes de vidro com tampas e etiquetas.', value: 140, img: 'gift-29.jpg' },
  { cat: 2, name: 'Cafeteira Francesa', desc: 'Prensa francesa de 800ml em aço inox, café com sabor de manhãs juntos.', value: 130, img: 'gift-30.jpg' },

  // 4. Eletrodomésticos (10) — gift-31..40
  { cat: 3, name: 'Liquidificador Potente', desc: 'Liquidificador 1200W com jarra de vidro, para vitaminas e receitas.', value: 280, img: 'gift-31.jpg' },
  { cat: 3, name: 'Ferro de Passar a Vapor', desc: 'Ferro antiaderente com controle de temperatura e função auto-limpante.', value: 180, img: 'gift-32.jpg' },
  { cat: 3, name: 'Cafeteira Elétrica', desc: 'Cafeteira de 30 xícaras com jarra térmica, café quente o dia todo.', value: 250, img: 'gift-33.jpg' },
  { cat: 3, name: 'Sanduicheira e Grill', desc: 'Grill duplo antiaderente, para sanduíches e carnes rápidas.', value: 220, img: 'gift-34.jpg' },
  { cat: 3, name: 'Batedeira Planetária', desc: 'Batedeira com 3 velocidades e batedores em inox, para bolos do amor.', value: 450, img: 'gift-35.jpg' },
  { cat: 3, name: 'Aspirador de Pó Vertical', desc: 'Aspirador sem fio 2 em 1, praticidade para manter a casa limpa.', value: 520, img: 'gift-36.jpg' },
  { cat: 3, name: 'Micro-ondas 20L', desc: 'Micro-ondas espelhado com painel digital e função descongelar.', value: 480, img: 'gift-37.jpg' },
  { cat: 3, name: 'Airfryer 4L', desc: 'Fritadeira sem óleo com timer digital, refeições práticas e saudáveis.', value: 400, img: 'gift-38.jpg' },
  { cat: 3, name: 'Processador de Alimentos', desc: 'Multiprocessador com lâminas de inox e 6 acessórios.', value: 350, img: 'gift-39.jpg' },
  { cat: 3, name: 'Ventilador de Coluna', desc: 'Ventilador silencioso com 3 velocidades e oscilação, para noites quentes.', value: 260, img: 'gift-40.jpg' },

  // 5. Experiências a Dois (8) — gift-41..48
  { cat: 4, name: 'Jantar Romântico Especial', desc: 'Vale para um jantar a dois em restaurante com menu degustação.', value: 350, img: 'gift-41.jpg' },
  { cat: 4, name: 'Spa para o Casal', desc: 'Dia de spa com massagem relaxante e hidratação, para dois.', value: 400, img: 'gift-42.jpg' },
  { cat: 4, name: 'Passeio de Barco ao Pôr do Sol', desc: 'Passeio de escuna com champanhe, vista para o mar no entardecer.', value: 300, img: 'gift-43.jpg' },
  { cat: 4, name: 'Sessão de Cinema com Pipoca', desc: 'Vale para cinema + combo de pipoca e refrigerante, sessão a dois.', value: 120, img: 'gift-44.jpg' },
  { cat: 4, name: 'Aula de Dança de Salão', desc: '4 aulas de dança de salão para o casal dançar a primeira música.', value: 250, img: 'gift-45.jpg' },
  { cat: 4, name: 'Ensaio Fotográfico', desc: 'Ensaio de 2 horas com fotógrafo profissional + 30 fotos editadas.', value: 450, img: 'gift-46.jpg' },
  { cat: 4, name: 'Degustação de Vinhos', desc: 'Experiência de degustação harmonizada em vinícola, para dois.', value: 280, img: 'gift-47.jpg' },
  { cat: 4, name: 'Dia de Beleza a Dois', desc: 'Cabelo, maquiagem e manicure para ela + corte e barba para ele.', value: 320, img: 'gift-48.jpg' },

  // 6. Viagens e Lua de Mel (7) — gift-49..55
  { cat: 5, name: 'Fim de Semana em Pousada', desc: '2 noites em pousada charmosa com café da manhã, para o casal.', value: 600, img: 'gift-49.jpg' },
  { cat: 5, name: 'Trecho Aéreo da Lua de Mel', desc: 'Contribua com as passagens da viagem dos sonhos dos noivos.', value: 800, img: 'gift-50.jpg' },
  { cat: 5, name: 'Passeio Especial na Viagem', desc: 'Um passeio exclusivo (mergulho, jantar em alto-mar ou city tour).', value: 500, img: 'gift-51.jpg' },
  { cat: 5, name: 'Jantar de Lua de Mel', desc: 'Um jantar especial com vista para o mar durante a viagem.', value: 400, img: 'gift-52.jpg' },
  { cat: 5, name: 'Day Use em Hotel à Beira-Mar', desc: 'Dia de piscina, praia e estrutura de hotel luxuoso, para dois.', value: 350, img: 'gift-53.jpg' },
  { cat: 5, name: 'Hospedagem Extra na Lua de Mel', desc: 'Mais uma noite de hospedagem especial na viagem dos noivos.', value: 450, img: 'gift-54.jpg' },
  { cat: 5, name: 'Cofre da Lua de Mel', desc: 'Contribuição livre para o fundo da viagem dos sonhos do casal.', value: 200, img: 'gift-55.jpg' },

  // 7. Momentos Especiais (5) — gift-56..60
  { cat: 6, name: 'Cesta de Café da Manhã Romântico', desc: 'Cesta surpresa com pães, frutas, sucos e flores, entregue em casa.', value: 180, img: 'gift-56.jpg' },
  { cat: 6, name: 'Noite de Filmes e Pipoca', desc: 'Kit cinema em casa com mantas, pipocas gourmet e filmes escolhidos.', value: 120, img: 'gift-57.jpg' },
  { cat: 6, name: 'Piquenique ao Ar Livre', desc: 'Cesta de piquenique completa para um dia no parque ou na praia.', value: 150, img: 'gift-58.jpg' },
  { cat: 6, name: 'Álbum de Memórias do Casal', desc: 'Álbum artesanal com 40 fotos para guardar a história de vocês.', value: 200, img: 'gift-59.jpg' },
  { cat: 6, name: 'Caixa de Vinhos Selecionados', desc: '3 rótulos de vinhos especiais para brindar cada nova fase.', value: 250, img: 'gift-60.jpg' },
];

function seed() {
  const catCount = db.prepare('SELECT COUNT(*) AS c FROM categories').get().c;
  if (catCount === 0) {
    const insCat = db.prepare('INSERT INTO categories (name, slug, sort_order) VALUES (?,?,?)');
    CATEGORIES.forEach((c, i) => insCat.run(c.name, c.slug, i));
  }
  const giftCount = db.prepare('SELECT COUNT(*) AS c FROM gifts').get().c;
  if (giftCount === 0) {
    const insGift = db.prepare(
      'INSERT INTO gifts (category_id, name, description, value_cents, image) VALUES (?,?,?,?,?)'
    );
    const catIds = db.prepare('SELECT id, slug FROM categories').all();
    const idByIndex = {};
    catIds.forEach((c, i) => { idByIndex[CATEGORIES[i].slug] = c.id; });
    const tx = db.transaction(() => {
      GIFTS.forEach(g => {
        const catId = idByIndex[CATEGORIES[g.cat].slug];
        insGift.run(catId, g.name, g.desc, Math.round(g.value * 100), g.img);
      });
    });
    tx();
  }
}
seed();

// Libera presentes com reserva expirada
function expireReservations() {
  const r = db.prepare(`
    UPDATE orders SET status = 'EXPIRADO'
    WHERE status = 'AGUARDANDO' AND reserved_until < datetime('now')
  `).run();
  return r.changes;
}

module.exports = { db, expireReservations, isAuthorizedAdmin, getReservationMinutes, GIFTS_COUNT: GIFTS.length };
