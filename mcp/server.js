// Servidor MCP do portfólio: expõe perfil, projetos, carreira e um canal de
// contato para que agentes possam consultar e conversar com Rodrigo Franchini.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  SERVER_INFO,
  SITE_URL,
  deliverMessage,
  getCareer,
  getContactChannels,
  getProfile,
  getProject,
  getProjects,
  getSkills,
  searchPortfolio,
} from "./portfolio.js";

const INSTRUCTIONS = `Servidor MCP do portfólio de ${getProfile().name}.

Use-o para responder perguntas sobre a experiência, os projetos e as competências
dele, e para entregar mensagens diretamente na caixa de entrada dele.

Guia rápido:
- Visão geral de quem ele é: get_profile
- Projetos (com stack e repositório): list_projects / get_project
- Histórico profissional: get_career
- Pergunta em linguagem natural: search_portfolio
- Falar com ele de verdade: send_message (ou get_contact_channels para os links diretos)

Responda em português quando o usuário escrever em português.`;

/** Empacota um objeto como conteúdo textual + structuredContent. */
function json(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

export function createPortfolioServer() {
  const server = new McpServer(SERVER_INFO, {
    instructions: INSTRUCTIONS,
    capabilities: { tools: {}, resources: {}, prompts: {}, logging: {} },
  });

  registerResources(server);
  registerTools(server);
  registerPrompts(server);

  return server;
}

function registerResources(server) {
  server.registerResource(
    "profile",
    "portfolio://profile",
    {
      title: "Perfil",
      description: "Nome, cargo, resumo profissional e link do currículo.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(getProfile(), null, 2),
        },
      ],
    })
  );

  server.registerResource(
    "projects",
    "portfolio://projects",
    {
      title: "Projetos",
      description: "Catálogo completo de projetos com stack e repositórios.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(getProjects(), null, 2),
        },
      ],
    })
  );

  server.registerResource(
    "career",
    "portfolio://career",
    {
      title: "Carreira",
      description: "Experiências profissionais em ordem cronológica.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(getCareer(), null, 2),
        },
      ],
    })
  );

  server.registerResource(
    "resume",
    "portfolio://resume",
    {
      title: "Currículo (PDF)",
      description: "Link direto para o currículo em PDF.",
      mimeType: "text/plain",
    },
    async (uri) => ({
      contents: [
        { uri: uri.href, mimeType: "text/plain", text: getProfile().resumeUrl },
      ],
    })
  );
}

function registerTools(server) {
  const readOnly = { readOnlyHint: true, openWorldHint: false };

  server.registerTool(
    "get_profile",
    {
      title: "Obter perfil",
      description:
        "Retorna nome, cargo, resumo, biografia, site e link do currículo de Rodrigo Franchini. Comece por aqui.",
      inputSchema: {},
      annotations: readOnly,
    },
    async () => json(getProfile())
  );

  server.registerTool(
    "list_projects",
    {
      title: "Listar projetos",
      description:
        "Lista os projetos do portfólio. Use `technology` para filtrar por stack (ex.: 'Java', 'React').",
      inputSchema: {
        technology: z
          .string()
          .optional()
          .describe("Filtra projetos que usam esta tecnologia (case-insensitive)."),
      },
      annotations: readOnly,
    },
    async ({ technology }) => {
      const all = getProjects();
      if (!technology) return json({ count: all.length, projects: all });

      const needle = technology.trim().toLowerCase();
      // Prioriza correspondência exata para que "java" não traga "Javascript".
      const exact = all.filter((p) =>
        p.technologies.some((t) => t.toLowerCase() === needle)
      );
      const projects = exact.length
        ? exact
        : all.filter((p) =>
            p.technologies.some((t) => t.toLowerCase().includes(needle))
          );

      return json({ count: projects.length, technology, projects });
    }
  );

  server.registerTool(
    "get_project",
    {
      title: "Detalhar projeto",
      description: "Retorna um projeto específico pelo id.",
      inputSchema: {
        id: z
          .string()
          .describe(`Id do projeto, ex.: ${getProjects().map((p) => p.id).join(", ")}`),
      },
      annotations: readOnly,
    },
    async ({ id }) => {
      const project = getProject(id);
      if (!project) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Projeto "${id}" não encontrado. Ids válidos: ${getProjects()
                .map((p) => p.id)
                .join(", ")}.`,
            },
          ],
        };
      }
      return json(project);
    }
  );

  server.registerTool(
    "get_career",
    {
      title: "Obter carreira",
      description:
        "Retorna o histórico profissional: empresa, cargo, período e responsabilidades.",
      inputSchema: {},
      annotations: readOnly,
    },
    async () => json({ experiences: getCareer() })
  );

  server.registerTool(
    "list_skills",
    {
      title: "Listar competências",
      description:
        "Retorna as tecnologias presentes no portfólio, ordenadas por quantidade de projetos.",
      inputSchema: {},
      annotations: readOnly,
    },
    async () => json({ skills: getSkills() })
  );

  server.registerTool(
    "search_portfolio",
    {
      title: "Buscar no portfólio",
      description:
        "Busca livre em projetos, experiências e biografia. Ideal para perguntas em linguagem natural como 'ele já trabalhou com Docker?'.",
      inputSchema: {
        query: z.string().min(2).describe("Termos de busca."),
        limit: z.number().int().min(1).max(25).optional().describe("Máximo de resultados (padrão 10)."),
      },
      annotations: readOnly,
    },
    async ({ query, limit }) => {
      const results = searchPortfolio(query, limit ?? 10);
      return json({ query, count: results.length, results });
    }
  );

  server.registerTool(
    "get_contact_channels",
    {
      title: "Canais de contato",
      description:
        "Retorna e-mail, WhatsApp, LinkedIn e GitHub para contato direto com Rodrigo.",
      inputSchema: {},
      annotations: readOnly,
    },
    async () => json(getContactChannels())
  );

  server.registerTool(
    "send_message",
    {
      title: "Enviar mensagem",
      description:
        "Entrega uma mensagem na caixa de entrada de Rodrigo Franchini. Use para propostas, dúvidas ou oportunidades. Confirme o texto com o usuário antes de enviar.",
      inputSchema: {
        from: z.string().min(2).describe("Nome de quem está enviando."),
        contact: z
          .string()
          .email()
          .describe("E-mail de retorno de quem está enviando."),
        message: z.string().min(10).describe("Conteúdo da mensagem."),
        agent: z
          .string()
          .optional()
          .describe("Nome do agente/assistente que está enviando, se aplicável."),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      const result = await deliverMessage(args);
      return { ...json(result), isError: !result.delivered };
    }
  );
}

function registerPrompts(server) {
  server.registerPrompt(
    "apresentar_portfolio",
    {
      title: "Apresentar o portfólio",
      description:
        "Gera uma apresentação do portfólio de Rodrigo ajustada ao público desejado.",
      argsSchema: {
        publico: z
          .string()
          .optional()
          .describe("Para quem apresentar (ex.: 'recrutador técnico', 'cliente')."),
      },
    },
    ({ publico }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Use as ferramentas get_profile, list_projects e get_career deste servidor MCP e monte uma apresentação de ${
              getProfile().name
            } para ${publico || "um recrutador técnico"}. Destaque projetos concretos e a stack de cada um. Termine oferecendo o contato via send_message. Site: ${SITE_URL}`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "avaliar_fit_vaga",
    {
      title: "Avaliar aderência a uma vaga",
      description:
        "Compara a descrição de uma vaga com a experiência e os projetos do portfólio.",
      argsSchema: {
        vaga: z.string().describe("Descrição ou requisitos da vaga."),
      },
    },
    ({ vaga }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Consulte list_skills, list_projects e get_career neste servidor MCP e avalie a aderência de ${
              getProfile().name
            } à vaga abaixo. Aponte pontos fortes com evidência (projeto ou experiência específica) e lacunas reais, sem inventar.\n\n---\n${vaga}\n---`,
          },
        },
      ],
    })
  );
}
