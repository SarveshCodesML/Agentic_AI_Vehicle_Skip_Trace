import { apiSimulator } from './apiSimulator';
import type { VehicleInfo, BorrowerInfo, AddressInfo, VehicleSighting, EmploymentInfo, SocialMediaProfile, Associate, LoanInfo } from './apiSimulator';

export interface TraceStep {
  step: number;
  tool: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message: string;
  data?: unknown;
  timestamp: Date;
}

export interface TraceResult {
  vehicleInfo: VehicleInfo | null;
  borrowerInfo: BorrowerInfo | null;
  loanInfo: LoanInfo | null;
  addresses: AddressInfo[];
  sightings: VehicleSighting[];
  employment: EmploymentInfo[];
  socialMedia: SocialMediaProfile[];
  associates: Associate[];
  summary: string;
  recommendations: string[];
}

export class SkipTraceAgent {
  private steps: TraceStep[] = [];
  private onStepUpdate?: (steps: TraceStep[]) => void;

  constructor(onStepUpdate?: (steps: TraceStep[]) => void) {
    this.onStepUpdate = onStepUpdate;
  }

  private addStep(tool: string, message: string, status: 'pending' | 'running' | 'completed' | 'failed' = 'pending', data?: unknown) {
    const step: TraceStep = {
      step: this.steps.length + 1,
      tool,
      status,
      message,
      data,
      timestamp: new Date()
    };
    this.steps.push(step);
    if (this.onStepUpdate) {
      this.onStepUpdate([...this.steps]);
    }
  }

  private updateLastStep(status: 'running' | 'completed' | 'failed', data?: unknown) {
    if (this.steps.length > 0) {
      this.steps[this.steps.length - 1].status = status;
      if (data !== undefined) {
        this.steps[this.steps.length - 1].data = data;
      }
      if (this.onStepUpdate) {
        this.onStepUpdate([...this.steps]);
      }
    }
  }

  async traceVehicle(vin: string, firstName: string, lastName: string): Promise<TraceResult> {
    this.steps = [];

    let vehicleInfo: VehicleInfo | null = null;
    let borrowerInfo: BorrowerInfo | null = null;
    let loanInfo: LoanInfo | null = null;
    let addresses: AddressInfo[] = [];
    let sightings: VehicleSighting[] = [];
    let employment: EmploymentInfo[] = [];
    let socialMedia: SocialMediaProfile[] = [];
    let associates: Associate[] = [];

    this.addStep('VIN_LOOKUP', `Querying DMV database for VIN: ${vin}`, 'running');
    vehicleInfo = await apiSimulator.searchVehicleByVIN(vin);

    if (!vehicleInfo) {
      this.updateLastStep('failed');
      this.addStep('ERROR', 'Vehicle not found in system', 'failed');
      return this.buildResult(vehicleInfo, borrowerInfo, loanInfo, addresses, sightings, employment, socialMedia, associates);
    }

    this.updateLastStep('completed', vehicleInfo);

    this.addStep('BORROWER_SEARCH', `Searching credit bureau for ${firstName} ${lastName}`, 'running');
    borrowerInfo = await apiSimulator.searchBorrowerByName(firstName, lastName);

    if (!borrowerInfo) {
      this.updateLastStep('failed');
      this.addStep('ERROR', 'Borrower not found in system', 'failed');
      return this.buildResult(vehicleInfo, borrowerInfo, loanInfo, addresses, sightings, employment, socialMedia, associates);
    }

    this.updateLastStep('completed', borrowerInfo);

    this.addStep('LOAN_STATUS', 'Retrieving loan account details', 'running');
    loanInfo = await apiSimulator.getLoanInfo(vehicleInfo.vin, borrowerInfo.id);
    this.updateLastStep('completed', loanInfo);

    this.addStep('ADDRESS_TRACE', 'Running comprehensive address trace', 'running');
    addresses = await apiSimulator.getAddressHistory(borrowerInfo.id);
    this.updateLastStep('completed', { count: addresses.length, addresses });

    this.addStep('LPR_SCAN', 'Scanning license plate recognition database', 'running');
    sightings = await apiSimulator.getVehicleSightings(vehicleInfo.vin);
    this.updateLastStep('completed', { count: sightings.length, sightings });

    this.addStep('EMPLOYMENT_CHECK', 'Checking employment databases', 'running');
    employment = await apiSimulator.getEmploymentRecords(borrowerInfo.id);
    this.updateLastStep('completed', { count: employment.length, employment });

    this.addStep('SOCIAL_MEDIA', 'Analyzing social media presence', 'running');
    socialMedia = await apiSimulator.getSocialMediaProfiles(borrowerInfo.id);
    this.updateLastStep('completed', { count: socialMedia.length, socialMedia });

    this.addStep('ASSOCIATE_NETWORK', 'Mapping associate network', 'running');
    associates = await apiSimulator.getAssociates(borrowerInfo.id);
    this.updateLastStep('completed', { count: associates.length, associates });

    this.addStep('ANALYSIS', 'Generating intelligence report', 'running');
    await new Promise(resolve => setTimeout(resolve, 500));
    this.updateLastStep('completed');

    return this.buildResult(vehicleInfo, borrowerInfo, loanInfo, addresses, sightings, employment, socialMedia, associates);
  }

  private buildResult(
    vehicleInfo: VehicleInfo | null,
    borrowerInfo: BorrowerInfo | null,
    loanInfo: LoanInfo | null,
    addresses: AddressInfo[],
    sightings: VehicleSighting[],
    employment: EmploymentInfo[],
    socialMedia: SocialMediaProfile[],
    associates: Associate[]
  ): TraceResult {
    const summary = this.generateSummary(vehicleInfo, borrowerInfo, loanInfo, addresses, sightings, employment);
    const recommendations = this.generateRecommendations(addresses, sightings, employment, associates);

    return {
      vehicleInfo,
      borrowerInfo,
      loanInfo,
      addresses,
      sightings,
      employment,
      socialMedia,
      associates,
      summary,
      recommendations
    };
  }

  private generateSummary(
    vehicleInfo: VehicleInfo | null,
    borrowerInfo: BorrowerInfo | null,
    loanInfo: LoanInfo | null,
    addresses: AddressInfo[],
    sightings: VehicleSighting[],
    employment: EmploymentInfo[]
  ): string {
    if (!vehicleInfo || !borrowerInfo) {
      return 'Unable to complete trace - insufficient data found.';
    }

    const parts = [];

    parts.push(`Subject: ${borrowerInfo.first_name} ${borrowerInfo.last_name}`);
    parts.push(`Vehicle: ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model} (${vehicleInfo.color})`);
    parts.push(`VIN: ${vehicleInfo.vin}`);

    if (vehicleInfo.license_plate) {
      parts.push(`License Plate: ${vehicleInfo.license_plate} (${vehicleInfo.state})`);
    }

    if (loanInfo) {
      parts.push(`\nLoan Status: ${loanInfo.days_delinquent} days delinquent`);
      parts.push(`Outstanding Amount: $${loanInfo.loan_amount.toLocaleString()}`);
    }

    if (borrowerInfo.phone) {
      parts.push(`\nContact: ${borrowerInfo.phone}`);
    }

    const currentAddress = addresses.find(a => a.address_type === 'current');
    if (currentAddress) {
      parts.push(`Last Known Address: ${currentAddress.street}, ${currentAddress.city}, ${currentAddress.state} ${currentAddress.zip}`);
      parts.push(`Address Confidence: ${currentAddress.confidence_score}%`);
    }

    if (sightings.length > 0) {
      const latestSighting = sightings[0];
      const date = new Date(latestSighting.sighting_date);
      parts.push(`\nLatest Vehicle Sighting: ${latestSighting.location}`);
      parts.push(`Date: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`);
      parts.push(`Source: ${latestSighting.source.toUpperCase()} - Confidence: ${latestSighting.confidence}`);
    }

    const currentEmployment = employment.find(e => e.is_current);
    if (currentEmployment) {
      parts.push(`\nCurrent Employment: ${currentEmployment.employer_name}`);
      if (currentEmployment.employer_address) {
        parts.push(`Work Location: ${currentEmployment.employer_address}`);
      }
    }

    return parts.join('\n');
  }

  private generateRecommendations(
    addresses: AddressInfo[],
    sightings: VehicleSighting[],
    employment: EmploymentInfo[],
    associates: Associate[]
  ): string[] {
    const recommendations: string[] = [];

    if (sightings.length > 0) {
      const latestSighting = sightings[0];
      recommendations.push(`Check ${latestSighting.location} - vehicle was spotted there recently via ${latestSighting.source}`);
    }

    const highConfidenceAddresses = addresses.filter(a => a.confidence_score >= 70);
    if (highConfidenceAddresses.length > 0) {
      highConfidenceAddresses.slice(0, 2).forEach(addr => {
        recommendations.push(`Conduct surveillance at ${addr.street}, ${addr.city}, ${addr.state} (${addr.confidence_score}% confidence)`);
      });
    }

    const currentEmployment = employment.find(e => e.is_current);
    if (currentEmployment && currentEmployment.employer_address) {
      recommendations.push(`Monitor work location: ${currentEmployment.employer_address} during business hours`);
    }

    if (associates.length > 0) {
      const closeRelatives = associates.filter(a => ['spouse', 'parent', 'sibling'].includes(a.relationship.toLowerCase()));
      closeRelatives.slice(0, 2).forEach(assoc => {
        if (assoc.address) {
          recommendations.push(`Check associate: ${assoc.name} (${assoc.relationship}) at ${assoc.address}`);
        }
      });
    }

    const recentSightings = sightings.slice(0, 3);
    if (recentSightings.length >= 2) {
      const locations = recentSightings.map(s => s.location);
      recommendations.push(`Pattern detected: Vehicle frequently spotted in these areas: ${locations.join(', ')}`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Insufficient data for specific recommendations. Consider additional skip tracing resources.');
    }

    return recommendations;
  }

  getSteps(): TraceStep[] {
    return [...this.steps];
  }
}
