# Festival Abri2000 en Couleurs 3

Site d'une page du festival (25 et 26 décembre 2026, Cité Abri 2000, Koumassi).

En ligne : https://abri2000encouleurs.kouassij019.workers.dev

Les polices (Lilita One, Poppins, Kaushan Script) sont hébergées dans `assets/fonts/`, sans appel à Google Fonts.

Pour voir le site en local : `npx serve .` puis ouvrir http://localhost:3000.

Pour le développer avec Claude Code : ouvrir ce dossier dans Claude Code, le brief est dans `CLAUDE.md`.

## Mise en ligne

Le site est servi par le Worker Cloudflare `abri2000encouleurs` (fichiers statiques, voir `wrangler.jsonc`).
Chaque push sur `main` relance le déploiement. Déploiement manuel : `npx wrangler deploy`.

- `.assetsignore` liste les fichiers qui ne sont pas publiés (`reference/`, `CLAUDE.md`, configuration).
- `_headers` règle le cache et quelques en-têtes de sécurité.

## Images

Chaque photo `assets/img/nom.jpg` a des variantes `nom-400.avif`, `nom-400.webp`, `nom-800.…` jusqu'à sa largeur d'origine,
utilisées par les balises `<picture>` de `index.html`. Le JPEG reste en secours et sert à la visionneuse.
En ajoutant une photo, générer les mêmes variantes et la même balise `<picture>`.

## Quand le nom de domaine sera connu

Remplacer `abri2000encouleurs.kouassij019.workers.dev` dans `index.html` (canonical, Open Graph, JSON-LD), `robots.txt` et `sitemap.xml`.

## Vidéo de l'ouverture

`assets/video/festival-ambiance.mp4` : les 20 premières secondes de la vidéo source, sans le son, jouées en boucle dans le cadre de la photo principale.
Après une modification de `style.css` ou `main.js`, changer le numéro `?v=` dans `index.html` pour que les navigateurs prennent la nouvelle version.

`src/video.js` répond aux requêtes partielles (Range) sur les vidéos, exigées par Safari et l'iPhone. Les autres fichiers sont servis directement par Cloudflare.

## Réservations

Le bouton « Réserver » (barre du haut, ouverture, section Partenaires, pied de page) ouvre la fenêtre de `assets/js/reservation.js` : place dans le public (gratuite, sert à compter les personnes attendues), stand, ou partenariat.

- Les demandes arrivent sur `POST /api/reservations` (`src/reservations.js`) et sont enregistrées dans la base D1 `abri2000-reservations` (schéma dans `migrations/`).
- Page privée de l'équipe : `/equipe/`, protégée par le mot de passe `MOT_DE_PASSE_EQUIPE`. Compteurs par jour, listes, suivi des stands et partenaires, export Excel (`src/equipe.js`).
- Mail à infos.147event@gmail.com à chaque demande, seulement si le secret `RESEND_API_KEY` est défini (compte Resend). Sans clé, les demandes sont quand même enregistrées.
- Secrets Cloudflare : `MOT_DE_PASSE_EQUIPE`, `CLE_SESSION`, `RESEND_API_KEY`, à définir avec `npx wrangler secret put NOM_DU_SECRET`. En local, les mettre dans `.dev.vars` (non versionné).
- Nouvelle migration : `npx wrangler d1 migrations apply abri2000-reservations --remote`.
