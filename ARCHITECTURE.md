# Architecture - Prometheus

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                         PROMETHEUS                               │
│                  Extension de prévisualisation                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│   Content Script    │  │   Background     │  │     Popup       │
│   (content.ts)      │  │  (background.ts) │  │  (main.ts)      │
└─────────────────────┘  └──────────────────┘  └─────────────────┘
         │                        │                      │
         │                        │                      │
         ▼                        ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WXT Storage (Local)                         │
│  • Settings (maxPreload, disabledDomains, blacklist)           │
│  • VisitCounts (Record<url, {count, lastVisitedAt}>)           │
└─────────────────────────────────────────────────────────────────┘
```

## Flux de données

### 1. Tracking des visites

```
User clique sur lien
         │
         ▼
┌────────────────────┐
│  link-tracker.ts   │  ← Intercepte le clic (capture phase)
└────────────────────┘
         │
         ▼
┌────────────────────┐
│   url-utils.ts     │  ← Normalise l'URL (sans UTM, sans #)
└────────────────────┘
         │
         ▼
┌────────────────────┐
│   storage.ts       │  ← Incrémente visitCountsByUrl[url]
└────────────────────┘
```

### 2. Affichage du panneau

```
Page chargée
         │
         ▼
┌────────────────────┐
│   content.ts       │  ← Vérifie domaine désactivé
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ link-selector.ts   │  ← Extrait liens + filtre + trie
└────────────────────┘
         │
         ▼
┌────────────────────┐
│   storage.ts       │  ← Récupère visitCounts
└────────────────────┘
         │
         ▼
    Liens éligibles ?
         │
    ┌────┴────┐
    │         │
   NON       OUI
    │         │
    │         ▼
    │  ┌────────────────────┐
    │  │    panel.ts        │  ← Crée le panneau UI
    │  └────────────────────┘
    │         │
    │         ▼
    │  ┌────────────────────┐
    │  │  preloader.ts      │  ← Précharge top K URLs
    │  └────────────────────┘
    │
    ▼
  Rien
```

### 3. Interaction utilisateur

```
User hover miniature
         │
         ▼
┌────────────────────┐
│    panel.ts        │  ← showIframe(index)
└────────────────────┘
         │
         ▼
   Affiche iframe
         │
         │
User clique iframe
         │
         ▼
┌────────────────────┐
│  navigation.ts     │  ← navigateWithTransition(url)
└────────────────────┘
         │
         ▼
  Animation 400ms
         │
         ▼
  window.location = url
```

### 4. Blacklist

```
User clique croix
         │
         ▼
┌────────────────────┐
│    panel.ts        │  ← handleBlacklist(url)
└────────────────────┘
         │
         ▼
┌────────────────────┐
│   storage.ts       │  ← addToBlacklist(url)
└────────────────────┘
         │
         ▼
   Retire miniature
         │
         ▼
  Réanalyse page
```

## Modules détaillés

### src/lib/constants.ts
**Rôle** : Constantes globales
- Liste domaines désactivés (YouTube, Facebook, etc.)
- Extensions fichiers à ignorer (.pdf, .zip, etc.)
- Schémas URL à ignorer (mailto:, tel:, etc.)
- Valeurs par défaut (5 affichés, 3 préchargés)

### src/lib/types.ts
**Rôle** : Définitions TypeScript
- `PrometheusSettings` : Config utilisateur
- `VisitCount` : Compteur de visites
- `EligibleLink` : Lien éligible
- `PanelState` : État du panneau

### src/lib/storage.ts
**Rôle** : Gestion du storage WXT
- `loadSettings()` : Charge config
- `saveSettings()` : Sauvegarde config
- `incrementVisitCount()` : +1 visite
- `getAllVisitCounts()` : Récupère tous les compteurs
- `addToBlacklist()` / `removeFromBlacklist()`

### src/lib/url-utils.ts
**Rôle** : Utilitaires pour URLs
- `normalizeUrl()` : Supprime UTM + fragments
- `isValidPageUrl()` : Vérifie si page (pas fichier)
- `toAbsoluteUrl()` : Relative → Absolue
- `matchesDomain()` : Matching avec wildcard
- `isBlacklisted()` : Vérifie blacklist
- `isDomainDisabled()` : Vérifie domaine désactivé
- `getFaviconUrl()` : Extrait favicon
- `getLinkTitle()` : Extrait titre

### src/lib/link-tracker.ts
**Rôle** : Tracking des clics
- Event listener en capture phase
- Debounce (1s) pour éviter double-compte
- Normalisation + incrémentation
- Nettoyage périodique du cache

### src/lib/link-selector.ts
**Rôle** : Sélection des liens
- `extractEligibleLinks()` : Extrait + filtre + trie
  - Vérifie visibilité (offsetParent, display)
  - Valide URL (pages uniquement)
  - Applique blacklist
  - Vérifie compteur de visites
  - Trie par visites + date
  - Limite au top N
- `observeDOMChanges()` : MutationObserver pour SPAs

### src/lib/panel.ts
**Rôle** : Gestion du panneau UI
- `createPanel()` : Crée et injecte le panneau
- `createThumbnailElement()` : Miniature (favicon + titre + badge)
- `createIframeElement()` : Iframe avec fallback CSP
- `showIframe()` / `hideIframes()` : Bascule hover
- `handleBlacklist()` : Gère la croix
- `getBodyBackground()` : Récupère fond du site

### src/lib/panel-styles.ts
**Rôle** : Styles CSS du panneau
- Conteneur fixed (280px × 100vh)
- Miniatures avec animations
- Iframes avec overlay clicable
- Fallback CSP
- Animation de transition
- Scrollbar personnalisée

### src/lib/preloader.ts
**Rôle** : Préchargement des URLs
- `preloadUrl()` : Crée `<link rel="prefetch">`
- `preloadUrls()` : Précharge top K
- `isPreloaded()` : Vérifie si préchargé
- `cleanupPreloads()` : Nettoie les éléments

### src/lib/navigation.ts
**Rôle** : Navigation avec transition
- `navigateWithTransition()` : Animation + navigation
- `openInNewTab()` : Ouvre dans nouvel onglet
- `shouldOpenInNewTab()` : Détecte Ctrl/Cmd

## Entrypoints

### entrypoints/content.ts
**Rôle** : Orchestration principale
```typescript
1. Charger settings
2. Vérifier domaine désactivé → early-exit
3. Initialiser tracking des clics
4. Analyser la page :
   - Extraire liens éligibles
   - Si aucun → rien
   - Sinon → créer panneau + précharger
5. Observer DOM pour SPAs
6. Gérer callbacks (hover, clic, blacklist)
```

### entrypoints/background.ts
**Rôle** : Background service worker
- Actuellement minimal (WXT gère le storage)
- Prêt pour extension future

### entrypoints/popup/main.ts
**Rôle** : UI des settings
```typescript
1. Charger settings actuels
2. Afficher dans l'UI :
   - Input nombre max préchargement
   - Liste domaines désactivés
   - Liste blacklist
3. Gérer interactions :
   - Ajout/suppression items
   - Sauvegarde
   - Réinitialisation
4. Afficher messages de statut
```

## Cycle de vie complet

```
┌─────────────────────────────────────────────────────────────────┐
│                    Page chargée                                  │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Content script init   │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Domaine désactivé ?   │
              └────────────────────────┘
                    │            │
                   OUI          NON
                    │            │
                    │            ▼
                    │   ┌────────────────────┐
                    │   │ Init link tracking │
                    │   └────────────────────┘
                    │            │
                    │            ▼
                    │   ┌────────────────────┐
                    │   │  Analyser page     │
                    │   └────────────────────┘
                    │            │
                    │            ▼
                    │   ┌────────────────────┐
                    │   │ Liens éligibles ?  │
                    │   └────────────────────┘
                    │         │        │
                    │        NON      OUI
                    │         │        │
                    ▼         ▼        ▼
              ┌────────────────────────────┐
              │     Rien à afficher        │
              └────────────────────────────┘
                                    │
                                    ▼
                      ┌──────────────────────────┐
                      │  Créer panneau UI        │
                      └──────────────────────────┘
                                    │
                                    ▼
                      ┌──────────────────────────┐
                      │  Précharger top K URLs   │
                      └──────────────────────────┘
                                    │
                                    ▼
                      ┌──────────────────────────┐
                      │  Observer DOM (SPAs)     │
                      └──────────────────────────┘
                                    │
                                    ▼
                      ┌──────────────────────────┐
                      │  Attendre interactions   │
                      └──────────────────────────┘
                           │        │        │
                           │        │        │
                      ┌────┘   ┌────┘   └────┐
                      │        │             │
                    Hover    Clic        Croix
                      │        │             │
                      ▼        ▼             ▼
                  Iframe   Navigate    Blacklist
```

## Décisions d'architecture

### Pourquoi tracking interne ?
- ✅ Pas besoin permission `history`
- ✅ Plus simple et plus rapide
- ✅ Contrôle total sur les données
- ❌ Ne compte que depuis l'installation

### Pourquoi position: fixed ?
- ✅ Aucun layout shift garanti
- ✅ Ne touche pas au DOM du site
- ✅ Toujours visible (pas de scroll)
- ✅ Facile à animer/retirer

### Pourquoi link rel="prefetch" ?
- ✅ Léger (pas de chargement complet)
- ✅ Natif au navigateur
- ✅ Améliore cache/DNS/TCP
- ❌ Pas de garantie de chargement instantané

### Pourquoi liste hardcodée de domaines ?
- ✅ Simple et maintenable
- ✅ Explicite pour l'utilisateur
- ✅ Éditable via popup
- ❌ Nécessite mise à jour manuelle

### Pourquoi WXT ?
- ✅ Support MV3 + MV2
- ✅ Hot reload en dev
- ✅ Build optimisé
- ✅ Storage API simple
- ✅ TypeScript natif

## Performance

### Optimisations implémentées
1. **Debounce** : Tracking (1s) + observation DOM (500ms)
2. **Limites strictes** : Max 3 préchargements par défaut
3. **Early-exit** : Domaine désactivé → pas d'init
4. **Nettoyage** : Cache des clics nettoyé toutes les 5s
5. **Lazy loading** : Iframes créées mais pas chargées avant hover
6. **Normalisation** : URLs normalisées pour éviter doublons

### Métriques cibles
- Layout shift (CLS) : 0
- Temps d'injection : < 50ms
- Mémoire : < 10MB par onglet
- Préchargement : < 500KB par page

## Sécurité

### Permissions minimales
- `storage` : Nécessaire pour settings + visites
- `<all_urls>` : Nécessaire pour content script
- Pas de `history`, `tabs`, `webNavigation`

### Sandbox iframe
- `allow-same-origin` : Pour charger le site
- `allow-scripts` : Pour que le site fonctionne
- `allow-popups` : Pour liens externes
- `allow-forms` : Pour formulaires

### Validation
- Toutes les URLs sont validées
- Schémas non-HTTP bloqués
- Pas d'eval() ou innerHTML dangereux
- Storage limité (pas de croissance infinie)

## Extensibilité

### Ajout facile de fonctionnalités
- Nouveau module dans `src/lib/`
- Import dans `content.ts`
- Ajout dans settings si nécessaire

### Exemples d'extensions futures
1. **Screenshots** : Nouveau module `screenshot.ts`
2. **Statistiques** : Nouveau module `stats.ts`
3. **Thèmes** : Nouveau module `themes.ts`
4. **Sync** : Utiliser `storage.sync` au lieu de `local`

## Conclusion

Architecture **modulaire**, **performante** et **extensible**.

Chaque module a une responsabilité claire et peut être testé/modifié indépendamment.

