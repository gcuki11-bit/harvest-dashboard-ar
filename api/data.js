// api/data.js — Reporte de Cosecha AR
// Sirve harvest_data.json desde el repo (GitHub raw)

const OWNER = "gcuki11-bit";
const REPO  = "harvest-dashboard-ar";
const FILE  = "public/harvest_data.json";
const TOKEN = process.env.GITHUB_TOKEN;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;
    const r = await fetch(url, {
      headers: {
        Authorization: `token ${TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!r.ok) throw new Error(`GitHub API ${r.status}`);

    const json = await r.json();
    const content = Buffer.from(json.content, "base64").toString("utf-8");
    const data = JSON.parse(content);

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
