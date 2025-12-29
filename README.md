# Prometheus — Extension de prévisualisation intelligente

> 📚 **[Index de la documentation complète](INDEX.md)** | 🚀 **[Démarrage rapide](QUICKSTART.md)**

**Prometheus** est une extension web qui affiche, **sur la droite de l'écran**, un panneau de prévisualisation contenant **les 5 liens les plus visités** présents sur la page courante (si l'utilisateur a déjà visité ces liens).  
Si **aucun lien de la page n'a d'historique de visite**, l'extension **ne s'active pas** et **n'affiche rien**.

## Fonctionnalités (côté utilisateur)

- **Panneau de preview contextuel** : apparaît uniquement quand la page contient des liens déjà visités.
- **Top liens visités** : par défaut, affichage des **5** liens les plus consultés (par l’utilisateur).
- **Miniatures + préchargement** : l’UI montre d’abord des **miniatures**, mais les sites sont **préchargés** en arrière-plan.
- **Hover = aperçu live** : en approchant la souris d’une miniature, la preview devient un **iframe** affichant le site correspondant.
- **Clic = transition vers la page préchargée** : un clic dans l’iframe déclenche une **animation de transition** et ouvre la page déjà préchargée.
- **Réglages** :
  - **Nombre max de liens préchargés par page** (limite configurable).
  - **Blacklist** de liens : un lien peut être exclu définitivement du préchargement via une **croix** sur la miniature.

## Contraintes UX / UI

- **Aucune variation de largeur** : l’extension **ne doit jamais modifier la `width` du `body`** de la page en cours, ni lors du hover, ni pendant la transition (pas de layout shift).
- **Fond cohérent** : le fond du panneau doit **correspondre au `background` du `body`** du site actuel (pour une intégration visuelle naturelle).

## Spécifications techniques

### Stack

- **WXT** (Web Extension Toolkit)
- **TypeScript (vanilla)** — pas de framework UI requis

### Entrypoints

Le projet utilise la structure WXT standard :

- `entrypoints/background.ts` : logique “background” (orchestration, stockage, éventuels accès API extension).
- `entrypoints/content.ts` : injection côté page (détection des liens, rendu du panneau, gestion hover/clic/animations).
- `entrypoints/popup/*` : UI de popup (settings : limite de préchargement, gestion de blacklist).

### Données & paramètres

- **Paramètres utilisateur** :
  - `maxPreloadPerPage` (nombre max de liens préchargés par page)
  - `blacklist` (liste de liens/domaines à ne jamais précharger)
- **Source “liens visités”** :
  - Basé sur l’historique de navigation de l’utilisateur (ou une métrique interne de visites), afin d’identifier et trier les liens déjà consultés.

### Comportement d’activation

- Le content script analyse les liens de la page.
- Il ne rend le panneau que si au moins un lien (hors blacklist) est reconnu comme “déjà visité”.
- Il limite ensuite le set à précharger selon :
  - le top “visité” (par défaut 5 affichés),
  - et le `maxPreloadPerPage` défini dans les settings.

### Garde-fous (fluidité, compatibilité, contrôle)

- **Filtrage des liens éligibles (pages uniquement)** : Prometheus ne précharge/preview que des liens qui aboutissent à des **pages** (objectif : navigation plus fluide), et ignore notamment :
  - les médias et ressources (images/vidéos/audio),
  - les fichiers (PDF, ZIP, exécutables, etc.),
  - les torrents/magnets,
  - les liens e-mail et assimilés (`mailto:`, etc.),
  - plus généralement tout ce qui n’est pas une destination “page” pertinente à ouvrir en navigation.
- **Désactivé par défaut sur les sites à listes/flux massifs** : pour éviter surcharge réseau/CPU/mémoire et du bruit (préchargements non désirés), l’extension est **désactivée par défaut** sur les plateformes de type “feed”/listings (exemples) :
  - YouTube, SoundCloud
  - Facebook, TikTok, Instagram
  - Leboncoin
  - et plus globalement les sites contenant des listes de liens longues/infinies.
- **Activation stricte** : si aucun lien “déjà visité” n’est détecté (hors blacklist), l’extension **reste invisible** (pas de coût UI inutile).
- **Objectif performance** : tout doit être conçu pour **ne pas dégrader** la page courante (pas de layout shift, limites de préchargement, rendu progressif).

### Préchargement & transition

- Les previews sont **préchargées** avant affichage live.
- Le hover bascule de “miniature” à “iframe” sans provoquer de reflow global.
- Le clic déclenche une animation puis navigue vers la page correspondante en tirant parti du préchargement (objectif : impression de navigation instantanée).

## Développement

### Prérequis

- Node.js (recommandé : LTS)

### Commandes

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run zip
```

Firefox :

```bash
npm run dev:firefox
npm run build:firefox
npm run zip:firefox
```

Vérification TypeScript :

```bash
npm run compile
```

## Notes

- Le projet a été initialisé avec WXT (scripts et structure standards).
- Le nom **Prometheus** correspond au produit final (l’entrée `name` de `package.json` pourra être ajustée si besoin).


