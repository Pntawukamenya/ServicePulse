import { useMemo } from 'react';
import {
  RWANDA_DISTRICTS,
  getSectorsForDistrict,
  getCellsForSector,
  getVillagesForCell,
} from '../config/rwandaLocations';

export interface DistrictSectorSelectProps {
  district: string;
  sector: string;
  onDistrictChange: (district: string) => void;
  onSectorChange: (sector: string) => void;
  districtLabel?: string;
  sectorLabel?: string;
  districtRequired?: boolean;
  sectorRequired?: boolean;
  districtError?: string;
  sectorError?: string;
  disabled?: boolean;
  className?: string;
  /** When true, show Cell and Village dropdowns */
  includeCellAndVillage?: boolean;
  cell?: string;
  village?: string;
  onCellChange?: (cell: string) => void;
  onVillageChange?: (village: string) => void;
  cellLabel?: string;
  villageLabel?: string;
  cellRequired?: boolean;
  villageRequired?: boolean;
  cellError?: string;
  villageError?: string;
}

/** Format location for storage: "District, Sector" or "District, Sector, Cell" or "District, Sector, Cell, Village" */
export function formatLocation(
  district: string,
  sector: string,
  cell?: string,
  village?: string
): string {
  if (!district || !sector) return '';
  const base = `${district}, ${sector}`;
  if (cell) {
    return village ? `${base}, ${cell}, ${village}` : `${base}, ${cell}`;
  }
  return base;
}

/** Parse location string into district, sector, cell, village */
export function parseLocation(location: string | null | undefined): {
  district: string;
  sector: string;
  cell: string;
  village: string;
} {
  if (!location || !location.trim()) return { district: '', sector: '', cell: '', village: '' };
  const parts = location.split(',').map((p) => p.trim());
  return {
    district: parts[0] ?? '',
    sector: parts[1] ?? '',
    cell: parts[2] ?? '',
    village: parts[3] ?? '',
  };
}

export default function DistrictSectorSelect({
  district,
  sector,
  onDistrictChange,
  onSectorChange,
  districtRequired = false,
  sectorRequired = false,
  districtError,
  sectorError,
  disabled = false,
  className = '',
  includeCellAndVillage = false,
  cell = '',
  village = '',
  onCellChange,
  onVillageChange,
  cellRequired = false,
  villageRequired = false,
  cellError,
  villageError,
}: DistrictSectorSelectProps) {
  const sectors = useMemo(() => getSectorsForDistrict(district), [district]);
  const cells = useMemo(() => getCellsForSector(district, sector), [district, sector]);
  const villages = useMemo(
    () => getVillagesForCell(district, sector, cell),
    [district, sector, cell]
  );

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onDistrictChange(val);
    onSectorChange('');
    onCellChange?.('');
    onVillageChange?.('');
  };

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onSectorChange(val);
    onCellChange?.('');
    onVillageChange?.('');
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onCellChange?.(val);
    onVillageChange?.('');
  };

  const selectClass = 'select-location';
  const errorClass = 'mt-1 text-xs text-error-600 dark:text-error-400';

  const showSector = Boolean(district);
  const showCellRow = includeCellAndVillage && Boolean(sector);
  const showVillage = includeCellAndVillage && Boolean(cell);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* District first; Sector only after a district is chosen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <select
            id="district"
            value={district}
            onChange={handleDistrictChange}
            disabled={disabled}
            className={selectClass}
            aria-required={districtRequired}
            aria-invalid={!!districtError}
            aria-label="District"
          >
            <option value="">Select District</option>
            {RWANDA_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {districtError && <p className={errorClass}>{districtError}</p>}
        </div>
        {showSector && (
          <div>
            <select
              id="sector"
              value={sector}
              onChange={handleSectorChange}
              disabled={disabled || !district}
              className={selectClass}
              aria-required={sectorRequired}
              aria-invalid={!!sectorError}
              aria-label="Sector"
            >
              <option value="">Select Sector</option>
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {sectorError && <p className={errorClass}>{sectorError}</p>}
          </div>
        )}
      </div>

      {/* Cell after sector; Village after cell */}
      {showCellRow && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <select
              id="cell"
              value={cell}
              onChange={handleCellChange}
              disabled={disabled || !district || !sector}
              className={selectClass}
              aria-required={cellRequired}
              aria-invalid={!!cellError}
              aria-label="Cell"
            >
              <option value="">Select Cell</option>
              {cells.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            {cellError && <p className={errorClass}>{cellError}</p>}
          </div>
          {showVillage && (
            <div>
              <select
                id="village"
                value={village}
                onChange={(e) => onVillageChange?.(e.target.value)}
                disabled={disabled || !district || !sector || !cell}
                className={selectClass}
                aria-required={villageRequired}
                aria-invalid={!!villageError}
                aria-label="Village"
              >
                <option value="">Select Village</option>
                {villages.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              {villageError && <p className={errorClass}>{villageError}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
