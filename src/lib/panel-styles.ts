/**
 * Styles CSS pour le panneau Prometheus
 */
export const PANEL_STYLES = `
/* Conteneur principal - fixed, ne touche pas au layout */
#prometheus-container {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  z-index: 2147483647;
  pointer-events: auto;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
}

/* Panneau */
#prometheus-preview-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}

/* Section des miniatures */
.prometheus-thumbnails {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Miniature individuelle */
.prometheus-thumbnail {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 50px;
}

.prometheus-thumbnail:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateX(-2px);
}

.prometheus-thumbnail-hidden {
  opacity: 0.3;
  pointer-events: none;
}

/* Favicon */
.prometheus-favicon-wrapper {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  overflow: hidden;
}

.prometheus-favicon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.prometheus-favicon-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
}

/* Titre */
.prometheus-title {
  flex: 1;
  font-size: 13px;
  line-height: 1.3;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

/* Badge de compteur */
.prometheus-visit-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* Bouton blacklist */
.prometheus-blacklist-btn {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  padding: 0;
}

.prometheus-thumbnail:hover .prometheus-blacklist-btn {
  opacity: 1;
}

.prometheus-blacklist-btn:hover {
  background: rgba(220, 38, 38, 1);
  transform: scale(1.1);
}

/* Section des iframes */
.prometheus-iframes {
  position: relative;
  flex: 1;
  margin-top: 12px;
}

/* Conteneur iframe */
.prometheus-iframe-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

/* Iframe */
.prometheus-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* Overlay clicable sur l'iframe */
.prometheus-iframe-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  cursor: pointer;
  z-index: 1;
}

.prometheus-iframe-overlay:hover {
  background: rgba(59, 130, 246, 0.05);
}

/* Fallback quand iframe bloqué */
.prometheus-iframe-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  text-align: center;
  background: rgba(0, 0, 0, 0.02);
}

.prometheus-fallback-icon {
  font-size: 48px;
  opacity: 0.5;
}

.prometheus-fallback-text {
  font-size: 14px;
  color: #666;
}

.prometheus-fallback-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.prometheus-fallback-btn:hover {
  background: #2563eb;
}

/* Animation de transition */
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

/* Scrollbar personnalisée */
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
`;

