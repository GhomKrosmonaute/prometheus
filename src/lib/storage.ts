import { storage } from 'wxt/utils/storage';
import type { PrometheusSettings, VisitData, VisitCount } from './types';
import { DEFAULT_DISABLED_DOMAINS, DEFAULT_MAX_PRELOAD } from './constants';

/**
 * Clés de stockage
 */
const STORAGE_KEYS = {
  SETTINGS: 'local:settings',
  VISITS: 'local:visits',
} as const;

/**
 * Paramètres par défaut
 */
export const DEFAULT_SETTINGS: PrometheusSettings = {
  maxPreloadPerPage: DEFAULT_MAX_PRELOAD,
  disabledDomains: [...DEFAULT_DISABLED_DOMAINS],
  blacklist: [],
};

/**
 * Données de visites par défaut
 */
const DEFAULT_VISITS: VisitData = {
  visitCountsByUrl: {},
};

/**
 * Charge les paramètres depuis le storage
 */
export async function loadSettings(): Promise<PrometheusSettings> {
  const stored = await storage.getItem<PrometheusSettings>(STORAGE_KEYS.SETTINGS);
  
  if (!stored) {
    // Initialiser avec les valeurs par défaut
    await storage.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  
  // Fusionner avec les valeurs par défaut pour gérer les nouvelles clés
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
  };
}

/**
 * Sauvegarde les paramètres dans le storage
 */
export async function saveSettings(settings: PrometheusSettings): Promise<void> {
  await storage.setItem(STORAGE_KEYS.SETTINGS, settings);
}

/**
 * Réinitialise les paramètres aux valeurs par défaut
 */
export async function resetSettings(): Promise<PrometheusSettings> {
  await storage.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

/**
 * Charge les données de visites depuis le storage
 */
export async function loadVisits(): Promise<VisitData> {
  const stored = await storage.getItem<VisitData>(STORAGE_KEYS.VISITS);
  
  if (!stored) {
    await storage.setItem(STORAGE_KEYS.VISITS, DEFAULT_VISITS);
    return DEFAULT_VISITS;
  }
  
  return stored;
}

/**
 * Incrémente le compteur de visites pour une URL
 */
export async function incrementVisitCount(url: string): Promise<void> {
  const visits = await loadVisits();
  const now = Date.now();
  
  if (visits.visitCountsByUrl[url]) {
    visits.visitCountsByUrl[url].count++;
    visits.visitCountsByUrl[url].lastVisitedAt = now;
  } else {
    visits.visitCountsByUrl[url] = {
      count: 1,
      lastVisitedAt: now,
    };
  }
  
  await storage.setItem(STORAGE_KEYS.VISITS, visits);
}

/**
 * Récupère le compteur de visites pour une URL
 */
export async function getVisitCount(url: string): Promise<VisitCount | null> {
  const visits = await loadVisits();
  return visits.visitCountsByUrl[url] || null;
}

/**
 * Récupère tous les compteurs de visites
 */
export async function getAllVisitCounts(): Promise<Record<string, VisitCount>> {
  const visits = await loadVisits();
  return visits.visitCountsByUrl;
}

/**
 * Ajoute une URL à la blacklist
 */
export async function addToBlacklist(url: string): Promise<void> {
  const settings = await loadSettings();
  
  if (!settings.blacklist.includes(url)) {
    settings.blacklist.push(url);
    await saveSettings(settings);
  }
}

/**
 * Retire une URL de la blacklist
 */
export async function removeFromBlacklist(url: string): Promise<void> {
  const settings = await loadSettings();
  settings.blacklist = settings.blacklist.filter(item => item !== url);
  await saveSettings(settings);
}

/**
 * Nettoie les anciennes visites (optionnel, pour éviter que le storage grossisse trop)
 */
export async function cleanOldVisits(maxAgeMs: number = 90 * 24 * 60 * 60 * 1000): Promise<void> {
  const visits = await loadVisits();
  const now = Date.now();
  const cutoff = now - maxAgeMs;
  
  const cleaned: Record<string, VisitCount> = {};
  
  for (const [url, visitCount] of Object.entries(visits.visitCountsByUrl)) {
    if (visitCount.lastVisitedAt >= cutoff) {
      cleaned[url] = visitCount;
    }
  }
  
  visits.visitCountsByUrl = cleaned;
  await storage.setItem(STORAGE_KEYS.VISITS, visits);
}

