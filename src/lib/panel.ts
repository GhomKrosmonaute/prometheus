import type { EligibleLink, PanelState } from './types';
import { addToBlacklist } from './storage';
import { PANEL_STYLES } from './panel-styles';

/**
 * ID du conteneur du panneau
 */
const PANEL_ID = 'prometheus-preview-panel';
const PANEL_CONTAINER_ID = 'prometheus-container';

/**
 * État du panneau
 */
let panelState: PanelState = {
  isVisible: false,
  links: [],
  hoveredIndex: null,
  preloadedUrls: new Set(),
};

/**
 * Callbacks pour les événements du panneau
 */
interface PanelCallbacks {
  onLinkBlacklisted?: (url: string) => void;
  onLinkClicked?: (url: string) => void;
  onLinkHovered?: (url: string, index: number) => void;
  onLinkUnhovered?: () => void;
}

let callbacks: PanelCallbacks = {};

/**
 * Récupère le fond du body du site
 */
function getBodyBackground(): string {
  const bodyStyle = window.getComputedStyle(document.body);
  const bg = bodyStyle.backgroundColor;
  
  // Si transparent ou invalide, utiliser un fond neutre
  if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
    return '#ffffff';
  }
  
  return bg;
}

/**
 * Crée l'élément de miniature pour un lien
 */
function createThumbnailElement(link: EligibleLink, index: number): HTMLElement {
  const thumbnail = document.createElement('div');
  thumbnail.className = 'prometheus-thumbnail';
  thumbnail.dataset.index = String(index);
  thumbnail.dataset.url = link.url;
  
  // Favicon
  const faviconWrapper = document.createElement('div');
  faviconWrapper.className = 'prometheus-favicon-wrapper';
  
  const favicon = document.createElement('img');
  favicon.className = 'prometheus-favicon';
  favicon.src = link.favicon || '';
  favicon.alt = '';
  favicon.onerror = () => {
    // Fallback: afficher la première lettre du titre
    faviconWrapper.innerHTML = `<div class="prometheus-favicon-fallback">${link.title.charAt(0).toUpperCase()}</div>`;
  };
  
  faviconWrapper.appendChild(favicon);
  thumbnail.appendChild(faviconWrapper);
  
  // Titre
  const title = document.createElement('div');
  title.className = 'prometheus-title';
  title.textContent = link.title;
  title.title = link.title;
  thumbnail.appendChild(title);
  
  // Badge de compteur de visites
  const badge = document.createElement('div');
  badge.className = 'prometheus-visit-badge';
  badge.textContent = String(link.visitCount);
  badge.title = `${link.visitCount} visite${link.visitCount > 1 ? 's' : ''}`;
  thumbnail.appendChild(badge);
  
  // Bouton blacklist (croix)
  const blacklistBtn = document.createElement('button');
  blacklistBtn.className = 'prometheus-blacklist-btn';
  blacklistBtn.innerHTML = '×';
  blacklistBtn.title = 'Ne plus précharger ce lien';
  blacklistBtn.onclick = async (e) => {
    e.stopPropagation();
    await handleBlacklist(link.url);
  };
  thumbnail.appendChild(blacklistBtn);
  
  // Événements hover
  thumbnail.addEventListener('mouseenter', () => {
    panelState.hoveredIndex = index;
    if (callbacks.onLinkHovered) {
      callbacks.onLinkHovered(link.url, index);
    }
  });
  
  thumbnail.addEventListener('mouseleave', () => {
    if (panelState.hoveredIndex === index) {
      panelState.hoveredIndex = null;
      if (callbacks.onLinkUnhovered) {
        callbacks.onLinkUnhovered();
      }
    }
  });
  
  return thumbnail;
}

/**
 * Crée le conteneur iframe pour un lien
 */
function createIframeElement(link: EligibleLink, index: number): HTMLElement {
  const container = document.createElement('div');
  container.className = 'prometheus-iframe-container';
  container.dataset.index = String(index);
  container.dataset.url = link.url;
  container.style.display = 'none';
  
  const iframe = document.createElement('iframe');
  iframe.className = 'prometheus-iframe';
  iframe.src = link.url;
  iframe.sandbox.add('allow-same-origin', 'allow-scripts', 'allow-popups', 'allow-forms');
  
  // Gestion des erreurs de chargement
  iframe.onerror = () => {
    showIframeFallback(container, link);
  };
  
  // Intercepter les clics dans l'iframe
  iframe.addEventListener('load', () => {
    try {
      // Note: ne fonctionnera que si same-origin
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.addEventListener('click', (e) => {
          e.preventDefault();
          if (callbacks.onLinkClicked) {
            callbacks.onLinkClicked(link.url);
          }
        });
      }
    } catch {
      // Cross-origin, on ne peut pas intercepter
      // L'utilisateur devra cliquer sur l'overlay
    }
  });
  
  container.appendChild(iframe);
  
  // Overlay clicable pour la navigation
  const overlay = document.createElement('div');
  overlay.className = 'prometheus-iframe-overlay';
  overlay.onclick = () => {
    if (callbacks.onLinkClicked) {
      callbacks.onLinkClicked(link.url);
    }
  };
  container.appendChild(overlay);
  
  return container;
}

/**
 * Affiche un fallback quand l'iframe ne peut pas charger
 */
function showIframeFallback(container: HTMLElement, link: EligibleLink): void {
  container.innerHTML = `
    <div class="prometheus-iframe-fallback">
      <div class="prometheus-fallback-icon">🔒</div>
      <div class="prometheus-fallback-text">Aperçu indisponible</div>
      <button class="prometheus-fallback-btn">Ouvrir le lien</button>
    </div>
  `;
  
  const btn = container.querySelector('.prometheus-fallback-btn') as HTMLButtonElement;
  if (btn) {
    btn.onclick = () => {
      if (callbacks.onLinkClicked) {
        callbacks.onLinkClicked(link.url);
      }
    };
  }
}

/**
 * Gère l'ajout d'un lien à la blacklist
 */
async function handleBlacklist(url: string): Promise<void> {
  await addToBlacklist(url);
  
  if (callbacks.onLinkBlacklisted) {
    callbacks.onLinkBlacklisted(url);
  }
  
  // Retirer le lien du panneau
  panelState.links = panelState.links.filter(link => link.url !== url);
  
  if (panelState.links.length === 0) {
    hidePanel();
  } else {
    renderPanel(panelState.links);
  }
}

/**
 * Crée et injecte le panneau dans la page
 */
export function createPanel(links: EligibleLink[], panelCallbacks: PanelCallbacks = {}): void {
  callbacks = panelCallbacks;
  panelState.links = links;
  panelState.isVisible = true;
  
  // Vérifier si le panneau existe déjà
  let container = document.getElementById(PANEL_CONTAINER_ID);
  
  if (!container) {
    // Injecter les styles
    injectStyles();
    
    // Créer le conteneur principal
    container = document.createElement('div');
    container.id = PANEL_CONTAINER_ID;
    
    const bgColor = getBodyBackground();
    container.style.backgroundColor = bgColor;
    
    document.body.appendChild(container);
  }
  
  renderPanel(links);
}

/**
 * Rend le contenu du panneau
 */
function renderPanel(links: EligibleLink[]): void {
  const container = document.getElementById(PANEL_CONTAINER_ID);
  if (!container) return;
  
  // Créer le panneau
  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  
  // Section des miniatures
  const thumbnailsSection = document.createElement('div');
  thumbnailsSection.className = 'prometheus-thumbnails';
  
  links.forEach((link, index) => {
    const thumbnail = createThumbnailElement(link, index);
    thumbnailsSection.appendChild(thumbnail);
  });
  
  panel.appendChild(thumbnailsSection);
  
  // Section des iframes
  const iframesSection = document.createElement('div');
  iframesSection.className = 'prometheus-iframes';
  
  links.forEach((link, index) => {
    const iframeContainer = createIframeElement(link, index);
    iframesSection.appendChild(iframeContainer);
  });
  
  panel.appendChild(iframesSection);
  
  // Remplacer le contenu
  container.innerHTML = '';
  container.appendChild(panel);
}

/**
 * Affiche l'iframe pour un index donné
 */
export function showIframe(index: number): void {
  const iframes = document.querySelectorAll('.prometheus-iframe-container');
  const thumbnails = document.querySelectorAll('.prometheus-thumbnail');
  
  iframes.forEach((iframe, i) => {
    const el = iframe as HTMLElement;
    el.style.display = i === index ? 'block' : 'none';
  });
  
  thumbnails.forEach((thumb, i) => {
    if (i === index) {
      thumb.classList.add('prometheus-thumbnail-hidden');
    } else {
      thumb.classList.remove('prometheus-thumbnail-hidden');
    }
  });
}

/**
 * Cache tous les iframes et réaffiche les miniatures
 */
export function hideIframes(): void {
  const iframes = document.querySelectorAll('.prometheus-iframe-container');
  const thumbnails = document.querySelectorAll('.prometheus-thumbnail');
  
  iframes.forEach((iframe) => {
    (iframe as HTMLElement).style.display = 'none';
  });
  
  thumbnails.forEach((thumb) => {
    thumb.classList.remove('prometheus-thumbnail-hidden');
  });
}

/**
 * Cache le panneau
 */
export function hidePanel(): void {
  const container = document.getElementById(PANEL_CONTAINER_ID);
  if (container) {
    container.remove();
  }
  
  panelState.isVisible = false;
  panelState.hoveredIndex = null;
}

/**
 * Vérifie si le panneau est visible
 */
export function isPanelVisible(): boolean {
  return panelState.isVisible;
}

/**
 * Récupère l'état actuel du panneau
 */
export function getPanelState(): PanelState {
  return { ...panelState };
}

/**
 * Injecte les styles CSS dans la page
 */
function injectStyles(): void {
  // Vérifier si les styles sont déjà injectés
  if (document.getElementById('prometheus-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'prometheus-styles';
  style.textContent = PANEL_STYLES;
  document.head.appendChild(style);
}

