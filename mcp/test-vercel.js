// Simula o ambiente da Vercel: a plataforma entrega `req.body` já parseado,
// caminho diferente do servidor local (que lê o stream bruto).
//   node mcp/test-vercel.js
import { createServer } from "node:http";
import handler from "../api/mcp.js";

const server = createServer(async (req, res) => {
  // Vercel popula req.body antes de chamar o handler.
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (raw) req.body = JSON.parse(raw);

  await handler(req, res);
});

await new Promise((resolve) => server.listen(0, resolve));
const base = `http://localhost:${server.address().port}`;

let failures = 0;

async function rpc(method, params) {
  const response = await fetch(base, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  return { status: response.status, body: await response.json() };
}

async function check(label, fn) {
  try {
    console.log(`ok   ${label} — ${await fn()}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${label} — ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

await check("initialize (body pré-parseado)", async () => {
  const { status, body } = await rpc("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "vercel-sim", version: "1.0.0" },
  });
  assert(status === 200, `esperava 200, recebi ${status}`);
  assert(body.result?.serverInfo?.name, "sem serverInfo na resposta");
  return body.result.serverInfo.name;
});

await check("tools/list", async () => {
  const { body } = await rpc("tools/list", {});
  assert(body.result?.tools?.length === 8, "esperava 8 tools");
  return `${body.result.tools.length} tools`;
});

await check("tools/call get_profile", async () => {
  const { body } = await rpc("tools/call", {
    name: "get_profile",
    arguments: {},
  });
  const profile = JSON.parse(body.result.content[0].text);
  assert(profile.name, "perfil sem nome");
  return profile.name;
});

await check("resources/read", async () => {
  const { body } = await rpc("resources/read", { uri: "portfolio://projects" });
  const projects = JSON.parse(body.result.contents[0].text);
  return `${projects.length} projetos`;
});

await check("CORS liberado no preflight", async () => {
  const response = await fetch(base, { method: "OPTIONS" });
  assert(response.status === 204, `esperava 204, recebi ${response.status}`);
  assert(
    response.headers.get("access-control-allow-origin") === "*",
    "header CORS ausente"
  );
  return "204 + Access-Control-Allow-Origin";
});

await check("GET recebe 405 (endpoint é stateless)", async () => {
  const response = await fetch(base, { method: "GET" });
  assert(response.status === 405, `esperava 405, recebi ${response.status}`);
  return "405";
});

server.close();

console.log(
  failures === 0
    ? "\nO handler da Vercel está pronto para deploy."
    : `\n${failures} verificação(ões) falharam.`
);
process.exit(failures === 0 ? 0 : 1);
