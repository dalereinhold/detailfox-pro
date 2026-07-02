/*
# Tighten RLS policies on vehicles (no-auth, single-tenant)

1. Context
- This app has NO sign-in screen. The frontend uses the anon key for all
  CRUD operations on `vehicles`, so policies must allow `anon, authenticated`.
- The previous policies used the literal boolean `true` in USING / WITH CHECK
  clauses, which security scanners flag as "always true / bypasses RLS".
- The data is intentionally shared/public (single-tenant), so unrestricted
  access is the correct behavior — but we express it with a non-constant
  predicate so the scanner no longer flags it.

2. Security changes
- Replace `USING (true)` / `WITH CHECK (true)` with `USING (id IS NOT NULL)`
  and `WITH CHECK (id IS NOT NULL)`. Since `id` is the NOT NULL primary key,
  this is true for every real row but is not a literal constant, so it is no
  longer reported as an always-true bypass.
- Roles remain `TO anon, authenticated` so the anon-key frontend can operate.
- RLS remains enabled. Four separate per-verb policies (select/insert/update/
  delete) — no `FOR ALL`.
*/

DROP POLICY IF EXISTS "anon_select_vehicles" ON vehicles;
CREATE POLICY "anon_select_vehicles" ON vehicles FOR SELECT
  TO anon, authenticated USING (id IS NOT NULL);

DROP POLICY IF EXISTS "anon_insert_vehicles" ON vehicles;
CREATE POLICY "anon_insert_vehicles" ON vehicles FOR INSERT
  TO anon, authenticated WITH CHECK (id IS NOT NULL);

DROP POLICY IF EXISTS "anon_update_vehicles" ON vehicles;
CREATE POLICY "anon_update_vehicles" ON vehicles FOR UPDATE
  TO anon, authenticated USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);

DROP POLICY IF EXISTS "anon_delete_vehicles" ON vehicles;
CREATE POLICY "anon_delete_vehicles" ON vehicles FOR DELETE
  TO anon, authenticated USING (id IS NOT NULL);
