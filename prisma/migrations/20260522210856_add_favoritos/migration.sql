-- CreateTable
CREATE TABLE "favoritos" (
    "id" UUID NOT NULL,
    "adotante_id" UUID NOT NULL,
    "animal_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favoritos_adotante_id_idx" ON "favoritos"("adotante_id");

-- CreateIndex
CREATE UNIQUE INDEX "favoritos_adotante_id_animal_id_key" ON "favoritos"("adotante_id", "animal_id");

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_adotante_id_fkey" FOREIGN KEY ("adotante_id") REFERENCES "perfis_adotantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
