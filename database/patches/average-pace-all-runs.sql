-- Include all members with at least one valid run on average pace leaderboard
-- (previously required 10 km cumulative).

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
            when coalesce(sum(distance_km), 0) <= 0 then null
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
