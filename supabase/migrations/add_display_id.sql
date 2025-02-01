ALTER TABLE classrooms
ADD COLUMN display_id text,
ADD CONSTRAINT unique_display_id UNIQUE (display_id); 