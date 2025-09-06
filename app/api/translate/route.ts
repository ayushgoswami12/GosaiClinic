export async function POST(req: Request) {
  try {
    const { text, source = "en", target = "gu" } = await req.json()

    if (!text || !String(text).trim()) {
      return Response.json({ translatedText: "" }, { status: 200 })
    }

    const apiKey = process.env.RAPIDAPI_KEY // server-only var
    if (!apiKey) {
      return Response.json({ error: "Missing RAPIDAPI_KEY" }, { status: 500 })
    }

    const form = new URLSearchParams({ q: text, source, target })

    const upstream = await fetch("https://google-translate1.p.rapidapi.com/language/translate/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "google-translate1.p.rapidapi.com",
      },
      body: form,
      // Do not cache translations
      cache: "no-store",
    })

    const data = await upstream.json().catch(() => ({}))
    const translatedText = data?.data?.translations?.[0]?.translatedText ?? ""

    return Response.json({ translatedText }, { status: upstream.ok ? 200 : upstream.status || 200 })
  } catch (err: any) {
    return Response.json({ error: "Translation failed" }, { status: 500 })
  }
}
