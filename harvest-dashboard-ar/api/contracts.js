// api/contracts.js — Reporte de Cosecha AR
// GET  → devuelve contracts_data.json
// POST → add | delete

const OWNER = "gcuki11-bit";
const REPO  = "harvest-dashboard-ar";
const FILE  = "public/contracts_data.json";
const TOKEN = process.env.GITHUB_TOKEN;

async function getFile() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;
  const r = await fetch(url, {
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  const json = await r.json();
  const content = Buffer.from(json.content, "base64").toString("utf-8");
  return { data: JSON.parse(content), sha: json.sha };
}

async function putFile(data, sha, message) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
  const body = { message, content, sha };
  const r = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`GitHub PUT ${r.status}: ${err}`);
  }
  return r.status;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const { data } = await getFile();
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const { action, contract, id } = req.body;
      const { data, sha } = await getFile();

      if (action === "add") {
        const newContract = { ...contract, id: Date.now() };
        data.push(newContract);
        await putFile(data, sha, `contracts: add ${contract.client} - ${contract.item}`);
        return res.status(200).json({ ok: true, contract: newContract });
      }

      if (action === "delete") {
        const filtered = data.filter((c) => String(c.id) !== String(id));
        await putFile(filtered, sha, `contracts: delete id ${id}`);
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: "Unknown action" });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
