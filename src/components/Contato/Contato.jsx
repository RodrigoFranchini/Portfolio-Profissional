import React, { useRef, useState } from "react";
import { FaEnvelope, FaWhatsapp, FaLinkedin, FaGithub, FaPaperPlane } from "react-icons/fa";
import { contatos } from "../../config/Config";
import "./Contato.css";

export default function Contato() {
  const formRef = useRef(null);
  const [status, setStatus] = useState({ type: "", message: "" });

  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

  function handleWhatsAppUrl() {
    const base = `https://wa.me/${contatos.whatsapp}`;
    const text = encodeURIComponent("Olá! Vi seu portfólio e gostaria de conversar. 🙂");
    return `${base}?text=${text}`;
  }

  function validate(form) {
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if (name.length < 2) return "Informe seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Informe um e-mail válido.";
    if (message.length < 10) return "Escreva uma mensagem um pouco maior.";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    const form = formRef.current;

    if (!accessKey) {
      setStatus({
        type: "error",
        message: "Configuração ausente. Configure VITE_WEB3FORMS_ACCESS_KEY no .env"
      });
      return;
    }

    const error = validate(form);
    if (error) {
      setStatus({ type: "error", message: error });
      return;
    }

    try {
      setStatus({ type: "loading", message: "Enviando..." });

      const formData = new FormData(form);
      formData.append("access_key", accessKey);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStatus({ type: "success", message: "Mensagem enviada com sucesso! 🎉" });
        form.reset();
      } else {
        console.error("Web3Forms error:", data);
        setStatus({
          type: "error",
          message: data.message || "Erro ao enviar. Tente novamente."
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setStatus({
        type: "error",
        message: "Não foi possível enviar agora. Tente novamente mais tarde."
      });
    }
  }

  return (
    <section id="contact" className="contato">
      <header className="contato__header">
        <h1>Contato</h1>
        <p>Fale comigo pelos ícones ou envie uma mensagem pelo formulário.</p>
      </header>

      <div className="contato__icons">
        {contatos.email && (
          <a className="contact-icon" href={`mailto:${contatos.email}`} aria-label="E-mail">
            <FaEnvelope />
          </a>
        )}
        {contatos.whatsapp && (
          <a className="contact-icon" href={handleWhatsAppUrl()} target="_blank" rel="noreferrer" aria-label="WhatsApp">
            <FaWhatsapp />
          </a>
        )}
        {contatos.linkedin && (
          <a className="contact-icon" href={contatos.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <FaLinkedin />
          </a>
        )}
        {contatos.github && (
          <a className="contact-icon" href={contatos.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <FaGithub />
          </a>
        )}
      </div>

      <form ref={formRef} className="contato__form" onSubmit={onSubmit} noValidate>
        <div className="form-row">
          <label htmlFor="name">Nome</label>
          <input id="name" name="name" type="text" placeholder="Seu nome" required />
        </div>

        <div className="form-row">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" placeholder="voce@exemplo.com" required />
        </div>

        <div className="form-row">
          <label htmlFor="message">Mensagem</label>
          <textarea id="message" name="message" rows={6} placeholder="Escreva sua mensagem..." required />
        </div>

        <button type="submit" className="btn-send" disabled={status.type === "loading"}>
          <FaPaperPlane />
          <span>{status.type === "loading" ? "Enviando..." : "Enviar"}</span>
        </button>

        {status.type && status.type !== "loading" && (
          <p className={`form-status form-status--${status.type}`}>{status.message}</p>
        )}
      </form>
    </section>
  );
}
