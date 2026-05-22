-- CreateTable
CREATE TABLE "mensagens" (
    "id" UUID NOT NULL,
    "solicitacao_id" UUID NOT NULL,
    "autor_id" UUID NOT NULL,
    "tipo_autor" "TipoUsuario" NOT NULL,
    "texto" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mensagens_solicitacao_id_idx" ON "mensagens"("solicitacao_id");

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_solicitacao_id_fkey" FOREIGN KEY ("solicitacao_id") REFERENCES "solicitacoes_adocao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
