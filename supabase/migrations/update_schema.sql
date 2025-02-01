-- Drop exercises table and update classrooms
alter table classrooms 
  drop column current_exercise_id,
  add column current_exercise text;

-- Update scores table to use exercise_id as text
alter table scores
  alter column exercise_id type text;