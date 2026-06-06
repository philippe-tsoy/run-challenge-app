-- Phase 9: global badge evaluation + additional leaderboard RPCs
-- Apply in Supabase SQL Editor after functions.sql / triggers.sql

-- =====================================================
-- GLOBAL USER STATS (badges are global)
-- =====================================================

create or replace function user_global_total_distance(p_user_id uuid)
returns numeric
language sql
stable
as $$
    select coalesce(sum(distance_km), 0)
    from runs
    where user_id = p_user_id
    and is_valid = true;
$$;

create or replace function user_global_total_runs(p_user_id uuid)
returns bigint
language sql
stable
as $$
    select count(*)
    from runs
    where user_id = p_user_id
    and is_valid = true;
$$;

create or replace function user_reactions_received_count(p_user_id uuid)
returns bigint
language sql
stable
as $$
    select count(*)
    from reactions re
    join runs r on r.id = re.run_id
    where r.user_id = p_user_id
    and r.is_valid = true;
$$;

-- =====================================================
-- BADGE EVALUATION (global distance / runs)
-- =====================================================

create or replace function evaluate_badges()
returns trigger
language plpgsql
as $$
declare
    v_total_distance numeric;
    v_total_runs bigint;
begin
    if new.is_valid is distinct from true then
        return new;
    end if;

    select user_global_total_distance(new.user_id)
    into v_total_distance;

    select user_global_total_runs(new.user_id)
    into v_total_runs;

    if v_total_runs = 1 then
        perform unlock_badge(new.user_id, 'FIRST_RUN');
    end if;

    if v_total_distance >= 10 then
        perform unlock_badge(new.user_id, 'TEN_KM');
    end if;

    if v_total_distance >= 25 then
        perform unlock_badge(new.user_id, 'TWENTY_FIVE_KM');
    end if;

    if v_total_distance >= 42.2 then
        perform unlock_badge(new.user_id, 'MARATHON_RUNNER');
    end if;

    if v_total_distance >= 50 then
        perform unlock_badge(new.user_id, 'FIFTY_KM');
    end if;

    if v_total_distance >= 100 then
        perform unlock_badge(new.user_id, 'ONE_HUNDRED_KM');
    end if;

    return new;
end;
$$;

-- =====================================================
-- STREAK BADGES (after streak row updates)
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
    if new.is_valid is distinct from true then
        return new;
    end if;

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

    v_longest := greatest(v_longest, v_current);

    update user_streaks
    set
        current_streak = v_current,
        longest_streak = v_longest,
        last_run_date = date(new.created_at),
        updated_at = now()
    where user_id = new.user_id;

    if v_current >= 3 then
        perform unlock_badge(new.user_id, 'THREE_DAY_STREAK');
    end if;

    if v_longest >= 7 then
        perform unlock_badge(new.user_id, 'WEEKLY_WARRIOR');
    end if;

    return new;
end;
$$;

-- =====================================================
-- SOCIAL MVP (reactions received on your runs)
-- =====================================================

create or replace function evaluate_received_social_badges(p_run_owner uuid)
returns void
language plpgsql
as $$
declare
    v_reactions bigint;
begin
    select user_reactions_received_count(p_run_owner)
    into v_reactions;

    if v_reactions >= 25 then
        perform unlock_badge(p_run_owner, 'CROWD_FAVORITE');
    end if;
end;
$$;

create or replace function handle_reaction_badge_eval()
returns trigger
language plpgsql
as $$
declare
    v_owner uuid;
begin
    select user_id into v_owner from runs where id = new.run_id;
    if v_owner is not null then
        perform evaluate_received_social_badges(v_owner);
    end if;
    return new;
end;
$$;

drop trigger if exists reaction_badge_eval_trigger on reactions;
create trigger reaction_badge_eval_trigger
after insert on reactions
for each row
execute function handle_reaction_badge_eval();

-- =====================================================
-- LEADERBOARDS (with achieved_at for tie-breaks)
-- =====================================================
-- functions.sql used different OUT column names (e.g. total_distance).
-- CREATE OR REPLACE cannot change that; drop first.

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
