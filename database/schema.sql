-- =====================================================
-- RUN CHALLENGE PWA
-- PRODUCTION DATABASE SCHEMA V2
-- =====================================================

create extension if not exists pgcrypto;
create extension if not exists citext;

-- =====================================================
-- ROLES
-- =====================================================

create table roles (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    name text not null
);

create table user_roles (
    user_id uuid not null references auth.users(id) on delete cascade,
    role_id uuid not null references roles(id) on delete cascade,
    assigned_at timestamptz not null default now(),

    primary key(user_id, role_id)
);

-- =====================================================
-- PROFILES
-- =====================================================

create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    username citext not null unique,
    email citext not null unique,

    display_name text,
    avatar_url text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_profiles_username
on profiles(username);

-- =====================================================
-- INVITE CODES
-- =====================================================

create table invite_codes (
    id uuid primary key default gen_random_uuid(),

    code text not null unique,

    description text,

    is_active boolean not null default true,

    max_uses integer,
    current_uses integer not null default 0,

    expires_at timestamptz,

    created_by uuid references profiles(id),

    created_at timestamptz not null default now()
);

-- =====================================================
-- CHALLENGE THEMES
-- =====================================================

create table challenge_themes (
    id uuid primary key default gen_random_uuid(),

    code text not null unique,
    name text not null,

    description text,

    created_at timestamptz not null default now()
);

-- =====================================================
-- CHALLENGES
-- =====================================================

create table challenges (
    id uuid primary key default gen_random_uuid(),

    theme_id uuid references challenge_themes(id),

    name text not null,
    description text,

    start_date date not null,
    end_date date not null,

    target_km numeric(10,2) not null default 500,

    is_active boolean not null default false,

    config jsonb not null default '{}',

    created_by uuid references profiles(id),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint chk_challenge_dates
    check (end_date > start_date)
);

create unique index idx_single_active_challenge
on challenges(is_active)
where is_active = true;

-- =====================================================
-- CHALLENGE MEMBERS
-- =====================================================

create table challenge_members (
    challenge_id uuid not null
        references challenges(id)
        on delete cascade,

    user_id uuid not null
        references profiles(id)
        on delete cascade,

    joined_at timestamptz not null default now(),

    primary key (
        challenge_id,
        user_id
    )
);

create index idx_challenge_members_user
on challenge_members(user_id);

-- =====================================================
-- JOURNEY NODES
-- =====================================================

create table journey_nodes (
    id uuid primary key default gen_random_uuid(),

    challenge_id uuid not null
        references challenges(id)
        on delete cascade,

    name text not null,

    description text,

    km_marker numeric(10,2) not null,

    sort_order integer not null,

    image_url text,
    artwork_url text,

    map_x numeric,
    map_y numeric,

    created_at timestamptz not null default now(),

    unique(challenge_id, sort_order),
    unique(challenge_id, km_marker)
);

-- =====================================================
-- RUNS
-- =====================================================

create table runs (
    id uuid primary key default gen_random_uuid(),

    challenge_id uuid not null
        references challenges(id),

    user_id uuid not null
        references profiles(id),

    distance_km numeric(10,2) not null,

    duration_min integer not null,

    notes text,

    source text not null default 'manual',

    is_valid boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint chk_distance
        check(distance_km > 0),

    constraint chk_duration
        check(duration_min > 0),

    constraint chk_source
        check (
            source in (
                'manual',
                'strava'
            )
        )
);

create index idx_runs_challenge
on runs(challenge_id);

create index idx_runs_user
on runs(user_id);

create index idx_runs_created
on runs(created_at desc);

-- =====================================================
-- USER STREAKS
-- =====================================================

create table user_streaks (
    user_id uuid primary key
        references profiles(id)
        on delete cascade,

    current_streak integer not null default 0,

    longest_streak integer not null default 0,

    last_run_date date,

    updated_at timestamptz not null default now()
);

-- =====================================================
-- RUN PHOTOS
-- =====================================================

create table run_photos (
    id uuid primary key default gen_random_uuid(),

    run_id uuid not null
        references runs(id)
        on delete cascade,

    original_url text not null,

    thumbnail_url text not null,

    width integer,
    height integer,

    uploaded_at timestamptz not null default now()
);

create index idx_run_photos_run
on run_photos(run_id);

-- =====================================================
-- COMMENTS
-- =====================================================

create table comments (
    id uuid primary key default gen_random_uuid(),

    run_id uuid not null
        references runs(id)
        on delete cascade,

    user_id uuid not null
        references profiles(id),

    body text not null,

    created_at timestamptz not null default now()
);

-- =====================================================
-- REACTIONS
-- =====================================================

create table reactions (
    id uuid primary key default gen_random_uuid(),

    run_id uuid not null
        references runs(id)
        on delete cascade,

    user_id uuid not null
        references profiles(id),

    reaction_type text not null,

    created_at timestamptz not null default now(),

    constraint chk_reaction
    check (
        reaction_type in (
            'like',
            'fire',
            'water',
            'ice'
        )
    ),

    unique(run_id, user_id)
);

-- =====================================================
-- BADGES
-- =====================================================

create table badges (
    id uuid primary key default gen_random_uuid(),

    code text not null unique,

    name text not null,

    description text,

    icon text
);

create table user_badges (
    badge_id uuid not null
        references badges(id),

    user_id uuid not null
        references profiles(id),

    unlocked_at timestamptz not null default now(),

    primary key (
        badge_id,
        user_id
    )
);

-- =====================================================
-- AWARDS
-- =====================================================

create table challenge_awards (
    id uuid primary key default gen_random_uuid(),

    challenge_id uuid not null
        references challenges(id),

    award_code text not null,

    user_id uuid not null
        references profiles(id),

    created_at timestamptz not null default now()
);

-- =====================================================
-- HISTORICAL RANKINGS
-- =====================================================

create table challenge_rankings (
    id uuid primary key default gen_random_uuid(),

    challenge_id uuid not null
        references challenges(id)
        on delete cascade,

    user_id uuid not null
        references profiles(id)
        on delete cascade,

    ranking_type text not null,

    rank integer not null,

    value numeric not null,

    created_at timestamptz not null default now()
);

-- =====================================================
-- CHALLENGE SNAPSHOTS
-- =====================================================

create table challenge_snapshots (
    challenge_id uuid primary key
        references challenges(id)
        on delete cascade,

    total_distance numeric not null,

    total_runs integer not null,

    total_participants integer not null,

    completed_at timestamptz not null
);

-- =====================================================
-- JOURNEY MILESTONES
-- =====================================================

create table challenge_milestones (
    id uuid primary key default gen_random_uuid(),

    challenge_id uuid not null
        references challenges(id),

    journey_node_id uuid not null
        references journey_nodes(id),

    triggered_at timestamptz not null default now(),

    unique(
        challenge_id,
        journey_node_id
    )
);

-- =====================================================
-- FEED EVENTS
-- =====================================================

create table feed_events (
    id uuid primary key default gen_random_uuid(),

    challenge_id uuid not null
        references challenges(id),

    actor_user_id uuid
        references profiles(id),

    event_type text not null,

    entity_type text,
    entity_id uuid,

    payload jsonb not null default '{}',

    created_at timestamptz not null default now()
);

create index idx_feed_challenge
on feed_events(
    challenge_id,
    created_at desc
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

create table notifications (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references profiles(id),

    notification_type text not null,

    payload jsonb not null default '{}',

    is_read boolean not null default false,

    created_at timestamptz not null default now()
);

-- =====================================================
-- STRAVA ACCOUNTS
-- =====================================================

create table strava_accounts (
    user_id uuid primary key
        references profiles(id),

    athlete_id bigint not null unique,

    access_token text not null,

    refresh_token text not null,

    token_expires_at timestamptz not null,

    created_at timestamptz not null default now()
);

-- =====================================================
-- SYNC OPERATIONS
-- =====================================================

create table sync_operations (
    id uuid primary key default gen_random_uuid(),

    client_operation_id text not null unique,

    user_id uuid not null
        references profiles(id),

    operation_type text not null,

    created_at timestamptz not null default now()
);

-- =====================================================
-- AUDIT LOG
-- =====================================================

create table audit_log (
    id uuid primary key default gen_random_uuid(),

    actor_user_id uuid
        references profiles(id),

    action text not null,

    entity_type text not null,

    entity_id uuid,

    payload jsonb,

    created_at timestamptz not null default now()
);
