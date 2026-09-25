// Adaptateur Vercel : Express reste l'API REST du projet.
const app = require("../server/src/app");
const { migrate } = require("../server/src/db");

let ready;

module.exports = async function handler(req, res) {
  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return res.status(500).json({ error: "Configuration serveur incomplète : DATABASE_URL/JWT_SECRET." });
  }

  try {
    ready ||= migrate();
    await ready;
    return app(req, res);
  } catch (err) {
    ready = undefined;
    console.error("API initialization error:", err);
    return res.status(500).json({ error: "Initialisation de l'API impossible. Vérifiez les variables Supabase/Vercel." });
  }
};