-- Trigger helpers run in the caller's RLS context by default, which blocks
-- feed_events, user_badges, notifications, user_streaks, and challenge_milestones
-- writes during run insert. Run as definer with a fixed search_path.

create or replace function create_feed_event(
    p_challenge_id uuid,
    p_actor_user_id uuid,
    p_event_type text,
    p_entity_type text,
    p_entity_id uuid,
    p_payload jsonb default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into feed_events (
        challenge_id,
        actor_user_id,
        event_type,
        entity_type,
        entity_id,
        payload
    )
    values (
        p_challenge_id,
        p_actor_user_id,
        p_event_type,
        p_entity_type,
        p_entity_id,
        p_payload
    );
end;
$$;

create or replace function create_notification(
    p_user_id uuid,
    p_type text,
    p_payload jsonb default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into notifications (
        user_id,
        notification_type,
        payload
    )
    values (
        p_user_id,
        p_type,
        p_payload
    );
end;
$$;

create or replace function unlock_badge(
    p_user_id uuid,
    p_badge_code text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_badge uuid;
begin
    select id
    into v_badge
    from badges
    where code = p_badge_code;

    if v_badge is null then
        return;
    end if;

    insert into user_badges (
        badge_id,
        user_id
    )
    values (
        v_badge,
        p_user_id
    )
    on conflict do nothing;
end;
$$;

create or replace function update_user_streak()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_last_date date;
    v_current integer;
    v_longest integer;
begin
    select
        last_run_date,
        current_streak,
        longest_streak
    into
        v_last_date,
        v_current,
        v_longest
    from user_streaks
    where user_id = new.user_id;

    if not found then
        insert into user_streaks (
            user_id,
            current_streak,
            longest_streak,
            last_run_date
        )
        values (
            new.user_id,
            1,
            1,
            date(new.created_at)
        );

        return new;
    end if;

    if v_last_date = date(new.created_at) then
        return new;
    end if;

    if v_last_date = date(new.created_at) - 1 then
        v_current := v_current + 1;
    else
        v_current := 1;
    end if;

    update user_streaks
    set
        current_streak = v_current,
        longest_streak = greatest(longest_streak, v_current),
        last_run_date = date(new.created_at),
        updated_at = now()
    where user_id = new.user_id;

    return new;
end;
$$;

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

create or replace function audit_action(
    p_actor uuid,
    p_action text,
    p_entity_type text,
    p_entity_id uuid,
    p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into audit_log (
        actor_user_id,
        action,
        entity_type,
        entity_id,
        payload
    )
    values (
        p_actor,
        p_action,
        p_entity_type,
        p_entity_id,
        p_payload
    );
end;
$$;
