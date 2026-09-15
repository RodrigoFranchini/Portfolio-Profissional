# Portfólio — Rodrigo Franchini

Portfólio pessoal desenvolvido com **React** e **Vite** como parte da disciplina
Laboratório de Desenvolvimento de Software — PUC Minas.

Além do site, este projeto é um **servidor MCP (Model Context Protocol)**: agentes
de IA podem se conectar, consultar os dados do portfólio de forma estruturada e
enviar mensagens diretamente para mim — sem precisar raspar o HTML.

---

## 🤖 Servidor MCP

### Endpoint remoto (sem instalar nada)

```
https://portifolio-profissional-virid.vercel.app/api/mcp
```

Transporte **Streamable HTTP**, stateless, sem autenticação.

Configuração para Claude Desktop, Claude Code, Cursor ou qualquer cliente MCP:

```json
{
  "mcpServers": {
    "portfolio-rodrigo": {
      "type": "http",
      "url": "https://portifolio-profissional-virid.vercel.app/api/mcp"
    }
  }
}
```

### Execução local (stdio)

```json
{
  "mcpServers": {
    "portfolio": {
      "command": "node",
      "args": ["mcp/stdio.js"]
    }
  }
}
```

O repositório já traz um `.mcp.json` pronto — o Claude Code detecta o servidor
automaticamente ao abrir o projeto.

### Ferramentas

| Ferramenta | O que faz |
| --- | --- |
| `get_profile` | Nome, cargo, resumo, biografia e link do currículo |
| `list_projects` | Lista os projetos; aceita filtro por `technology` |
| `get_project` | Detalha um projeto pelo `id` |
| `get_career` | Histórico profissional (empresa, cargo, período) |
| `list_skills` | Tecnologias ordenadas por número de projetos |
| `search_portfolio` | Busca em linguagem natural, sem acento-sensibilidade |
| `get_contact_channels` | E-mail, WhatsApp, LinkedIn e GitHub |
| `send_message` | Entrega uma mensagem na minha caixa de entrada |

### Resources

`portfolio://profile` · `portfolio://projects` · `portfolio://career` · `portfolio://resume`

### Prompts

- `apresentar_portfolio` — apresentação ajustada ao público (recrutador, cliente…)
- `avaliar_fit_vaga` — compara uma descrição de vaga com a experiência real

### Descoberta automática

Agentes que chegam pelo site encontram o servidor sozinhos:

- `/.well-known/mcp.json` — manifesto com endpoint e capacidades
- `/llms.txt` — instruções em texto para agentes
- `<link rel="mcp-server">` no `index.html`

---

## 🗂️ Estrutura de diretórios

```text
├── api/
│   └── mcp.js               # endpoint MCP serverless (Vercel)
├── mcp/
│   ├── portfolio.js         # camada de dados (reusa src/config/Config.js)
│   ├── server.js            # tools, resources e prompts
│   ├── stdio.js             # transporte stdio (agentes locais)
│   ├── http-handler.js      # handler HTTP compartilhado
│   ├── http.js              # servidor HTTP local de desenvolvimento
│   └── test-client.js       # smoke test do servidor MCP
├── public/
│   ├── .well-known/mcp.json # descoberta para agentes
│   └── llms.txt
├── src/
│   ├── components/
│   │   ├── Agentes/         # seção "Agentes (MCP)" do site
│   │   ├── Carreira/
│   │   ├── Contato/
│   │   ├── Projetos/
│   │   ├── Sidebar/
│   │   └── SobreMim/
│   ├── config/Config.js     # fonte única de dados (site + MCP)
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
└── vercel.json
```

O `Config.js` é a **fonte única de verdade**: o site e o servidor MCP leem os
mesmos dados, então nunca divergem. Para atualizar o portfólio, edite só esse
arquivo.

---

## 🛠️ Como rodar localmente

Pré-requisito: **Node.js** (inclui o npm).

```bash
npm install

npm run dev          # site em http://localhost:5173
npm run mcp          # servidor MCP via stdio
npm run mcp:http     # endpoint MCP em http://localhost:3333/mcp
npm run mcp:test     # smoke test do servidor MCP (stdio)
npm run mcp:test:vercel  # testa o handler serverless como a Vercel o chama
npm run mcp:verify   # roda os dois
npm run mcp:inspect  # abre o MCP Inspector
npm run lint
npm run build
```

### Variáveis de ambiente

Copie `.env.example` para `.env`:

| Variável | Escopo | Necessária? |
| --- | --- | --- |
| `VITE_WEB3FORMS_ACCESS_KEY` | Browser | Formulário de contato do site |
| `WEB3FORMS_ACCESS_KEY` | Servidor | Tool `send_message` |
| `PORTFOLIO_SITE_URL` | Servidor | Opcional; links absolutos |

`VITE_WEB3FORMS_ACCESS_KEY` só existe no bundle do browser — a função serverless
não enxerga essa variável. Por isso a mesma chave precisa aparecer também como
`WEB3FORMS_ACCESS_KEY`, sem o prefixo `VITE_`.

Localmente os scripts `mcp*` carregam o `.env` via `--env-file-if-exists` (Node
20.6+), então basta preencher o arquivo. Em produção, configure a variável no
painel da Vercel.

Sem `WEB3FORMS_ACCESS_KEY` o servidor MCP continua funcionando normalmente: a
tool `send_message` apenas responde com os canais diretos de contato em vez de
entregar a mensagem.

---

## ☁️ Deploy

Hospedado na Vercel. O `vercel.json` publica o site estático a partir de `dist/`
e a função serverless de `api/mcp.js`. Configure `WEB3FORMS_ACCESS_KEY` nas
variáveis de ambiente do projeto na Vercel para habilitar o `send_message`.

🔗 [Acesse meu portfólio](https://portifolio-profissional-virid.vercel.app/)

---

## 📄 Licença

Licenciado sob **Creative Commons Attribution-NonCommercial 4.0 International
(CC BY-NC 4.0)**.

🔗 [Leia a licença completa](https://creativecommons.org/licenses/by-nc/4.0/legalcode)

---

## 🙌 Créditos

Criado por **Rodrigo Franchini** na disciplina Laboratório de Desenvolvimento de
Software.
