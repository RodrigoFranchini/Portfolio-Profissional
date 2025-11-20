import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FaHome, FaIdBadge, FaFolderOpen, FaInfoCircle, FaPaperPlane,
  FaAngleDoubleLeft, FaAngleDoubleRight, FaDownload
} from "react-icons/fa";
import { profile, navItems } from "../../config/Config.js";
import "./Sidebar.css";

const iconMap = {
  home:   <FaHome />,
  id:     <FaIdBadge />,
  folder: <FaFolderOpen />,
  info:   <FaInfoCircle />,
  send:   <FaPaperPlane />,
};

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [current, setCurrent] = useState(navItems?.[0]?.key || null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const currentRef = useRef(current);        
  const sidebarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setExpanded(false);
      }
    }
    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  useEffect(() => {
    const sections = navItems
      .map(it => document.getElementById(it.key))
      .filter(Boolean);
    if (!sections.length) return;

    let ticking = false;

    const ANCHOR_FRACTION = 0.5;

    const updateActive = () => {
      const viewportAnchor = window.innerHeight * ANCHOR_FRACTION;

      let bestId = null;
      let bestDist = Infinity;

      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        const secCenter = rect.top + rect.height / 2;
        const dist = Math.abs(secCenter - viewportAnchor);

        if (dist < bestDist) {
          bestDist = dist;
          bestId = sec.id;
        }
      }

      if (bestId && bestId !== currentRef.current) {
        currentRef.current = bestId;
        setCurrent(bestId);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActive();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateActive();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`sidebar ${expanded ? "expanded" : ""}`}
      >
      <div className="sidebar__content">
        <div className="sidebar__brand">
          <div className="brand__avatar">{profile.initials}</div>
          {expanded && (
            <div className="brand__text">
              <span className="brand__title">{profile.name}</span>
              <span className="brand__subtitle">{profile.role}</span>
            </div>
          )}
        </div>

        <nav className="sidebar__nav" aria-label="Navegação principal">
          {navItems.map((it) => (
            <button
              key={it.key}
              className="nav__item"
              type="button"
              data-active={current === it.key ? "true" : "false"}
              aria-current={current === it.key ? "page" : undefined}
              onClick={() => {
                const section = document.getElementById(it.key);
                if (section) {
                  const scrollPosition = it.key === "projects" ? "start" : "center";
                  section.scrollIntoView({ behavior: "smooth", block: scrollPosition });
                }
                currentRef.current = it.key;
                setCurrent(it.key);
                setExpanded(false);
              }}
            >
              <span className="nav__icon">{iconMap[it.icon]}</span>
              {expanded && <span className="nav__label">{it.label}</span>}
            </button>
          ))}

          {profile.cvUrl && (
            <button
              type="button"
              className="nav__item nav__item--download"
              onClick={() => {
                setShowDownloadModal(true);
                setExpanded(false);
              }}
            >
              <span className="nav__icon"><FaDownload /></span>
              {expanded && <span className="nav__label">Download CV</span>}
            </button>
          )}
        </nav>
      </div>

      <button
        className="sidebar__toggle"
        type="button"
        aria-expanded={expanded ? "true" : "false"}
        aria-label={expanded ? "Recolher menu" : "Expandir menu"}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight />}
      </button>
      </aside>

      {showDownloadModal && createPortal(
        <div className="download-modal-overlay" onClick={() => setShowDownloadModal(false)}>
          <div className="download-modal" onClick={(e) => e.stopPropagation()}>
            <div className="download-modal__icon">
              <FaDownload />
            </div>
            <h3 className="download-modal__title">Baixar Currículo?</h3>
            <p className="download-modal__message">
              O arquivo será baixado em formato PDF
            </p>
            <div className="download-modal__actions">
              <button
                className="download-modal__btn download-modal__btn--cancel"
                onClick={() => setShowDownloadModal(false)}
              >
                Cancelar
              </button>
              <a
                href={profile.cvUrl}
                download="Rodrigo_Franchini_CV.pdf"
                className="download-modal__btn download-modal__btn--confirm"
                onClick={() => setShowDownloadModal(false)}
              >
                <FaDownload />
                Baixar
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
