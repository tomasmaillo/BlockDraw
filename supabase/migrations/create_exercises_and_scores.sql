-- Create exercises table
create table exercises (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  instructions text [] not null,
  validation_rules jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
-- Create scores table
create table scores (
  id uuid default uuid_generate_v4() primary key,
  participant_id uuid references participants(id),
  exercise_id uuid references exercises(id),
  score integer not null,
  time_taken integer not null,
  -- in seconds
  completed_at timestamp with time zone default timezone('utc'::text, now())
);
-- Add exercise_id to classrooms
alter table classrooms
add column current_exercise_id uuid references exercises(id);