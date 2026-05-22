-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('protetor', 'adotante', 'admin');

-- CreateEnum
CREATE TYPE "TipoProtetor" AS ENUM ('independente', 'lar_temporario', 'abrigo', 'ong');

-- CreateEnum
CREATE TYPE "TipoOrganizacao" AS ENUM ('abrigo', 'ong', 'empresa', 'publica');

-- CreateEnum
CREATE TYPE "EspecieAnimal" AS ENUM ('cachorro', 'gato', 'outro');

-- CreateEnum
CREATE TYPE "SexoAnimal" AS ENUM ('macho', 'femea');

-- CreateEnum
CREATE TYPE "PorteAnimal" AS ENUM ('mini', 'pequeno', 'medio', 'grande', 'gigante');

-- CreateEnum
CREATE TYPE "StatusAnimal" AS ENUM ('disponivel', 'em_processo_adocao', 'adotado', 'indisponivel_temporario', 'removido');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('pendente', 'em_analise', 'aprovada', 'rejeitada', 'cancelada', 'concluida');

-- CreateEnum
CREATE TYPE "TipoMoradia" AS ENUM ('casa_propria', 'alugada', 'cedida', 'outros');

-- CreateTable
CREATE TABLE "regioes_administrativas" (
    "id" SERIAL NOT NULL,
    "codigo_ra" VARCHAR(10) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "sigla" VARCHAR(10),
    "regiao" VARCHAR(50),

    CONSTRAINT "regioes_administrativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizacoes" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "tipo" "TipoOrganizacao" NOT NULL,
    "cnpj" VARCHAR(20),
    "ra_id" INTEGER,
    "endereco" TEXT,
    "telefone" VARCHAR(20),
    "email" VARCHAR(255),
    "site" VARCHAR(255),
    "descricao" TEXT,
    "verificada" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "nome_completo" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(20),
    "tipo" "TipoUsuario" NOT NULL,
    "email_verificado" BOOLEAN NOT NULL DEFAULT false,
    "token_verificacao" VARCHAR(255),
    "token_expira_em" TIMESTAMP(3),
    "token_reset" VARCHAR(255),
    "token_reset_expira" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfis_protetores" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "cpf_criptografado" TEXT,
    "data_nascimento" DATE,
    "tipo_protetor" "TipoProtetor" NOT NULL,
    "organizacao_id" UUID,
    "ra_id" INTEGER,
    "descricao" TEXT,
    "foto_perfil_url" VARCHAR(500),
    "redes_sociais" JSONB NOT NULL DEFAULT '{}',
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfis_protetores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animais" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "protetor_id" UUID NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "especie" "EspecieAnimal" NOT NULL,
    "raca" VARCHAR(100),
    "sexo" "SexoAnimal" NOT NULL,
    "idade_estimada_meses" INTEGER,
    "porte" "PorteAnimal" NOT NULL,
    "cor" VARCHAR(100),
    "descricao" TEXT NOT NULL,
    "castrado" BOOLEAN,
    "vacinado" BOOLEAN,
    "vermifugado" BOOLEAN,
    "microchipado" BOOLEAN NOT NULL DEFAULT false,
    "necessidades_especiais" TEXT,
    "bom_com_criancas" BOOLEAN,
    "bom_com_outros_animais" BOOLEAN,
    "bom_com_gatos" BOOLEAN,
    "ra_id" INTEGER,
    "status" "StatusAnimal" NOT NULL DEFAULT 'disponivel',
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos_animais" (
    "id" UUID NOT NULL,
    "animal_id" UUID NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fotos_animais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfis_adotantes" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "cpf_criptografado" TEXT,
    "data_nascimento" DATE,
    "endereco_completo" TEXT,
    "ra_id" INTEGER,
    "tipo_moradia" "TipoMoradia",
    "tem_area_externa" BOOLEAN,
    "tem_outros_animais" BOOLEAN NOT NULL DEFAULT false,
    "descricao_outros_animais" TEXT,
    "ja_adotou_antes" BOOLEAN NOT NULL DEFAULT false,
    "motivo_adocao" TEXT,
    "conhece_custos" BOOLEAN NOT NULL DEFAULT false,
    "aceita_visita" BOOLEAN NOT NULL DEFAULT false,
    "foto_perfil_url" VARCHAR(500),
    "perfil_completo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfis_adotantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes_adocao" (
    "id" UUID NOT NULL,
    "animal_id" UUID NOT NULL,
    "adotante_id" UUID NOT NULL,
    "protetor_id" UUID NOT NULL,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'pendente',
    "mensagem_adotante" TEXT NOT NULL,
    "nota_interna" TEXT,
    "data_resposta" TIMESTAMP(3),
    "data_conclusao" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_adocao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regioes_administrativas_codigo_ra_key" ON "regioes_administrativas"("codigo_ra");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "perfis_protetores_usuario_id_key" ON "perfis_protetores"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "animais_slug_key" ON "animais"("slug");

-- CreateIndex
CREATE INDEX "animais_status_idx" ON "animais"("status");

-- CreateIndex
CREATE INDEX "animais_especie_idx" ON "animais"("especie");

-- CreateIndex
CREATE INDEX "animais_ra_id_idx" ON "animais"("ra_id");

-- CreateIndex
CREATE INDEX "animais_protetor_id_idx" ON "animais"("protetor_id");

-- CreateIndex
CREATE UNIQUE INDEX "perfis_adotantes_usuario_id_key" ON "perfis_adotantes"("usuario_id");

-- CreateIndex
CREATE INDEX "solicitacoes_adocao_animal_id_idx" ON "solicitacoes_adocao"("animal_id");

-- CreateIndex
CREATE INDEX "solicitacoes_adocao_adotante_id_idx" ON "solicitacoes_adocao"("adotante_id");

-- CreateIndex
CREATE INDEX "solicitacoes_adocao_protetor_id_idx" ON "solicitacoes_adocao"("protetor_id");

-- CreateIndex
CREATE INDEX "solicitacoes_adocao_status_idx" ON "solicitacoes_adocao"("status");

-- CreateIndex
CREATE UNIQUE INDEX "solicitacoes_adocao_animal_id_adotante_id_key" ON "solicitacoes_adocao"("animal_id", "adotante_id");

-- AddForeignKey
ALTER TABLE "organizacoes" ADD CONSTRAINT "organizacoes_ra_id_fkey" FOREIGN KEY ("ra_id") REFERENCES "regioes_administrativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfis_protetores" ADD CONSTRAINT "perfis_protetores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfis_protetores" ADD CONSTRAINT "perfis_protetores_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "organizacoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfis_protetores" ADD CONSTRAINT "perfis_protetores_ra_id_fkey" FOREIGN KEY ("ra_id") REFERENCES "regioes_administrativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animais" ADD CONSTRAINT "animais_protetor_id_fkey" FOREIGN KEY ("protetor_id") REFERENCES "perfis_protetores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animais" ADD CONSTRAINT "animais_ra_id_fkey" FOREIGN KEY ("ra_id") REFERENCES "regioes_administrativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_animais" ADD CONSTRAINT "fotos_animais_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfis_adotantes" ADD CONSTRAINT "perfis_adotantes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfis_adotantes" ADD CONSTRAINT "perfis_adotantes_ra_id_fkey" FOREIGN KEY ("ra_id") REFERENCES "regioes_administrativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_adocao" ADD CONSTRAINT "solicitacoes_adocao_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_adocao" ADD CONSTRAINT "solicitacoes_adocao_adotante_id_fkey" FOREIGN KEY ("adotante_id") REFERENCES "perfis_adotantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_adocao" ADD CONSTRAINT "solicitacoes_adocao_protetor_id_fkey" FOREIGN KEY ("protetor_id") REFERENCES "perfis_protetores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
