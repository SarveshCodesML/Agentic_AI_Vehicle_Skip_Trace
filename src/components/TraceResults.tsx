import { MapPin, Calendar, DollarSign, Briefcase, Users, Share2 } from 'lucide-react';
import type { TraceResult } from '../services/skipTraceAgent';

interface TraceResultsProps {
  result: TraceResult;
}

export function TraceResults({ result }: TraceResultsProps) {
  const { vehicleInfo, borrowerInfo, loanInfo, addresses, sightings, employment, socialMedia, associates, summary, recommendations } = result;

  if (!vehicleInfo || !borrowerInfo) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p className="text-red-800 text-sm">Unable to locate vehicle or borrower information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Skip Trace Report</h3>
        <div className="bg-gray-50 rounded p-3 mb-4">
          <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">{summary}</pre>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address History ({addresses.length})
          </h4>
          <div className="space-y-2">
            {addresses.slice(0, 3).map((addr, idx) => (
              <div key={idx} className="bg-gray-50 rounded p-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-gray-900">{addr.address_type.toUpperCase()}</p>
                    <p className="text-xs text-gray-700">{addr.street}</p>
                    <p className="text-xs text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-600">{addr.confidence_score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {sightings.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Vehicle Sightings ({sightings.length})
            </h4>
            <div className="space-y-2">
              {sightings.slice(0, 3).map((sighting, idx) => (
                <div key={idx} className="bg-blue-50 rounded p-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-gray-900">{sighting.location}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(sighting.sighting_date).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Source: {sighting.source.toUpperCase()} • {sighting.confidence} confidence
                      </p>
                    </div>
                  </div>
                  {sighting.notes && (
                    <p className="text-xs text-gray-600 mt-1">{sighting.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {employment.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Employment Records ({employment.length})
            </h4>
            <div className="space-y-2">
              {employment.map((emp, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-gray-900">{emp.employer_name}</p>
                      {emp.position && (
                        <p className="text-xs text-gray-700">{emp.position}</p>
                      )}
                      {emp.employer_address && (
                        <p className="text-xs text-gray-600">{emp.employer_address}</p>
                      )}
                    </div>
                    {emp.is_current && (
                      <span className="text-xs font-semibold text-green-600">CURRENT</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {socialMedia.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Social Media Profiles ({socialMedia.length})
            </h4>
            <div className="space-y-2">
              {socialMedia.map((profile, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-2">
                  <p className="text-xs font-medium text-gray-900">{profile.platform.toUpperCase()}</p>
                  {profile.profile_url && (
                    <p className="text-xs text-blue-600 truncate">{profile.profile_url}</p>
                  )}
                  {profile.location_shared && (
                    <p className="text-xs text-gray-600">Last location: {profile.location_shared}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {associates.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Known Associates ({associates.length})
            </h4>
            <div className="space-y-2">
              {associates.map((assoc, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-gray-900">{assoc.name}</p>
                      <p className="text-xs text-gray-600">{assoc.relationship}</p>
                      {assoc.phone && (
                        <p className="text-xs text-gray-600">{assoc.phone}</p>
                      )}
                      {assoc.address && (
                        <p className="text-xs text-gray-600">{assoc.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loanInfo && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Loan Information
            </h4>
            <div className="bg-red-50 rounded p-2">
              <p className="text-xs text-gray-700">
                Outstanding: <span className="font-semibold">${loanInfo.loan_amount.toLocaleString()}</span>
              </p>
              <p className="text-xs text-gray-700">
                Delinquent: <span className="font-semibold text-red-700">{loanInfo.days_delinquent} days</span>
              </p>
              <p className="text-xs text-gray-700">
                Status: <span className="font-semibold">{loanInfo.status.toUpperCase()}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-green-900 mb-2">AI Generated Summary</h3>
          <ul className="space-y-1">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs text-green-800 flex items-start gap-2">
                <span className="font-bold mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
