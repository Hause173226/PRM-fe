const baseUrl = "http://160.25.232.148:5000/api";

export default async function handler(req: any, res: any) {
  // Lấy path động từ URL (VD: auth/register)
  const path = req.query.path ? req.query.path.join("/") : "";
  const targetUrl = `${baseUrl}/${path}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json",
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
