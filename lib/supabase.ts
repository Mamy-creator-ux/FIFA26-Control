// lib/supabase.ts
// -----------------------------------------------------------------------------
// Client Supabase côté navigateur — utilisé pour l'espace « supporter »
// (inscription / connexion) via Supabase Auth. Les données du championnat
// (équipes, matchs, classement...) transitent, elles, par l'API REST
// Node.js + Express (voir lib/api.ts) qui se connecte à la même base
// Supabase côté serveur.
// -----------------------------------------------------------------------------
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (typeof window !== "undefined" && !isSupabaseConfigured) {
  // Avertissement uniquement — n'empêche pas le reste du site de fonctionner.
  console.warn(
    "[Supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants. " +
      "L'espace supporter (/connexion) ne pourra pas s'authentifier. Voir .env.example."
  )
}

// IMPORTANT : createClient() lève une exception immédiate si l'URL est une
// chaîne vide ("supabaseUrl is required."), ce qui ferait planter la page
// (et le build statique) tant que les variables d'environnement ne sont pas
// renseignées. On retombe donc sur une URL syntaxiquement valide mais
// inutilisable ; isSupabaseConfigured permet à l'UI d'afficher un message
// clair plutôt qu'une erreur réseau opaque.
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)
