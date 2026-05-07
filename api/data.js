// api/data.js — Reporte de Cosecha AR
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
    const raw = JSON.parse(content);

    // Si ya viene en formato campaigns, pasar directo
    if (raw.campaigns) return res.status(200).json(raw);

    // Transformar {harvest, movements} → formato campaigns esperado por el HTML
    const harvest   = raw.harvest   || [];
    const movements = raw.movements || [];

    // Agrupar por campaña extraída del job_no
    const campaignMap = {};
    for (const row of harvest) {
      const match = (row.job_no || "").match(/(\d{2}\/\d{2})$/);
      const campName = match ? `Campaña ${match[1]}` : "Campaña 25/26";
      if (!campaignMap[campName]) campaignMap[campName] = [];
      campaignMap[campName].push({
        "Farm Code":            row.farm,
        "Job Crop":             row.crop,
        "Irrigated":            row.irrigated,
        "Plot Code":            row.plot,
        "Hectares Farmed":      row.ha_total,
        "Harvested Hectares":   row.ha_done,
        "Hectares Remaining":   row.ha_rem,
        "Total (t)":            row.prod_t,
        "Yield to Date (t/ha)": row.yield_real,
        "Est. Yield (t/Ha)":    row.yield_est,
        "Est. Total (t)":       row.prod_est,
        "Diff. Yield (%)":      row.diff_pct,
        "Current Price (LCY)":  row.price_cur,
        "Current Amount (LCY)": row.amount_cur,
        "Est. Price (LCY)":     row.price_est,
        "Est. Amount (LCY)":    row.amount_est,
        "Job No.":              row.job_no,
      });
    }

    const campaign_names = Object.keys(campaignMap).sort();

    const sales = movements.map(m => ({
      client: m.bin_code, item: m.item, farm: m.farm,
      qty_tn: m.qty_tn, qty_origin_tn: m.qty_origin_tn, has_dest: m.has_dest,
      humidity_kg: m.humidity_kg, humidity_pct: m.humidity_pct,
      contam_kg: m.contam_kg, contam_pct: m.contam_pct,
      descuento_tn: m.descuento_tn, date: m.date, ticket: m.ticket,
      source: "Carta de Porte",
    }));

    res.status(200).json({
      updated_at:       raw.updated_at || new Date().toISOString(),
      source_file:      "Reporte de Cosecha ARG - Database.xlsx",
      campaigns:        campaignMap,
      campaign_names:   campaign_names,
      total_plots:      harvest.length,
      comercializacion: { sales, contracts: [] },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
