import { IGNORED_FILE_EXTENSIONS, IGNORED_URL_SCHEMES } from './constants';

/**
 * Normalise une URL en retirant les paramètres de tracking et fragments
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Retirer les paramètres UTM et autres tracking communs
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref', 'source'];
    trackingParams.forEach(param => urlObj.searchParams.delete(param));
    
    // Retirer le fragment (#)
    urlObj.hash = '';
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Vérifie si une URL est valide et pointe vers une page (pas un fichier/média)
 */
export function isValidPageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Vérifier le schéma
    if (!urlObj.protocol.startsWith('http')) {
      return false;
    }
    
    // Vérifier les schémas ignorés
    for (const scheme of IGNORED_URL_SCHEMES) {
      if (url.toLowerCase().startsWith(scheme)) {
        return false;
      }
    }
    
    // Vérifier les extensions de fichiers
    const pathname = urlObj.pathname.toLowerCase();
    for (const ext of IGNORED_FILE_EXTENSIONS) {
      if (pathname.endsWith(ext)) {
        return false;
      }
    }
    
    // Vérifier le paramètre "download" dans l'URL
    if (urlObj.searchParams.has('download')) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Convertit une URL relative en URL absolue
 */
export function toAbsoluteUrl(href: string, baseUrl: string = window.location.href): string {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

/**
 * Vérifie si un domaine correspond à un pattern (avec support wildcard basique)
 */
export function matchesDomain(hostname: string, pattern: string): boolean {
  // Support pour wildcard au début (ex: *.google.com)
  if (pattern.startsWith('*.')) {
    const domain = pattern.slice(2);
    return hostname === domain || hostname.endsWith('.' + domain);
  }
  
  return hostname === pattern || hostname.endsWith('.' + pattern);
}

/**
 * Vérifie si une URL est dans la blacklist
 */
export function isBlacklisted(url: string, blacklist: string[]): boolean {
  try {
    const urlObj = new URL(url);
    
    for (const item of blacklist) {
      // Si l'item est une URL complète
      if (item.includes('://')) {
        if (normalizeUrl(url) === normalizeUrl(item)) {
          return true;
        }
      }
      // Si c'est un pattern de domaine
      else if (matchesDomain(urlObj.hostname, item)) {
        return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Vérifie si le domaine actuel est désactivé
 */
export function isDomainDisabled(hostname: string, disabledDomains: string[]): boolean {
  return disabledDomains.some(domain => matchesDomain(hostname, domain));
}

/**
 * Extrait le favicon d'un lien ou génère un fallback
 */
export function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}/favicon.ico`;
  } catch {
    return '';
  }
}

/**
 * Extrait le titre d'un élément lien
 */
export function getLinkTitle(anchor: HTMLAnchorElement): string {
  return anchor.title || anchor.textContent?.trim() || anchor.href;
}

