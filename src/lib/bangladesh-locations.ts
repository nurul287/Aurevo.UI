import districtsJson from "@/assets/data/districts.json";
import upazilasJson from "@/assets/data/upzilas.json";

export interface BangladeshDistrict {
  id: string;
  division_id: string;
  name: string;
  bn_name: string;
}

export interface BangladeshUpazila {
  id: string;
  district_id: string;
  name: string;
  bn_name: string;
}

const rawDistricts = (districtsJson as { data: BangladeshDistrict[] }).data;

/** Districts sorted by English name for dropdowns */
export const BANGLADESH_DISTRICTS: BangladeshDistrict[] = [...rawDistricts].sort(
  (a, b) => a.name.localeCompare(b.name),
);

const rawUpazilas = upazilasJson as BangladeshUpazila[];

/** Upazilas (upazila rows) keyed by `district_id` matching `BangladeshDistrict.id` */
export const BANGLADESH_UPAZILAS: BangladeshUpazila[] = rawUpazilas;

/** Upazila names for a district, sorted (match on district display `name`) */
export function upazilasForDistrictName(districtName: string): string[] {
  const district = BANGLADESH_DISTRICTS.find((d) => d.name === districtName);
  if (!district) return [];
  return BANGLADESH_UPAZILAS.filter((u) => u.district_id === district.id)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((u) => u.name);
}
