// Dados pessoais do portifólio
export const profile = {
  initials: "RF",
  name: "Rodrigo Franchini Cecchin",
  role: "Desenvolvedor",
};

// Define os ícones da sidebar
export const navItems = [
  { key: "home", label: "Home", icon: "home" },
  { key: "projects", label: "Projetos", icon: "folder" },
  { key: "career", label: "Carreira", icon: "id" },
  { key: "contact", label: "Contato", icon: "send" },
];

// Define o texto que irá aparecer na seção sobre mim
export const sobremim = {
  texto1ptbr: "Desenvolvedor apaixonado por criar soluções inovadoras e eficientes.",
  texto2ptbr: "Com experiência em diversas tecnologias, busco constantemente aprimorar minhas habilidades técnicas e interpessoais, explorando novas ferramentas, linguagens e metodologias. Meu objetivo é aplicar esse conhecimento de forma prática e criativa, contribuindo para o desenvolvimento de soluções robustas, escaláveis e inovadoras.",
  texto1eng:"Developer passionate about creating innovative and efficient solutions.",
  texto2eng:"With experience in various technologies, I am constantly striving to enhance both my technical and interpersonal skills by exploring new tools, languages, and methodologies. My goal is to apply this knowledge in a practical and creative way, contributing to the development of robust, scalable, and innovative solutions."
}

// Lista de projetos do portfólio
export const projetos = [
  {
    id: "entregas-api",
    nome: "Sistema de Entregas Urbanas API",
    descricao:
      "API RESTful desenvolvida com Spring Boot, a API permite gerenciar entregas urbanas com uso de drones, sendo projetada para ser facilmente extensível.",
    tecnologias: ["Java", "Spring Boot", "H2"],
    github: "https://github.com/RodrigoFranchini/Simulador-de-Entregas-Urbanas-API",
    imagem: "Cursosapi.png" 
  },
  {
    id: "sistema-login-firebase",
    nome: "Sistema de Login com Firebase",
    descricao:
      "Sistema de login utilizando a plataforma Firebase, permitindo aos usuários realizar cadastro e acesso direto.",
    tecnologias: ["HTML, CSS, Javascript", "Node.js", "Firebase"],
    github: "https://github.com/RodrigoFranchini/HOEX",
    imagem: "HOExtra.png" 
  },
  {
    id: "desenvolvimento-web-full-stack",
    nome: "Desenvolvimento Web Full Stack",
    descricao:
      "Projeto de documentação e desenvolvimento de uma aplicação para a matéria Desenvolvimento Web.",
    tecnologias: ["React", "Node.js"],
    github: "https://github.com/RodrigoFranchini/Projeto-Dev.-Web-Full-Stack",
    imagem: "web-full-stack.png" 
  },
  {
    id: "java-atividades",
    nome: "Java Atividades",
    descricao:
      "Coletânea de atividades desenvolvidas em Java e utilizando JFrame (GUI).",
    tecnologias: ["Java"],
    github: "https://github.com/RodrigoFranchini/Java-Atividades",
    imagem: "Java-Atividades.png" 
  }
];

// Define os dados da carreira
export const carreira = [
  {
    id: "exp1",
    empresa: "Assembleia Legislativa do Estado de Minas Gerais",
    cargo: "Estagiário",
    periodo: "Dez 2023 – Março 2025",
    descricao:
      "Suporte ao time de analistas e aos softwares do órgão, com foco na automação de workflows e criação de dashboards para acompanhamento de métricas.",
  }
];

// Define os dados do contato
export const contatos = {
  email: "rofranchinicecchin@gmail.com",
  whatsapp: "5531999539901", 
  linkedin: "https://www.linkedin.com/in/rodrigofranchini/",
  github: "https://github.com/RodrigoFranchini"
};

