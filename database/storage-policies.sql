-- Storage bucket + policies for run photos
-- Apply after creating project (Phase 1)

insert into storage.buckets (id, name, public)
values ('run-photos', 'run-photos', false)
on conflict (id) do nothing;

create policy "run_photos_select"
on storage.objects for select
to authenticated
using (bucket_id = 'run-photos');

create policy "run_photos_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'run-photos');

create policy "run_photos_update"
on storage.objects for update
to authenticated
using (bucket_id = 'run-photos' and owner = auth.uid());

create policy "run_photos_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'run-photos' and owner = auth.uid());
