// src/supabase/schema.md
# Supabase Table: users

- id: uuid (primary key, auto-generated)
- name: text
- email: text (unique)
- password: text (hashed, for demo only; use auth in production)
- created_at: timestamp

You can create this table in Supabase SQL editor with:

```sql
create table users (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text unique,
  password text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

> For production, use Supabase Auth instead of storing passwords directly.
