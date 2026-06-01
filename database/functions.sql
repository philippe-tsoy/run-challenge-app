-- =====================================================
-- RUN CHALLENGE PWA
-- DATABASE FUNCTIONS
-- VERSION 2.0
-- =====================================================

-- =====================================================
-- TEAM TOTAL DISTANCE
-- =====================================================

create or replace function challenge_total_distance(
    p_challenge_id uuid
)
returns numeric
language sql
stable
as $$
    select coalesce(sum(distance_km),0)
    from runs
    where challenge_id = p_challenge_id
    and is_valid = true;
$$;

-- =====================================================
-- TEAM TOTAL RUNS
-- =====================================================

create or replace function challenge_total_runs(
    p_challenge_id uuid
)
returns bigint
language sql
stable
as $$
    select count(*)
    from runs
    where challenge_id = p_challenge_id
    and is_valid = true;
$$;

-- =====================================================
-- TEAM TOTAL PARTICIPANTS
-- =====================================================

create or replace function challenge_total_participants(
    p_challenge_id uuid
)
returns bigint
language sql
stable
as $$
    select count(*)
    from challenge_members
    where challenge_id = p_challenge_id;
$$;

-- =====================================================
-- USER TOTAL DISTANCE
-- =====================================================

create or replace function user_total_distance(
    p_challenge_id uuid,
    p_user_id uuid
)
returns numeric
language sql
stable
as $$
    select coalesce(sum(distance_km),0)
    from runs
    where challenge_id = p_challenge_id
    and user_id = p_user_id
    and is_valid = true;
$$;

-- =====================================================
-- USER TOTAL RUNS
-- =====================================================

create or replace function user_total_runs(
    p_challenge_id uuid,
    p_user_id uuid
)
returns bigint
language sql
stable
as $$
    select count(*)
    from runs
    where challenge_id = p_challenge_id
    and user_id = p_user_id
    and is_valid = true;
$$;

-- =====================================================
-- USER TOTAL DURATION
-- =====================================================

create or replace function user_total_duration(
    p_challenge_id uuid,
    p_user_id uuid
)
returns bigint
language sql
stable
as $$
    select coalesce(sum(duration_min),0)
    from runs
    where challenge_id = p_challenge_id
    and user_id = p_user_id
    and is_valid = true;
$$;

-- =====================================================
-- USER AVERAGE PACE
-- QUALIFICATION: 10 KM TOTAL
-- =====================================================

create or replace function user_average_pace(
    p_challenge_id uuid,
    p_user_id uuid
)
returns numeric
language sql
stable
as $$
    select
        case
            when sum(distance_km) < 10 then null
            else round(
                sum(duration_min)::numeric
                / sum(distance_km),
                2
            )
        end
    from runs
    where challenge_id = p_challenge_id
    and user_id = p_user_id
    and is_valid = true;
$$;

-- =====================================================
-- USER BEST PACE
-- QUALIFICATION: RUN >= 2 KM
-- =====================================================

create or replace function user_best_pace(
    p_challenge_id uuid,
    p_user_id uuid
)
returns numeric
language sql
stable
as $$
    select min(
        duration_min::numeric
        / distance_km
    )
    from runs
    where challenge_id = p_challenge_id
    and user_id = p_user_id
    and distance_km >= 2
    and is_valid = true;
$$;

-- =====================================================
-- JOURNEY PERCENT
-- MAY EXCEED 100%
-- =====================================================

create or replace function challenge_progress_percent(
    p_challenge_id uuid
)
returns numeric
language plpgsql
stable
as $$
declare
    v_distance numeric;
    v_target numeric;
begin

    select challenge_total_distance(
        p_challenge_id
    )
    into v_distance;

    select target_km
    into v_target
    from challenges
    where id = p_challenge_id;

    if v_target = 0 then
        return 0;
    end if;

    return round(
        (v_distance / v_target) * 100,
        2
    );

end;
$$;

-- =====================================================
-- JOURNEY DISPLAY PERCENT
-- CAPPED AT 100 FOR UI BARS
-- =====================================================

create or replace function challenge_progress_percent_capped(
    p_challenge_id uuid
)
returns numeric
language sql
stable
as $$
    select least(
        challenge_progress_percent(
            p_challenge_id
        ),
        100
    );
$$;

-- =====================================================
-- CURRENT JOURNEY NODE
-- =====================================================

create or replace function current_journey_node(
    p_challenge_id uuid
)
returns uuid
language sql
stable
as $$
    select id
    from journey_nodes
    where challenge_id = p_challenge_id
    and km_marker <= challenge_total_distance(
        p_challenge_id
    )
    order by km_marker desc
    limit 1;
$$;

-- =====================================================
-- NEXT JOURNEY NODE
-- =====================================================

create or replace function next_journey_node(
    p_challenge_id uuid
)
returns uuid
language sql
stable
as $$
    select id
    from journey_nodes
    where challenge_id = p_challenge_id
    and km_marker >
        challenge_total_distance(
            p_challenge_id
        )
    order by km_marker asc
    limit 1;
$$;

-- =====================================================
-- UNLOCKED JOURNEY NODES
-- =====================================================

create or replace function unlocked_journey_nodes(
    p_challenge_id uuid
)
returns table (
    node_id uuid,
    node_name text,
    km_marker numeric
)
language sql
stable
as $$
    select
        id,
        name,
        km_marker
    from journey_nodes
    where challenge_id = p_challenge_id
    and km_marker <= challenge_total_distance(
        p_challenge_id
    )
    order by km_marker;
$$;

-- =====================================================
-- DISTANCE LEADERBOARD
-- =====================================================

create or replace function leaderboard_distance(
    p_challenge_id uuid
)
returns table (
    rank bigint,
    user_id uuid,
    username text,
    total_distance numeric
)
language sql
stable
as $$
    select
        row_number() over (
            order by sum(distance_km) desc
        ),
        p.id,
        p.username::text,
        sum(r.distance_km)
    from profiles p
    join runs r
        on p.id = r.user_id
    where r.challenge_id = p_challenge_id
    and r.is_valid = true
    group by p.id,p.username;
$$;

-- =====================================================
-- RUN COUNT LEADERBOARD
-- =====================================================

create or replace function leaderboard_runs(
    p_challenge_id uuid
)
returns table (
    rank bigint,
    user_id uuid,
    username text,
    total_runs bigint
)
language sql
stable
as $$
    select
        row_number() over (
            order by count(*) desc
        ),
        p.id,
        p.username::text,
        count(*)
    from profiles p
    join runs r
        on r.user_id = p.id
    where r.challenge_id = p_challenge_id
    and r.is_valid = true
    group by p.id,p.username;
$$;

-- =====================================================
-- AVERAGE PACE LEADERBOARD
-- =====================================================

create or replace function leaderboard_average_pace(
    p_challenge_id uuid
)
returns table (
    rank bigint,
    user_id uuid,
    username text,
    average_pace numeric
)
language sql
stable
as $$
    select
        row_number() over (
            order by
                sum(duration_min)::numeric
                / sum(distance_km)
        ),
        p.id,
        p.username::text,
        round(
            sum(duration_min)::numeric
            / sum(distance_km),
            2
        )
    from profiles p
    join runs r
        on p.id = r.user_id
    where r.challenge_id = p_challenge_id
    and r.is_valid = true
    group by p.id,p.username
    having sum(distance_km) >= 10;
$$;

-- =====================================================
-- SOCIAL SCORE
-- CHALLENGE SCOPED
-- =====================================================

create or replace function social_score(
    p_challenge_id uuid,
    p_user_id uuid
)
returns bigint
language sql
stable
as $$
    select
        (
            select count(*)
            from comments c
            join runs r
                on r.id = c.run_id
            where c.user_id = p_user_id
            and r.challenge_id = p_challenge_id
        )
        +
        (
            select count(*)
            from reactions re
            join runs r
                on r.id = re.run_id
            where re.user_id = p_user_id
            and r.challenge_id = p_challenge_id
        );
$$;

-- =====================================================
-- CURRENT STREAK
-- CHALLENGE SCOPED
-- =====================================================

create or replace function current_streak_days(
    p_challenge_id uuid,
    p_user_id uuid
)
returns integer
language sql
stable
as $$
    select count(*)
    from (
        select distinct
            date(created_at)
        from runs
        where challenge_id = p_challenge_id
        and user_id = p_user_id
        and is_valid = true
    ) days_logged;
$$;

-- =====================================================
-- STRAVA DUPLICATE DETECTION
-- =====================================================

create or replace function potential_duplicate_run(
    p_user_id uuid,
    p_distance numeric,
    p_run_time timestamptz
)
returns boolean
language sql
stable
as $$
    select exists (
        select 1
        from runs
        where user_id = p_user_id
        and is_valid = true
        and abs(
            extract(
                epoch from (
                    created_at
                    - p_run_time
                )
            )
        ) < 3600
        and abs(
            distance_km
            - p_distance
        ) <= 0.5
    );
$$;

-- =====================================================
-- TEAM MILESTONES
-- =====================================================

create or replace function evaluate_team_milestones(
    p_challenge_id uuid
)
returns void
language plpgsql
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

-- =====================================================
-- CHALLENGE COMPLETED
-- =====================================================

create or replace function challenge_is_completed(
    p_challenge_id uuid
)
returns boolean
language sql
stable
as $$
    select current_date >
        (
            select end_date
            from challenges
            where id = p_challenge_id
        );
$$;
