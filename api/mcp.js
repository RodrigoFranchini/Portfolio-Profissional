// Endpoint MCP remoto: https://<site>/api/mcp
// Agentes se conectam aqui via Streamable HTTP, sem instalar nada.
import { handleMcpRequest } from "../mcp/http-handler.js";

export default async function handler(req, res) {
  await handleMcpRequest(req, res);
}
