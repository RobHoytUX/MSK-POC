CREATE TABLE IF NOT EXISTS keyword_nodes (
  id            text,
  patient_id    text,
  label         text NOT NULL,
  taxonomy_path text NOT NULL,
  PRIMARY KEY (patient_id, id)
);

CREATE TABLE IF NOT EXISTS keyword_edges (
  patient_id  text NOT NULL,
  from_id     text NOT NULL,
  to_id       text NOT NULL,
  PRIMARY KEY (patient_id, from_id, to_id)
);

CREATE INDEX IF NOT EXISTS idx_keyword_nodes_patient ON keyword_nodes (patient_id);
CREATE INDEX IF NOT EXISTS idx_keyword_nodes_label ON keyword_nodes (label);
CREATE INDEX IF NOT EXISTS idx_keyword_edges_patient_from ON keyword_edges (patient_id, from_id);

CREATE TABLE IF NOT EXISTS research_trail (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  text NOT NULL,
  doctor_id   text NOT NULL,
  doctor_name text NOT NULL,
  node_id     text NOT NULL,
  node_label  text NOT NULL,
  post_type   text NOT NULL,
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_research_trail_patient ON research_trail (patient_id);
