# Guide de test - Prometheus

## Scénarios de test

### 1. Installation et configuration initiale

1. Charger l'extension en mode dev
2. Ouvrir le popup (cliquer sur l'icône)
3. Vérifier que les paramètres par défaut sont corrects :
   - Nombre max de préchargement : 3
   - Liste des domaines désactivés pré-remplie
   - Blacklist vide

### 2. Test du tracking des visites

1. Aller sur une page avec plusieurs liens (ex: Wikipédia)
2. Cliquer sur 3-4 liens différents
3. Revenir à la page d'origine (bouton retour)
4. **Résultat attendu** : Le panneau Prometheus devrait apparaître à droite avec les liens cliqués

### 3. Test de l'affichage du panneau

**Sur une page avec liens visités :**
- ✅ Le panneau apparaît à droite
- ✅ Affiche jusqu'à 5 miniatures
- ✅ Chaque miniature montre : favicon, titre, badge de visites
- ✅ Le fond du panneau correspond au fond de la page
- ✅ Aucun changement de largeur du body (vérifier avec DevTools)

**Sur une page sans liens visités :**
- ✅ Aucun panneau visible
- ✅ Aucun élément injecté dans le DOM

**Sur un domaine désactivé (ex: YouTube) :**
- ✅ Aucun panneau, même si des liens ont été visités

### 4. Test du hover

1. Sur une page avec le panneau visible
2. Passer la souris sur une miniature
3. **Résultat attendu** :
   - L'iframe du site s'affiche à la place de la miniature
   - Les autres miniatures restent visibles mais atténuées
   - Pas de changement de largeur du body
   - Le site se charge dans l'iframe

4. Retirer la souris
5. **Résultat attendu** :
   - L'iframe disparaît
   - Les miniatures redeviennent normales

### 5. Test de la navigation

1. Hover sur une miniature pour afficher l'iframe
2. Cliquer sur l'iframe
3. **Résultat attendu** :
   - Animation de transition (scale/fade)
   - Navigation vers la page
   - La page devrait se charger rapidement (préchargée)

### 6. Test de la blacklist

1. Sur une miniature, cliquer sur la croix rouge (en bas à droite)
2. **Résultat attendu** :
   - La miniature disparaît immédiatement
   - Le lien est ajouté à la blacklist
   - Si c'était le dernier lien, le panneau disparaît complètement

3. Ouvrir le popup
4. **Résultat attendu** :
   - Le lien apparaît dans la section "Liens blacklistés"

5. Cliquer sur "Retirer" à côté du lien
6. Recharger la page
7. **Résultat attendu** :
   - Le lien réapparaît dans le panneau

### 7. Test du filtrage des URLs

**URLs qui NE doivent PAS apparaître dans le panneau :**
- ❌ Liens vers des images (.jpg, .png, etc.)
- ❌ Liens vers des PDFs (.pdf)
- ❌ Liens vers des fichiers (.zip, .exe, etc.)
- ❌ Liens mailto:
- ❌ Liens tel:
- ❌ Liens magnet:
- ❌ Liens avec paramètre `?download=`

**URLs qui DOIVENT apparaître :**
- ✅ Pages web normales (http/https)
- ✅ Pages avec paramètres de tracking (les paramètres UTM sont normalisés)

### 8. Test des paramètres (popup)

**Modifier le nombre max de préchargement :**
1. Ouvrir le popup
2. Changer la valeur (ex: 5)
3. Cliquer sur "Enregistrer"
4. **Résultat attendu** : Message "Paramètres enregistrés !"
5. Recharger une page avec liens
6. Vérifier dans la console : `[Prometheus] Preloading: ...` (max 5 fois)

**Ajouter un domaine désactivé :**
1. Ouvrir le popup
2. Dans "Domaines désactivés", entrer "exemple.com"
3. Cliquer sur "Ajouter"
4. Cliquer sur "Enregistrer"
5. Aller sur exemple.com
6. **Résultat attendu** : Aucun panneau, même avec liens visités

**Réinitialiser les paramètres :**
1. Modifier plusieurs paramètres
2. Cliquer sur "Réinitialiser"
3. Confirmer
4. **Résultat attendu** : Tous les paramètres reviennent aux valeurs par défaut

### 9. Test des iframes bloquées (CSP)

1. Visiter des sites avec CSP strict (ex: Google, GitHub)
2. Cliquer sur des liens
3. Revenir et hover sur une miniature
4. **Résultat attendu** :
   - Message "🔒 Aperçu indisponible"
   - Bouton "Ouvrir le lien"
   - Clic sur le bouton → navigation normale

### 10. Test des SPAs (Single Page Apps)

1. Aller sur un site SPA (ex: Twitter/X si non désactivé)
2. Naviguer via les liens internes (sans rechargement de page)
3. **Résultat attendu** :
   - Le panneau se met à jour après ~500ms
   - Les nouveaux liens apparaissent si visités

### 11. Test de performance

**Vérifier qu'il n'y a pas de ralentissement :**
1. Ouvrir DevTools → Performance
2. Charger une page avec beaucoup de liens (ex: page de recherche)
3. **Résultat attendu** :
   - Pas de layout shift (score CLS = 0)
   - Pas de ralentissement perceptible
   - Pas de freeze/lag au scroll

**Vérifier la mémoire :**
1. DevTools → Memory
2. Prendre un snapshot
3. Naviguer sur plusieurs pages avec le panneau
4. Prendre un nouveau snapshot
5. **Résultat attendu** : Pas de fuite mémoire majeure

### 12. Test multi-onglets

1. Ouvrir plusieurs onglets avec l'extension active
2. Cliquer sur des liens dans différents onglets
3. **Résultat attendu** :
   - Chaque onglet a son propre panneau
   - Les compteurs de visites sont partagés entre onglets
   - Pas d'interférence entre les panneaux

## Console logs à surveiller

En mode développement, l'extension log :
- `[Prometheus] Content script initialized`
- `[Prometheus] Domain disabled, skipping: ...` (si domaine désactivé)
- `[Prometheus] Eligible links found: X`
- `[Prometheus] Visit tracked: ...` (à chaque clic)
- `[Prometheus] Preloading: ...` (pour chaque URL préchargée)
- `[Prometheus] Link blacklisted: ...` (quand on blacklist)

## Erreurs à surveiller

- ❌ Erreurs de CORS dans l'iframe (normal pour certains sites)
- ❌ Erreurs CSP (normal, on a un fallback)
- ✅ Pas d'erreurs JavaScript non gérées
- ✅ Pas d'erreurs de storage

## Compatibilité navigateurs

### Chrome/Edge (MV3)
```bash
npm run dev
npm run build
```

### Firefox (MV2)
```bash
npm run dev:firefox
npm run build:firefox
```

## Checklist finale avant release

- [ ] Tous les tests ci-dessus passent
- [ ] Aucune erreur dans la console
- [ ] Performance acceptable (pas de lag)
- [ ] UI responsive et cohérente
- [ ] Popup fonctionnel et clair
- [ ] Documentation à jour (README.md)
- [ ] Build sans warnings
- [ ] Test sur Chrome ET Firefox
- [ ] Icons corrects (16, 32, 48, 96, 128)
- [ ] Manifest.json valide

