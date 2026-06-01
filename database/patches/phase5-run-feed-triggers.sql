-- Apply in Supabase SQL Editor if triggers.sql was already run before Phase 5.
-- Adds run_updated and run_deleted feed events.

create or replace function handle_run_updated()
returns trigger
language plpgsql
as $$
begin

    if old.distance_km is distinct from new.distance_km
        or old.duration_min is distinct from new.duration_min
        or old.notes is distinct from new.notes then

        perform create_feed_event(
            new.challenge_id,
            new.user_id,
            'run_updated',
            'run',
            new.id,
            jsonb_build_object(
                'distance_km', new.distance_km,
                'duration_min', new.duration_min
            )
        );

    end if;

    return new;

end;
$$;

drop trigger if exists run_updated_trigger on runs;

create trigger run_updated_trigger
after update on runs
for each row
execute function handle_run_updated();

create or replace function handle_run_deleted()
returns trigger
language plpgsql
as $$
begin

    perform create_feed_event(
        old.challenge_id,
        old.user_id,
        'run_deleted',
        'run',
        old.id,
        jsonb_build_object(
            'distance_km', old.distance_km,
            'duration_min', old.duration_min
        )
    );

    return old;

end;
$$;

drop trigger if exists run_deleted_trigger on runs;

create trigger run_deleted_trigger
before delete on runs
for each row
execute function handle_run_deleted();
