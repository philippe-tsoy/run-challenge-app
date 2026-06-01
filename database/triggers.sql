-- Triggers for feed events, milestones, leaderboard updates# /database/triggers.sql
-- =====================================================
-- RUN CHALLENGE PWA
-- DATABASE TRIGGERS
-- VERSION 1.0
-- =====================================================

-- =====================================================
-- HELPER FUNCTION
-- GET ROLE
-- =====================================================

create or replace function user_has_role(
    p_user_id uuid,
    p_role_code text
)
returns boolean
language sql
stable
as $$
    select exists (
        select 1
        from user_roles ur
        join roles r
            on r.id = ur.role_id
        where ur.user_id = p_user_id
        and r.code = p_role_code
    );
$$;

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_updated_at
before update on profiles
for each row
execute function set_updated_at();

create trigger challenges_updated_at
before update on challenges
for each row
execute function set_updated_at();

create trigger runs_updated_at
before update on runs
for each row
execute function set_updated_at();

-- =====================================================
-- FEED EVENT CREATION
-- =====================================================

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

-- =====================================================
-- NOTIFICATION CREATION
-- =====================================================

create or replace function create_notification(
    p_user_id uuid,
    p_type text,
    p_payload jsonb default '{}'
)
returns void
language plpgsql
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

-- =====================================================
-- RUN CREATED
-- =====================================================

create or replace function handle_run_created()
returns trigger
language plpgsql
as $$
begin

    perform create_feed_event(
        new.challenge_id,
        new.user_id,
        'run_created',
        'run',
        new.id,
        jsonb_build_object(
            'distance_km', new.distance_km
        )
    );

    return new;

end;
$$;

create trigger run_created_trigger
after insert on runs
for each row
execute function handle_run_created();

-- =====================================================
-- RUN UPDATED
-- =====================================================

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

create trigger run_updated_trigger
after update on runs
for each row
execute function handle_run_updated();

-- =====================================================
-- RUN DELETED
-- =====================================================

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

create trigger run_deleted_trigger
before delete on runs
for each row
execute function handle_run_deleted();

-- =====================================================
-- COMMENT CREATED
-- =====================================================

create or replace function handle_comment_created()
returns trigger
language plpgsql
as $$
declare
    v_owner uuid;
    v_challenge uuid;
begin

    select
        r.user_id,
        r.challenge_id
    into
        v_owner,
        v_challenge
    from runs r
    where r.id = new.run_id;

    perform create_feed_event(
        v_challenge,
        new.user_id,
        'comment_created',
        'comment',
        new.id,
        '{}'::jsonb
    );

    if v_owner <> new.user_id then
        perform create_notification(
            v_owner,
            'run_comment',
            jsonb_build_object(
                'comment_id',
                new.id
            )
        );
    end if;

    return new;

end;
$$;

create trigger comment_created_trigger
after insert on comments
for each row
execute function handle_comment_created();

-- =====================================================
-- REACTION CREATED
-- =====================================================

create or replace function handle_reaction_created()
returns trigger
language plpgsql
as $$
declare
    v_owner uuid;
    v_challenge uuid;
begin

    select
        r.user_id,
        r.challenge_id
    into
        v_owner,
        v_challenge
    from runs r
    where r.id = new.run_id;

    perform create_feed_event(
        v_challenge,
        new.user_id,
        'reaction_created',
        'reaction',
        new.id,
        jsonb_build_object(
            'reaction',
            new.reaction_type
        )
    );

    if v_owner <> new.user_id then
        perform create_notification(
            v_owner,
            'run_reaction',
            jsonb_build_object(
                'reaction',
                new.reaction_type
            )
        );
    end if;

    return new;

end;
$$;

create trigger reaction_created_trigger
after insert on reactions
for each row
execute function handle_reaction_created();

-- =====================================================
-- STREAK ENGINE
-- =====================================================

create or replace function update_user_streak()
returns trigger
language plpgsql
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
        longest_streak = greatest(
            longest_streak,
            v_current
        ),
        last_run_date = date(new.created_at),
        updated_at = now()
    where user_id = new.user_id;

    return new;

end;
$$;

create trigger streak_trigger
after insert on runs
for each row
execute function update_user_streak();

-- =====================================================
-- BADGE UNLOCKING
-- =====================================================

create or replace function unlock_badge(
    p_user_id uuid,
    p_badge_code text
)
returns void
language plpgsql
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

create or replace function evaluate_badges()
returns trigger
language plpgsql
as $$
declare
    v_total_distance numeric;
    v_total_runs bigint;
begin

    select user_total_distance(
        new.challenge_id,
        new.user_id
    )
    into v_total_distance;

    select user_total_runs(
        new.challenge_id,
        new.user_id
    )
    into v_total_runs;

    if v_total_runs = 1 then
        perform unlock_badge(
            new.user_id,
            'FIRST_RUN'
        );
    end if;

    if v_total_distance >= 10 then
        perform unlock_badge(
            new.user_id,
            'TEN_KM'
        );
    end if;

    if v_total_distance >= 25 then
        perform unlock_badge(
            new.user_id,
            'TWENTY_FIVE_KM'
        );
    end if;

    if v_total_distance >= 50 then
        perform unlock_badge(
            new.user_id,
            'FIFTY_KM'
        );
    end if;

    if v_total_distance >= 100 then
        perform unlock_badge(
            new.user_id,
            'ONE_HUNDRED_KM'
        );
    end if;

    return new;

end;
$$;

create trigger badge_trigger
after insert on runs
for each row
execute function evaluate_badges();

-- =====================================================
-- JOURNEY MILESTONES
-- =====================================================

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

-- =====================================================
-- BADGE NOTIFICATIONS
-- =====================================================

create or replace function badge_notification_trigger()
returns trigger
language plpgsql
as $$
begin

    perform create_notification(
        new.user_id,
        'badge_unlocked',
        jsonb_build_object(
            'badge_id',
            new.badge_id
        )
    );

    return new;

end;
$$;

create trigger badge_notification
after insert on user_badges
for each row
execute function badge_notification_trigger();

-- =====================================================
-- MILESTONE FEED EVENTS
-- =====================================================

create or replace function milestone_feed_trigger()
returns trigger
language plpgsql
as $$
declare
    v_node record;
begin

    select
        name,
        km_marker,
        description
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

create trigger milestone_feed_event
after insert on challenge_milestones
for each row
execute function milestone_feed_trigger();

-- =====================================================
-- MILESTONE NOTIFICATIONS (all challenge members)
-- =====================================================

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

create trigger milestone_notify_event
after insert on challenge_milestones
for each row
execute function milestone_notify_trigger();

-- =====================================================
-- AUDIT LOGGING
-- =====================================================

create or replace function audit_action(
    p_actor uuid,
    p_action text,
    p_entity_type text,
    p_entity_id uuid,
    p_payload jsonb
)
returns void
language plpgsql
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

-- =====================================================
-- FUTURE TRIGGERS
-- =====================================================

-- Challenge completion snapshots
-- Challenge ranking snapshots
-- Award generation
-- Strava import events
-- Offline sync reconciliation
-- Challenge archival automation
