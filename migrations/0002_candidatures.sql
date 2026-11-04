-- Ajoute le type « candidature » (Prix du Meilleur Entrepreneur).
-- SQLite ne sait pas modifier une contrainte CHECK : on recrée la table et on recopie les demandes.
CREATE TABLE reservations_new (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  type      TEXT NOT NULL CHECK (type IN ('public', 'stand', 'partenaire', 'candidature')),
  cree_le   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  nom       TEXT NOT NULL,
  sexe      TEXT NOT NULL,
  tel       TEXT NOT NULL,
  email     TEXT,
  jours     TEXT NOT NULL DEFAULT '',
  places    INTEGER NOT NULL DEFAULT 0,
  details   TEXT NOT NULL DEFAULT '{}',
  suivi     TEXT NOT NULL DEFAULT 'Nouveau'
);
INSERT INTO reservations_new (id, type, cree_le, nom, sexe, tel, email, jours, places, details, suivi)
  SELECT id, type, cree_le, nom, sexe, tel, email, jours, places, details, suivi FROM reservations;
DROP TABLE reservations;
ALTER TABLE reservations_new RENAME TO reservations;
CREATE INDEX reservations_type ON reservations (type, cree_le);
