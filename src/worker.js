// Les fichiers statiques sont servis par Cloudflare. Ce script ne sert qu'aux vidéos :
// il répond aux requêtes partielles (Range), indispensables à la lecture sur Safari et iPhone.
export default {
  async fetch(request, env) {
    const range = request.headers.get('Range');
    const reponse = await env.ASSETS.fetch(new Request(request.url, { method: 'GET' }));
    if (!reponse.ok) return reponse;

    const entetes = new Headers(reponse.headers);
    entetes.set('Accept-Ranges', 'bytes');
    const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!m) return new Response(request.method === 'HEAD' ? null : reponse.body, { status: 200, headers: entetes });

    const donnees = await reponse.arrayBuffer();
    const total = donnees.byteLength;
    let debut = m[1] === '' ? total - Number(m[2]) : Number(m[1]);
    let fin = m[1] === '' || m[2] === '' ? total - 1 : Math.min(Number(m[2]), total - 1);
    if (debut < 0) debut = 0;
    if (debut > fin || debut >= total) {
      entetes.set('Content-Range', `bytes */${total}`);
      return new Response(null, { status: 416, headers: entetes });
    }
    entetes.set('Content-Range', `bytes ${debut}-${fin}/${total}`);
    entetes.set('Content-Length', String(fin - debut + 1));
    return new Response(request.method === 'HEAD' ? null : donnees.slice(debut, fin + 1), { status: 206, headers: entetes });
  },
};
