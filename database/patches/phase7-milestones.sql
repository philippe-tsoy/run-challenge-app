-- Apply in Supabase SQL Editor if functions.sql / triggers.sql were run before Phase 7.

create or replace function evaluate_team_milestones(
    p_challenge_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_total numeric;
    node_record record;
begin

    select challenge_total_distance(p_challenge_id)
    into v_total;

    for node_record in
        select id
        from journey_nodes
        where challenge_id = p_challenge_id
        and km_marker <= v_total
        order by km_marker
    loop
        insert into challenge_milestones (
            challenge_id,
            journey_node_id
        )
        values (
            p_challenge_id,
            node_record.id
        )
        on conflict do nothing;
    end loop;

end;
$$;

create or replace function evaluate_milestones()
returns trigger
language plpgsql
as $$
begin

    if new.is_valid = true then
        perform evaluate_team_milestones(new.challenge_id);
    end if;

    return new;

end;
$$;

drop trigger if exists milestone_trigger on runs;
drop trigger if exists milestone_trigger_insert on runs;
drop trigger if exists milestone_trigger_update on runs;

create trigger milestone_trigger_insert
after insert on runs
for each row
execute function evaluate_milestones();

create trigger milestone_trigger_update
after update of distance_km, duration_min, is_valid on runs
for each row
when (
    old.distance_km is distinct from new.distance_km
    or old.duration_min is distinct from new.duration_min
    or old.is_valid is distinct from new.is_valid
)
execute function evaluate_milestones();

create or replace function milestone_feed_trigger()
returns trigger
language plpgsql
as $$
declare
    v_node record;
begin

    select name, km_marker, description
    into v_node
    from journey_nodes
    where id = new.journey_node_id;

    perform create_feed_event(
        new.challenge_id,
        null,
        'milestone_reached',
        'journey_node',
        new.journey_node_id,
        jsonb_build_object(
            'nodeId', new.journey_node_id,
            'nodeName', v_node.name,
            'kmMarker', v_node.km_marker,
            'title', v_node.name,
            'message', coalesce(v_node.description, 'Milestone reached')
        )
    );

    return new;

end;
$$;

create or replace function milestone_notify_trigger()
returns trigger
language plpgsql
as $$
declare
    v_node record;
    member_record record;
begin

    select name, km_marker
    into v_node
    from journey_nodes
    where id = new.journey_node_id;

    for member_record in
        select user_id
        from challenge_members
        where challenge_id = new.challenge_id
    loop
        perform create_notification(
            member_record.user_id,
            'milestone_reached',
            jsonb_build_object(
                'challenge_id', new.challenge_id,
                'journey_node_id', new.journey_node_id,
                'node_name', v_node.name,
                'km_marker', v_node.km_marker,
                'milestone_id', new.id
            )
        );
    end loop;

    return new;

end;
$$;

drop trigger if exists milestone_notify_event on challenge_milestones;

create trigger milestone_notify_event
after insert on challenge_milestones
for each row
execute function milestone_notify_trigger();
