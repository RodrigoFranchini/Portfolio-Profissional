// Camada de dados do MCP.
// Reaproveita o Config.js do site para que portfólio e servidor MCP nunca divirjam.
import {
  profile,
  sobremim,
  projetos,
  carreira,
  contatos,
} from "../src/config/Config.js";

export const SITE_URL =
  process.env.PORTFOLIO_SITE_URL ||
  "https://portifolio-profissional-virid.vercel.app";

export const SERVER_INFO = {
  name: "portfolio-rodrigo-franchini",
  version: "1.0.0",
  title: "Portfólio de Rodrigo Franchini",
};

export function getProfile() {
  return {
    name: profile.name,
    initials: profile.initials,
    role: profile.role,
    site: SITE_URL,
    resumeUrl: `${SITE_URL}/${encodeURI(profile.cvUrl)}`,
    summary: sobremim.texto1ptbr,
    bio: sobremim.texto2ptbr,
    languages: ["pt-BR"],
  };
}

export function getProjects() {
  return projetos.map((p) => ({
    id: p.id,
    name: p.nome,
    description: p.descricao,
    technologies: p.tecnologias.flatMap((t) =>
      t.split(",").map((s) => s.trim())
    ),
    repository: p.github,
    imageUrl: `${SITE_URL}/${encodeURI(p.imagem)}`,
  }));
}

export function getProject(id) {
  return getProjects().find((p) => p.id === id) || null;
}

export function getCareer() {
  return carreira.map((c) => ({
    id: c.id,
    company: c.empresa,
    title: c.cargo,
    period: c.periodo,
    description: c.descricao,
  }));
}

export function getContactChannels() {
  return {
    email: contatos.email,
    whatsapp: `https://wa.me/${contatos.whatsapp}`,
    linkedin: contatos.linkedin,
    github: contatos.github,
    contactForm: `${SITE_URL}/#contact`,
  };
}

/** Lista única e normalizada de todas as tecnologias citadas nos projetos. */
export function getSkills() {
  const counts = new Map();
  for (const project of getProjects()) {
    for (const tech of project.technologies) {
      const key = tech.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, projectCount]) => ({ name, projectCount }))
    .sort((a, b) => b.projectCount - a.projectCount || a.name.localeCompare(b.name));
}

function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Busca textual simples em projetos, carreira e bio. Retorna trechos com a origem. */
export function searchPortfolio(query, limit = 10) {
  const needle = normalize(query);
  if (!needle) return [];

  const documents = [
    {
      type: "about",
      id: "about",
      title: "Sobre mim",
      text: `${getProfile().summary} ${getProfile().bio}`,
    },
    ...getProjects().map((p) => ({
      type: "project",
      id: p.id,
      title: p.name,
      text: `${p.description} ${p.technologies.join(" ")}`,
      url: p.repository,
    })),
    ...getCareer().map((c) => ({
      type: "experience",
      id: c.id,
      title: `${c.title} — ${c.company}`,
      text: `${c.description} ${c.period}`,
    })),
  ];

  return documents
    .map((doc) => {
      const haystack = normalize(`${doc.title} ${doc.text}`);
      let score = 0;
      for (const term of needle.split(/\s+/).filter(Boolean)) {
        if (haystack.includes(term)) score += 1;
      }
      return { ...doc, score };
    })
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Entrega a mensagem de um agente ao dono do portfólio via Resend.
 * O Web3Forms (usado pelo formulário do site) não serve aqui: no plano gratuito
 * o Cloudflare bloqueia com 403 qualquer envio que não venha de um navegador.
 */
export async function deliverMessage({ from, contact, message, agent }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      delivered: false,
      reason:
        "RESEND_API_KEY não configurada no servidor. Use os canais diretos retornados por get_contact_channels.",
      fallback: getContactChannels(),
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // onboarding@resend.dev só entrega para o e-mail da própria conta Resend;
      // com domínio verificado, defina RESEND_FROM.
      from: process.env.RESEND_FROM || "Portfólio MCP <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO_EMAIL || contatos.email],
      reply_to: contact,
      subject: `[MCP] Mensagem de ${from}`,
      text: `Origem: servidor MCP do portfólio\nDe: ${from} <${contact}>\nAgente: ${agent || "não informado"}\n\n${message}`,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.id) {
    return {
      delivered: false,
      reason: data.message || `Falha no envio (HTTP ${response.status}).`,
      fallback: getContactChannels(),
    };
  }

  return {
    delivered: true,
    message: "Mensagem entregue na caixa de entrada de Rodrigo Franchini.",
  };
}
