const baseUrl = "http://160.25.232.148:5000/api";

export default async function handler(req: any, res: any) {
  const targetUrl = baseUrl + req.url;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...req.headers,
      },
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (error: any) {
    console.error("Proxy error:", error);
    res.status(500).json({ message: "Proxy failed", error: error.message });
  }
}
