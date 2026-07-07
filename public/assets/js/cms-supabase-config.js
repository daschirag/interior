/**
 * Supabase public credentials — safe to expose (RLS = read-only SELECT).
 * Copy from Supabase → Project Settings → API:
 *   • Project URL  → url
 *   • anon public  → anonKey  (NOT service_role)
 *
 * Leave url/anonKey empty to disable live updates (hydrate still works).
 */
window.VINAYAK_SUPABASE = window.VINAYAK_SUPABASE || {
  url: "https://gocnyztcicwyyvllrzrf.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY255enRjaWN3eXl2bGxyenJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MzQ3MzYsImV4cCI6MjA5ODUxMDczNn0.p48TN14VxibSkRhAxhcTHGpsrF3Hz6l7BqJoRol8OM8",
};
