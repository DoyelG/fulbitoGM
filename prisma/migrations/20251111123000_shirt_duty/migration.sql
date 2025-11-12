-- Add shirt duty tracking fields
-- Player: add shirtDutiesCount with default 0
ALTER TABLE "Player"
ADD COLUMN IF NOT EXISTS "shirtDutiesCount" INTEGER NOT NULL DEFAULT 0;

-- Match: add shirtsResponsibleId referencing Player(id)
ALTER TABLE "Match"
ADD COLUMN IF NOT EXISTS "shirtsResponsibleId" TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "Match_shirtsResponsibleId_idx" ON "Match"("shirtsResponsibleId");

-- Foreign key constraint (on delete set null, on update cascade)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'Match_shirtsResponsibleId_fkey'
      AND table_name = 'Match'
  ) THEN
    ALTER TABLE "Match"
    ADD CONSTRAINT "Match_shirtsResponsibleId_fkey"
    FOREIGN KEY ("shirtsResponsibleId") REFERENCES "Player"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;


