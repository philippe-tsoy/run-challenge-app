-- Run this ONLY if phase9-badges-leaderboards.sql failed at leaderboard_distance
-- (badge/trigger section above line ~210 already succeeded).
--
-- If you have NOT run phase9 at all, use phase9-badges-leaderboards.sql instead.

drop function if exists public.leaderboard_distance(uuid);
drop function if exists public.leaderboard_runs(uuid);
drop function if exists public.leaderboard_average_pace(uuid);
drop function if exists public.leaderboard_best_pace(uuid);
drop function if exists public.leaderboard_streak(uuid);
drop function if exists public.leaderboard_longest_streak(uuid);
drop function if exists public.leaderboard_social_score(uuid);

create or replace function leaderboard_distance(p_challenge_id uuid)
returns table (
    rank bigint,
    user_id uuid,
    username text,
    value numeric,
    achieved_at timestamptz
)
language sql
stable
as $$
    select
        row_number() over (
            order by sum(r.distance_km) desc, max(r.created_at) asc
        ),
        p.id,
        p.username::text,
        sum(r.distance_km),
        max(r.created_at)
    from profiles p
    join runs r on r.user_id = p.id
    where r.challenge_id = p_challenge_id
    and r.is_valid = true
    group by p.id, p.username;
$$;

create or replace function leaderboard_runs(p_challenge_id uuid)
returns table (
    rank bigint,
    user_id uuid,
    username text,
    value numeric,
    achieved_at timestamptz
)
language sql
stable
as $$
    select
        row_number() over (
            order by count(*) desc, max(r.created_at) asc
        ),
        p.id,
        p.username::text,
        count(*)::numeric,
        max(r.created_at)
    from profiles p
    join runs r on r.user_id = p.id
    where r.challenge_id = p_challenge_id
    and r.is_valid = true
    group by p.id, p.username;
$$;

create or replace function leaderboard_average_pace(p_challenge_id uuid)
returns table (
    rank bigint,
    user_id uuid,
    username text,
    value numeric,
    achieved_at timestamptz
)
language sql
stable
as $$
    select
        row_number() over (
            order by
                sum(r.duration_min)::numeric / sum(r.distance_km) asc,
                max(r.created_at) asc
        ),
        p.id,
        p.username::text,
        round(sum(r.duration_min)::numeric / sum(r.distance_km), 2),
        max(r.created_at)
    from profiles p
    join runs r on r.user_id = p.id
    where r.challenge_id = p_challenge_id
    and r.is_valid = true
    group by p.id, p.username;
$$;

create or replace function leaderboard_best_pace(p_challenge_id uuid)
returns table (
    rank bigint,
    user_id uuid,
    username text,
    value numeric,
    achieved_at timestamptz
)
language sql
stable
as $$
    with best_runs as (
        select
            r.user_id,
            r.duration_min::numeric / r.distance_km as pace,
            r.created_at
        from runs r
        where r.challenge_id = p_challenge_id
        and r.is_valid = true
        and r.distance_km >= 2
    ),
    user_best as (
        select distinct on (user_id)
            user_id,
            pace,
            created_at
        from best_runs
        order by user_id, pace asc, created_at asc
    )
    select
        row_number() over (order by ub.pace asc, ub.created_at asc),
        p.id,
        p.username::text,
        round(ub.pace, 2),
        ub.created_at
    from user_best ub
    join profiles p on p.id = ub.user_id;
$$;

create or replace function leaderboard_streak(p_challenge_id uuid)
returns table (
    rank bigint,
    user_id uuid,
    username text,
    value numeric,
    achieved_at timestamptz
)
language sql
stable
as $$
    select
        row_number() over (
            order by us.current_streak desc, us.updated_at asc
        ),
        p.id,
        p.username::text,
        us.current_streak::numeric,
        us.updated_at
    from challenge_members cm
    join profiles p on p.id = cm.user_id
    join user_streaks us on us.user_id = cm.user_id
    where cm.challenge_id = p_challenge_id
    and us.current_streak > 0;
$$;

create or replace function leaderboard_longest_streak(p_challenge_id uuid)
returns table (
    rank bigint,
    user_id uuid,
    username text,
    value numeric,
    achieved_at timestamptz
)
language sql
stable
as $$
    select
        row_number() over (
            order by us.longest_streak desc, us.updated_at asc
        ),
        p.id,
        p.username::text,
        us.longest_streak::numeric,
        us.updated_at
    from challenge_members cm
    join profiles p on p.id = cm.user_id
    join user_streaks us on us.user_id = cm.user_id
    where cm.challenge_id = p_challenge_id
    and us.longest_streak > 0;
$$;

create or replace function leaderboard_social_score(p_challenge_id uuid)
returns table (
    rank bigint,
    user_id uuid,
    username text,
    value numeric,
    achieved_at timestamptz
)
language sql
stable
as $$
    with scores as (
        select
            cm.user_id,
            social_score(p_challenge_id, cm.user_id) as score
        from challenge_members cm
        where cm.challenge_id = p_challenge_id
    ),
    activity as (
        select
            s.user_id,
            s.score,
            greatest(
                coalesce(
                    (
                        select max(c.created_at)
                        from comments c
                        join runs r on r.id = c.run_id
                        where c.user_id = s.user_id
                        and r.challenge_id = p_challenge_id
                    ),
                    'epoch'::timestamptz
                ),
                coalesce(
                    (
                        select max(re.created_at)
                        from reactions re
                        join runs r on r.id = re.run_id
                        where re.user_id = s.user_id
                        and r.challenge_id = p_challenge_id
                    ),
                    'epoch'::timestamptz
                )
            ) as last_activity
        from scores s
        where s.score > 0
    )
    select
        row_number() over (order by a.score desc, a.last_activity asc),
        p.id,
        p.username::text,
        a.score::numeric,
        a.last_activity
    from activity a
    join profiles p on p.id = a.user_id;
$$;
