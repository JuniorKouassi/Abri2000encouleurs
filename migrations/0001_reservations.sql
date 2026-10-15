-- Demandes envoyées depuis le bouton « Réserver » du site
CREATE TABLE reservations (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  type      TEXT NOT NULL CHECK (type IN ('public', 'stand', 'partenaire')),
  cree_le   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  nom       TEXT NOT NULL,
  sexe      TEXT NOT NULL,
  tel       TEXT NOT NULL,
  email     TEXT,
  jours     TEXT NOT NULL DEFAULT '', -- 'Vendredi 25', 'Samedi 26' ou 'Les deux jours' (vide pour un partenaire)
  places    INTEGER NOT NULL DEFAULT 0, -- public seulement
  details   TEXT NOT NULL DEFAULT '{}', -- réponses propres au type, en JSON
  suivi     TEXT NOT NULL DEFAULT 'Nouveau'
);
CREATE INDEX reservations_type ON reservations (type, cree_le);
