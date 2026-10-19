-- Run AFTER you have created your own user in Supabase (Authentication > Users > Add user).
-- Replace the email below with YOUR email, keep the quotes.
insert into public.admins (user_id) select id from auth.users where email = 'PUT_YOUR_EMAIL_HERE';
