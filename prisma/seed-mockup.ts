/**
 * Seed de mockup — PV Território Animal
 *
 * Por RA: 1 protetor, 2 adotantes, 10 animais (3 cães, 3 gatos, 4 outros).
 * Idempotente: pula RAs que já têm protetor de mockup.
 *
 * Uso: npx tsx prisma/seed-mockup.ts
 * Login de qualquer usuário gerado: senha = "Mockup@123"
 */

import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: "postgresql://saulo@localhost/pv_territorio_animal?host=/var/run/postgresql",
});
const prisma = new PrismaClient({ adapter });

// ─── Pools de dados ──────────────────────────────────────────────────────────

const NOMES_CAES = [
  "Bolt", "Thor", "Rex", "Max", "Bob", "Mel", "Luna", "Mia", "Nina", "Bela",
  "Caramelo", "Pipoca", "Farofa", "Amendoim", "Xodó", "Docinho", "Pandinha",
  "Floquinho", "Nuvem", "Pintão", "Rajado", "Malhado", "Dengo", "Fofo", "Lelê",
  "Paçoca", "Biscoito", "Café", "Açaí", "Tucano", "Tico", "Teca", "Bibia",
  "Branquinha", "Pretinha",
];

const NOMES_GATOS = [
  "Mimi", "Frajola", "Garfield", "Simba", "Nala", "Belinha", "Félix", "Salem",
  "Brisa", "Nuvem", "Estrela", "Lua", "Pérola", "Titã", "Zeus", "Hera",
  "Minerva", "Íris", "Apolo", "Hermes", "Cleo", "Isis", "Ra", "Shu",
  "Ninja", "Pixel", "Byte", "Wifi", "Mocha", "Latte", "Caju", "Manga",
  "Goiaba", "Pitanga", "Jabuticaba",
];

const OUTROS_TIPOS = [
  {
    raca: "Coelho angorá",
    nomes: ["Pompom", "Algodão", "Bolinha", "Tufão", "Flocos", "Pelúcia", "Nuvem", "Branco", "Caramelo", "Creme"],
    descricao: "Coelho dócil e brincalhão, adora carinho e espaço para correr. Muito afetivo com os tutores.",
    porte: "pequeno" as const,
  },
  {
    raca: "Periquito australiano",
    nomes: ["Piu", "Pipoca", "Kiwi", "Limão", "Azulão", "Verdinho", "Amarelinho", "Pintinho", "Canto", "Alegria"],
    descricao: "Periquito jovem, já começa a imitar sons. Muito ativo e curioso, adora interação diária.",
    porte: "mini" as const,
  },
  {
    raca: "Porquinho-da-índia",
    nomes: ["Gordinho", "Batatinha", "Cebola", "Farofa", "Biscoito", "Pudim", "Quindim", "Coxinha", "Pão", "Rosquinha"],
    descricao: "Porquinho sociável e fácil de cuidar. Ideal para famílias com crianças — dócil e raramente morde.",
    porte: "mini" as const,
  },
  {
    raca: "Hamster sírio",
    nomes: ["Bolota", "Pipoquinha", "Nugget", "Amendoim", "Castanha", "Nozes", "Avelã", "Brigadeiro", "Trufa", "Bombom"],
    descricao: "Hamster jovem e saudável. Muito ativo durante a noite, adora roer e explorar o labirinto.",
    porte: "mini" as const,
  },
];

const RACAS_CAES = [
  "Vira-lata caramelo", "SRD", "Labrador mix", "Pitbull mix", "Border Collie mix",
  "Poodle mix", "Beagle mix", "Pastor Alemão mix", "Bulldog mix", "SRD",
];

const RACAS_GATOS = [
  "SRD", "Persa mix", "Siamês mix", "Maine Coon mix", "Angorá mix",
  "SRD", "Ragdoll mix", "Doméstico", "SRD", "Doméstico",
];

const PORTES_CAES = ["mini", "pequeno", "medio", "grande", "gigante"] as const;
const SEXOS = ["macho", "femea"] as const;
const CORES_CAES = ["Caramelo", "Preto", "Branco", "Tricolor", "Mesclado", "Marrom", "Cinza", "Bege", "Rajado", "Pintado"];
const CORES_GATOS = ["Laranja", "Preto", "Branco", "Cinza", "Mesclado", "Tricolor", "Rajado", "Fulvo", "Tigrado", "Preto e branco"];

const HISTORIAS_CAES = [
  "Encontrado na rua em situação de abandono, já está vacinado e castrado. Ama crianças e é muito brincalhão. Precisa de um lar com espaço para correr.",
  "Resgatado de uma situação de maus-tratos. Está se recuperando bem e já confia em pessoas. Precisa de um tutor paciente e carinhoso.",
  "Animal dócil e tranquilo, ideal para apartamento. Já passou por treinamento básico e conhece os comandos senta, fica e pata.",
  "Ex-cão de rua que aprendeu a amar o ambiente doméstico. Adora passear e brincar com bolinha. Bom com outros cães.",
  "Filhote encontrado abandonado com a mãe. Já desmamado e vacinado. Energia alta, precisa de passeios diários.",
  "Adulto calmo e carinhoso. Passou pela fase destrutiva e só quer um sofá e colo. Bom com gatos.",
  "Resgatado de caçamba. Já está saudável e com todas as vacinas em dia. Adora banho e escovação.",
];

const HISTORIAS_GATOS = [
  "Gatinho encontrado em caixa de sapato na porta do hospital. Totalmente saudável e sociável. Adora colo e ronrona muito.",
  "Gata adulta que perdeu o tutor anterior. Está um pouco assustada com o ambiente novo mas já aceita carinho. Muito carinhosa quando ganha confiança.",
  "Filhote resgatado de situação de abandono com a ninhada. Já desmamado, vacinado e desverminado. Muito brincalhão.",
  "Gato castrado e vacinado. Vive bem em apartamento, não exige muito espaço. Já conviveu com cão e não tem problemas.",
  "Resgatada de obra em demolição. Tímida no início mas amorosa quando ganha confiança. Adora janela e observar os pássaros.",
  "Gato adulto de rua que decidiu entrar numa casa e nunca mais quis sair. Sociável com pessoas e outros gatos.",
  "Gatinha tricolor, considerada símbolo de boa sorte. Saudável, vacinada e muito alegre. Ama brincar com varinha.",
];

const MOTIVACOES_ADOTANTE = [
  "Sempre quis ter um animal de estimação e agora moro sozinha — quero ter uma companhia e dar um lar para um animal que precisa.",
  "Meus filhos pedem há anos. Pesquisamos bastante e entendemos a responsabilidade. Queremos adotar, não comprar.",
  "Trabalho em home office e quero um companheiro para o dia a dia. Tenho tempo e espaço para cuidar bem.",
  "Perdi meu animal recentemente e, após um tempo de luto, me sinto pronto para abrir meu coração novamente para adoção.",
  "Sou veterinário e quero dar um lar para um animal especial ou com necessidades que outros hesitam em adotar.",
  "Minha mãe mora comigo e está sozinha durante o dia — um animal vai fazer bem para ela e para mim.",
  "Sempre fui voluntário em abrigos e chegou a hora de adotar de vez.",
];

const TIPOS_PROTETOR = ["independente", "lar_temporario", "abrigo", "ong"] as const;
const TIPOS_MORADIA = ["casa_propria", "alugada", "cedida", "outros"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[], idx: number): T {
  return arr[idx % arr.length];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function imageUrl(seed: string, w = 800, h = 600): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const SENHA_HASH = await bcrypt.hash("Mockup@123", 10);

  const ras = await prisma.regiaoAdministrativa.findMany({ orderBy: { id: "asc" } });
  if (ras.length === 0) {
    console.error("Nenhuma RA encontrada. Rode o seed principal primeiro: npm run db:seed");
    process.exit(1);
  }

  console.log(`Encontradas ${ras.length} RAs. Iniciando mockup...\n`);

  let totalProtetores = 0;
  let totalAdotantes = 0;
  let totalAnimais = 0;

  for (const ra of ras) {
    const sigla = (ra.sigla ?? ra.codigoRa).toLowerCase();

    // ── Verifica se já existe protetor de mockup para esta RA ──────────────
    const jaExiste = await prisma.usuario.findUnique({
      where: { email: `protetor.${sigla}@mockup.pvterritorioanimal.invalid` },
    });
    if (jaExiste) {
      console.log(`  [skip] RA ${ra.sigla} — já possui dados de mockup`);
      continue;
    }

    console.log(`  ► RA ${ra.sigla} — ${ra.nome}`);

    // ── 1. Protetor ────────────────────────────────────────────────────────
    const tipoProtetor = pick(TIPOS_PROTETOR, ra.id);
    const nomeProtetor = `Protetor ${ra.sigla}`;
    const userProtetor = await prisma.usuario.create({
      data: {
        email: `protetor.${sigla}@mockup.pvterritorioanimal.invalid`,
        senhaHash: SENHA_HASH,
        nomeCompleto: nomeProtetor,
        telefone: `(61) 9${String(ra.id).padStart(4, "0")}-0001`,
        tipo: "protetor",
        emailVerificado: true,
        perfilProtetor: {
          create: {
            tipoProtetor,
            raId: ra.id,
            verificado: ra.id % 3 !== 0,
            descricao: `Protetor voluntário atuando em ${ra.nome} há ${3 + (ra.id % 8)} anos. Especializado em resgates de rua e reabilitação.`,
            redesSociais: {},
          },
        },
      },
      include: { perfilProtetor: true },
    });
    const protetor = userProtetor.perfilProtetor!;
    totalProtetores++;

    // ── 2. Adotantes (2 por RA) ────────────────────────────────────────────
    for (let a = 0; a < 2; a++) {
      const idx = (ra.id - 1) * 2 + a;
      const nomeAdotante = a === 0
        ? `Ana ${ra.sigla}`
        : `Carlos ${ra.sigla}`;
      await prisma.usuario.create({
        data: {
          email: `adotante${a + 1}.${sigla}@mockup.pvterritorioanimal.invalid`,
          senhaHash: SENHA_HASH,
          nomeCompleto: nomeAdotante,
          telefone: `(61) 9${String(ra.id).padStart(4, "0")}-${String(a + 2).padStart(4, "0")}`,
          tipo: "adotante",
          emailVerificado: true,
          perfilAdotante: {
            create: {
              raId: ra.id,
              tipoMoradia: pick(TIPOS_MORADIA, idx),
              temAreaExterna: idx % 2 === 0,
              temOutrosAnimais: idx % 3 === 0,
              descricaoOutrosAnimais: idx % 3 === 0 ? "Tenho um gato adulto castrado, muito tranquilo." : null,
              jaAdotouAntes: idx % 4 === 0,
              motivoAdocao: pick(MOTIVACOES_ADOTANTE, idx),
              conheceCustos: true,
              aceitaVisita: true,
              perfilCompleto: true,
            },
          },
        },
      });
      totalAdotantes++;
    }

    // ── 3. Animais (3 cães + 3 gatos + 4 outros) ──────────────────────────
    const baseIdx = (ra.id - 1) * 10;

    // 3a. Cães
    for (let i = 0; i < 3; i++) {
      const idx = baseIdx + i;
      const nome = pick(NOMES_CAES, idx);
      const sexo = pick(SEXOS, idx);
      const porte = pick(PORTES_CAES, idx);
      const raca = pick(RACAS_CAES, idx);
      const cor = pick(CORES_CAES, idx);
      const baseSlug = slugify(`${nome}-${ra.sigla}-${i}`);
      const slug = `${baseSlug}-${Date.now()}-${i}`;

      await prisma.animal.create({
        data: {
          slug,
          protetorId: protetor.id,
          raId: ra.id,
          nome,
          especie: "cachorro",
          raca,
          sexo,
          porte,
          cor,
          idadeEstimadaMeses: 3 + (idx % 72),
          castrado: idx % 3 !== 2,
          vacinado: true,
          vermifugado: true,
          microchipado: idx % 4 === 0,
          bomComCriancas: idx % 2 === 0,
          bomComOutrosAnimais: idx % 3 !== 2,
          bomComGatos: idx % 4 === 1,
          descricao: pick(HISTORIAS_CAES, idx),
          necessidadesEspeciais: idx % 7 === 0 ? "Usa ração hipoalergênica." : null,
          status: "disponivel",
          destaque: idx % 5 === 0,
          fotos: {
            create: [
              { url: imageUrl(`cao-${ra.sigla}-${i}-a`), ordem: 0, principal: true },
              { url: imageUrl(`cao-${ra.sigla}-${i}-b`), ordem: 1, principal: false },
            ],
          },
        },
      });
      totalAnimais++;
    }

    // 3b. Gatos
    for (let i = 0; i < 3; i++) {
      const idx = baseIdx + 3 + i;
      const nome = pick(NOMES_GATOS, idx);
      const sexo = pick(SEXOS, idx);
      const raca = pick(RACAS_GATOS, idx);
      const cor = pick(CORES_GATOS, idx);
      const baseSlug = slugify(`${nome}-${ra.sigla}-gato-${i}`);
      const slug = `${baseSlug}-${Date.now()}-g${i}`;

      await prisma.animal.create({
        data: {
          slug,
          protetorId: protetor.id,
          raId: ra.id,
          nome,
          especie: "gato",
          raca,
          sexo,
          porte: "pequeno",
          cor,
          idadeEstimadaMeses: 2 + (idx % 84),
          castrado: idx % 3 !== 1,
          vacinado: true,
          vermifugado: true,
          microchipado: idx % 5 === 0,
          bomComCriancas: idx % 3 !== 2,
          bomComOutrosAnimais: idx % 4 === 0,
          bomComGatos: true,
          descricao: pick(HISTORIAS_GATOS, idx),
          necessidadesEspeciais: idx % 9 === 0 ? "Tem alergia a proteína de frango — requer ração específica." : null,
          status: "disponivel",
          destaque: idx % 7 === 0,
          fotos: {
            create: [
              { url: imageUrl(`gato-${ra.sigla}-${i}-a`), ordem: 0, principal: true },
              { url: imageUrl(`gato-${ra.sigla}-${i}-b`), ordem: 1, principal: false },
            ],
          },
        },
      });
      totalAnimais++;
    }

    // 3c. Outros (4 tipos rotacionando)
    for (let i = 0; i < 4; i++) {
      const idx = baseIdx + 6 + i;
      const tipo = OUTROS_TIPOS[i % OUTROS_TIPOS.length];
      const nome = pick(tipo.nomes, idx);
      const sexo = pick(SEXOS, idx);
      const baseSlug = slugify(`${nome}-${ra.sigla}-outro-${i}`);
      const slug = `${baseSlug}-${Date.now()}-o${i}`;

      await prisma.animal.create({
        data: {
          slug,
          protetorId: protetor.id,
          raId: ra.id,
          nome,
          especie: "outro",
          raca: tipo.raca,
          sexo,
          porte: tipo.porte,
          cor: "Variado",
          idadeEstimadaMeses: 1 + (idx % 36),
          castrado: null,
          vacinado: idx % 2 === 0,
          vermifugado: true,
          microchipado: false,
          bomComCriancas: true,
          bomComOutrosAnimais: idx % 3 !== 0,
          bomComGatos: false,
          descricao: tipo.descricao,
          necessidadesEspeciais: null,
          status: "disponivel",
          destaque: false,
          fotos: {
            create: [
              { url: imageUrl(`outro-${ra.sigla}-${i}`), ordem: 0, principal: true },
            ],
          },
        },
      });
      totalAnimais++;
    }
  }

  console.log("\n✅ Mockup concluído!");
  console.log(`   Protetores criados : ${totalProtetores}`);
  console.log(`   Adotantes criados  : ${totalAdotantes}`);
  console.log(`   Animais criados    : ${totalAnimais}`);
  console.log(`\n   Senha de todos os usuários mockup: Mockup@123`);
  console.log(`   Email dos protetores: protetor.<sigla>@mockup.pvterritorioanimal.invalid`);
  console.log(`   Email dos adotantes: adotante1.<sigla>@mockup.pvterritorioanimal.invalid`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
