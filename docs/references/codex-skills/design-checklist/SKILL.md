---
name: design-checklist
description: "Audit détaillé d'une interface (maquette, capture, Figma, code, URL) via des checklists pages, composants, parcours et fondations inspirées de checklist.design, pour relire ou concevoir un design."
---

# Design Checklist : vérifier chaque détail, livrer un meilleur travail

Inspirée de [checklist.design](https://www.checklist.design/), qui classe ses checklists en **Websites, Web apps, Mobile, Components et Flows**. Le but est de repérer ce qu'on oublie presque toujours : états vides, erreurs, chargement, cas limites, accessibilité et responsive. Le rendu visuel « happy path » est rarement là où se cachent les problèmes.

## Quand l'utiliser

- **Mode audit** : l'utilisateur fournit un design (image, PDF, lien Figma, HTML/React, URL) et veut une relecture ou une validation.
- **Mode conception** : l'utilisateur va concevoir un écran, un composant ou un parcours, et veut la liste de ce qu'il ne doit pas oublier.
- **Mode handoff** : vérifier qu'une maquette est complète (tous les états, toutes les tailles) avant de la passer aux développeurs.

## Méthode

1. **Identifier le périmètre** : plateforme (site web, web app, mobile), type de page, composants visibles, parcours concerné. Un écran de connexion, par exemple, active la page « Login », les composants Input Field, Button, Checkbox et Toast, le parcours « Mot de passe » et les fondations.
2. **Sélectionner les checklists** ci-dessous qui s'appliquent. Ignorer celles qui ne concernent pas l'écran : une liste de 200 points non pertinents noie les vrais problèmes.
3. **Examiner réellement le design**. Ouvrir l'image, lire le code, parcourir la page. Chaque verdict doit s'appuyer sur ce qui est visible. Si un état n'est pas montré (ex. erreur), le noter « Non fourni » plutôt que « OK ».
4. **Adapter à la plateforme** : cibles tactiles de 44×44 pt (iOS) ou 48×48 dp (Android) sur mobile, hover et raccourcis clavier sur desktop, safe areas, clavier virtuel.
5. **Rédiger le rapport** au format ci-dessous, avec les problèmes classés par gravité.

## Format du rapport

```
# Audit design : [nom de l'écran]
Périmètre : [plateforme] · [page] · [composants] · [parcours]

## Synthèse
Score : X/Y points validés · N bloquants · N majeurs · N mineurs
[2-3 phrases : l'essentiel à corriger en priorité]

## Problèmes
### 🔴 Bloquant  (empêche d'accomplir la tâche, inaccessible, perte de données)
- **[Checklist › Point]** Constat précis → Recommandation concrète
### 🟠 Majeur  (friction importante, état manquant, incohérence visible)
### 🟡 Mineur  (finition, polish)

## Non fourni / à vérifier
- États ou tailles absents du livrable qu'il faut concevoir

## Points validés
- Liste courte de ce qui est bien fait (utile pour ne pas le casser)
```

En mode conception, livrer plutôt la checklist filtrée sous forme de cases à cocher `- [ ]`, groupée par section.

Rédiger dans la langue de l'utilisateur. Chaque constat doit être spécifique : « Le champ mot de passe n'a pas d'icône afficher/masquer » plutôt que « améliorer le champ mot de passe ».

---

## 1. Fondations (toujours appliquer)

**Typographie** : hiérarchie claire (3-4 niveaux maximum), corps ≥ 16 px sur le web, interligne de 1,4 à 1,6, lignes de 45 à 80 caractères, pas plus de 2 familles de police, pas de texte justifié.
**Couleur et contraste** : texte ≥ 4.5:1 (≥ 3:1 pour le gros texte et les éléments d'interface, WCAG AA), l'information n'est jamais portée par la couleur seule, couleurs sémantiques cohérentes (erreur, succès, alerte, info), mode sombre prévu si pertinent.
**Espacement et grille** : échelle d'espacement cohérente (ex. multiples de 4 ou 8), alignements respectés, proximité qui reflète les regroupements logiques.
**Accessibilité** : ordre de focus logique, focus visible, libellés pour les lecteurs d'écran, textes alternatifs, zones cliquables suffisantes, pas d'animation indispensable (respecter `prefers-reduced-motion`).
**Responsive** : versions mobile, tablette et desktop, pas de défilement horizontal, contenu prioritaire en haut sur mobile, images adaptées.
**Contenu** : microcopie claire et orientée action, ton cohérent, textes longs et traductions anticipés (+30 % en français et en allemand), formats de date, heure et devise localisés.
**Icônes et images** : style d'icônes homogène (trait ou plein, épaisseur), icône seule accompagnée d'un libellé ou d'un tooltip, images optimisées avec des ratios cohérents.

## 2. États universels (à vérifier sur chaque écran et composant)

- Par défaut, survol, focus, actif/pressé, désactivé, sélectionné
- Chargement (skeleton ou indicateur), vide (premier usage, aucun résultat), erreur (réseau, serveur, permission), succès
- Données extrêmes : texte très long, 0 élément, 1 élément, 10 000 éléments, nom sans photo
- Hors ligne ou connexion lente

---

## 3. Pages

**Login** : e-mail ou identifiant et mot de passe, afficher/masquer le mot de passe, lien « Mot de passe oublié », « Se souvenir de moi », connexion sociale ou SSO si proposée, lien vers l'inscription, erreur générique sans révéler si le compte existe, état de chargement du bouton, autocomplete et gestionnaires de mots de passe compatibles, verrouillage après plusieurs tentatives expliqué.
**Signup** : champs réduits au minimum, règles du mot de passe affichées avant la saisie, validation en ligne, CGU et confidentialité, consentement explicite (RGPD), lien vers le login, e-mail de vérification annoncé, connexion sociale.
**Onboarding** : valeur montrée rapidement, étapes numérotées et possibilité de passer, progression visible, personnalisation optionnelle, écran final avec une action claire.
**Homepage / landing** : proposition de valeur compréhensible en 5 s, CTA principal unique et visible au-dessus de la ligne de flottaison, preuve sociale, navigation claire, footer complet, performance (LCP).
**Pricing** : plans comparables côte à côte, plan recommandé mis en évidence, bascule mensuel/annuel avec l'économie indiquée, devise et taxes précisées, FAQ, CTA par plan, offre Entreprise ou contact.
**Page produit** : galerie avec zoom, prix et disponibilité, variantes (taille, couleur) avec les états en rupture, ajout au panier avec retour visuel, livraison et retours, avis.
**Panier** : modifier la quantité, supprimer (avec annulation), sous-total, frais et taxes, code promo, panier vide, continuer les achats, CTA de paiement.
**Checkout** : étapes visibles, commande en invité possible, adresse avec autocomplétion, récapitulatif persistant, moyens de paiement, sécurité rassurante, erreurs de paiement récupérables, page de confirmation avec numéro de commande.
**Dashboard** : KPI prioritaires en haut, filtres et période, états vide et chargement par widget, date de mise à jour, graphiques lisibles (légende, unités).
**Settings** : sections groupées, enregistrement explicite ou automatique clairement signalé, actions destructrices isolées et confirmées, préférences de notification.
**Profil** : avatar avec valeur par défaut, édition en place ou via formulaire, champs publics ou privés indiqués.
**Recherche / résultats** : nombre de résultats, requête rappelée, filtres et tri, aucun résultat accompagné de suggestions, surlignage des termes, pagination ou chargement infini.
**404 / erreur** : message humain, retour à l'accueil, recherche, liens utiles, cohérence avec la marque.
**Blog / article** : titre, auteur, date, temps de lecture, sommaire pour les articles longs, partage, articles liés, lisibilité.
**Contact** : formulaire court, autres canaux (e-mail, téléphone, adresse), délai de réponse, confirmation d'envoi.

## 4. Composants

**Accordion** : icône d'état (chevron) qui tourne, zone cliquable sur toute l'en-tête, un ou plusieurs panneaux ouverts (choix documenté), `aria-expanded`, navigation au clavier.
**Avatar** : tailles définies, repli sur les initiales puis sur une icône, forme cohérente, indicateur de statut, groupe avec « +N ».
**Badge** : lisible à petite taille, variantes sémantiques, compteur plafonné (99+), position sur l'icône.
**Banner** : niveaux (info, alerte, erreur, succès), dismissible ou non, action optionnelle, ne masque pas le contenu.
**Button** : hiérarchie primaire, secondaire, tertiaire et destructif, libellé verbe + objet, tous les états y compris chargement (largeur stable), tailles, icône optionnelle, zone cliquable minimale, un seul bouton primaire par zone.
**Card** : zone cliquable claire (toute la carte ou ses éléments, pas les deux en conflit), image avec ratio fixe, troncature du texte, actions secondaires, états survol et sélection.
**Carousel** : contrôles visibles, indicateurs de position, swipe sur mobile, pause de l'autoplay, accessible au clavier, n'y placer aucun contenu critique.
**Checkbox** : états coché, non coché et indéterminé, libellé cliquable, groupe avec « tout sélectionner », erreur.
**Drawer** : côté d'ouverture cohérent, overlay, fermeture par X, clic extérieur et Échap, focus piégé, largeur responsive.
**Footer** : liens groupés, mentions légales, réseaux sociaux, langue, newsletter, copyright à jour.
**Icon** : grille et taille cohérentes, trait uniforme, sens universel ou libellé, `aria-hidden` ou `aria-label`.
**Input Field** : libellé persistant (pas seulement un placeholder), aide, champ obligatoire ou optionnel indiqué, erreur sous le champ avec la solution, type de clavier mobile adapté, autocomplete, compteur de caractères, états désactivé et lecture seule, préfixe ou suffixe (devise, unité).
**Loading** : spinner pour une attente de moins de 3 s environ, barre de progression au-delà, message si l'attente est longue, annulation possible.
**Modal** : titre clair, fermeture (X, Échap, clic extérieur sauf action critique), focus piégé puis restauré, actions en bas à droite ou empilées sur mobile, défilement interne pour les contenus longs, pas de modal empilé sur un autre modal.
**Navigation** : page active indiquée, hiérarchie limitée, version mobile (menu burger ou tab bar), logo qui renvoie à l'accueil, sticky si long, sous-menus accessibles au clavier.
**Radio** : une option présélectionnée si pertinent, groupe avec légende, libellé cliquable, disposition verticale de préférence.
**Searchbar** : icône loupe, placeholder explicite, bouton pour effacer, suggestions et historique, raccourci clavier (/ ou ⌘K), état sans résultat.
**Skeleton** : forme proche du contenu réel, animation discrète, pas de décalage de mise en page au chargement.
**Slider** : valeur affichée, min et max, pas défini, saisie numérique alternative, poignée assez grande, clavier.
**Table** : en-têtes figés, tri indiqué, alignement des nombres à droite, sélection de lignes, pagination, actions par ligne, version mobile (défilement ou cartes), état vide.
**Tabs** : onglet actif évident, libellés courts, débordement géré (défilement), contenu non perdu en changeant d'onglet, navigation aux flèches.
**Toast** : durée suffisante (≥ 5 s, plus s'il contient une action), action « Annuler », position cohérente, empilement, `aria-live`, pas d'information critique uniquement dans un toast.
**Toggle** : effet immédiat (sinon utiliser une checkbox), libellé de l'état, couleur + position (pas la couleur seule).
**Tooltip** : délai d'apparition, reste dans l'écran, accessible au focus, texte court, jamais indispensable sur mobile (pas de hover).

## 5. Parcours (flows)

**Mot de passe** : oubli → e-mail → lien expirant → nouveau mot de passe avec règles → confirmation → connexion automatique ou redirection. Prévoir le lien expiré, l'e-mail non reçu (renvoyer, vérifier les spams) et le changement depuis les paramètres (ancien mot de passe demandé).
**Vérification de compte** : e-mail ou SMS envoyé avec la destination masquée, code saisissable et collable (OTP), renvoi avec délai, changement d'adresse, succès, lien expiré.
**Inscription → première valeur** : du clic « S'inscrire » jusqu'au premier résultat utile, en minimisant les étapes.
**Paiement / achat** : panier → livraison → paiement → confirmation, avec les échecs (carte refusée, 3-D Secure, stock épuisé pendant l'achat).
**Invitation d'équipe** : saisie multiple, rôles, invitation en attente, renvoi, révocation, acceptation par un nouvel utilisateur ou un utilisateur existant.
**Suppression de compte / de données** : conséquences expliquées, alternative (désactiver, exporter), double confirmation, délai de grâce, e-mail de confirmation.
**Déconnexion** : accessible, session expirée expliquée, retour à l'endroit précédent après reconnexion.
**Recherche → filtre → détail → retour** : filtres et position de défilement conservés au retour.
**Upload de fichier** : glisser-déposer et parcourir, formats et taille maximum annoncés, progression, annulation, erreur par fichier, aperçu.
**Notifications / permissions (mobile)** : pré-demande qui explique la valeur avant la demande système, gestion du refus.

---

## Bonnes pratiques d'audit

- Signaler un problème une seule fois, dans la checklist la plus pertinente, pour éviter les doublons.
- Proposer une correction réalisable, avec des valeurs concrètes quand c'est possible (couleur, taille, texte de remplacement).
- Pour une URL ou du code, vérifier réellement le contraste, le responsive et le clavier quand les outils le permettent (navigateur, Playwright), plutôt que de supposer.
- Garder un ton constructif : commencer la synthèse par le plus important, pas par une liste de reproches.
- Checklists complètes et à jour : https://www.checklist.design/ (catégories Websites, Web apps, Mobile, Components, Flows).