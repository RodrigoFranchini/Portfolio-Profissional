import "./SobreMim.css";
import { profile, sobremim } from "../../config/Config.js";

export default function SobreMim() {
  return (
    <section id="home" className="sobre-mim">
      <div className="sobre-mim__container">
        <div className="sobre-mim__imagem">
          <img src="Foto de Perfil.jpeg" alt={profile.name} />
        </div>

        <div className="sobre-mim__texto">
          <h1 className="sobre-mim__titulo">{profile.name}</h1>

          <h2 className="sobre-mim__subtitulo">Sobre Mim</h2>
          <p className="sobre-mim__paragrafo">{sobremim.texto1ptbr}</p>
          <p className="sobre-mim__paragrafo">{sobremim.texto2ptbr}</p>
        </div>
      </div>
    </section>
  );
}
