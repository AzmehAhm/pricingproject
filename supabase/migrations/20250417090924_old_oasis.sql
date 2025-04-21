/*
  # Create initial admin user with proper identity setup

  1. Changes
    - Creates admin user with email and password
    - Sets up user metadata with ADMIN role
    - Creates identity with required provider_id field
*/

DO $$ 
DECLARE
  new_user_id uuid;
  new_identity_id uuid;
BEGIN
  -- Insert admin user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'azmehpaintsgroup@gmail.com',
    crypt('Admin123!', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    ),
    jsonb_build_object(
      'role', 'ADMIN'
    ),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Generate a new UUID for identity
  SELECT gen_random_uuid() INTO new_identity_id;

  -- Insert identity with provider_id
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    new_identity_id,
    new_user_id,
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', 'azmehpaintsgroup@gmail.com'
    ),
    'email',
    new_user_id::text,
    NOW(),
    NOW(),
    NOW()
  );
END $$;