import { incrementVisitCount } from './storage';
import { normalizeUrl, toAbsoluteUrl, isValidPageUrl } from './url-utils';

/**
 * Debounce pour éviter les double-comptes
 */
const recentClicks = new Map<string, number>();
const DEBOUNCE_MS = 1000;

/**
 * Vérifie si un clic a déjà été enregistré récemment
 */
function isRecentClick(url: string): boolean {
  const lastClick = recentClicks.get(url);
  if (!lastClick) return false;
  
  const now = Date.now();
  if (now - lastClick < DEBOUNCE_MS) {
    return true;
  }
  
  recentClicks.delete(url);
  return false;
}

/**
 * Enregistre un clic
 */
function recordClick(url: string): void {
  recentClicks.set(url, Date.now());
}

/**
 * Nettoie les anciens clics du cache
 */
function cleanupRecentClicks(): void {
  const now = Date.now();
  for (const [url, timestamp] of recentClicks.entries()) {
    if (now - timestamp > DEBOUNCE_MS * 2) {
      recentClicks.delete(url);
    }
  }
}

// Nettoyage périodique
setInterval(cleanupRecentClicks, 5000);

/**
 * Gère le clic sur un lien et incrémente le compteur de visites
 */
async function handleLinkClick(event: MouseEvent): Promise<void> {
  const target = event.target as HTMLElement;
  
  // Trouver l'élément <a> parent si on a cliqué sur un enfant
  const anchor = target.closest('a') as HTMLAnchorElement | null;
  if (!anchor || !anchor.href) return;
  
  try {
    // Convertir en URL absolue
    const absoluteUrl = toAbsoluteUrl(anchor.href);
    
    // Vérifier que c'est une page valide
    if (!isValidPageUrl(absoluteUrl)) return;
    
    // Normaliser l'URL
    const normalizedUrl = normalizeUrl(absoluteUrl);
    
    // Vérifier le debounce
    if (isRecentClick(normalizedUrl)) return;
    
    // Enregistrer le clic
    recordClick(normalizedUrl);
    
    // Incrémenter le compteur de visites
    await incrementVisitCount(normalizedUrl);
    
    console.log('[Prometheus] Visit tracked:', normalizedUrl);
  } catch (error) {
    console.error('[Prometheus] Error tracking visit:', error);
  }
}

/**
 * Initialise le tracking des clics sur les liens
 */
export function initLinkTracking(): () => void {
  // Utiliser la phase de capture pour intercepter tous les clics
  document.addEventListener('click', handleLinkClick, true);
  
  // Retourner une fonction de nettoyage
  return () => {
    document.removeEventListener('click', handleLinkClick, true);
  };
}

