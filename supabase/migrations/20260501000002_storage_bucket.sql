-- 20260501000002_storage_bucket.sql
-- Phase 1: Bucket privado progress-photos (preparacao para Phase 4)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'progress-photos',
  'progress-photos',
  false,                                       -- PRIVADO (SEC-02)
  10 * 1024 * 1024,                            -- 10MB max por arquivo
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Policy: usuario so pode upload no folder com seu uid
create policy "user_can_upload_own_progress"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Policy: usuario so pode ler arquivos do proprio folder
create policy "user_can_read_own_progress"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Policy: usuario pode deletar arquivos do proprio folder
create policy "user_can_delete_own_progress"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
