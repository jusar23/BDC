DO $$ BEGIN
    CREATE TYPE "CrmRole" AS ENUM ('ADMIN', 'EMPLOYEE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "crm_users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "role" "CrmRole" NOT NULL DEFAULT 'EMPLOYEE',
    "can_manage_catalog" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_orders" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_chats" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "crm_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "crm_users_email_key" ON "crm_users"("email");

ALTER TABLE "crm_users" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "crm_users" FROM anon, authenticated;
