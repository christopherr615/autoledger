BEGIN;

DROP VIEW IF EXISTS standings_page_rows;

ALTER TABLE neighborhoods
  ALTER COLUMN neighborhood_id TYPE varchar(64);

ALTER TABLE standings_entries
  ALTER COLUMN time_window TYPE varchar(40),
  ALTER COLUMN neighborhood_id TYPE varchar(64);

ALTER TABLE standings_entries
  DROP CONSTRAINT IF EXISTS standings_entries_rep_score_check,
  ADD CONSTRAINT standings_entries_rep_score_check CHECK (rep_score >= 0 AND rep_score <= 100);

ALTER TABLE score_inputs
  DROP CONSTRAINT IF EXISTS score_inputs_rating_check,
  ADD CONSTRAINT score_inputs_rating_check CHECK (rating >= 0 AND rating <= 5),
  DROP CONSTRAINT IF EXISTS score_inputs_response_minutes_check,
  ADD CONSTRAINT score_inputs_response_minutes_check CHECK (response_minutes >= 0),
  DROP CONSTRAINT IF EXISTS score_inputs_on_time_percent_check,
  ADD CONSTRAINT score_inputs_on_time_percent_check CHECK (on_time_percent >= 0 AND on_time_percent <= 100);

CREATE OR REPLACE VIEW standings_page_rows AS
SELECT
  se.entry_id,
  se.rank,
  se.operator_id,
  o.operator_name,
  se.league_id,
  l.league_name,
  se.neighborhood_id,
  n.neighborhood_name,
  se.zip_code,
  se.time_window,
  se.rep_score,
  si.rating,
  si.review_count,
  se.rank_delta_30d,
  se.distance_miles,
  o.status
FROM standings_entries se
JOIN operators o ON o.operator_id = se.operator_id
LEFT JOIN leagues l ON l.league_id = se.league_id
LEFT JOIN neighborhoods n ON n.neighborhood_id = se.neighborhood_id
LEFT JOIN score_inputs si ON si.entry_id = se.entry_id;

COMMIT;