import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: "postgresql://saulo@localhost/pv_territorio_animal?host=/var/run/postgresql",
});
const prisma = new PrismaClient({ adapter });

// RAs do DF importadas do banco pdad_crivo
const RAS_DF = [
  { id: 1, codigoRa: "RA01", nome: "Plano Piloto", sigla: "PP", regiao: "Centro" },
  { id: 2, codigoRa: "RA02", nome: "Gama", sigla: "GA", regiao: "Sul" },
  { id: 3, codigoRa: "RA03", nome: "Taguatinga", sigla: "TA", regiao: "Oeste" },
  { id: 4, codigoRa: "RA04", nome: "Brazlândia", sigla: "BZ", regiao: "Oeste" },
  { id: 5, codigoRa: "RA05", nome: "Sobradinho", sigla: "SO", regiao: "Norte" },
  { id: 6, codigoRa: "RA06", nome: "Planaltina", sigla: "PL", regiao: "Norte" },
  { id: 7, codigoRa: "RA07", nome: "Paranoá", sigla: "PR", regiao: "Leste" },
  { id: 8, codigoRa: "RA08", nome: "Núcleo Bandeirante", sigla: "NB", regiao: "Centro-Sul" },
  { id: 9, codigoRa: "RA09", nome: "Ceilândia", sigla: "CL", regiao: "Oeste" },
  { id: 10, codigoRa: "RA10", nome: "Guará", sigla: "GU", regiao: "Centro-Sul" },
  { id: 11, codigoRa: "RA11", nome: "Cruzeiro", sigla: "CZ", regiao: "Centro" },
  { id: 12, codigoRa: "RA12", nome: "Samambaia", sigla: "SA", regiao: "Oeste" },
  { id: 13, codigoRa: "RA13", nome: "Santa Maria", sigla: "SM", regiao: "Sul" },
  { id: 14, codigoRa: "RA14", nome: "São Sebastião", sigla: "SS", regiao: "Leste" },
  { id: 15, codigoRa: "RA15", nome: "Recanto das Emas", sigla: "RE", regiao: "Sul" },
  { id: 16, codigoRa: "RA16", nome: "Lago Sul", sigla: "LS", regiao: "Centro-Sul" },
  { id: 17, codigoRa: "RA17", nome: "Riacho Fundo", sigla: "RF", regiao: "Centro-Sul" },
  { id: 18, codigoRa: "RA18", nome: "Lago Norte", sigla: "LN", regiao: "Norte" },
  { id: 19, codigoRa: "RA19", nome: "Candangolândia", sigla: "CD", regiao: "Centro-Sul" },
  { id: 20, codigoRa: "RA20", nome: "Águas Claras", sigla: "AC", regiao: "Oeste" },
  { id: 21, codigoRa: "RA21", nome: "Riacho Fundo II", sigla: "RF2", regiao: "Centro-Sul" },
  { id: 22, codigoRa: "RA22", nome: "Sudoeste/Octogonal", sigla: "SWO", regiao: "Centro" },
  { id: 23, codigoRa: "RA23", nome: "Varjão", sigla: "VA", regiao: "Norte" },
  { id: 24, codigoRa: "RA24", nome: "Park Way", sigla: "PW", regiao: "Centro-Sul" },
  { id: 25, codigoRa: "RA25", nome: "SCIA/Estrutural", sigla: "ES", regiao: "Oeste" },
  { id: 26, codigoRa: "RA26", nome: "Sobradinho II", sigla: "SO2", regiao: "Norte" },
  { id: 27, codigoRa: "RA27", nome: "Jardim Botânico", sigla: "JB", regiao: "Leste" },
  { id: 28, codigoRa: "RA28", nome: "Itapoã", sigla: "IT", regiao: "Leste" },
  { id: 29, codigoRa: "RA29", nome: "SIA", sigla: "SIA", regiao: "Centro-Sul" },
  { id: 30, codigoRa: "RA30", nome: "Vicente Pires", sigla: "VP", regiao: "Oeste" },
  { id: 31, codigoRa: "RA31", nome: "Fercal", sigla: "FE", regiao: "Norte" },
  { id: 32, codigoRa: "RA32", nome: "Sol Nascente/Pôr do Sol", sigla: "SN", regiao: "Oeste" },
  { id: 33, codigoRa: "RA33", nome: "Arniqueira", sigla: "AR", regiao: "Oeste" },
  { id: 34, codigoRa: "RA34", nome: "Arapoanga", sigla: "ARP", regiao: "Norte" },
  { id: 35, codigoRa: "RA35", nome: "Água Quente", sigla: "AQ", regiao: "Sul" },
];

async function main() {
  console.log("Seeding regioes_administrativas...");

  for (const ra of RAS_DF) {
    await prisma.regiaoAdministrativa.upsert({
      where: { codigoRa: ra.codigoRa },
      update: { nome: ra.nome, sigla: ra.sigla, regiao: ra.regiao },
      create: ra,
    });
  }

  const count = await prisma.regiaoAdministrativa.count();
  console.log(`✓ ${count} regiões administrativas cadastradas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
