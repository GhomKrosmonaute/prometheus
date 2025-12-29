/**
 * Liste des domaines désactivés par défaut (sites avec listes/flux massifs)
 */
export const DEFAULT_DISABLED_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'soundcloud.com',
  'www.soundcloud.com',
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'tiktok.com',
  'www.tiktok.com',
  'instagram.com',
  'www.instagram.com',
  'leboncoin.fr',
  'www.leboncoin.fr',
  'twitter.com',
  'x.com',
  'www.twitter.com',
  'reddit.com',
  'www.reddit.com',
  'linkedin.com',
  'www.linkedin.com',
];

/**
 * Extensions de fichiers à ignorer (pas des pages)
 */
export const IGNORED_FILE_EXTENSIONS = [
  // Documents
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp',
  // Archives
  '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz',
  // Executables
  '.exe', '.dmg', '.pkg', '.deb', '.rpm', '.msi', '.apk',
  // Images
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico', '.tiff', '.tif',
  // Vidéos
  '.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.mpg', '.mpeg',
  // Audio
  '.mp3', '.wav', '.ogg', '.flac', '.aac', '.wma', '.m4a', '.opus',
  // Autres
  '.torrent', '.iso', '.dmg',
];

/**
 * Schémas d'URL à ignorer
 */
export const IGNORED_URL_SCHEMES = [
  'mailto:',
  'tel:',
  'sms:',
  'magnet:',
  'javascript:',
  'data:',
  'blob:',
  'about:',
  'chrome:',
  'chrome-extension:',
  'moz-extension:',
];

/**
 * Nombre par défaut de liens à afficher
 */
export const DEFAULT_DISPLAY_COUNT = 5;

/**
 * Nombre par défaut max de liens à précharger
 */
export const DEFAULT_MAX_PRELOAD = 3;

