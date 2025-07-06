import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    if (!req.body || !req.body.data) {
      console.log("❌ Proxy CAPI: Payload inválido recebido:", req.body);
      return res.status(400).json({ error: "Payload inválido - campo 'data' obrigatório" });
    }

    const payload = {
      ...req.body,
      client_ip_address: req.headers["x-forwarded-for"] || undefined
    };

    console.log("🔄 Proxy CAPI: Enviando para Meta...");
    console.log("📊 Proxy CAPI: Pixel ID:", "703302575818162");
    console.log("📊 Proxy CAPI: Payload size:", JSON.stringify(payload).length, "bytes");

    const response = await fetch(
      "https://graph.facebook.com/v19.0/703302575818162/events?access_token=EAAQfmxkTTZCcBPMtbiRdOTtGC1LycYJsKXnFZCs3N04MsoBjbx5WdvaPhObbtmKg3iDZBJZAjAlpzqWAr80uEUsUSm95bVCODpzJSsC3X6gA9u6yPC3oDko8gUIMW2SA5C7MOsZBvmyVN72N38UcMKp8uGbQaPxe9r5r66H6PAXuZCieIl6gPIFU5c2ympRwZDZD",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    console.log("✅ Proxy CAPI: Resposta da Meta - Status:", response.status);
    console.log("✅ Proxy CAPI: Resposta da Meta - Data:", data);

    if (response.ok) {
      console.log("✅ Proxy CAPI: Evento enviado com SUCESSO!");
    } else {
      console.log("❌ Proxy CAPI: Erro na resposta da Meta:", response.status, data);
    }

    res.status(response.status).json(data);
  } catch (err) {
    console.error("❌ Erro no Proxy CAPI:", err);
    res.status(500).json({ error: "Erro interno no servidor CAPI." });
  }
}
