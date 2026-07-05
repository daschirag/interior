/**
 * Karnataka location lookup — single source of truth.
 * Region is resolved only via exact district or city/taluk matches. No fuzzy guessing.
 */

// District -> Region (all 31 Karnataka districts)
const DISTRICT_TO_REGION = {
  // North Karnataka (Kittur + Kalyana revenue divisions)
  Belagavi: "North Karnataka",
  Bagalkot: "North Karnataka",
  Vijayapura: "North Karnataka",
  Dharwad: "North Karnataka",
  Gadag: "North Karnataka",
  Haveri: "North Karnataka",
  Kalaburagi: "North Karnataka",
  Bidar: "North Karnataka",
  Raichur: "North Karnataka",
  Koppal: "North Karnataka",
  Yadgir: "North Karnataka",
  Ballari: "North Karnataka",
  Vijayanagara: "North Karnataka",

  // South Karnataka (Bengaluru + Mysuru revenue divisions, excluding coastal/malnad)
  "Bengaluru Urban": "South Karnataka",
  "Bengaluru Rural": "South Karnataka",
  Ramanagara: "South Karnataka",
  Chikkaballapur: "South Karnataka",
  Kolar: "South Karnataka",
  Tumakuru: "South Karnataka",
  Chitradurga: "South Karnataka",
  Davanagere: "South Karnataka",
  Mysuru: "South Karnataka",
  Mandya: "South Karnataka",
  Hassan: "South Karnataka",
  Chamarajanagar: "South Karnataka",

  // Coastal Karnataka (Karavali)
  "Dakshina Kannada": "Coastal Karnataka",
  Udupi: "Coastal Karnataka",
  "Uttara Kannada": "Coastal Karnataka",

  // Malnad Karnataka (Western Ghats)
  Kodagu: "Malnad Karnataka",
  Chikkamagaluru: "Malnad Karnataka",
  Shivamogga: "Malnad Karnataka",
};

// City / taluk -> district
const CITY_TO_DISTRICT = {
  // —— Belagavi ——
  Belagavi: "Belagavi",
  Belgaum: "Belagavi",
  Athani: "Belagavi",
  Bailhongal: "Belagavi",
  Chikkodi: "Belagavi",
  Gokak: "Belagavi",
  Nippani: "Belagavi",
  Ramdurg: "Belagavi",
  Hukkeri: "Belagavi",

  // —— Bagalkot ——
  Bagalkot: "Bagalkot",
  Bagalkote: "Bagalkot",
  Badami: "Bagalkot",
  Jamkhandi: "Bagalkot",
  Mudhol: "Bagalkot",
  Ilkal: "Bagalkot",
  Bilagi: "Bagalkot",
  Hunagunda: "Bagalkot",

  // —— Vijayapura ——
  Vijayapura: "Vijayapura",
  Bijapur: "Vijayapura",
  Indi: "Vijayapura",
  Sindgi: "Vijayapura",
  "Basavana Bagevadi": "Vijayapura",
  Muddebihal: "Vijayapura",
  Talikote: "Vijayapura",

  // —— Dharwad ——
  Dharwad: "Dharwad",
  Hubli: "Dharwad",
  Hubballi: "Dharwad",
  Navalgund: "Dharwad",
  Kundgol: "Dharwad",
  Kalghatgi: "Dharwad",

  // —— Gadag ——
  Gadag: "Gadag",
  "Gadag-Betageri": "Gadag",
  Nargund: "Gadag",
  Ron: "Gadag",
  Shirhatti: "Gadag",
  Mundargi: "Gadag",
  Gajendragad: "Gadag",

  // —— Haveri ——
  Haveri: "Haveri",
  Ranebennur: "Haveri",
  Shiggaon: "Haveri",
  Byadgi: "Haveri",
  Hangal: "Haveri",
  Hirekerur: "Haveri",

  // —— Kalaburagi ——
  Kalaburagi: "Kalaburagi",
  Gulbarga: "Kalaburagi",
  Gulburga: "Kalaburagi",
  Kalaburgi: "Kalaburagi",
  Afzalpur: "Kalaburagi",
  Aland: "Kalaburagi",
  Sedam: "Kalaburagi",
  Chittapur: "Kalaburagi",
  Chincholi: "Kalaburagi",
  Jevargi: "Kalaburagi",

  // —— Bidar ——
  Bidar: "Bidar",
  Basavakalyan: "Bidar",
  Bhalki: "Bidar",
  Humnabad: "Bidar",
  Aurad: "Bidar",
  Chitgoppa: "Bidar",

  // —— Raichur ——
  Raichur: "Raichur",
  Sindhanur: "Raichur",
  Manvi: "Raichur",
  Lingsugur: "Raichur",
  Devadurga: "Raichur",
  Maski: "Raichur",

  // —— Koppal ——
  Koppal: "Koppal",
  Gangawati: "Koppal",
  Kushtagi: "Koppal",
  Yelbarga: "Koppal",
  Kanakagiri: "Koppal",
  Karatagi: "Koppal",

  // —— Yadgir ——
  Yadgir: "Yadgir",
  Shahpur: "Yadgir",
  Shorapur: "Yadgir",

  // —— Ballari ——
  Ballari: "Ballari",
  Bellary: "Ballari",
  Hospet: "Ballari",
  Hosapete: "Ballari",
  Sanduru: "Ballari",
  Siruguppa: "Ballari",
  Kampli: "Ballari",
  Kurugodu: "Ballari",

  // —— Vijayanagara ——
  Vijayanagara: "Vijayanagara",
  Hampi: "Vijayanagara",
  Hagaribommanahalli: "Vijayanagara",
  Harapanahalli: "Vijayanagara",
  Hadagali: "Vijayanagara",
  Kottur: "Vijayanagara",

  // —— Bengaluru Urban ——
  "Bengaluru Urban": "Bengaluru Urban",
  Bengaluru: "Bengaluru Urban",
  Bangalore: "Bengaluru Urban",
  Anekal: "Bengaluru Urban",
  Yelahanka: "Bengaluru Urban",
  Kengeri: "Bengaluru Urban",
  Krishnarajapura: "Bengaluru Urban",

  // —— Bengaluru Rural ——
  "Bengaluru Rural": "Bengaluru Rural",
  Doddaballapura: "Bengaluru Rural",
  Devanahalli: "Bengaluru Rural",
  Hosakote: "Bengaluru Rural",
  Nelamangala: "Bengaluru Rural",

  // —— Ramanagara ——
  Ramanagara: "Ramanagara",
  Ramnagar: "Ramanagara",
  Channapatna: "Ramanagara",
  Kanakapura: "Ramanagara",
  Magadi: "Ramanagara",

  // —— Chikkaballapur ——
  Chikkaballapur: "Chikkaballapur",
  Bagepalli: "Chikkaballapur",
  Chintamani: "Chikkaballapur",
  Gauribidanur: "Chikkaballapur",
  Sidlaghatta: "Chikkaballapur",

  // —— Kolar ——
  Kolar: "Kolar",
  Bangarapet: "Kolar",
  Malur: "Kolar",
  Mulbagal: "Kolar",
  Srinivaspur: "Kolar",
  KGF: "Kolar",

  // —— Tumakuru ——
  Tumakuru: "Tumakuru",
  Tumkur: "Tumakuru",
  Sira: "Tumakuru",
  Tiptur: "Tumakuru",
  Madhugiri: "Tumakuru",
  Gubbi: "Tumakuru",
  Koratagere: "Tumakuru",
  Pavagada: "Tumakuru",

  // —— Chitradurga ——
  Chitradurga: "Chitradurga",
  Challakere: "Chitradurga",
  Hiriyur: "Chitradurga",
  Hosadurga: "Chitradurga",
  Holalkere: "Chitradurga",

  // —— Davanagere ——
  Davanagere: "Davanagere",
  Davangere: "Davanagere",
  Harihar: "Davanagere",
  Channagiri: "Davanagere",
  Honnali: "Davanagere",
  Jagalur: "Davanagere",

  // —— Mysuru ——
  Mysuru: "Mysuru",
  Mysore: "Mysuru",
  Nanjangud: "Mysuru",
  Hunsur: "Mysuru",
  "T. Narasipura": "Mysuru",
  Periyapatna: "Mysuru",

  // —— Mandya ——
  Mandya: "Mandya",
  Maddur: "Mandya",
  Malavalli: "Mandya",
  Srirangapatna: "Mandya",
  Krishnarajpet: "Mandya",

  // —— Hassan ——
  Hassan: "Hassan",
  Arsikere: "Hassan",
  Channarayapatna: "Hassan",
  Holenarasipura: "Hassan",
  Belur: "Hassan",
  Sakleshpur: "Hassan",

  // —— Chamarajanagar ——
  Chamarajanagar: "Chamarajanagar",
  Gundlupet: "Chamarajanagar",
  Kollegal: "Chamarajanagar",
  Hanur: "Chamarajanagar",
  Yelandur: "Chamarajanagar",

  // —— Dakshina Kannada ——
  "Dakshina Kannada": "Dakshina Kannada",
  Mangaluru: "Dakshina Kannada",
  Mangalore: "Dakshina Kannada",
  Bantwal: "Dakshina Kannada",
  Puttur: "Dakshina Kannada",
  Belthangady: "Dakshina Kannada",
  Sulya: "Dakshina Kannada",
  Moodbidri: "Dakshina Kannada",

  // —— Udupi ——
  Udupi: "Udupi",
  Manipal: "Udupi",
  Kundapura: "Udupi",
  Karkala: "Udupi",
  Brahmavara: "Udupi",
  Byndoor: "Udupi",
  Kaup: "Udupi",

  // —— Uttara Kannada ——
  "Uttara Kannada": "Uttara Kannada",
  Karwar: "Uttara Kannada",
  Sirsi: "Uttara Kannada",
  Kumta: "Uttara Kannada",
  Bhatkal: "Uttara Kannada",
  Dandeli: "Uttara Kannada",
  Ankola: "Uttara Kannada",
  Honnavar: "Uttara Kannada",

  // —— Kodagu ——
  Kodagu: "Kodagu",
  Coorg: "Kodagu",
  Madikeri: "Kodagu",
  Virajpet: "Kodagu",
  Somvarpet: "Kodagu",
  Kushalanagar: "Kodagu",
  Ponnampet: "Kodagu",

  // —— Chikkamagaluru ——
  Chikkamagaluru: "Chikkamagaluru",
  Chikmagalur: "Chikkamagaluru",
  Kadur: "Chikkamagaluru",
  Koppa: "Chikkamagaluru",
  Mudigere: "Chikkamagaluru",
  Tarikere: "Chikkamagaluru",
  Sringeri: "Chikkamagaluru",

  // —— Shivamogga ——
  Shivamogga: "Shivamogga",
  Shimoga: "Shivamogga",
  Bhadravathi: "Shivamogga",
  Bhadravati: "Shivamogga",
  Sagara: "Shivamogga",
  Shikaripura: "Shivamogga",
  Soraba: "Shivamogga",
  Tirthahalli: "Shivamogga",
};

/** URL slug <-> stored region label (analytics charts) */
const REGION_SLUG_TO_LABEL = {
  north: "North Karnataka",
  south: "South Karnataka",
  coastal: "Coastal Karnataka",
  malnad: "Malnad Karnataka",
};

const REGION_LABEL_TO_SLUG = Object.fromEntries(
  Object.entries(REGION_SLUG_TO_LABEL).map(([slug, label]) => [label, slug]),
);

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function resolveRegion(cityName) {
  if (!cityName || !String(cityName).trim()) {
    return { city: null, district: null, region: "Unknown" };
  }

  const key = normalizeKey(cityName);

  for (const [district, region] of Object.entries(DISTRICT_TO_REGION)) {
    if (normalizeKey(district) === key) {
      return { city: district, district, region };
    }
  }

  for (const [city, district] of Object.entries(CITY_TO_DISTRICT)) {
    if (normalizeKey(city) === key) {
      const region = DISTRICT_TO_REGION[district];
      if (region) {
        return { city, district, region };
      }
    }
  }

  return { city: null, district: null, region: "Unknown" };
}

function resolveCityInput(cityName) {
  const exact = resolveRegion(cityName);
  if (exact.region !== "Unknown") {
    return exact;
  }

  const key = normalizeKey(cityName);
  if (key.length < 2) {
    return exact;
  }

  const matches = LOCATION_CATALOG.filter((entry) => {
    const cityKey = normalizeKey(entry.city);
    const districtKey = normalizeKey(entry.district);
    return cityKey.startsWith(key) || districtKey.startsWith(key);
  });

  if (matches.length === 1) {
    const match = matches[0];
    return {
      city: match.city,
      district: match.district,
      region: match.region,
    };
  }

  return exact;
}

function isKnownCity(cityName) {
  return resolveCityInput(cityName).region !== "Unknown";
}

function buildLocationCatalog() {
  const seen = new Set();
  const catalog = [];

  function add(city, district, region) {
    const dedupeKey = normalizeKey(city);
    if (!dedupeKey || seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    catalog.push({
      city,
      district,
      region,
      regionLabel: region,
      regionSlug: REGION_LABEL_TO_SLUG[region] || "unknown",
    });
  }

  for (const [district, region] of Object.entries(DISTRICT_TO_REGION)) {
    add(district, district, region);
  }

  for (const [city, district] of Object.entries(CITY_TO_DISTRICT)) {
    const region = DISTRICT_TO_REGION[district];
    if (region) add(city, district, region);
  }

  return catalog.sort((a, b) => a.city.localeCompare(b.city));
}

const LOCATION_CATALOG = buildLocationCatalog();

function getLocationCatalog() {
  const regions = Object.values(REGION_SLUG_TO_LABEL).map((label) => ({
    key: REGION_LABEL_TO_SLUG[label],
    label,
    cities: LOCATION_CATALOG.filter((entry) => entry.region === label),
  }));

  return { regions, all: LOCATION_CATALOG };
}

function searchLocations(query, regionSlug) {
  let list = LOCATION_CATALOG;

  if (regionSlug && regionSlug !== "all") {
    const label = REGION_SLUG_TO_LABEL[regionSlug];
    if (label) list = list.filter((entry) => entry.region === label);
  }

  const key = normalizeKey(query);
  if (!key) return list;

  return list.filter((entry) => {
    const cityKey = normalizeKey(entry.city);
    const districtKey = normalizeKey(entry.district);
    return cityKey.startsWith(key) || districtKey.startsWith(key);
  });
}

function getRegionKeys() {
  return Object.keys(REGION_SLUG_TO_LABEL);
}

function getRegionLabel(regionSlug) {
  return REGION_SLUG_TO_LABEL[regionSlug] || regionSlug;
}

function slugFromRegionLabel(regionLabel) {
  return REGION_LABEL_TO_SLUG[regionLabel] || "unknown";
}

function getDistrictsForRegion(regionSlug) {
  const label = REGION_SLUG_TO_LABEL[regionSlug];
  if (!label) return [];
  return Object.entries(DISTRICT_TO_REGION)
    .filter(([, region]) => region === label)
    .map(([district]) => district)
    .sort();
}

module.exports = {
  DISTRICT_TO_REGION,
  CITY_TO_DISTRICT,
  REGION_SLUG_TO_LABEL,
  REGION_LABEL_TO_SLUG,
  LOCATION_CATALOG,
  resolveRegion,
  resolveCityInput,
  isKnownCity,
  getLocationCatalog,
  searchLocations,
  getRegionKeys,
  getRegionLabel,
  slugFromRegionLabel,
  getDistrictsForRegion,
};
