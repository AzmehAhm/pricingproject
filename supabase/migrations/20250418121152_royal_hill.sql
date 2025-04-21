/*
  # Create initial admin user if not exists

  1. Changes
    - Checks if admin user exists before creating
    - Creates admin user with email and password if needed
    - Sets up proper identity record with provider_id
*/

DO $$ 
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if admin user already exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'azmehpaintsgroup@gmail.com'
  ) THEN
    -- Create the admin user
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
      now(),
      jsonb_build_object(
        'provider', 'email',
        'providers', array['email']
      ),
      jsonb_build_object(
        'role', 'ADMIN'
      ),
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO new_user_id;

    -- Create the user identity
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
      gen_random_uuid(),
      new_user_id,
      jsonb_build_object(
        'sub', new_user_id::text,
        'email', 'azmehpaintsgroup@gmail.com'
      ),
      'email',
      new_user_id::text,
      now(),
      now(),
      now()
    );
  END IF;
END $$;