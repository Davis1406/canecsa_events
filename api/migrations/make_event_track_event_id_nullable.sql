-- Make event_track.event_id nullable so sub-themes can exist without being tied to an event
ALTER TABLE event_track MODIFY COLUMN event_id INT NULL;
