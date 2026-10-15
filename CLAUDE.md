# Festival Abri2000 en Couleurs 3 : site web d'une page

Brief pour Claude Code. Lis ce fichier en entier avant de toucher au code.

## Le projet

Site vitrine d'une seule page pour la **3e édition du Festival Abri2000 en Couleurs**, organisé par **147 Event** avec l'**Association des Jeunes de la Cité Abri 2000 de Koumassi** (Abidjan, Côte d'Ivoire).

Objectifs de la page, par ordre de priorité :
1. Annoncer le festival (dates, lieu, programme).
2. Attirer des partenaires et sponsors (bouton WhatsApp, numéros, Facebook).
3. Montrer l'engagement des jeunes de la cité (photos des éditions précédentes, actions citoyennes).

**Langue : exclusivement en français.** Aucun texte en anglais visible sur le site.

## État actuel

Le design est **validé par le client**. La page fonctionne déjà en HTML, CSS et JavaScript pur, sans framework ni étape de build. Ouvre `index.html` dans un navigateur pour la voir.

Ne change pas la direction artistique. Le travail restant consiste à préparer la mise en ligne (voir « Tâches » plus bas).

## Structure des fichiers

```
index.html              page complète (sections dans l'ordre ci-dessous)
assets/css/style.css    tous les styles, tokens de couleur en haut du fichier
assets/js/main.js       compte à rebours, filtres galerie, visionneuse photo, boutons « Copier »
assets/js/reservation.js fenêtre « Réserver » (public, stand, partenaire)
equipe/index.html       page privée de l'équipe (réservations), protégée par mot de passe
src/                    Worker Cloudflare : API des réservations, page équipe, vidéos
migrations/             schéma de la base D1 des réservations
assets/img/             photos (jpg), logos (webp), nuages de poudre transparents (webp)
reference/              documents sources du client : flyer, papier en-tête, PDF
```

Sections de la page, dans l'ordre : navigation, ouverture (accueil), bandeau défilant des valeurs, Le festival, Activités (8 cartes), Programme (2 jours), En images (galerie filtrable), Nos actions dans la cité, Partenaires et contacts, pied de page.

## Charte graphique (à respecter strictement)

Elle reprend le flyer et le papier en-tête du festival (dossier `reference/`).

Couleurs (variables CSS dans `:root`) :
| Token | Hex | Usage |
|---|---|---|
| `--violet` | #6A2CA8 | couleur principale |
| `--violet-profond` | #43197F | titres, dégradés |
| `--violet-nuit` | #2A0E57 | sections sombres (programme, pied de page) |
| `--orange` | #F46C16 | accent, titres autocollant |
| `--rose` | #E91E78 | accent, boutons |
| `--bleu` | #1E88E5 | accent secondaire |
| `--jaune` | #FFBE14 | accent secondaire |
| `--vert` | #78BE3C | accent secondaire |
| `--encre` | #24123F | texte courant |

Polices (Google Fonts) :
- **Lilita One** : grands titres
- **Poppins** : texte courant
- **Kaushan Script** : touches manuscrites (slogan, « Troisième édition »)

Éléments signature : nuages de poudre colorée (style Holi) en arrière-plan, motif hexagonal discret, titres type autocollant avec contour blanc, photos posées comme des tirages légèrement inclinés, ligne tricolore orange, jaune, vert (reprise du papier en-tête).

Règles de rédaction : pas de tirets cadratins dans les textes, utiliser des virgules, deux-points ou des phrases séparées.

## Informations officielles (ne pas modifier sans accord du client)

- **Dates** : vendredi 25 et samedi 26 décembre 2026
- **Lieu** : Koumassi, Sci Lagune, Cité Abri2000 (147 logements)
- **Google Maps** : https://maps.app.goo.gl/ezuLBU18LiKTqTJx5?g_st=atm
- **WhatsApp (bouton « Écrivez-nous »)** : +225 07 47 77 84 53, lien `https://wa.me/2250747778453`
- **Infoline** : 01 42 75 64 03 / 07 49 43 41 29 / 07 08 47 95 43
- **Président de 147 Event** : Bléhiri Martin, 07 47 77 84 53 / 07 09 30 84 26
- **Facebook** : facebook.com/cent47event
- **Slogans** : « Ensemble pour un meilleur avenir ! », « Plus qu'un festival, un véritable rendez-vous de cohésion ! », « Solidarité, Engagement, Développement »
- **Valeurs** : Culture, Solidarité, Sport, Gastronomie, Divertissement

Le compte à rebours vise le 25 décembre 2026 à 00:00, heure d'Abidjan (UTC+0), dans `assets/js/main.js`.

## Tâches pour la mise en ligne

1. **Vérifier en local** : servir le dossier (`npx serve .` ou `python3 -m http.server`) et contrôler la page en largeur bureau et mobile (390 px). Aucune barre de défilement horizontale ne doit apparaître.
2. **Images** :
   - générer des versions WebP et AVIF des photos avec `srcset`/`sizes`, en gardant le JPEG en secours ;
   - garder `width` et `height` sur chaque `<img>` ;
   - compresser sans perte visible.
3. **SEO local** :
   - ajouter un bloc JSON-LD `Event` (nom, dates, lieu, organisateur 147 Event, `isAccessibleForFree` à confirmer avec le client) ;
   - ajouter `robots.txt` et `sitemap.xml` ;
   - mettre des URL absolues dans les balises Open Graph une fois le domaine connu.
4. **Favicon** : produire `favicon.ico`, `favicon-32.png` et `apple-touch-icon.png` (180 px) à partir de `assets/img/logo-147event.webp`.
5. **Image de partage** : créer `og-image.jpg` (1200 × 630) avec le titre du festival sur la photo `hero-foule.jpg`, dans la charte.
6. **Accessibilité** :
   - contraste du texte sur les nuages de poudre (le texte d'accroche a un halo blanc, à conserver) ;
   - focus clavier visible ;
   - visionneuse fermable avec Échap ;
   - respecter `prefers-reduced-motion`.
7. **Performance** :
   - précharger la police Lilita One et `hero-foule.jpg` ;
   - viser un score Lighthouse supérieur à 90 sur mobile.
8. **Déploiement** : Worker Cloudflare `abri2000encouleurs` (fichiers statiques, plus une base D1 pour les réservations). Voir README.md.

## À ne pas faire

- Ne pas remplacer les photos par des images génériques ou générées.
- Ne pas recadrer ni retoucher les photos du festival.
- Ne pas ajouter de cartes ou d'encadrés autour du texte d'accroche de l'ouverture : le client les a refusés.
- Ne pas revenir aux icônes simples : les icônes des activités sont des pictogrammes duotone sur tuiles en dégradé, validés par le client.
- Ne pas inventer de chiffres (fréquentation, nombre de sponsors, etc.).

## Points à confirmer avec le client

- Logos des partenaires et sponsors confirmés, pour ajouter une rangée de logos dans la section Partenaires.
- Orthographe exacte de « Sci Lagune » dans l'adresse.
