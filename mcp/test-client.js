// Smoke test do servidor MCP: conecta via stdio e exercita tools, resources e prompts.
//   npm run mcp:test
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "portfolio-smoke-test", version: "1.0.0" });

// O servidor é iniciado SEM a chave do Web3Forms de propósito: assim o smoke
// test exercita o caminho de `send_message` sem enviar e-mail de verdade.
await client.connect(
  new StdioClientTransport({
    command: "node",
    args: ["mcp/stdio.js"],
    env: { PATH: process.env.PATH ?? "" },
  })
);

let failures = 0;

async function check(label, fn) {
  try {
    const result = await fn();
    console.log(`ok   ${label} — ${result}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${label} — ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

await check("tools/list", async () => {
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name);
  for (const expected of [
    "get_profile",
    "list_projects",
    "get_project",
    "get_career",
    "list_skills",
    "search_portfolio",
    "get_contact_channels",
    "send_message",
  ]) {
    assert(names.includes(expected), `tool ausente: ${expected}`);
  }
  return `${tools.length} tools`;
});

await check("resources/list", async () => {
  const { resources } = await client.listResources();
  assert(resources.length >= 4, "esperava ao menos 4 resources");
  return resources.map((r) => r.uri).join(", ");
});

await check("prompts/list", async () => {
  const { prompts } = await client.listPrompts();
  assert(prompts.length >= 2, "esperava ao menos 2 prompts");
  return prompts.map((p) => p.name).join(", ");
});

await check("get_profile", async () => {
  const result = await client.callTool({ name: "get_profile", arguments: {} });
  const profile = JSON.parse(result.content[0].text);
  assert(profile.name, "perfil sem nome");
  assert(profile.resumeUrl.endsWith(".pdf"), "resumeUrl deveria apontar para um PDF");
  return profile.name;
});

await check("list_projects (sem filtro)", async () => {
  const result = await client.callTool({ name: "list_projects", arguments: {} });
  const { count } = JSON.parse(result.content[0].text);
  assert(count > 0, "nenhum projeto retornado");
  return `${count} projetos`;
});

await check("list_projects (filtro Java)", async () => {
  const result = await client.callTool({
    name: "list_projects",
    arguments: { technology: "java" },
  });
  const { count, projects } = JSON.parse(result.content[0].text);
  assert(count > 0, "filtro por Java não retornou nada");
  assert(
    projects.every((p) =>
      p.technologies.some((t) => t.toLowerCase().includes("java"))
    ),
    "filtro retornou projeto sem Java"
  );
  return `${count} projetos`;
});

await check("get_project (id inválido)", async () => {
  const result = await client.callTool({
    name: "get_project",
    arguments: { id: "nao-existe" },
  });
  assert(result.isError, "deveria retornar isError para id inexistente");
  return "erro tratado corretamente";
});

await check("search_portfolio", async () => {
  const result = await client.callTool({
    name: "search_portfolio",
    arguments: { query: "spring boot" },
  });
  const { count } = JSON.parse(result.content[0].text);
  assert(count > 0, "busca não retornou resultados");
  return `${count} resultados`;
});

await check("resources/read portfolio://projects", async () => {
  const result = await client.readResource({ uri: "portfolio://projects" });
  const projects = JSON.parse(result.contents[0].text);
  assert(Array.isArray(projects), "resource deveria conter um array");
  return `${projects.length} projetos`;
});

await check("prompts/get apresentar_portfolio", async () => {
  const result = await client.getPrompt({
    name: "apresentar_portfolio",
    arguments: { publico: "recrutador técnico" },
  });
  assert(result.messages.length > 0, "prompt sem mensagens");
  return `${result.messages.length} mensagem(ns)`;
});

await check("send_message degrada sem chave", async () => {
  const result = await client.callTool({
    name: "send_message",
    arguments: {
      from: "Agente de Teste",
      contact: "teste@exemplo.com",
      message: "Mensagem de smoke test, ignore por favor.",
      agent: "smoke-test",
    },
  });
  const payload = JSON.parse(result.content[0].text);
  assert(!payload.delivered, "sem chave, não deveria entregar");
  assert(payload.fallback?.email, "fallback deveria trazer os canais diretos");
  return "devolveu os canais diretos";
});

await check("send_message rejeita e-mail inválido", async () => {
  const result = await client.callTool({
    name: "send_message",
    arguments: {
      from: "Agente de Teste",
      contact: "nao-e-um-email",
      message: "Mensagem de smoke test, ignore por favor.",
    },
  });
  assert(result.isError, "deveria recusar um e-mail malformado");
  return "validação de schema ativa";
});

await client.close();

console.log(
  failures === 0 ? "\nTodos os testes passaram." : `\n${failures} teste(s) falharam.`
);
process.exit(failures === 0 ? 0 : 1);
