/**
 * Styles CSS pour le panneau Prometheus
 */
export const PANEL_STYLES = `
/* Conteneur principal - fixed, ne touche pas au layout */
#prometheus-container {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100vh;
  z-index: 2147483647;
  pointer-events: auto;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Panneau */
#prometheus-preview-panel {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}

/* Section des cartes */
.prometheus-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ============================================
   CARTE INDIVIDUELLE
   ============================================ */
.prometheus-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  background: #fff;
}

.prometheus-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}

/* ============================================
   CONTENEUR MEDIA (Screenshot/Gradient + Iframe)
   ============================================ */
.prometheus-media {
  position: relative;
  width: 100%;
  height: 140px;
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  overflow: hidden;
}

.prometheus-media-screenshot {
  /* Le screenshot est défini via style inline */
}

.prometheus-media-gradient {
  /* Le gradient est défini via style inline */
}

/* Overlay gradient pour lisibilité du texte */
.prometheus-media-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0) 40%,
    rgba(0, 0, 0, 0) 60%,
    rgba(0, 0, 0, 0.5) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* Wrapper iframe dans le media */
.prometheus-iframe-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
  background: #fff;
}

.prometheus-card-hovered .prometheus-iframe-wrapper {
  opacity: 1;
}

/* Iframe */
.prometheus-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  transform: scale(0.5);
  transform-origin: top left;
  width: 200%;
  height: 200%;
}

/* Overlay clicable sur l'iframe */
.prometheus-iframe-click-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  cursor: pointer;
  z-index: 3;
}

/* ============================================
   HEADER (Favicon + Titre + Bouton X)
   ============================================ */
.prometheus-card-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  z-index: 10;
}

/* Favicon */
.prometheus-favicon-wrapper {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.prometheus-favicon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.prometheus-favicon-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #333;
  background: #f0f0f0;
}

/* Titre */
.prometheus-title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Bouton blacklist */
.prometheus-blacklist-btn {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease, background 0.2s ease;
  padding: 0;
}

.prometheus-card:hover .prometheus-blacklist-btn {
  opacity: 1;
}

.prometheus-blacklist-btn:hover {
  background: rgba(239, 68, 68, 0.9);
}

/* ============================================
   FOOTER (Badge de visites)
   ============================================ */
.prometheus-card-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  padding: 10px 12px;
  z-index: 10;
}

/* Badge de compteur */
.prometheus-visit-badge {
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

/* ============================================
   ANIMATION DE TRANSITION
   ============================================ */
@keyframes prometheus-transition-out {
  0% {
    transform: scale(1) translateX(0);
    opacity: 1;
  }
  100% {
    transform: scale(1.5) translateX(-50%);
    opacity: 0;
  }
}

.prometheus-transitioning {
  animation: prometheus-transition-out 0.4s ease-out forwards;
}

/* ============================================
   SCROLLBAR
   ============================================ */
#prometheus-container::-webkit-scrollbar {
  width: 6px;
}

#prometheus-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

#prometheus-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

#prometheus-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* ============================================
   INDICATEUR DE CHARGEMENT
   ============================================ */
.prometheus-iframe-wrapper::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  margin: -12px 0 0 -12px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: prometheus-spin 0.8s linear infinite;
  z-index: 1;
}

.prometheus-iframe-wrapper .prometheus-iframe {
  position: relative;
  z-index: 2;
}

@keyframes prometheus-spin {
  to {
    transform: rotate(360deg);
  }
}
`;

