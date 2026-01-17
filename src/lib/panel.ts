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
 * Génère un dégradé cohérent basé sur l'URL
 */
function generateGradient(url: string): string {
  // Utiliser un hash simple de l'URL pour générer des couleurs cohérentes
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Générer deux couleurs à partir du hash
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360; // Couleur complémentaire proche
  
  return `linear-gradient(135deg, hsl(${hue1}, 65%, 45%) 0%, hsl(${hue2}, 70%, 35%) 100%)`;
}

/**
 * Crée l'élément de carte pour un lien
 * Structure:
 * - Background: screenshot ou dégradé
 * - Header: favicon + titre
 * - Footer: badge de visites
 * - Au hover: iframe remplace le background
 */
function createCardElement(link: EligibleLink, index: number): HTMLElement {
  const card = document.createElement('div');
  card.className = 'prometheus-card';
  card.dataset.index = String(index);
  card.dataset.url = link.url;
  
  // Conteneur media (screenshot/gradient + iframe au hover)
  const mediaContainer = document.createElement('div');
  mediaContainer.className = 'prometheus-media';
  
  // Background: screenshot ou dégradé
  if (link.screenshot) {
    mediaContainer.style.backgroundImage = `url(${link.screenshot})`;
    mediaContainer.classList.add('prometheus-media-screenshot');
  } else {
    mediaContainer.style.background = generateGradient(link.url);
    mediaContainer.classList.add('prometheus-media-gradient');
  }
  
  // Overlay gradient pour lisibilité du texte
  const overlay = document.createElement('div');
  overlay.className = 'prometheus-media-overlay';
  mediaContainer.appendChild(overlay);
  
  // Conteneur iframe (caché par défaut, affiché au hover)
  const iframeContainer = document.createElement('div');
  iframeContainer.className = 'prometheus-iframe-wrapper';
  mediaContainer.appendChild(iframeContainer);
  
  card.appendChild(mediaContainer);
  
  // Header: favicon + titre
  const header = document.createElement('div');
  header.className = 'prometheus-card-header';
  
  const faviconWrapper = document.createElement('div');
  faviconWrapper.className = 'prometheus-favicon-wrapper';
  
  const favicon = document.createElement('img');
  favicon.className = 'prometheus-favicon';
  favicon.src = link.favicon || '';
  favicon.alt = '';
  favicon.onerror = () => {
    faviconWrapper.innerHTML = `<div class="prometheus-favicon-fallback">${link.title.charAt(0).toUpperCase()}</div>`;
  };
  
  faviconWrapper.appendChild(favicon);
  header.appendChild(faviconWrapper);
  
  const title = document.createElement('div');
  title.className = 'prometheus-title';
  title.textContent = link.title;
  title.title = link.title;
  header.appendChild(title);
  
  // Bouton blacklist (croix)
  const blacklistBtn = document.createElement('button');
  blacklistBtn.className = 'prometheus-blacklist-btn';
  blacklistBtn.innerHTML = '×';
  blacklistBtn.title = 'Ne plus précharger ce lien';
  blacklistBtn.onclick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    await handleBlacklist(link.url);
  };
  header.appendChild(blacklistBtn);
  
  card.appendChild(header);
  
  // Footer: badge de visites
  const footer = document.createElement('div');
  footer.className = 'prometheus-card-footer';
  
  const badge = document.createElement('div');
  badge.className = 'prometheus-visit-badge';
  badge.textContent = String(link.visitCount);
  badge.title = `${link.visitCount} visite${link.visitCount > 1 ? 's' : ''}`;
  footer.appendChild(badge);
  
  card.appendChild(footer);
  
  // Événements hover
  let iframeLoaded = false;
  
  card.addEventListener('mouseenter', () => {
    panelState.hoveredIndex = index;
    
    // Charger l'iframe seulement au premier hover
    if (!iframeLoaded) {
      loadIframeInCard(iframeContainer, link);
      iframeLoaded = true;
    }
    
    // Afficher l'iframe
    card.classList.add('prometheus-card-hovered');
    
    if (callbacks.onLinkHovered) {
      callbacks.onLinkHovered(link.url, index);
    }
  });
  
  card.addEventListener('mouseleave', () => {
    if (panelState.hoveredIndex === index) {
      panelState.hoveredIndex = null;
      
      // Cacher l'iframe
      card.classList.remove('prometheus-card-hovered');
      
      if (callbacks.onLinkUnhovered) {
        callbacks.onLinkUnhovered();
      }
    }
  });
  
  // Clic pour naviguer
  card.addEventListener('click', (e) => {
    // Ne pas naviguer si on clique sur le bouton blacklist
    if ((e.target as HTMLElement).closest('.prometheus-blacklist-btn')) {
      return;
    }
    
    if (callbacks.onLinkClicked) {
      callbacks.onLinkClicked(link.url);
    }
  });
  
  return card;
}

/**
 * Charge l'iframe dans le conteneur de la carte
 */
function loadIframeInCard(container: HTMLElement, link: EligibleLink): void {
  const iframe = document.createElement('iframe');
  iframe.className = 'prometheus-iframe';
  iframe.src = link.url;
  iframe.sandbox.add('allow-same-origin', 'allow-scripts', 'allow-popups', 'allow-forms');
  
  // Overlay clicable pour la navigation
  const clickOverlay = document.createElement('div');
  clickOverlay.className = 'prometheus-iframe-click-overlay';
  
  container.appendChild(iframe);
  container.appendChild(clickOverlay);
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
  
  // Section des cartes
  const cardsSection = document.createElement('div');
  cardsSection.className = 'prometheus-cards';
  
  links.forEach((link, index) => {
    const card = createCardElement(link, index);
    cardsSection.appendChild(card);
  });
  
  panel.appendChild(cardsSection);
  
  // Remplacer le contenu
  container.innerHTML = '';
  container.appendChild(panel);
}

/**
 * Affiche l'iframe pour un index donné
 * Note: Avec la nouvelle architecture, l'iframe est gérée par le hover CSS
 */
export function showIframe(index: number): void {
  const cards = document.querySelectorAll('.prometheus-card');
  cards.forEach((card, i) => {
    if (i === index) {
      card.classList.add('prometheus-card-hovered');
    }
  });
}

/**
 * Cache tous les iframes
 * Note: Avec la nouvelle architecture, l'iframe est gérée par le hover CSS
 */
export function hideIframes(): void {
  const cards = document.querySelectorAll('.prometheus-card');
  cards.forEach((card) => {
    card.classList.remove('prometheus-card-hovered');
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

