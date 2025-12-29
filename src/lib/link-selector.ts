import type { EligibleLink, VisitCount } from './types';
import { 
  normalizeUrl, 
  toAbsoluteUrl, 
  isValidPageUrl, 
  isBlacklisted,
  getFaviconUrl,
  getLinkTitle 
} from './url-utils';
import { getAllVisitCounts } from './storage';

/**
 * Vérifie si un élément est visible et clicable
 */
function isElementVisible(element: HTMLElement): boolean {
  // Vérifier si l'élément est caché
  if (element.offsetParent === null) return false;
  
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  
  return true;
}

/**
 * Extrait tous les liens éligibles de la page
 */
export async function extractEligibleLinks(
  blacklist: string[],
  maxCount: number = 5
): Promise<EligibleLink[]> {
  // Récupérer tous les compteurs de visites
  const visitCounts = await getAllVisitCounts();
  
  // Extraire tous les liens <a> de la page
  const anchors = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
  
  const eligibleLinks: EligibleLink[] = [];
  const seenUrls = new Set<string>();
  
  for (const anchor of anchors) {
    try {
      // Vérifier la visibilité
      if (!isElementVisible(anchor)) continue;
      
      // Convertir en URL absolue
      const absoluteUrl = toAbsoluteUrl(anchor.href);
      
      // Vérifier que c'est une page valide
      if (!isValidPageUrl(absoluteUrl)) continue;
      
      // Normaliser l'URL
      const normalizedUrl = normalizeUrl(absoluteUrl);
      
      // Éviter les doublons
      if (seenUrls.has(normalizedUrl)) continue;
      seenUrls.add(normalizedUrl);
      
      // Vérifier la blacklist
      if (isBlacklisted(normalizedUrl, blacklist)) continue;
      
      // Vérifier si l'URL a été visitée
      const visitCount = visitCounts[normalizedUrl];
      if (!visitCount || visitCount.count === 0) continue;
      
      // Ajouter à la liste des liens éligibles
      eligibleLinks.push({
        url: normalizedUrl,
        element: anchor,
        visitCount: visitCount.count,
        lastVisitedAt: visitCount.lastVisitedAt,
        title: getLinkTitle(anchor),
        favicon: getFaviconUrl(normalizedUrl),
      });
    } catch (error) {
      console.error('[Prometheus] Error processing link:', error);
    }
  }
  
  // Trier par nombre de visites (décroissant), puis par date de dernière visite
  eligibleLinks.sort((a, b) => {
    if (b.visitCount !== a.visitCount) {
      return b.visitCount - a.visitCount;
    }
    return b.lastVisitedAt - a.lastVisitedAt;
  });
  
  // Limiter au nombre demandé
  return eligibleLinks.slice(0, maxCount);
}

/**
 * Observe les changements du DOM pour détecter les nouveaux liens
 */
export function observeDOMChanges(callback: () => void): () => void {
  const observer = new MutationObserver((mutations) => {
    // Vérifier si des liens ont été ajoutés/modifiés
    let hasLinkChanges = false;
    
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === 'A' || element.querySelector('a')) {
              hasLinkChanges = true;
              break;
            }
          }
        }
      }
    }
    
    if (hasLinkChanges) {
      callback();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  return () => observer.disconnect();
}

