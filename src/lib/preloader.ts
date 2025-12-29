import type { EligibleLink } from './types';

/**
 * URLs préchargées
 */
const preloadedUrls = new Set<string>();

/**
 * Éléments de préchargement créés
 */
const preloadElements = new Map<string, HTMLLinkElement>();

/**
 * Précharge une URL en utilisant link rel="prefetch"
 */
export function preloadUrl(url: string): void {
  if (preloadedUrls.has(url)) return;
  
  try {
    // Créer un élément link pour le prefetch
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    
    // Ajouter au head
    document.head.appendChild(link);
    
    preloadedUrls.add(url);
    preloadElements.set(url, link);
    
    console.log('[Prometheus] Preloading:', url);
  } catch (error) {
    console.error('[Prometheus] Error preloading:', url, error);
  }
}

/**
 * Précharge plusieurs URLs avec une limite
 */
export function preloadUrls(links: EligibleLink[], maxCount: number): void {
  const urlsToPreload = links.slice(0, maxCount).map(link => link.url);
  
  urlsToPreload.forEach(url => {
    preloadUrl(url);
  });
}

/**
 * Vérifie si une URL a été préchargée
 */
export function isPreloaded(url: string): boolean {
  return preloadedUrls.has(url);
}

/**
 * Nettoie les préchargements
 */
export function cleanupPreloads(): void {
  preloadElements.forEach((element) => {
    element.remove();
  });
  
  preloadElements.clear();
  preloadedUrls.clear();
}

/**
 * Récupère le set des URLs préchargées
 */
export function getPreloadedUrls(): Set<string> {
  return new Set(preloadedUrls);
}

