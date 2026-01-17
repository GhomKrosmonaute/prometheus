import type { EligibleLink } from './types';

/**
 * URLs préchargées
 */
const preloadedUrls = new Set<string>();

/**
 * Éléments de préchargement créés
 */
const preloadElements = new Map<string, HTMLLinkElement | HTMLScriptElement>();

/**
 * Vérifie si le navigateur supporte la Speculation Rules API
 */
function supportsSpeculationRules(): boolean {
  return (
    typeof HTMLScriptElement !== 'undefined' &&
    typeof HTMLScriptElement.supports === 'function' &&
    HTMLScriptElement.supports('speculationrules')
  );
}

/**
 * Précharge une URL en utilisant Speculation Rules API (prerender) ou link rel="prefetch"
 */
export function preloadUrl(url: string): void {
  if (preloadedUrls.has(url)) return;
  
  try {
    if (supportsSpeculationRules()) {
      // Utiliser Speculation Rules API pour un vrai prerender
      const script = document.createElement('script');
      script.type = 'speculationrules';
      script.textContent = JSON.stringify({
        prerender: [{ urls: [url] }]
      });
      
      document.head.appendChild(script);
      preloadElements.set(url, script);
      
      console.log('[Prometheus] Prerendering (Speculation Rules):', url);
    } else {
      // Fallback: utiliser prefetch
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'document';
      
      document.head.appendChild(link);
      preloadElements.set(url, link);
      
      console.log('[Prometheus] Prefetching (fallback):', url);
    }
    
    preloadedUrls.add(url);
  } catch (error) {
    console.error('[Prometheus] Error preloading:', url, error);
  }
}

/**
 * Précharge plusieurs URLs avec Speculation Rules API (batch) ou prefetch
 */
export function preloadUrls(links: EligibleLink[], maxCount: number): void {
  const urlsToPreload = links.slice(0, maxCount).map(link => link.url);
  
  if (urlsToPreload.length === 0) return;
  
  // Filtrer les URLs déjà préchargées
  const newUrls = urlsToPreload.filter(url => !preloadedUrls.has(url));
  
  if (newUrls.length === 0) return;
  
  try {
    if (supportsSpeculationRules()) {
      // Utiliser Speculation Rules API en batch pour un prerender groupé
      const script = document.createElement('script');
      script.type = 'speculationrules';
      script.textContent = JSON.stringify({
        prerender: [{ urls: newUrls }]
      });
      
      document.head.appendChild(script);
      
      // Marquer toutes les URLs comme préchargées
      newUrls.forEach(url => {
        preloadedUrls.add(url);
        preloadElements.set(url, script);
      });
      
      console.log('[Prometheus] Prerendering batch (Speculation Rules):', newUrls);
    } else {
      // Fallback: prefetch individuel
      newUrls.forEach(url => {
        preloadUrl(url);
      });
    }
  } catch (error) {
    console.error('[Prometheus] Error preloading batch:', error);
    // Fallback en cas d'erreur
    newUrls.forEach(url => {
      try {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = 'document';
        document.head.appendChild(link);
        preloadedUrls.add(url);
        preloadElements.set(url, link);
      } catch (e) {
        console.error('[Prometheus] Fallback prefetch error:', url, e);
      }
    });
  }
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

/**
 * Vérifie si le navigateur utilise Speculation Rules
 */
export function isUsingSpeculationRules(): boolean {
  return supportsSpeculationRules();
}