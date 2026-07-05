import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import api from "../services/api";
import { baseChartOptions, chartColors } from "../utils/chartSetup";

const REGION_LABELS = {
  north: "North Karnataka",
  south: "South Karnataka",
  coastal: "Coastal Karnataka",
  malnad: "Malnad Karnataka",
};

function RegionAnalyticsChart({ period, chartRef, onRegionSelect }) {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const onRegionSelectRef = useRef(onRegionSelect);
  onRegionSelectRef.current = onRegionSelect;

  const loadRegions = useCallback(async () => {
    try {
      const res = await api.get(`/analytics/regions?period=${period}`);
      setRegions(res.data.data || []);
    } catch (err) {
      console.error("Region analytics failed:", err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  const loadDistricts = useCallback(async (regionKey) => {
    setDistrictLoading(true);
    try {
      const res = await api.get(`/analytics/regions/${regionKey}/districts?period=${period}`);
      setDistricts(res.data.data || []);
      onRegionSelectRef.current?.(regionKey);
    } catch (err) {
      console.error("District analytics failed:", err);
      setDistricts([]);
    } finally {
      setDistrictLoading(false);
    }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    setSelectedRegion(null);
    setDistricts([]);
    onRegionSelectRef.current?.(null);
    loadRegions();
  }, [period, loadRegions]);

  const regionChartData = useMemo(() => ({
    labels: regions.map((r) => REGION_LABELS[r.region] || r.label),
    datasets: [
      {
        label: "Page Views",
        data: regions.map((r) => r.views),
        backgroundColor: chartColors.azure,
        borderRadius: 6,
      },
      {
        label: "Enquiries",
        data: regions.map((r) => r.enquiries),
        backgroundColor: chartColors.violet,
        borderRadius: 6,
      },
    ],
  }), [regions]);

  const districtChartData = useMemo(() => ({
    labels: districts.map((d) => d.district),
    datasets: [
      {
        label: "Page Views",
        data: districts.map((d) => d.views),
        backgroundColor: chartColors.azure,
        borderRadius: 6,
      },
      {
        label: "Enquiries",
        data: districts.map((d) => d.enquiries),
        backgroundColor: chartColors.violet,
        borderRadius: 6,
      },
    ],
  }), [districts]);

  const selectRegion = useCallback((regionKey) => {
    if (!regionKey || regionKey === "unknown") return;
    setSelectedRegion(regionKey);
    loadDistricts(regionKey);
  }, [loadDistricts]);

  const regionOptions = useMemo(() => {
    const opts = baseChartOptions();
    opts.indexAxis = "y";
    opts.plugins.legend.display = true;
    opts.interaction = { mode: "nearest", axis: "y", intersect: false };
    opts.onClick = (_evt, elements) => {
      if (!elements.length) return;
      const idx = elements[0].index;
      selectRegion(regions[idx]?.region);
    };
    opts.plugins.tooltip.callbacks = {
      afterBody: () => "Click a bar or use the buttons below",
    };
    return opts;
  }, [regions, selectRegion]);

  const districtOptions = useMemo(() => {
    const opts = baseChartOptions();
    opts.indexAxis = "y";
    opts.plugins.legend.display = true;
    opts.interaction = { mode: "nearest", axis: "y", intersect: false };
    return opts;
  }, []);

  return (
    <div className="analytics-chart-card analytics-chart-card--tall">
      <div className="chart-card-head">
        <h3>Karnataka Regions</h3>
        <span>
          Click North / South / Coastal / Malnad to drill down by district
        </span>
      </div>

      {loading ? (
        <div className="chart-placeholder">Loading regional data…</div>
      ) : (
        <>
          <div className="chart-wrap chart-wrap--region">
            <Bar ref={chartRef} data={regionChartData} options={regionOptions} />
          </div>

          <div className="region-pills" role="group" aria-label="Select a region">
            {regions
              .filter((r) => r.region !== "unknown")
              .map((r) => (
                <button
                  key={r.region}
                  type="button"
                  className={`region-pill ${selectedRegion === r.region ? "is-active" : ""}`}
                  onClick={() => selectRegion(r.region)}
                >
                  {REGION_LABELS[r.region] || r.label}
                  <span className="region-pill-meta">
                    {r.views} views · {r.enquiries} enquiries
                  </span>
                </button>
              ))}
          </div>

          {selectedRegion && (
            <div className="district-drilldown">
              <div className="district-drilldown-head">
                <strong>{REGION_LABELS[selectedRegion]}</strong>
                <button
                  type="button"
                  className="ghost-btn ghost-btn--sm"
                  onClick={() => {
                    setSelectedRegion(null);
                    setDistricts([]);
                    onRegionSelectRef.current?.(null);
                  }}
                >
                  Back to regions
                </button>
              </div>
              {districtLoading ? (
                <p className="district-empty">Loading cities…</p>
              ) : districts.length === 0 ? (
                <p className="district-empty">
                  No city-level data for this region in the selected period.
                </p>
              ) : (
                <div className="chart-wrap chart-wrap--district">
                  <Bar data={districtChartData} options={districtOptions} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RegionAnalyticsChart;
