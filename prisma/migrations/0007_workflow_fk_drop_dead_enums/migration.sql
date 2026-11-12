-- Schema hygiene.
--
-- #559 — WorkflowState.documentId gains a real foreign key to Document (it was
--        @unique with no relation, so orphan rows and no cascade were possible).
--        Purge any orphans first — the workflow feature is unbuilt, so the table
--        is empty in practice — then add the cascade FK.
--
-- #558 — drop six enums that were materialized into every consumer database via
--        CREATE TYPE but referenced by no model (pure schema/DB drift). IF EXISTS
--        keeps re-runs safe; NO CASCADE means if a downstream consumer somehow
--        reused one of these conveniently-named types, the DROP fails loudly
--        rather than silently removing their dependent columns.

DELETE FROM "actuate_workflow_states"
WHERE "documentId" NOT IN (SELECT "id" FROM "actuate_documents");

ALTER TABLE "actuate_workflow_states"
  ADD CONSTRAINT "actuate_workflow_states_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "actuate_documents"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

DROP TYPE IF EXISTS "AuditEvent";
DROP TYPE IF EXISTS "NotificationType";
DROP TYPE IF EXISTS "OrderStatus";
DROP TYPE IF EXISTS "PaymentStatus";
DROP TYPE IF EXISTS "DiscountType";
DROP TYPE IF EXISTS "ProductType";
