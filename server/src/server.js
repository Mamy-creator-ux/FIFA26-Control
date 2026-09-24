require("dotenv").config();
const app = require("./app");
const { migrate } = require("./db");
const PORT = Number(process.env.PORT || 4000);

async function start() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL est obligatoire.");
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET est obligatoire et doit contenir au moins 32 caractères.");
  }
  await migrate();
  app.listen(PORT, () => console.log(`⚽ FIFA26 / Control API — http://localhost:${PORT}`));
}

if (require.main === module) {
  start().catch((err) => {
    console.error("❌ Démarrage impossible :", err.message);
    process.exit(1);
  });
}

module.exports = app;
