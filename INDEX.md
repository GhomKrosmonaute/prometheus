# 📚 Index de la documentation - Prometheus

Bienvenue dans la documentation de **Prometheus**, l'extension de prévisualisation intelligente !

## 🚀 Par où commencer ?

### Vous voulez tester rapidement ?
👉 **[QUICKSTART.md](QUICKSTART.md)** - Démarrage en 5 minutes

### Vous voulez comprendre le projet ?
👉 **[README.md](README.md)** - Description complète + spécifications

### Vous voulez développer/modifier ?
👉 **[DEVELOPMENT.md](DEVELOPMENT.md)** - Guide de développement

## 📖 Documentation complète

### 1. Vue d'ensemble
- **[README.md](README.md)** (5.2 KB)
  - Description du projet
  - Fonctionnalités utilisateur
  - Contraintes UX/UI
  - Spécifications techniques
  - Stack et entrypoints
  - Garde-fous et filtrage
  - Commandes de développement

### 2. Démarrage rapide
- **[QUICKSTART.md](QUICKSTART.md)** (2.8 KB)
  - Installation en 3 étapes
  - Premier test guidé
  - Interactions de base
  - Configuration rapide
  - Commandes essentielles
  - Problèmes courants

### 3. Développement
- **[DEVELOPMENT.md](DEVELOPMENT.md)** (4.0 KB)
  - Installation des dépendances
  - Mode développement (Chrome/Firefox)
  - Build de production
  - Création de packages ZIP
  - Structure du projet
  - Fonctionnement détaillé
  - Configuration par défaut
  - Permissions requises
  - Notes techniques

### 4. Architecture
- **[ARCHITECTURE.md](ARCHITECTURE.md)** (16.4 KB)
  - Vue d'ensemble du système
  - Flux de données complets
  - Détail de chaque module
  - Cycle de vie de l'extension
  - Décisions d'architecture
  - Optimisations de performance
  - Considérations de sécurité
  - Extensibilité

### 5. Tests
- **[TESTING.md](TESTING.md)** (6.5 KB)
  - 12 scénarios de test détaillés
  - Test du tracking des visites
  - Test de l'affichage du panneau
  - Test du hover et navigation
  - Test de la blacklist
  - Test du filtrage des URLs
  - Test des paramètres (popup)
  - Test des iframes bloquées (CSP)
  - Test des SPAs
  - Test de performance
  - Console logs à surveiller
  - Checklist finale avant release

### 6. Implémentation
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** (8.3 KB)
  - Récapitulatif complet de l'implémentation
  - Liste des 10 modules créés
  - Détail des 3 entrypoints
  - Toutes les fonctionnalités implémentées
  - Contraintes respectées
  - Build & compilation
  - Documentation créée
  - Points d'amélioration futurs

### 7. Statut
- **[STATUS.md](STATUS.md)** (7.1 KB)
  - État actuel du projet (✅ 100% complété)
  - Résumé des métriques
  - Tous les todos complétés
  - Fonctionnalités implémentées
  - Structure du projet
  - Commandes disponibles
  - Design et permissions
  - Performance et tests
  - Prochaines étapes

## 🎯 Guide par objectif

### Je veux juste tester l'extension
1. [QUICKSTART.md](QUICKSTART.md) - Installation rapide
2. Suivre les 3 étapes
3. Tester sur Wikipédia

### Je veux comprendre comment ça marche
1. [README.md](README.md) - Vue d'ensemble
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture détaillée
3. [IMPLEMENTATION.md](IMPLEMENTATION.md) - Détails d'implémentation

### Je veux modifier le code
1. [DEVELOPMENT.md](DEVELOPMENT.md) - Setup de dev
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Comprendre la structure
3. [TESTING.md](TESTING.md) - Tester les modifications

### Je veux contribuer
1. [DEVELOPMENT.md](DEVELOPMENT.md) - Setup
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture
3. [TESTING.md](TESTING.md) - Tests à faire
4. [IMPLEMENTATION.md](IMPLEMENTATION.md) - État actuel

### Je veux déployer en production
1. [TESTING.md](TESTING.md) - Checklist complète
2. [STATUS.md](STATUS.md) - Vérifier que tout est OK
3. [DEVELOPMENT.md](DEVELOPMENT.md) - Commandes de build/zip

## 📊 Statistiques du projet

- **Fichiers de code** : 13 fichiers TypeScript
- **Modules utilitaires** : 10 modules
- **Entrypoints** : 3 (content, background, popup)
- **Lignes de code** : ~2000+ lignes
- **Documentation** : 7 fichiers (50 KB total)
- **Taille du build** : 59.29 kB
- **Compilation** : ✅ Sans erreurs
- **Linter** : ✅ Aucune erreur

## 🔗 Liens rapides

### Fichiers principaux
- [src/lib/storage.ts](src/lib/storage.ts) - Gestion du storage
- [src/lib/panel.ts](src/lib/panel.ts) - UI du panneau
- [entrypoints/content.ts](entrypoints/content.ts) - Content script principal
- [entrypoints/popup/main.ts](entrypoints/popup/main.ts) - UI des settings

### Configuration
- [wxt.config.ts](wxt.config.ts) - Config WXT
- [package.json](package.json) - Config npm
- [tsconfig.json](tsconfig.json) - Config TypeScript

## 🎓 Concepts clés

### Tracking interne
L'extension utilise un **tracking interne** des clics (pas besoin de la permission `history`). Chaque clic sur un lien incrémente un compteur dans le storage local.

### Filtrage strict
Seules les **pages web** sont préchargées (pas de fichiers, médias, emails, torrents, etc.). Le filtrage se fait via `url-utils.ts`.

### Domaines désactivés
L'extension est **désactivée par défaut** sur les sites à listes massives (YouTube, Facebook, etc.) pour éviter la surcharge.

### Aucun layout shift
Le panneau est en `position: fixed` et **ne modifie jamais** la largeur du `body` de la page courante.

### Préchargement borné
Maximum **3 liens préchargés** par défaut (configurable de 1 à 10) pour ne pas surcharger le réseau/CPU.

## 🆘 Besoin d'aide ?

### Problèmes courants
Consultez la section "Problèmes courants" dans [QUICKSTART.md](QUICKSTART.md#problèmes-courants)

### Console logs
Consultez la section "Console logs à surveiller" dans [TESTING.md](TESTING.md#console-logs-à-surveiller)

### Architecture
Consultez les diagrammes dans [ARCHITECTURE.md](ARCHITECTURE.md)

## 🎉 Statut actuel

✅ **Tous les todos sont complétés !**

L'extension est **100% fonctionnelle** et prête à être utilisée. Voir [STATUS.md](STATUS.md) pour les détails.

## 📝 Notes

- Tous les fichiers sont en **français** (selon vos préférences)
- Le code est **entièrement commenté**
- La documentation est **exhaustive** (50 KB)
- Le projet est **prêt pour la production**

---

**Bon développement ! 🚀**

