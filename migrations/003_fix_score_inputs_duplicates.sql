BEGIN;

-- Remove duplicate score_inputs rows, keeping one per standings entry.
DELETE FROM score_inputs
WHERE ctid IN (
  SELECT ctid
  FROM (
    SELECT ctid,
           ROW_NUMBER() OVER (PARTITION BY entry_id ORDER BY ctid) AS rn
    FROM score_inputs
  ) t
  WHERE rn > 1
);

COMMIT;
