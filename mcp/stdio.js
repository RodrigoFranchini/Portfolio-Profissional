#!/usr/bin/env node
// Transporte stdio: usado por agentes locais (Claude Desktop, Claude Code, etc.).
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createPortfolioServer } from "./server.js";

const server = createPortfolioServer();
const transport = new StdioServerTransport();

await server.connect(transport);

// stdout é o canal JSON-RPC; qualquer log precisa ir para stderr.
console.error("[mcp] portfolio server pronto (stdio)");
