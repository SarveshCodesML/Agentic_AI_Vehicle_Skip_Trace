import { supabase } from '../lib/supabase';

export interface VehicleInfo {
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string | null;
  state: string | null;
}

export interface BorrowerInfo {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  ssn_last_four: string | null;
  dob: string | null;
}

export interface AddressInfo {
  address_type: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  verified_date: string | null;
  confidence_score: number;
}

export interface VehicleSighting {
  location: string;
  latitude: number | null;
  longitude: number | null;
  sighting_date: string;
  source: string;
  confidence: string;
  notes: string | null;
}

export interface EmploymentInfo {
  employer_name: string;
  employer_address: string | null;
  employer_phone: string | null;
  position: string | null;
  start_date: string | null;
  is_current: boolean;
  verified_date: string | null;
}

export interface SocialMediaProfile {
  platform: string;
  profile_url: string | null;
  last_activity: string | null;
  location_shared: string | null;
}

export interface Associate {
  name: string;
  relationship: string;
  phone: string | null;
  address: string | null;
}

export interface LoanInfo {
  loan_amount: number;
  days_delinquent: number;
  status: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiSimulator = {
  async searchVehicleByVIN(vin: string): Promise<VehicleInfo | null> {
    await delay(800);

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vin', vin)
      .maybeSingle();

    if (error) {
      console.error('Error fetching vehicle:', error);
      return null;
    }

    return data;
  },

  async searchBorrowerByName(firstName: string, lastName: string): Promise<BorrowerInfo | null> {
    await delay(700);

    const { data, error } = await supabase
      .from('borrowers')
      .select('*')
      .ilike('first_name', firstName)
      .ilike('last_name', lastName)
      .maybeSingle();

    if (error) {
      console.error('Error fetching borrower:', error);
      return null;
    }

    return data;
  },

  async getLoanInfo(vehicleId: string, borrowerId: string): Promise<LoanInfo | null> {
    await delay(600);

    const { data, error } = await supabase
      .from('vehicle_ownership')
      .select('loan_amount, days_delinquent, status')
      .eq('vehicle_id', vehicleId)
      .eq('borrower_id', borrowerId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching loan info:', error);
      return null;
    }

    return data;
  },

  async getAddressHistory(borrowerId: string): Promise<AddressInfo[]> {
    await delay(900);

    const { data, error } = await supabase
      .from('address_history')
      .select('address_type, street, city, state, zip, verified_date, confidence_score')
      .eq('borrower_id', borrowerId)
      .order('confidence_score', { ascending: false });

    if (error) {
      console.error('Error fetching address history:', error);
      return [];
    }

    return data || [];
  },

  async getVehicleSightings(vehicleId: string): Promise<VehicleSighting[]> {
    await delay(1000);

    const { data, error } = await supabase
      .from('vehicle_sightings')
      .select('location, latitude, longitude, sighting_date, source, confidence, notes')
      .eq('vehicle_id', vehicleId)
      .order('sighting_date', { ascending: false });

    if (error) {
      console.error('Error fetching vehicle sightings:', error);
      return [];
    }

    return data || [];
  },

  async getEmploymentRecords(borrowerId: string): Promise<EmploymentInfo[]> {
    await delay(750);

    const { data, error } = await supabase
      .from('employment_records')
      .select('employer_name, employer_address, employer_phone, position, start_date, is_current, verified_date')
      .eq('borrower_id', borrowerId)
      .order('is_current', { ascending: false });

    if (error) {
      console.error('Error fetching employment records:', error);
      return [];
    }

    return data || [];
  },

  async getSocialMediaProfiles(borrowerId: string): Promise<SocialMediaProfile[]> {
    await delay(850);

    const { data, error } = await supabase
      .from('social_media_profiles')
      .select('platform, profile_url, last_activity, location_shared')
      .eq('borrower_id', borrowerId)
      .order('last_activity', { ascending: false });

    if (error) {
      console.error('Error fetching social media profiles:', error);
      return [];
    }

    return data || [];
  },

  async getAssociates(borrowerId: string): Promise<Associate[]> {
    await delay(650);

    const { data, error } = await supabase
      .from('associates')
      .select('name, relationship, phone, address')
      .eq('borrower_id', borrowerId);

    if (error) {
      console.error('Error fetching associates:', error);
      return [];
    }

    return data || [];
  }
};
