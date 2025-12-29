# Guide de développement - Prometheus

## Installation des dépendances

```bash
npm install
```

## Développement

### Mode développement (Chrome)

```bash
npm run dev
```

Puis dans Chrome :
1. Ouvrir `chrome://extensions/`
2. Activer le "Mode développeur"
3. Cliquer sur "Charger l'extension non empaquetée"
4. Sélectionner le dossier `.output/chrome-mv3`

### Mode développement (Edge)

```bash
npm run dev
```

Puis dans Edge :
1. Ouvrir `edge://extensions/`
2. Activer le "Mode développeur"
3. Cliquer sur "Charger l'extension décompressée"
4. Sélectionner le dossier `.output/chrome-mv3`

> **Note** : Edge utilise Chromium, donc le même build que Chrome (chrome-mv3) fonctionne parfaitement.

### Mode développement (Firefox)

```bash
npm run dev:firefox
```

Puis dans Firefox :
1. Ouvrir `about:debugging#/runtime/this-firefox`
2. Cliquer sur "Charger un module complémentaire temporaire"
3. Sélectionner le fichier `manifest.json` dans `.output/firefox-mv2`

## Build de production

### Chrome / Edge

```bash
npm run build
```

> **Note** : Le même build fonctionne pour Chrome et Edge (tous deux basés sur Chromium).

### Firefox

```bash
npm run build:firefox
```

## Créer un package ZIP

### Chrome / Edge

```bash
npm run zip
```

Le fichier ZIP (`prometheus-X.X.X-chrome.zip`) peut être utilisé pour :
- Chrome Web Store
- Edge Add-ons (même fichier)

### Firefox

```bash
npm run zip:firefox
```

Le fichier ZIP sera créé dans le dossier `.output`.

## Vérification TypeScript

```bash
npm run compile
```

## Structure du projet

```
prometheus/
├── src/lib/              # Modules utilitaires
│   ├── constants.ts      # Constantes (domaines désactivés, extensions fichiers)
│   ├── types.ts          # Types TypeScript
│   ├── storage.ts        # Gestion du storage (settings, visites)
│   ├── url-utils.ts      # Utilitaires pour les URLs
│   ├── link-tracker.ts   # Tracking des clics sur les liens
│   ├── link-selector.ts  # Sélection des liens éligibles
│   ├── panel.ts          # Gestion du panneau UI
│   ├── panel-styles.ts   # Styles CSS du panneau
│   ├── preloader.ts      # Préchargement des URLs
│   └── navigation.ts     # Navigation avec transition
├── entrypoints/
│   ├── content.ts        # Content script principal
│   ├── background.ts     # Background script
│   └── popup/            # UI du popup (settings)
│       ├── index.html
│       ├── main.ts
│       └── style.css
├── public/               # Assets publics
└── wxt.config.ts         # Configuration WXT

```

## Fonctionnement

### 1. Tracking des visites

Le content script intercepte tous les clics sur les liens et incrémente un compteur interne dans le storage local.

### 2. Détection des liens éligibles

À chaque chargement de page, l'extension :
- Vérifie si le domaine n'est pas désactivé
- Extrait tous les liens de la page
- Filtre les liens (pages uniquement, pas de fichiers/médias)
- Vérifie la blacklist
- Récupère les compteurs de visites
- Trie par nombre de visites

### 3. Affichage du panneau

Si au moins un lien éligible est trouvé :
- Affiche un panneau fixe à droite
- Montre des miniatures (favicon + titre + badge de visites)
- Précharge les URLs selon la limite configurée

### 4. Interactions

- **Hover** : Affiche l'iframe du site
- **Clic** : Animation de transition + navigation
- **Croix** : Ajoute le lien à la blacklist

## Configuration par défaut

- **Nombre max de liens préchargés** : 3
- **Nombre de liens affichés** : 5
- **Domaines désactivés** : YouTube, SoundCloud, Facebook, TikTok, Instagram, Leboncoin, Twitter/X, Reddit, LinkedIn

## Permissions requises

- `storage` : Pour sauvegarder les settings et les compteurs de visites
- `<all_urls>` : Pour injecter le content script sur toutes les pages

## Notes techniques

- **Pas de layout shift** : Le panneau est en `position: fixed` et ne modifie jamais la largeur du body
- **Fond adaptatif** : Le fond du panneau s'adapte au background du site
- **Préchargement léger** : Utilise `<link rel="prefetch">` pour ne pas surcharger
- **Fallback iframe** : Si un site bloque l'iframe (CSP), affiche un message + bouton
- **Tracking interne** : Pas besoin de la permission `history`, on compte nos propres clics

