-- Row Level Security Policies for PRM
-- Ensure each user can only access their own data

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Interaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Occasion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reminder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdvisorQuery" ENABLE ROW LEVEL SECURITY;

-- User table: users can only see their own user record
CREATE POLICY "Users can view own user record" ON "User"
  FOR ALL USING (id = auth.uid()::text);

-- Account table: users can only see their own accounts
CREATE POLICY "Users can view own accounts" ON "Account"
  FOR ALL USING ("userId" = auth.uid()::text);

-- Session table: users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON "Session"
  FOR ALL USING ("userId" = auth.uid()::text);

-- VerificationToken: users can only see their own tokens
CREATE POLICY "Users can view own verification tokens" ON "VerificationToken"
  FOR ALL USING (identifier = auth.email());

-- Contact: users can only see their own contacts
CREATE POLICY "Users can manage own contacts" ON "Contact"
  FOR ALL USING ("userId" = auth.uid()::text);

-- Interaction: users can only see interactions of their contacts
CREATE POLICY "Users can manage own interactions" ON "Interaction"
  FOR ALL USING (
    "contactId" IN (
      SELECT id FROM "Contact" WHERE "userId" = auth.uid()::text
    )
  );

-- Occasion: users can only see occasions of their contacts
CREATE POLICY "Users can manage own occasions" ON "Occasion"
  FOR ALL USING (
    "contactId" IN (
      SELECT id FROM "Contact" WHERE "userId" = auth.uid()::text
    )
  );

-- Reminder: users can only see reminders of their contacts
CREATE POLICY "Users can manage own reminders" ON "Reminder"
  FOR ALL USING (
    "contactId" IN (
      SELECT id FROM "Contact" WHERE "userId" = auth.uid()::text
    ) OR "occasionId" IN (
      SELECT o.id FROM "Occasion" o
      JOIN "Contact" c ON o."contactId" = c.id
      WHERE c."userId" = auth.uid()::text
    )
  );

-- AdvisorQuery: users can only see their own advisor query history
CREATE POLICY "Users can manage own advisor queries" ON "AdvisorQuery"
  FOR ALL USING ("userId" = auth.uid()::text);
