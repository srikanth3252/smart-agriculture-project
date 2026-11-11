import React, { useState } from 'react';
import priceService from '../services/priceService';
import './CropSuggestion.css';

export default function CropSuggestion() {
  const [soil, setSoil] = useState('black');
  const [season, setSeason] = useState('summer');
  const [crops, setCrops] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleGetSuggestion = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await priceService.getCropSuggestions({ soil, season });
      setCrops(res.crops || []);
      setDetails(res.details || []);
      setSearched(true);
    } catch (err) {
      alert('Error fetching crop suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container suggest-page">
      <div className="suggest-header">
        <h1 className="suggest-title">🌿 Agronomic Crop Suggestion System</h1>
        <p className="suggest-subtitle">
          Intelligent crop recommendations based on regional soil texture, agronomic seasons, and irrigation parameters.
        </p>
      </div>

      <div className="suggest-card">
        <form onSubmit={handleGetSuggestion}>
          <div className="suggest-form-grid">
            <div className="form-group">
              <label className="form-label">Select Soil Type</label>
              <select
                value={soil}
                onChange={(e) => setSoil(e.target.value)}
                className="form-select"
              >
                <option value="black">Black Soil (Regur - High Clay/Moisture)</option>
                <option value="red">Red Soil (Loamy / Well-drained)</option>
                <option value="sandy">Sandy Soil (Rapid Water Infiltration)</option>
                <option value="clay">Clay / Alluvial Soil (River Plains & Paddy)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Current / Upcoming Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="form-select"
              >
                <option value="summer">Summer Season (Zaid: Mar - Jun)</option>
                <option value="rainy">Monsoon / Rainy Season (Kharif: Jul - Oct)</option>
                <option value="winter">Winter Season (Rabi: Nov - Feb)</option>
              </select>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
            >
              {loading ? 'Analyzing Agronomic Data...' : 'Get Scientific Recommendations'}
            </button>
          </div>
        </form>

        {searched && (
          <div className="suggest-results-box">
            <h3 className="suggest-results-title">
              🌾 Recommended Crops for {soil.toUpperCase()} Soil in {season.toUpperCase()}
            </h3>

            {crops.length > 0 ? (
              <>
                <div className="suggest-crop-tags">
                  {crops.map((c, i) => (
                    <span key={i} className="suggest-crop-pill">
                      🌱 {c}
                    </span>
                  ))}
                </div>

                {details.length > 0 && (
                  <div className="suggest-details-grid">
                    {details.map((d, i) => (
                      <div key={i} className="suggest-detail-card">
                        <div className="suggest-detail-name">{d.crop}</div>
                        <div><strong>Suitability:</strong> {d.suitability}</div>
                        <div><strong>Water Need:</strong> {d.waterRequirement}</div>
                        <div><strong>Cycle:</strong> {d.duration}</div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {d.soilMatch}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p>No matching crops identified for these parameters.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

