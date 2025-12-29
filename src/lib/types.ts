/**
 * Types et interfaces pour Prometheus
 */

/**
 * Paramètres de l'extension (storage sync)
 */
export interface PrometheusSettings {
  maxPreloadPerPage: number;
  disabledDomains: string[];
  blacklist: string[];
}

/**
 * Compteur de visites pour une URL
 */
export interface VisitCount {
  count: number;
  lastVisitedAt: number;
}

/**
 * Structure de données pour les visites (storage local)
 */
export interface VisitData {
  visitCountsByUrl: Record<string, VisitCount>;
}

/**
 * Lien éligible pour prévisualisation
 */
export interface EligibleLink {
  url: string;
  element: HTMLAnchorElement;
  visitCount: number;
  lastVisitedAt: number;
  title: string;
  favicon?: string;
}

/**
 * État du panneau de prévisualisation
 */
export interface PanelState {
  isVisible: boolean;
  links: EligibleLink[];
  hoveredIndex: number | null;
  preloadedUrls: Set<string>;
}

