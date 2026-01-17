/**
 * Types et interfaces pour Prometheus
 */

/**
 * Parametres de l'extension (storage sync)
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
 * Structure de donnees pour les visites (storage local)
 */
export interface VisitData {
  visitCountsByUrl: Record<string, VisitCount>;
}

/**
 * Donnees de screenshot pour une URL
 */
export interface ScreenshotData {
  dataUrl: string;
  capturedAt: number;
}

/**
 * Structure de donnees pour les screenshots (storage local)
 */
export interface ScreenshotsData {
  screenshotsByUrl: Record<string, ScreenshotData>;
}

/**
 * Lien eligible pour previsualisation
 */
export interface EligibleLink {
  url: string;
  element: HTMLAnchorElement;
  visitCount: number;
  lastVisitedAt: number;
  title: string;
  favicon?: string;
  screenshot?: string; // base64 data URL du screenshot
}

/**
 * Etat du panneau de previsualisation
 */
export interface PanelState {
  isVisible: boolean;
  links: EligibleLink[];
  hoveredIndex: number | null;
  preloadedUrls: Set<string>;
}

/**
 * Messages entre content script et background script
 */
export interface CaptureScreenshotMessage {
  type: 'capture-screenshot';
  url: string;
}

export interface CaptureScreenshotResponse {
  success: boolean;
  dataUrl?: string;
  error?: string;
}
