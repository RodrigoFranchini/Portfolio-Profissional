import React, { useState } from "react";
import { FaRobot, FaCopy, FaCheck, FaGithub } from "react-icons/fa";
import { mcp } from "../../config/Config";
import "./Agentes.css";

const claudeConfig = `{
  "mcpServers": {
    "portfolio-rodrigo": {
      "type": "http",
      "url": "${mcp.endpoint}"
    }
  }
}`;

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className="agentes__copy" onClick={copy} aria-label={label}>
      {copied ? <FaCheck /> : <FaCopy />}
      <span>{copied ? "Copiado" : "Copiar"}</span>
    </button>
  );
}

export default function Agentes() {
  return (
    <section id="agents" className="agentes">
      <header className="agentes__header">
        <div className="agentes__title">
          <FaRobot aria-hidden="true" />
          <h1>Agentes (MCP)</h1>
        </div>
        <p>{mcp.descricao}</p>
      </header>

      <div className="agentes__endpoint">
        <div className="agentes__endpoint-info">
          <span className="agentes__label">Endpoint · {mcp.transport}</span>
          <code className="agentes__url">{mcp.endpoint}</code>
        </div>
        <CopyButton value={mcp.endpoint} label="Copiar endpoint MCP" />
      </div>

      <div className="agentes__grid">
        <div className="agentes__card">
          <h2 className="agentes__card-title">Ferramentas expostas</h2>
          <ul className="agentes__tools">
            {mcp.ferramentas.map((tool) => (
              <li key={tool.nome} className="agentes__tool">
                <code>{tool.nome}</code>
                <span>{tool.descricao}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="agentes__card">
          <h2 className="agentes__card-title">Como conectar</h2>
          <p className="agentes__hint">
            Adicione ao arquivo de configuração MCP do seu cliente (Claude Desktop,
            Claude Code, Cursor ou qualquer cliente compatível):
          </p>
          <div className="agentes__code-wrap">
            <pre className="agentes__code">
              <code>{claudeConfig}</code>
            </pre>
            <CopyButton value={claudeConfig} label="Copiar configuração MCP" />
          </div>
          <a
            className="agentes__repo"
            href={mcp.repoUrl}
            target="_blank"
            rel="noreferrer"
          >
            <FaGithub aria-hidden="true" />
            <span>Ver o código do servidor</span>
          </a>
        </div>
      </div>
    </section>
  );
}
