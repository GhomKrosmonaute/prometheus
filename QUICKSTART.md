# 🚀 Démarrage rapide - Prometheus

## Installation

```bash
npm install
```

## Lancer en mode développement

```bash
npm run dev
```

## Charger l'extension dans Chrome

1. Ouvrir Chrome
2. Aller sur `chrome://extensions/`
3. Activer le **Mode développeur** (toggle en haut à droite)
4. Cliquer sur **"Charger l'extension non empaquetée"**
5. Sélectionner le dossier `.output/chrome-mv3`

✅ L'extension est maintenant active !

## Premier test

1. Aller sur **Wikipédia** (ou n'importe quel site avec des liens)
2. Cliquer sur **3-4 liens** différents
3. Utiliser le **bouton retour** du navigateur
4. 🎉 Le panneau Prometheus devrait apparaître à droite avec vos liens !

## Interactions

- **Hover** sur une miniature → Aperçu du site dans un iframe
- **Clic** sur l'iframe → Navigation avec animation
- **Croix rouge** → Blacklister le lien (ne plus le précharger)

## Configurer l'extension

1. Cliquer sur l'**icône Prometheus** dans la barre d'outils
2. Modifier les paramètres :
   - Nombre max de liens à précharger
   - Ajouter/retirer des domaines désactivés
   - Gérer la blacklist
3. Cliquer sur **"Enregistrer"**

## Sites où l'extension est désactivée par défaut

- YouTube, SoundCloud
- Facebook, TikTok, Instagram
- Leboncoin, Twitter/X, Reddit, LinkedIn

*(Vous pouvez les activer via les paramètres si souhaité)*

## Commandes utiles

```bash
# Développement
npm run dev              # Chrome
npm run dev:firefox      # Firefox

# Build production
npm run build            # Chrome
npm run build:firefox    # Firefox

# Créer un ZIP
npm run zip              # Chrome
npm run zip:firefox      # Firefox

# Vérifier TypeScript
npm run compile
```

## Besoin d'aide ?

- 📖 [README.md](README.md) - Description complète du projet
- 🛠️ [DEVELOPMENT.md](DEVELOPMENT.md) - Guide de développement
- ✅ [TESTING.md](TESTING.md) - Scénarios de test
- 📋 [IMPLEMENTATION.md](IMPLEMENTATION.md) - Détails d'implémentation

## Problèmes courants

### Le panneau n'apparaît pas
- ✅ Avez-vous cliqué sur des liens avant ?
- ✅ Le site est-il dans la liste des domaines désactivés ?
- ✅ Vérifiez la console : `[Prometheus] Eligible links found: X`

### L'iframe ne s'affiche pas
- ℹ️ Certains sites bloquent les iframes (CSP)
- ✅ Un message "Aperçu indisponible" devrait s'afficher
- ✅ Vous pouvez quand même cliquer pour naviguer

### L'extension ralentit mon navigateur
- ⚙️ Réduisez le nombre max de préchargements (popup → 1 ou 2)
- ⚙️ Ajoutez les sites lourds aux domaines désactivés

## Support

Pour toute question ou bug, consultez les fichiers de documentation ou ouvrez une issue sur le repo.

---

**Bon test ! 🔥**

