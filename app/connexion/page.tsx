"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Session } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

type Tab = "connexion" | "inscription"

/** Traduit les messages d'erreur Supabase les plus courants ; sinon, renvoie
 *  le message original (mieux vaut un message anglais exact qu'un message
 *  générique qui masque la vraie cause). */
function translateAuthError(message: string): string {
  const known: Record<string, string> = {
    "Invalid login credentials": "Adresse email ou mot de passe incorrect.",
    "User already registered": "Un compte existe déjà avec cette adresse email. Utilisez l'onglet Connexion.",
    "Email not confirmed": "Adresse email non confirmée. Vérifiez votre boîte de réception.",
    "Password should be at least 6 characters": "Le mot de passe doit contenir au moins 6 caractères.",
    "Unable to validate email address: invalid format": "Adresse email invalide.",
    "Signups not allowed for this instance": "Les inscriptions sont désactivées sur ce projet Supabase.",
  }
  for (const [key, fr] of Object.entries(known)) {
    if (message.includes(key)) return fr
  }
  return message
}

export default function ConnexionPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("connexion")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  function switchTab(next: Tab) {
    setTab(next)
    setError("")
    setNotice("")
    setPassword("")
    setConfirmPassword("")
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setNotice("")

    if (!isSupabaseConfigured) {
      setError("Supabase n'est pas configuré (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants).")
      return
    }

    if (tab === "inscription" && password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.")
      return
    }

    setLoading(true)
    try {
      if (tab === "connexion") {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (err) {
          setError(translateAuthError(err.message))
          return
        }
        router.push("/")
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() } },
        })
        if (err) {
          setError(translateAuthError(err.message))
          return
        }
        // Supabase renvoie un utilisateur "fantôme" (identities: []) quand
        // l'email existe déjà mais que la confirmation par email est
        // activée — sans cela l'API ne renverrait aucune erreur explicite.
        if (data.user && data.user.identities?.length === 0) {
          setError("Un compte existe déjà avec cette adresse email. Utilisez l'onglet Connexion.")
          return
        }
        if (data.session) {
          // Confirmation par email désactivée sur le projet Supabase → déjà connecté.
          router.push("/")
          return
        }
        setNotice("Compte créé. Vérifiez votre boîte de réception pour confirmer votre adresse email avant de vous connecter.")
        setTab("connexion")
        setPassword("")
        setConfirmPassword("")
      }
    } catch {
      setError("Le service de connexion est momentanément indisponible. Réessayez dans quelques instants.")
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <main className="min-h-screen bg-[#080808] px-5 py-8 text-[#f0efea] sm:px-10">
      <Link href="/" className="font-mono text-xs uppercase tracking-[0.2em] text-[#aaa] hover:text-white">
        ← Retour à FIFA26
      </Link>
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <section className="w-full border border-white/15 bg-white/[.03] p-6 sm:p-10">
          <p className="font-mono text-[10px] uppercase tracking-[.25em] text-[#ef3f30]">FIFA26 / COMPTE</p>

          {!isSupabaseConfigured && (
            <p role="alert" className="mt-4 border border-[#ef3f30]/40 bg-[#ef3f30]/10 p-3 text-xs text-[#ef3f30]">
              Supabase n'est pas configuré. Renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY (voir .env.example).
            </p>
          )}

          {session === undefined && <p className="mt-6 font-mono text-xs uppercase text-white/40">Chargement…</p>}

          {session === null && (
            <>
              <p className="mt-3 text-sm text-[#aaa]">Accédez à votre espace supporter championnat.</p>
              <p className="mt-1 text-xs text-[#666]">
                Vous organisez le tournoi ?{" "}
                <Link href="/admin" className="underline underline-offset-4 hover:text-white">
                  Espace organisateur →
                </Link>
              </p>

              <div role="tablist" aria-label="Connexion ou inscription" className="mt-8 grid grid-cols-2 border border-white/15">
                <button
                  type="button"
                  role="tab"
                  id="tab-connexion"
                  aria-selected={tab === "connexion"}
                  aria-controls="panel-auth"
                  onClick={() => switchTab("connexion")}
                  data-active={tab === "connexion"}
                  className="border-r border-white/15 px-4 py-3 font-mono text-xs uppercase tracking-widest text-white/50 transition-colors hover:text-white data-[active=true]:bg-[#ef3f30] data-[active=true]:text-white"
                >
                  Connexion
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-inscription"
                  aria-selected={tab === "inscription"}
                  aria-controls="panel-auth"
                  onClick={() => switchTab("inscription")}
                  data-active={tab === "inscription"}
                  className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-white/50 transition-colors hover:text-white data-[active=true]:bg-[#ef3f30] data-[active=true]:text-white"
                >
                  Inscription
                </button>
              </div>

              <h1 className="mt-6 font-serif text-4xl tracking-[-.05em]">{tab === "connexion" ? "Bon retour" : "Créer un compte"}</h1>

              <form id="panel-auth" role="tabpanel" aria-labelledby={tab === "connexion" ? "tab-connexion" : "tab-inscription"} onSubmit={submit} className="mt-6 space-y-4">
                {tab === "inscription" && (
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nom complet"
                    aria-label="Nom complet"
                    className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#ef3f30]"
                  />
                )}
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse email"
                  aria-label="Adresse email"
                  className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#ef3f30]"
                />
                <input
                  required
                  minLength={6}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tab === "inscription" ? "Mot de passe (6 caractères minimum)" : "Mot de passe"}
                  aria-label="Mot de passe"
                  autoComplete={tab === "connexion" ? "current-password" : "new-password"}
                  className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#ef3f30]"
                />
                {tab === "inscription" && (
                  <input
                    required
                    minLength={6}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    aria-label="Confirmer le mot de passe"
                    autoComplete="new-password"
                    className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#ef3f30]"
                  />
                )}
                {error && (
                  <p role="alert" aria-live="polite" className="text-sm text-[#ef3f30]">
                    {error}
                  </p>
                )}
                {notice && (
                  <p role="status" aria-live="polite" className="text-sm text-emerald-400">
                    {notice}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ef3f30] px-4 py-4 font-mono text-xs uppercase tracking-[.2em] text-white transition hover:bg-white hover:text-black disabled:opacity-50"
                >
                  {loading ? "Chargement…" : tab === "connexion" ? "Se connecter" : "Créer mon compte"}
                </button>
              </form>
            </>
          )}

          {session && (
            <>
              <h1 className="mt-5 font-serif text-5xl tracking-[-.05em]">Bienvenue</h1>
              <p className="mt-3 text-sm text-[#aaa]">
                Connecté en tant que <span className="text-white">{session.user.email}</span>
              </p>
              <button
                onClick={logout}
                className="mt-8 w-full bg-[#f0efea] px-4 py-4 font-mono text-xs uppercase tracking-[.2em] text-black transition hover:bg-[#ef3f30] hover:text-white"
              >
                Se déconnecter
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
