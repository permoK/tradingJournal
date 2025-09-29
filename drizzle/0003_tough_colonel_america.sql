ALTER TABLE "strategies" DROP CONSTRAINT "strategies_original_strategy_id_strategies_id_fk";
--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "activity_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "activity_date" SET DEFAULT now();