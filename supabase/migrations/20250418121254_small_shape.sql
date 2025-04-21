/*
  # Create customer account with pricelist

  1. Changes
    - Creates a customer user with email and password
    - Sets up proper identity record
    - Creates a default pricelist
    - Creates customer record linked to user and pricelist
*/

DO $$ 
DECLARE
  new_user_id uuid;
  new_pricelist_id uuid;
  new_customer_id uuid;
BEGIN
  -- Check if customer user already exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'customer@example.com'
  ) THEN
    -- Create customer user
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
      'customer@example.com',
      crypt('Customer123!', gen_salt('bf')),
      now(),
      jsonb_build_object(
        'provider', 'email',
        'providers', array['email']
      ),
      jsonb_build_object(
        'role', 'CUSTOMER'
      ),
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO new_user_id;

    -- Create identity for the customer
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
        'email', 'customer@example.com'
      ),
      'email',
      new_user_id::text,
      now(),
      now(),
      now()
    );

    -- Create a default pricelist
    INSERT INTO pricelists (
      id,
      name,
      description
    )
    VALUES (
      gen_random_uuid(),
      'Standard Pricelist',
      'Default pricing for standard customers'
    )
    RETURNING id INTO new_pricelist_id;

    -- Create customer record
    INSERT INTO customers (
      id,
      user_id,
      pricelist_id,
      company_name,
      contact_person
    )
    VALUES (
      gen_random_uuid(),
      new_user_id,
      new_pricelist_id,
      'Example Company',
      'John Doe'
    )
    RETURNING id INTO new_customer_id;
  END IF;
END $$;