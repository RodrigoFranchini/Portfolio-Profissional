// Handler HTTP compartilhado entre a função serverless da Vercel (api/mcp.js)
// e o servidor local de desenvolvimento (mcp/http.js).
//
// Modo stateless: cada requisição cria um servidor e um transporte novos, o que
// é obrigatório em ambientes serverless, onde não há memória entre invocações.
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createPortfolioServer } from "./server.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Authorization, mcp-session-id, mcp-protocol-version, last-event-id",
  "Access-Control-Expose-Headers": "mcp-session-id, mcp-protocol-version",
  "Access-Control-Max-Age": "86400",
};

function applyCors(res) {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.setHeader(key, value);
  }
}

function sendJsonRpcError(res, status, code, message) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({ jsonrpc: "2.0", error: { code, message }, id: null })
  );
}

/**
 * Lê e faz o parse do corpo quando o runtime ainda não o entregou pronto.
 * A Vercel já popula `req.body`; o node:http local, não.
 */
async function readBody(req) {
  if (req.body !== undefined) {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : undefined;
}

export async function handleMcpRequest(req, res) {
  applyCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }

  // Sem sessão não há stream para reabrir nem sessão para encerrar.
  if (req.method === "GET" || req.method === "DELETE") {
    sendJsonRpcError(
      res,
      405,
      -32000,
      "Este endpoint é stateless: use POST com JSON-RPC (Streamable HTTP)."
    );
    return;
  }

  if (req.method !== "POST") {
    sendJsonRpcError(res, 405, -32000, "Método não permitido.");
    return;
  }

  const server = createPortfolioServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });

  try {
    const body = await readBody(req);
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (error) {
    console.error("[mcp] erro ao processar requisição:", error);
    if (!res.headersSent) {
      sendJsonRpcError(res, 500, -32603, "Erro interno do servidor MCP.");
    }
  }
}
