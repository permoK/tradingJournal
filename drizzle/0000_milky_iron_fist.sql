CREATE TYPE "public"."activity_type" AS ENUM('learning', 'trading', 'journal');--> statement-breakpoint
CREATE TYPE "public"."trade_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"user_id" uuid NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"activity_title" text NOT NULL,
	"activity_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"is_private" boolean DEFAULT true,
	"tags" text[] DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "news_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"news_id" text NOT NULL,
	"alert_type" text NOT NULL,
	"shown_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "news_alerts_user_id_news_id_unique" UNIQUE("user_id","news_id")
);
--> statement-breakpoint
CREATE TABLE "news_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"categories" text[] DEFAULT '{"forex","economic","central-bank","market"}',
	"importance_levels" text[] DEFAULT '{"high","medium"}',
	"notifications_enabled" boolean DEFAULT true,
	"email_notifications" boolean DEFAULT false,
	"push_notifications" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "news_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"username" text,
	"full_name" text,
	"avatar_url" text,
	"bio" text,
	"streak_count" integer DEFAULT 0,
	"last_active" timestamp with time zone DEFAULT now(),
	"balance" numeric(15, 2) DEFAULT '10000',
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"details" text,
	"image_url" text,
	"category" text,
	"is_active" boolean DEFAULT true,
	"is_private" boolean DEFAULT true,
	"success_rate" numeric(5, 2) DEFAULT '0',
	"total_trades" integer DEFAULT 0,
	"profitable_trades" integer DEFAULT 0,
	"original_strategy_id" uuid,
	"duplicate_count" integer DEFAULT 0,
	"is_duplicate" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" uuid NOT NULL,
	"strategy_id" uuid,
	"trade_date" timestamp with time zone NOT NULL,
	"market" text NOT NULL,
	"trade_type" text NOT NULL,
	"entry_price" numeric(15, 8) NOT NULL,
	"exit_price" numeric(15, 8),
	"quantity" numeric(15, 8) NOT NULL,
	"profit_loss" numeric(15, 2),
	"status" "trade_status" DEFAULT 'open',
	"notes" text,
	"screenshot_url" text,
	"is_private" boolean DEFAULT true,
	"is_demo" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_alerts" ADD CONSTRAINT "news_alerts_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_preferences" ADD CONSTRAINT "news_preferences_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_original_strategy_id_strategies_id_fk" FOREIGN KEY ("original_strategy_id") REFERENCES "public"."strategies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE set null ON UPDATE no action;