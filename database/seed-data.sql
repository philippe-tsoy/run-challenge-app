-- =====================================================
-- RUN CHALLENGE PWA
-- SEED DATA
-- VERSION 1.0
-- =====================================================

-- =====================================================
-- ROLES
-- =====================================================

insert into roles (
    code,
    name
)
values
(
    'admin',
    'Administrator'
),
(
    'member',
    'Member'
),
(
    'moderator',
    'Moderator'
)
on conflict (code) do nothing;

-- =====================================================
-- CHALLENGE THEMES
-- =====================================================

insert into challenge_themes (
    code,
    name,
    description
)
values
(
    'lotr',
    'The Fellowship Journey',
    'Travel from Hobbiton to Rivendell together.'
)
on conflict (code) do nothing;

-- =====================================================
-- BADGES
-- =====================================================

insert into badges (
    code,
    name,
    description,
    icon
)
values

(
    'FIRST_RUN',
    'First Steps',
    'Completed your first run.',
    'shoe'
),

(
    'TEN_KM',
    '10 KM Club',
    'Reach a cumulative distance of 10 km.',
    'target'
),

(
    'TWENTY_FIVE_KM',
    '25 KM Club',
    'Reach a cumulative distance of 25 km.',
    'mountain'
),

(
    'FIFTY_KM',
    '50 KM Club',
    'Reach a cumulative distance of 50 km.',
    'medal'
),

(
    'ONE_HUNDRED_KM',
    '100 KM Club',
    'Reach a cumulative distance of 100 km.',
    'trophy'
),

(
    'MARATHON_RUNNER',
    'Marathon Runner',
    'Accumulate at least 42.2 km.',
    'flag'
),

(
    'THREE_DAY_STREAK',
    'Consistency',
    'Run three consecutive days.',
    'calendar'
),

(
    'WEEKLY_WARRIOR',
    'Weekly Warrior',
    'Run seven consecutive days.',
    'flame'
)

on conflict (code) do nothing;

-- =====================================================
-- DEFAULT CHALLENGE
-- =====================================================

insert into challenges (
    theme_id,
    name,
    description,
    start_date,
    end_date,
    target_km,
    is_active,
    config
)
select
    ct.id,
    'June 2026 Fellowship Challenge',
    'Private running challenge for the fellowship.',
    date '2026-06-01',
    date '2026-06-30',
    500,
    true,
    jsonb_build_object(
        'allowPhotos', true,
        'maxPhotos', 3,
        'enableBadges', true,
        'enableLeaderboards', true,
        'enableJourneySystem', true,
        'enableComments', true,
        'enableReactions', true
    )
from challenge_themes ct
where ct.code = 'lotr'
and not exists (
    select 1
    from challenges
    where is_active = true
);

-- =====================================================
-- LOTR JOURNEY NODES
-- =====================================================

insert into journey_nodes (
    challenge_id,
    name,
    description,
    km_marker,
    sort_order,
    image_url,
    map_x,
    map_y
)
select
    c.id,

    node_name,

    node_description,

    km_marker,

    sort_order,

    image_url,

    map_x,

    map_y

from challenges c

cross join (
    values

    (
        'Hobbiton',
        'The journey begins.',
        0,
        1,
        '/journey/hobbiton.webp',
        5,
        50
    ),

    (
        'Buckland',
        'Cross the Brandywine River.',
        30,
        2,
        '/journey/buckland.webp',
        18,
        48
    ),

    (
        'Old Forest',
        'The trees begin to close in.',
        90,
        3,
        '/journey/old-forest.webp',
        33,
        45
    ),

    (
        'Bree',
        'A welcome rest at The Prancing Pony.',
        150,
        4,
        '/journey/bree.webp',
        46,
        43
    ),

    (
        'Weathertop',
        'A difficult climb and a dangerous place.',
        225,
        5,
        '/journey/weathertop.webp',
        63,
        37
    ),

    (
        'Ford of Bruinen',
        'The final push toward safety.',
        310,
        6,
        '/journey/ford-of-bruinen.webp',
        80,
        30
    ),

    (
        'Rivendell',
        'The Fellowship reaches Rivendell.',
        500,
        7,
        '/journey/rivendell.webp',
        95,
        20
    )

) as nodes (
    node_name,
    node_description,
    km_marker,
    sort_order,
    image_url,
    map_x,
    map_y
)

where c.name = 'June 2026 Fellowship Challenge'

and not exists (
    select 1
    from journey_nodes jn
    where jn.challenge_id = c.id
);

-- =====================================================
-- CHALLENGE AWARD TYPES
-- REFERENCE DATA
-- =====================================================

create table if not exists award_definitions (
    code text primary key,
    name text not null,
    description text not null
);

insert into award_definitions (
    code,
    name,
    description
)
values

(
    'DISTANCE_CHAMPION',
    'Distance Champion',
    'Most total distance.'
),

(
    'PACE_KING',
    'Pace King',
    'Best average pace.'
),

(
    'MOST_RUNS',
    'Most Runs',
    'Most runs logged.'
),

(
    'SOCIAL_BUTTERFLY',
    'Social Butterfly',
    'Most comments and reactions.'
),

(
    'CONSISTENCY_CHAMPION',
    'Consistency Champion',
    'Longest streak.'
),

(
    'MVP',
    'Fellowship MVP',
    'Highest overall contribution.'
)

on conflict do nothing;

-- =====================================================
-- DEFAULT FEED EVENT TYPES
-- DOCUMENTATION DATA
-- =====================================================

create table if not exists feed_event_types (
    code text primary key,
    description text not null
);

insert into feed_event_types (
    code,
    description
)
values

(
    'run_created',
    'A run was logged.'
),

(
    'comment_created',
    'A comment was added.'
),

(
    'reaction_created',
    'A reaction was added.'
),

(
    'badge_unlocked',
    'A badge was unlocked.'
),

(
    'milestone_reached',
    'A journey milestone was reached.'
),

(
    'challenge_completed',
    'Challenge completed.'
)

on conflict do nothing;

-- =====================================================
-- DEFAULT NOTIFICATION TYPES
-- DOCUMENTATION DATA
-- =====================================================

create table if not exists notification_types (
    code text primary key,
    description text not null
);

insert into notification_types (
    code,
    description
)
values

(
    'run_comment',
    'Someone commented on your run.'
),

(
    'run_reaction',
    'Someone reacted to your run.'
),

(
    'badge_unlocked',
    'A badge has been unlocked.'
),

(
    'milestone_reached',
    'The team reached a milestone.'
)

on conflict do nothing;

-- =====================================================
-- MVP NOTES
-- =====================================================
--
-- Admin user assignment should happen manually
-- after first signup:
--
-- insert into user_roles (
--     user_id,
--     role_id
-- )
-- select
--     '<USER_UUID>',
--     id
-- from roles
-- where code = 'admin';
--
--
-- Additional challenges should be created
-- through the admin UI.
--
-- Journey nodes are challenge specific,
-- allowing future challenge themes.
--
-- Distances can exceed 500 km.
-- Rivendell remains the final node.
-- Challenge completion is determined
-- by end_date, not total distance.
--
-- Historical rankings and snapshots
-- are generated when a challenge closes.
--
-- =====================================================

