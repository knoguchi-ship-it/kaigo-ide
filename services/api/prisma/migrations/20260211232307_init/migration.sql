-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CARE_MANAGER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "CareLevel" AS ENUM ('SUPPORT_1', 'SUPPORT_2', 'CARE_1', 'CARE_2', 'CARE_3', 'CARE_4', 'CARE_5');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('SHORT_TERM', 'LONG_TERM');

-- CreateEnum
CREATE TYPE "CareRecordCategory" AS ENUM ('VISIT', 'PHONE', 'FAX', 'MAIL', 'CONFERENCE', 'OTHER');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CARE_MANAGER',
    "tenant_id" TEXT NOT NULL,
    "google_access_token" TEXT,
    "google_refresh_token" TEXT,
    "hashed_password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "family_name" TEXT NOT NULL,
    "given_name" TEXT NOT NULL,
    "family_name_kana" TEXT NOT NULL,
    "given_name_kana" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "insurance_number" TEXT NOT NULL,
    "care_level" "CareLevel" NOT NULL,
    "certification_date" TIMESTAMP(3) NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plans" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_plan_goals" (
    "id" TEXT NOT NULL,
    "care_plan_id" TEXT NOT NULL,
    "type" "GoalType" NOT NULL,
    "text" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_plan_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_records" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "record_date" TIMESTAMP(3) NOT NULL,
    "category" "CareRecordCategory" NOT NULL,
    "content" TEXT NOT NULL,
    "related_organization" TEXT,
    "professional_judgment" TEXT,
    "client_family_opinion" TEXT,
    "google_calendar_event_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_records" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "care_plan_id" TEXT NOT NULL,
    "record_date" TIMESTAMP(3) NOT NULL,
    "overall_comment" TEXT NOT NULL,
    "professional_judgment" TEXT NOT NULL,
    "next_action" TEXT NOT NULL,
    "google_calendar_event_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitoring_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_evaluations" (
    "id" TEXT NOT NULL,
    "monitoring_record_id" TEXT NOT NULL,
    "goal_id" TEXT NOT NULL,
    "goal_text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "monitoring_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "clients_tenant_id_idx" ON "clients"("tenant_id");

-- CreateIndex
CREATE INDEX "care_plans_client_id_idx" ON "care_plans"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_plans_client_id_version_key" ON "care_plans"("client_id", "version");

-- CreateIndex
CREATE INDEX "care_plan_goals_care_plan_id_idx" ON "care_plan_goals"("care_plan_id");

-- CreateIndex
CREATE INDEX "care_records_client_id_record_date_idx" ON "care_records"("client_id", "record_date" DESC);

-- CreateIndex
CREATE INDEX "monitoring_records_client_id_record_date_idx" ON "monitoring_records"("client_id", "record_date" DESC);

-- CreateIndex
CREATE INDEX "monitoring_evaluations_monitoring_record_id_idx" ON "monitoring_evaluations"("monitoring_record_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plans" ADD CONSTRAINT "care_plans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_plan_goals" ADD CONSTRAINT "care_plan_goals_care_plan_id_fkey" FOREIGN KEY ("care_plan_id") REFERENCES "care_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_records" ADD CONSTRAINT "care_records_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_records" ADD CONSTRAINT "care_records_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_records" ADD CONSTRAINT "monitoring_records_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_records" ADD CONSTRAINT "monitoring_records_care_plan_id_fkey" FOREIGN KEY ("care_plan_id") REFERENCES "care_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_records" ADD CONSTRAINT "monitoring_records_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_evaluations" ADD CONSTRAINT "monitoring_evaluations_monitoring_record_id_fkey" FOREIGN KEY ("monitoring_record_id") REFERENCES "monitoring_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_evaluations" ADD CONSTRAINT "monitoring_evaluations_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "care_plan_goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
