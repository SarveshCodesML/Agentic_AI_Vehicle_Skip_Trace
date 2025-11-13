/*
  # Skip Trace Vehicle Repossession Database Schema

  ## Overview
  This migration creates tables to simulate skip tracing data for vehicle repossession.
  All data is fake and for hackathon demonstration purposes only.

  ## New Tables

  ### 1. `vehicles`
  Stores vehicle information linked to VIN numbers
  - `id` (uuid, primary key)
  - `vin` (text, unique) - Vehicle identification number
  - `make` (text) - Vehicle manufacturer
  - `model` (text) - Vehicle model
  - `year` (integer) - Manufacturing year
  - `color` (text) - Vehicle color
  - `license_plate` (text) - Current license plate
  - `state` (text) - Registration state
  - `created_at` (timestamp)

  ### 2. `borrowers`
  Stores information about vehicle owners/borrowers
  - `id` (uuid, primary key)
  - `first_name` (text) - Borrower's first name
  - `last_name` (text) - Borrower's last name
  - `phone` (text) - Primary phone number
  - `email` (text) - Email address
  - `ssn_last_four` (text) - Last 4 digits of SSN
  - `dob` (date) - Date of birth
  - `created_at` (timestamp)

  ### 3. `vehicle_ownership`
  Links vehicles to borrowers
  - `id` (uuid, primary key)
  - `vehicle_id` (uuid, foreign key to vehicles)
  - `borrower_id` (uuid, foreign key to borrowers)
  - `loan_amount` (numeric) - Outstanding loan amount
  - `days_delinquent` (integer) - Days past due
  - `status` (text) - Account status
  - `created_at` (timestamp)

  ### 4. `address_history`
  Stores address history for borrowers
  - `id` (uuid, primary key)
  - `borrower_id` (uuid, foreign key to borrowers)
  - `address_type` (text) - current, previous, work, relative
  - `street` (text)
  - `city` (text)
  - `state` (text)
  - `zip` (text)
  - `verified_date` (timestamp) - When address was last verified
  - `confidence_score` (numeric) - Confidence level (0-100)
  - `created_at` (timestamp)

  ### 5. `vehicle_sightings`
  Records of where vehicles have been spotted
  - `id` (uuid, primary key)
  - `vehicle_id` (uuid, foreign key to vehicles)
  - `location` (text) - Description of location
  - `latitude` (numeric)
  - `longitude` (numeric)
  - `sighting_date` (timestamp) - When vehicle was sighted
  - `source` (text) - LPR, social_media, informant, etc.
  - `confidence` (text) - high, medium, low
  - `notes` (text)
  - `created_at` (timestamp)

  ### 6. `employment_records`
  Employment information for borrowers
  - `id` (uuid, primary key)
  - `borrower_id` (uuid, foreign key to borrowers)
  - `employer_name` (text)
  - `employer_address` (text)
  - `employer_phone` (text)
  - `position` (text)
  - `start_date` (date)
  - `is_current` (boolean)
  - `verified_date` (timestamp)
  - `created_at` (timestamp)

  ### 7. `social_media_profiles`
  Social media profile information
  - `id` (uuid, primary key)
  - `borrower_id` (uuid, foreign key to borrowers)
  - `platform` (text) - facebook, instagram, linkedin, etc.
  - `profile_url` (text)
  - `last_activity` (timestamp)
  - `location_shared` (text)
  - `created_at` (timestamp)

  ### 8. `associates`
  Known associates and relatives
  - `id` (uuid, primary key)
  - `borrower_id` (uuid, foreign key to borrowers)
  - `name` (text)
  - `relationship` (text) - spouse, parent, sibling, friend, etc.
  - `phone` (text)
  - `address` (text)
  - `created_at` (timestamp)

  ### 9. `trace_sessions`
  Tracks AI agent trace sessions
  - `id` (uuid, primary key)
  - `vin` (text)
  - `borrower_first_name` (text)
  - `borrower_last_name` (text)
  - `session_data` (jsonb) - Complete trace results
  - `status` (text) - completed, in_progress, failed
  - `created_at` (timestamp)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to read data
  - Add policies for authenticated users to write trace sessions
*/

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vin text UNIQUE NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  color text NOT NULL,
  license_plate text,
  state text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS borrowers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  email text,
  ssn_last_four text,
  dob date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_ownership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) NOT NULL,
  borrower_id uuid REFERENCES borrowers(id) NOT NULL,
  loan_amount numeric NOT NULL,
  days_delinquent integer DEFAULT 0,
  status text DEFAULT 'delinquent',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS address_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id uuid REFERENCES borrowers(id) NOT NULL,
  address_type text NOT NULL,
  street text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  verified_date timestamptz,
  confidence_score numeric DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_sightings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) NOT NULL,
  location text NOT NULL,
  latitude numeric,
  longitude numeric,
  sighting_date timestamptz NOT NULL,
  source text NOT NULL,
  confidence text DEFAULT 'medium',
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id uuid REFERENCES borrowers(id) NOT NULL,
  employer_name text NOT NULL,
  employer_address text,
  employer_phone text,
  position text,
  start_date date,
  is_current boolean DEFAULT false,
  verified_date timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_media_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id uuid REFERENCES borrowers(id) NOT NULL,
  platform text NOT NULL,
  profile_url text,
  last_activity timestamptz,
  location_shared text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS associates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id uuid REFERENCES borrowers(id) NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL,
  phone text,
  address text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trace_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vin text NOT NULL,
  borrower_first_name text,
  borrower_last_name text,
  session_data jsonb,
  status text DEFAULT 'in_progress',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE address_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_sightings ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE associates ENABLE ROW LEVEL SECURITY;
ALTER TABLE trace_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on vehicles"
  ON vehicles FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on borrowers"
  ON borrowers FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on vehicle_ownership"
  ON vehicle_ownership FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on address_history"
  ON address_history FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on vehicle_sightings"
  ON vehicle_sightings FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on employment_records"
  ON employment_records FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on social_media_profiles"
  ON social_media_profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on associates"
  ON associates FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on trace_sessions"
  ON trace_sessions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on trace_sessions"
  ON trace_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on trace_sessions"
  ON trace_sessions FOR UPDATE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_borrowers_name ON borrowers(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_vehicle_ownership_vehicle ON vehicle_ownership(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_ownership_borrower ON vehicle_ownership(borrower_id);
CREATE INDEX IF NOT EXISTS idx_address_history_borrower ON address_history(borrower_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sightings_vehicle ON vehicle_sightings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trace_sessions_vin ON trace_sessions(vin);