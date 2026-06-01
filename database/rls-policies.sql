-- =====================================================
-- RUN CHALLENGE PWA
-- RLS POLICIES
-- VERSION 1.0
-- =====================================================

-- =====================================================
-- ENABLE RLS
-- =====================================================

alter table profiles enable row level security;

alter table invite_codes enable row level security;

alter table challenges enable row level security;

alter table challenge_members enable row level security;

alter table journey_nodes enable row level security;

alter table runs enable row level security;

alter table run_photos enable row level security;

alter table comments enable row level security;

alter table reactions enable row level security;

alter table badges enable row level security;

alter table user_badges enable row level security;

alter table challenge_awards enable row level security;

alter table challenge_milestones enable row level security;

alter table feed_events enable row level security;

alter table notifications enable row level security;

alter table strava_accounts enable row level security;

alter table sync_operations enable row level security;

alter table audit_log enable row level security;

alter table roles enable row level security;

alter table user_roles enable row level security;

alter table challenge_themes enable row level security;

alter table user_streaks enable row level security;

alter table challenge_rankings enable row level security;

alter table challenge_snapshots enable row level security;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from user_roles ur
        join roles r on r.id = ur.role_id
        where ur.user_id = auth.uid()
        and r.code = 'admin'
    );
$$;

create or replace function is_challenge_member(
    p_challenge_id uuid
)
returns boolean
language sql
stable
as $$
    select exists (
        select 1
        from challenge_members cm
        where cm.challenge_id = p_challenge_id
        and cm.user_id = auth.uid()
    );
$$;

-- =====================================================
-- PROFILES
-- =====================================================

create policy profiles_select
on profiles
for select
to authenticated
using (true);

create policy profiles_update_self
on profiles
for update
to authenticated
using (
    auth.uid() = id
)
with check (
    auth.uid() = id
);

create policy profiles_admin_all
on profiles
for all
to authenticated
using (
    is_admin()
)
with check (
    is_admin()
);

-- =====================================================
-- INVITE CODES
-- =====================================================

create policy invite_codes_admin_only
on invite_codes
for all
to authenticated
using (
    is_admin()
)
with check (
    is_admin()
);

-- =====================================================
-- CHALLENGES
-- =====================================================

create policy challenges_read
on challenges
for select
to authenticated
using (true);

create policy challenges_admin_write
on challenges
for all
to authenticated
using (
    is_admin()
)
with check (
    is_admin()
);

-- =====================================================
-- CHALLENGE MEMBERS
-- =====================================================

create policy challenge_members_read
on challenge_members
for select
to authenticated
using (true);

create policy challenge_members_insert
on challenge_members
for insert
to authenticated
with check (
    auth.uid() = user_id
    or is_admin()
);

create policy challenge_members_delete
on challenge_members
for delete
to authenticated
using (
    auth.uid() = user_id
    or is_admin()
);

-- =====================================================
-- JOURNEY NODES
-- =====================================================

create policy journey_nodes_read
on journey_nodes
for select
to authenticated
using (true);

create policy journey_nodes_admin_write
on journey_nodes
for all
to authenticated
using (
    is_admin()
)
with check (
    is_admin()
);

-- =====================================================
-- RUNS
-- =====================================================

create policy runs_read
on runs
for select
to authenticated
using (
    is_challenge_member(challenge_id)
);

create policy runs_insert
on runs
for insert
to authenticated
with check (
    auth.uid() = user_id
    and is_challenge_member(challenge_id)
);

create policy runs_update_owner
on runs
for update
to authenticated
using (
    auth.uid() = user_id
)
with check (
    auth.uid() = user_id
);

create policy runs_admin_update
on runs
for update
to authenticated
using (
    is_admin()
)
with check (
    is_admin()
);

create policy runs_delete_owner
on runs
for delete
to authenticated
using (
    auth.uid() = user_id
);

create policy runs_delete_admin
on runs
for delete
to authenticated
using (
    is_admin()
);

-- =====================================================
-- RUN PHOTOS
-- =====================================================

create policy run_photos_read
on run_photos
for select
to authenticated
using (
    exists (
        select 1
        from runs r
        where r.id = run_id
        and is_challenge_member(r.challenge_id)
    )
);

create policy run_photos_insert
on run_photos
for insert
to authenticated
with check (
    exists (
        select 1
        from runs r
        where r.id = run_id
        and r.user_id = auth.uid()
    )
);

create policy run_photos_delete
on run_photos
for delete
to authenticated
using (
    exists (
        select 1
        from runs r
        where r.id = run_id
        and (
            r.user_id = auth.uid()
            or is_admin()
        )
    )
);

-- =====================================================
-- COMMENTS
-- =====================================================

create policy comments_read
on comments
for select
to authenticated
using (
    exists (
        select 1
        from runs r
        where r.id = run_id
        and is_challenge_member(r.challenge_id)
    )
);

create policy comments_insert
on comments
for insert
to authenticated
with check (
    auth.uid() = user_id
);

create policy comments_delete_owner
on comments
for delete
to authenticated
using (
    auth.uid() = user_id
);

create policy comments_delete_admin
on comments
for delete
to authenticated
using (
    is_admin()
);

-- =====================================================
-- REACTIONS
-- =====================================================

create policy reactions_read
on reactions
for select
to authenticated
using (
    exists (
        select 1
        from runs r
        where r.id = run_id
        and is_challenge_member(r.challenge_id)
    )
);

create policy reactions_insert
on reactions
for insert
to authenticated
with check (
    auth.uid() = user_id
);

create policy reactions_update
on reactions
for update
to authenticated
using (
    auth.uid() = user_id
);

create policy reactions_delete
on reactions
for delete
to authenticated
using (
    auth.uid() = user_id
);

-- =====================================================
-- BADGES
-- =====================================================

create policy badges_read
on badges
for select
to authenticated
using (true);

create policy user_badges_read
on user_badges
for select
to authenticated
using (true);

create policy user_badges_admin_write
on user_badges
for all
to authenticated
using (
    is_admin()
)
with check (
    is_admin()
);

-- =====================================================
-- AWARDS
-- =====================================================

create policy awards_read
on challenge_awards
for select
to authenticated
using (true);

create policy awards_admin_write
on challenge_awards
for all
to authenticated
using (
    is_admin()
)
with check (
    is_admin()
);

-- =====================================================
-- MILESTONES
-- =====================================================

create policy milestones_read
on challenge_milestones
for select
to authenticated
using (true);

create policy milestones_admin_write
on challenge_milestones
for all
to authenticated
using (
    is_admin()
)
with check (
    is_admin()
);

-- =====================================================
-- FEED EVENTS
-- =====================================================

create policy feed_events_read
on feed_events
for select
to authenticated
using (
    is_challenge_member(challenge_id)
);

create policy feed_events_admin_write
on feed_events
for all
to authenticated
using (
    is_admin()
)
with check (
    is_admin()
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

create policy notifications_read
on notifications
for select
to authenticated
using (
    auth.uid() = user_id
);

create policy notifications_update
on notifications
for update
to authenticated
using (
    auth.uid() = user_id
);

-- =====================================================
-- STRAVA ACCOUNTS
-- =====================================================

create policy strava_read
on strava_accounts
for select
to authenticated
using (
    auth.uid() = user_id
);

create policy strava_insert
on strava_accounts
for insert
to authenticated
with check (
    auth.uid() = user_id
);

create policy strava_update
on strava_accounts
for update
to authenticated
using (
    auth.uid() = user_id
);

create policy strava_delete
on strava_accounts
for delete
to authenticated
using (
    auth.uid() = user_id
);

-- =====================================================
-- SYNC OPERATIONS
-- =====================================================

create policy sync_read
on sync_operations
for select
to authenticated
using (
    auth.uid() = user_id
);

create policy sync_insert
on sync_operations
for insert
to authenticated
with check (
    auth.uid() = user_id
);

-- =====================================================
-- AUDIT LOG
-- =====================================================

create policy audit_admin_only
on audit_log
for select
to authenticated
using (
    is_admin()
);

-- =====================================================
-- ROLES / THEMES / STREAKS / RANKINGS
-- =====================================================

create policy roles_read
on roles
for select
to authenticated
using (true);

create policy user_roles_read
on user_roles
for select
to authenticated
using (
    auth.uid() = user_id
    or is_admin()
);

create policy user_roles_admin_write
on user_roles
for all
to authenticated
using (
    is_admin()
)
with check (
    is_admin()
);

create policy challenge_themes_read
on challenge_themes
for select
to authenticated
using (true);

create policy user_streaks_read
on user_streaks
for select
to authenticated
using (true);

create policy challenge_rankings_read
on challenge_rankings
for select
to authenticated
using (
    is_challenge_member(challenge_id)
);

create policy challenge_snapshots_read
on challenge_snapshots
for select
to authenticated
using (
    is_challenge_member(challenge_id)
);

-- =====================================================
-- STORAGE — see database/storage-policies.sql
-- =====================================================

-- Storage bucket:
-- run-photos
--
-- Read:
-- authenticated users
--
-- Upload:
-- owner of run
--
-- Delete:
-- owner of run
-- or admin
--
-- Implement via Supabase Storage policies.
