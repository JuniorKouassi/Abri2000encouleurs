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

`src/worker.js` sert uniquement les vidéos, pour répondre aux requêtes partielles (Range) exigées par Safari et l'iPhone. Tout le reste est servi directement par Cloudflare.
