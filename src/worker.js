// Les fichiers statiques sont servis directement par Cloudflare.
// Ce script ne reçoit que /api/* (réservations, page de l'équipe) et /assets/video/* (voir wrangler.jsonc).
import { servirVideo } from './video.js';
import { enregistrer, json } from './reservations.js';
import { routeEquipe } from './equipe.js';

export default {
  async fetch(request, env, ctx) {
    const chemin = new URL(request.url).pathname;
    if (chemin.startsWith('/assets/video/')) return servirVideo(request, env);
    if (chemin === '/api/reservations' && request.method === 'POST') return enregistrer(request, env, ctx);
    if (chemin.startsWith('/api/equipe/')) return routeEquipe(request, env, chemin);
    return json({ erreur: 'Introuvable.' }, 404);
  },
};
