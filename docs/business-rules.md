# /docs/business-rules.md

## Purpose

Legacy business rules reference. **Authoritative spec:** [`docs/spec/MASTER_SPEC.md`](./spec/MASTER_SPEC.md).

When this file conflicts with `docs/spec/`, the spec package takes precedence.

---

# 1. Challenge Rules

## 1.1 Active Challenge

At any given time:

```text
Maximum Active Challenges = 1
```

The system must prevent multiple active challenges.

A challenge may be:

```text
Draft
Active
Completed
Archived
```

Only one challenge may be in the Active state.

---

## 1.2 Challenge Duration

A challenge has:

```text
start_date
end_date
```

The challenge automatically becomes active on the start date.

The challenge automatically becomes completed on the end date.

---

## 1.3 Challenge Distance Goal

Default target:

```text
500 km
```

The target is configurable by administrators.

The target is used for:

* Progress tracking
* Journey progression
* Completion celebrations

The target does NOT determine challenge completion.

Challenge completion is determined by:

```text
Current Date >= end_date
```

---

## 1.4 Distance Beyond Goal

The team may continue accumulating distance after reaching the target.

Example:

```text
Target:
500 km

Actual:
742 km
```

This is valid.

The challenge remains active until its end date.

---

## 1.5 Historical Preservation

Completed challenges are never deleted.

Historical data must remain available indefinitely.

Historical records include:

* Runs
* Rankings
* Awards
* Badges
* Milestones
* Feed events
* Challenge summaries

---

# 2. Membership Rules

## 2.1 Invite Only

The platform is private.

Users may only join through a valid invite code.

Public registration is not allowed.

---

## 2.2 Automatic Enrollment

When a user successfully creates an account:

```text
IF active challenge exists
THEN user automatically joins challenge
```

No manual join flow is required.

---

## 2.3 Leaving Challenges

Users cannot leave an active challenge.

Administrators may remove users if necessary.

---

# 3. Run Rules

## 3.1 Ownership

Every run belongs to:

```text
One User
One Challenge
```

---

## 3.2 Manual Entry

Manual run creation is supported in MVP.

Required fields:

```text
distance_km
duration_min
```

Optional fields:

```text
notes
photos
```

---

## 3.3 Photos

Maximum:

```text
3 photos per run
```

Supported image formats:

```text
jpg
jpeg
png
webp
```

Photos are stored in Supabase Storage.

---

## 3.4 Editing

Users may edit their own runs forever.

There is no edit time limit.

Editable fields:

* Distance
* Duration
* Notes
* Photos

---

## 3.5 Deletion

A run may be deleted by:

```text
Owner
Administrator
```

User-initiated deletion is a **hard delete** (row removed). Admin may **invalidate** a run (`is_valid = false`) to exclude it from stats/feed without deleting the row. Admin hard delete should write an `audit_log` entry when possible.

Invalid or deleted runs:

* Do not appear in leaderboards
* Do not appear in feed
* Do not count toward statistics

---

## 3.6 Distance Validation

Distance must be:

```text
> 0 km
```

---

## 3.7 Duration Validation

Duration must be:

```text
> 0 minutes
```

---

## 3.8 Pace Validation

Derived pace (`duration_min / distance_km`) must be:

```text
>= 2.0 min/km
<= 20.0 min/km
```

Administrators may override via API when logging or moderating runs.

---

# 4. Feed Rules

## 4.1 Feed Visibility

Challenge feed is visible only to challenge members.

---

## 4.2 Feed Events

Supported event types:

```text
Run Created
Run Updated
Comment Added
Reaction Added
Badge Unlocked
Milestone Reached
Award Granted
Challenge Completed
```

---

## 4.3 Ordering

Feed displays newest items first.

```text
ORDER BY created_at DESC
```

---

# 5. Social Rules

## 5.1 Comments

Any challenge member may comment on any run.

Comments are permanent.

Administrators may remove comments.

---

## 5.2 Reactions

Supported reactions:

```text
Like
Fire
Water
Ice
```

One reaction per user per run.

Users may change reactions.

---

# 6. Journey System Rules

## 6.1 Journey Theme

The initial challenge theme is:

```text
The Fellowship Journey
```

Inspired by the journey from Hobbiton to Rivendell.

---

## 6.2 Journey Nodes

Default nodes:

```text
Hobbiton
Buckland
Old Forest
Bree
Weathertop
Ford of Bruinen
Rivendell
```

---

## 6.3 Milestone Triggering

Milestones are based on journey nodes.

Milestones are NOT percentage based.

Each node unlocks when:

```text
Team Distance >= Node Distance
```

---

## 6.4 Current Location

The dashboard must always display:

```text
Current Location
Next Location
Distance Remaining
Progress Between Locations
```

---

## 6.5 Rivendell

Rivendell is the final visible journey node.

When Rivendell is reached:

```text
Journey Complete
```

is displayed.

The challenge continues until the end date.

---

## 6.6 Extended Journey

During an **active** challenge, after the team passes 500 km, the map may show **extended km markers** (550, 600, …) while Rivendell remains the narrative completion at 500 km.

The **extended journey completion screen** (infinite progression mode) unlocks only after:

```text
Challenge Completed (end_date passed + completion pipeline)
```

---

# 7. Badge Rules

## 7.1 Automatic Unlocking

Badges unlock automatically.

Users cannot manually claim badges.

---

## 7.2 Distance Badges

Default milestones:

```text
First Run
10 KM
25 KM
50 KM
100 KM
Marathon Runner
```

---

## 7.3 Streak Badges

Default milestones:

```text
3 Day Streak
7 Day Streak
```

---

## 7.4 Social Badges

Social badges may be unlocked through:

```text
Comments
Reactions
Community Participation
```

---

# 8. Leaderboard Rules

## 8.1 Leaderboard Visibility

Leaderboards are visible to all challenge members.

---

## 8.2 Ranking Modes

Supported ranking modes:

```text
Distance
Run Count
Average Pace
Best Pace
Current Streak
Longest Streak
Social Score
```

---

## 8.3 Ranking Ties

If values are equal:

```text
Earlier achievement wins
```

Example:

```text
User A reaches 100 km first

User B reaches 100 km later

User A ranks higher
```

---

# 9. Notification Rules

## 9.1 Notification Channel

Notifications are:

```text
In-App Only
```

No push notifications.

No email notifications.

---

## 9.2 Notification Types

Supported notifications:

```text
Comment Received
Reaction Received
Badge Unlocked
Milestone Reached
Challenge Completed
```

---

## 9.3 Read State

Notifications may be:

```text
Unread
Read
```

Users may mark notifications as read.

---

# 10. Strava Rules

## 10.1 Phase

Strava integration is Phase 2.

MVP does not require Strava.

---

## 10.2 Imported Activities

Imported runs behave exactly like manual runs.

Users may edit imported runs.

---

## 10.3 Duplicate Detection

Potential duplicates are identified using:

```text
Distance Similarity
Time Overlap
```

Potential duplicates require user confirmation.

---

# 11. Administration Rules

## 11.1 Administrators May

Create challenges

Edit challenges

Activate challenges

Close challenges

Delete runs

Edit any run

Manage users

Force milestones

Manage invite codes

Manage challenge settings

---

## 11.2 Audit Logging

Administrative actions must generate audit log entries.

Examples:

```text
Challenge Closed
Run Deleted
User Removed
Milestone Forced
```

---

# 12. Offline Rules

## 12.1 Offline Logging

Users may create runs while offline.

---

## 12.2 Sync Queue

Offline actions are queued.

Queued actions automatically sync when connectivity returns.

---

## 12.3 Conflict Resolution

Server data is authoritative.

Conflicts must be surfaced to users before overwriting data.

---

# 13. Security Rules

## 13.1 Data Access

Users may only access challenge data for challenges they belong to.

---

## 13.2 Ownership

Users may only edit resources they own unless they are administrators.

---

## 13.3 Row Level Security

All user-generated data must be protected by Supabase RLS policies.

RLS is mandatory.

---

# 14. Non-Functional Rules

## 14.1 Mobile First

Mobile experience is the primary target.

Desktop support is secondary.

---

## 14.2 Performance

Dashboard load target:

```text
< 2 seconds
```

on normal mobile connections.

---

## 14.3 Reliability

Challenge data must never be lost.

All writes must be persisted before success is returned to the client.

---

## 14.4 Accessibility

Core flows must be keyboard accessible.

Color alone must never convey important information.
