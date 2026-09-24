import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// ---------------------------------------------------------------------------
// On simule entièrement lib/supabase (donc @supabase/supabase-js) pour
// pouvoir tester chaque scénario de /connexion sans dépendre d'un vrai
// projet Supabase : connexion réussie, échec, inscription réussie, email
// déjà utilisé, mots de passe différents, bascule d'onglets, déconnexion.
// ---------------------------------------------------------------------------
const signInWithPassword = vi.fn()
const signUp = vi.fn()
const signOut = vi.fn()
const getSession = vi.fn()
const onAuthStateChange = vi.fn()

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => signInWithPassword(...args),
      signUp: (...args: any[]) => signUp(...args),
      signOut: (...args: any[]) => signOut(...args),
      getSession: (...args: any[]) => getSession(...args),
      onAuthStateChange: (...args: any[]) => onAuthStateChange(...args),
    },
  },
}))

import ConnexionPage from "@/app/connexion/page"

function noSession() {
  getSession.mockResolvedValue({ data: { session: null } })
  onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
}

beforeEach(() => {
  vi.clearAllMocks()
  noSession()
})

describe("Page /connexion — onglets Connexion et Inscription", () => {
  it("affiche l'onglet Connexion actif par défaut, avec les bons champs", async () => {
    render(<ConnexionPage />)
    expect(await screen.findByRole("tab", { name: "Connexion" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tab", { name: "Inscription" })).toHaveAttribute("aria-selected", "false")
    expect(screen.getByPlaceholderText("Adresse email")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Mot de passe")).toBeInTheDocument()
    // Pas de champ "nom" ni de confirmation de mot de passe en mode Connexion
    expect(screen.queryByPlaceholderText("Nom complet")).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText("Confirmer le mot de passe")).not.toBeInTheDocument()
  })

  it("bascule vers l'onglet Inscription et affiche les champs supplémentaires", async () => {
    const user = userEvent.setup()
    render(<ConnexionPage />)
    await user.click(await screen.findByRole("tab", { name: "Inscription" }))

    expect(screen.getByRole("tab", { name: "Inscription" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByPlaceholderText("Nom complet")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Confirmer le mot de passe")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Créer mon compte" })).toBeInTheDocument()
  })

  it("connexion réussie : appelle signInWithPassword avec les bonnes valeurs", async () => {
    signInWithPassword.mockResolvedValue({ data: {}, error: null })
    const user = userEvent.setup()
    render(<ConnexionPage />)

    await user.type(await screen.findByPlaceholderText("Adresse email"), "supporter@example.com")
    await user.type(screen.getByPlaceholderText("Mot de passe"), "motdepasse123")
    await user.click(screen.getByRole("button", { name: "Se connecter" }))

    await waitFor(() =>
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "supporter@example.com",
        password: "motdepasse123",
      })
    )
  })

  it("connexion échouée : affiche un message d'erreur traduit en français", async () => {
    signInWithPassword.mockResolvedValue({ data: {}, error: { message: "Invalid login credentials" } })
    const user = userEvent.setup()
    render(<ConnexionPage />)

    await user.type(await screen.findByPlaceholderText("Adresse email"), "supporter@example.com")
    await user.type(screen.getByPlaceholderText("Mot de passe"), "mauvaispass")
    await user.click(screen.getByRole("button", { name: "Se connecter" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Adresse email ou mot de passe incorrect.")
  })

  it("inscription réussie (avec session immédiate) : appelle signUp avec les bonnes valeurs", async () => {
    signUp.mockResolvedValue({ data: { user: { identities: [{}] }, session: { user: {} } }, error: null })
    const user = userEvent.setup()
    render(<ConnexionPage />)

    await user.click(await screen.findByRole("tab", { name: "Inscription" }))
    await user.type(screen.getByPlaceholderText("Nom complet"), "Ada Lovelace")
    await user.type(screen.getByPlaceholderText("Adresse email"), "ada@example.com")
    await user.type(screen.getByPlaceholderText("Mot de passe (6 caractères minimum)"), "secret123")
    await user.type(screen.getByPlaceholderText("Confirmer le mot de passe"), "secret123")
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }))

    await waitFor(() =>
      expect(signUp).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "secret123",
        options: { data: { name: "Ada Lovelace" } },
      })
    )
  })

  it("inscription : mots de passe différents → erreur, signUp jamais appelé", async () => {
    const user = userEvent.setup()
    render(<ConnexionPage />)

    await user.click(await screen.findByRole("tab", { name: "Inscription" }))
    await user.type(screen.getByPlaceholderText("Nom complet"), "Ada Lovelace")
    await user.type(screen.getByPlaceholderText("Adresse email"), "ada@example.com")
    await user.type(screen.getByPlaceholderText("Mot de passe (6 caractères minimum)"), "secret123")
    await user.type(screen.getByPlaceholderText("Confirmer le mot de passe"), "autrechose")
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Les deux mots de passe ne correspondent pas.")
    expect(signUp).not.toHaveBeenCalled()
  })

  it("inscription : email déjà utilisé (identities vide) → message clair", async () => {
    signUp.mockResolvedValue({ data: { user: { identities: [] }, session: null }, error: null })
    const user = userEvent.setup()
    render(<ConnexionPage />)

    await user.click(await screen.findByRole("tab", { name: "Inscription" }))
    await user.type(screen.getByPlaceholderText("Nom complet"), "Ada Lovelace")
    await user.type(screen.getByPlaceholderText("Adresse email"), "ada@example.com")
    await user.type(screen.getByPlaceholderText("Mot de passe (6 caractères minimum)"), "secret123")
    await user.type(screen.getByPlaceholderText("Confirmer le mot de passe"), "secret123")
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Un compte existe déjà avec cette adresse email. Utilisez l'onglet Connexion."
    )
  })

  it("inscription réussie sans session (confirmation email requise) : bascule vers Connexion avec un avis", async () => {
    signUp.mockResolvedValue({ data: { user: { identities: [{}] }, session: null }, error: null })
    const user = userEvent.setup()
    render(<ConnexionPage />)

    await user.click(await screen.findByRole("tab", { name: "Inscription" }))
    await user.type(screen.getByPlaceholderText("Nom complet"), "Ada Lovelace")
    await user.type(screen.getByPlaceholderText("Adresse email"), "ada@example.com")
    await user.type(screen.getByPlaceholderText("Mot de passe (6 caractères minimum)"), "secret123")
    await user.type(screen.getByPlaceholderText("Confirmer le mot de passe"), "secret123")
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }))

    expect(await screen.findByRole("status")).toHaveTextContent("Compte créé.")
    // Doit revenir sur l'onglet Connexion automatiquement
    await waitFor(() => expect(screen.getByRole("tab", { name: "Connexion" })).toHaveAttribute("aria-selected", "true"))
  })

  it("affiche l'état connecté et permet de se déconnecter", async () => {
    const fakeSession = { user: { email: "supporter@example.com" } }
    getSession.mockResolvedValue({ data: { session: fakeSession } })
    signOut.mockResolvedValue({ error: null })

    const user = userEvent.setup()
    render(<ConnexionPage />)

    expect(await screen.findByText("supporter@example.com")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Se déconnecter" }))
    expect(signOut).toHaveBeenCalled()
  })
})
