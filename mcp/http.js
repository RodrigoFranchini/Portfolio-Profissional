// Servidor HTTP local para testar o endpoint MCP sem a Vercel.
//   npm run mcp:http  ->  http://localhost:3333/mcp
import { createServer } from "node:http";
import { handleMcpRequest } from "./http-handler.js";
import { SITE_URL } from "./portfolio.js";

const PORT = Number(process.env.MCP_PORT) || 3333;

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);

  if (pathname === "/mcp" || pathname === "/api/mcp") {
    await handleMcpRequest(req, res);
    return;
  }

  if (pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", site: SITE_URL }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found. Use POST /mcp." }));
});

server.listen(PORT, () => {
  console.log(`[mcp] endpoint HTTP em http://localhost:${PORT}/mcp`);
});
