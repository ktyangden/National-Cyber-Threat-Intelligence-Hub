/**
 * Map utilities for country code matching, GeoJSON processing, and color calculations
 */

export interface CountryCounts {
    [countryCode: string]: number;
}

/**
 * Comprehensive country name to ISO_A2 code mapping
 * Includes common variations and alternative names
 */
export const countryNameToCode: { [key: string]: string } = {
    // Common country names
    'Afghanistan': 'AF',
    'Albania': 'AL',
    'Algeria': 'DZ',
    'Andorra': 'AD',
    'Angola': 'AO',
    'Antigua and Barbuda': 'AG',
    'Argentina': 'AR',
    'Armenia': 'AM',
    'Australia': 'AU',
    'Austria': 'AT',
    'Azerbaijan': 'AZ',
    'Bahamas': 'BS',
    'Bahrain': 'BH',
    'Bangladesh': 'BD',
    'Barbados': 'BB',
    'Belarus': 'BY',
    'Belgium': 'BE',
    'Belize': 'BZ',
    'Benin': 'BJ',
    'Bhutan': 'BT',
    'Bolivia': 'BO',
    'Bosnia and Herzegovina': 'BA',
    'Botswana': 'BW',
    'Brazil': 'BR',
    'Brunei': 'BN',
    'Bulgaria': 'BG',
    'Burkina Faso': 'BF',
    'Burundi': 'BI',
    'Cambodia': 'KH',
    'Cameroon': 'CM',
    'Canada': 'CA',
    'Cape Verde': 'CV',
    'Central African Republic': 'CF',
    'Chad': 'TD',
    'Chile': 'CL',
    'China': 'CN',
    'Colombia': 'CO',
    'Comoros': 'KM',
    'Congo': 'CG',
    'Costa Rica': 'CR',
    'Croatia': 'HR',
    'Cuba': 'CU',
    'Cyprus': 'CY',
    'Czech Republic': 'CZ',
    'Denmark': 'DK',
    'Djibouti': 'DJ',
    'Dominica': 'DM',
    'Dominican Republic': 'DO',
    'Ecuador': 'EC',
    'Egypt': 'EG',
    'El Salvador': 'SV',
    'Equatorial Guinea': 'GQ',
    'Eritrea': 'ER',
    'Estonia': 'EE',
    'Eswatini': 'SZ',
    'Ethiopia': 'ET',
    'Fiji': 'FJ',
    'Finland': 'FI',
    'France': 'FR',
    'Gabon': 'GA',
    'Gambia': 'GM',
    'Georgia': 'GE',
    'Germany': 'DE',
    'Ghana': 'GH',
    'Greece': 'GR',
    'Grenada': 'GD',
    'Guatemala': 'GT',
    'Guinea': 'GN',
    'Guinea-Bissau': 'GW',
    'Guyana': 'GY',
    'Haiti': 'HT',
    'Honduras': 'HN',
    'Hungary': 'HU',
    'Iceland': 'IS',
    'India': 'IN',
    'Indonesia': 'ID',
    'Iran': 'IR',
    'Iraq': 'IQ',
    'Ireland': 'IE',
    'Israel': 'IL',
    'Italy': 'IT',
    'Jamaica': 'JM',
    'Japan': 'JP',
    'Jordan': 'JO',
    'Kazakhstan': 'KZ',
    'Kenya': 'KE',
    'Kiribati': 'KI',
    'Kuwait': 'KW',
    'Kyrgyzstan': 'KG',
    'Laos': 'LA',
    'Latvia': 'LV',
    'Lebanon': 'LB',
    'Lesotho': 'LS',
    'Liberia': 'LR',
    'Libya': 'LY',
    'Liechtenstein': 'LI',
    'Lithuania': 'LT',
    'Luxembourg': 'LU',
    'Madagascar': 'MG',
    'Malawi': 'MW',
    'Malaysia': 'MY',
    'Maldives': 'MV',
    'Mali': 'ML',
    'Malta': 'MT',
    'Marshall Islands': 'MH',
    'Mauritania': 'MR',
    'Mauritius': 'MU',
    'Mexico': 'MX',
    'Micronesia': 'FM',
    'Moldova': 'MD',
    'Monaco': 'MC',
    'Mongolia': 'MN',
    'Montenegro': 'ME',
    'Morocco': 'MA',
    'Mozambique': 'MZ',
    'Myanmar': 'MM',
    'Namibia': 'NA',
    'Nauru': 'NR',
    'Nepal': 'NP',
    'Netherlands': 'NL',
    'New Zealand': 'NZ',
    'Nicaragua': 'NI',
    'Niger': 'NE',
    'Nigeria': 'NG',
    'North Korea': 'KP',
    'North Macedonia': 'MK',
    'Norway': 'NO',
    'Oman': 'OM',
    'Pakistan': 'PK',
    'Palau': 'PW',
    'Palestine': 'PS',
    'Panama': 'PA',
    'Papua New Guinea': 'PG',
    'Paraguay': 'PY',
    'Peru': 'PE',
    'Philippines': 'PH',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Qatar': 'QA',
    'Romania': 'RO',
    'Russia': 'RU',
    'Rwanda': 'RW',
    'Saint Kitts and Nevis': 'KN',
    'Saint Lucia': 'LC',
    'Saint Vincent and the Grenadines': 'VC',
    'Samoa': 'WS',
    'San Marino': 'SM',
    'Sao Tome and Principe': 'ST',
    'Saudi Arabia': 'SA',
    'Senegal': 'SN',
    'Serbia': 'RS',
    'Seychelles': 'SC',
    'Seychelles Islands': 'SC',
    'Republic of Seychelles': 'SC',
    'Sierra Leone': 'SL',
    'Singapore': 'SG',
    'Slovakia': 'SK',
    'Slovenia': 'SI',
    'Solomon Islands': 'SB',
    'Somalia': 'SO',
    'South Africa': 'ZA',
    'South Korea': 'KR',
    'South Sudan': 'SS',
    'Spain': 'ES',
    'Sri Lanka': 'LK',
    'Sudan': 'SD',
    'Suriname': 'SR',
    'Sweden': 'SE',
    'Switzerland': 'CH',
    'Syria': 'SY',
    'Taiwan': 'TW',
    'Tajikistan': 'TJ',
    'Tanzania': 'TZ',
    'Thailand': 'TH',
    'Timor-Leste': 'TL',
    'Togo': 'TG',
    'Tonga': 'TO',
    'Trinidad and Tobago': 'TT',
    'Tunisia': 'TN',
    'Turkey': 'TR',
    'Turkmenistan': 'TM',
    'Tuvalu': 'TV',
    'Uganda': 'UG',
    'Ukraine': 'UA',
    'United Arab Emirates': 'AE',
    'United Kingdom': 'GB',
    'United States': 'US',
    'United States of America': 'US',
    'USA': 'US',
    'Uruguay': 'UY',
    'Uzbekistan': 'UZ',
    'Vanuatu': 'VU',
    'Vatican City': 'VA',
    'Venezuela': 'VE',
    'Vietnam': 'VN',
    'Yemen': 'YE',
    'Zambia': 'ZM',
    'Zimbabwe': 'ZW',

    // Alternative names and common variations
    'UK': 'GB',
    'United Kingdom of Great Britain and Northern Ireland': 'GB',
    'Great Britain': 'GB',
    'Britain': 'GB',
    'Russian Federation': 'RU',
    'Republic of Korea': 'KR',
    'Democratic People\'s Republic of Korea': 'KP',
    'Czechia': 'CZ',
    'Macedonia': 'MK',
    'Burma': 'MM',
    'Swaziland': 'SZ',
    'East Timor': 'TL',
    'Ivory Coast': 'CI',
    'Côte d\'Ivoire': 'CI',
};

/**
 * Extract country code from GeoJSON feature properties
 * Tries multiple property name variations
 */
export function extractCountryCode(feature: any): string | null {
    const props = feature.properties || {};

    // Try ISO_A2 codes first (most common)
    return (
        props.ISO_A2 ||
        props.ISO2 ||
        props.iso_a2 ||
        props.ADM0_A2 ||
        props.ISO ||
        // Then try ISO_A3
        props.ISO_A3 ||
        props.ISO3 ||
        props.iso_a3 ||
        // Then try country names
        props.NAME ||
        props.NAME_EN ||
        props.name ||
        props.NAME_LONG ||
        props.ADMIN ||
        null
    );
}

/**
 * Match country code from GeoJSON feature with backend country counts
 * Handles case-insensitive matching and name-to-code conversion
 */
export function matchCountryCount(
    countryCode: string | null,
    countryCounts: CountryCounts
): number {
    if (!countryCode) return 0;

    // Direct match
    let count = countryCounts[countryCode] || 0;
    if (count > 0) return count;

    // Case-insensitive match
    const upperCode = countryCode.toUpperCase();
    count = countryCounts[upperCode] || 0;
    if (count > 0) return count;

    // Try matching against all keys (case-insensitive)
    const matchedKey = Object.keys(countryCounts).find(
        key => key.toUpperCase() === countryCode.toUpperCase()
    );
    if (matchedKey) {
        return countryCounts[matchedKey];
    }

    // If it looks like a country name (longer than 2 chars), try name-to-code mapping
    if (countryCode.length > 2) {
        // Try exact match first
        let mappedCode = countryNameToCode[countryCode] ||
            countryNameToCode[countryCode.toUpperCase()] ||
            countryNameToCode[countryCode.charAt(0).toUpperCase() + countryCode.slice(1).toLowerCase()];

        // If no exact match, try partial matching (for variations like "Seychelles" vs "Seychelles Islands")
        if (!mappedCode) {
            const normalizedName = countryCode.toLowerCase().trim();
            const foundKey = Object.keys(countryNameToCode).find(key =>
                key.toLowerCase() === normalizedName ||
                key.toLowerCase().includes(normalizedName) ||
                normalizedName.includes(key.toLowerCase())
            );
            if (foundKey) {
                mappedCode = countryNameToCode[foundKey];
            }
        }

        if (mappedCode) {
            return countryCounts[mappedCode] || 0;
        }
    }

    return 0;
}

/**
 * Calculate color intensity based on attack count
 * Returns RGB color string for heatmap visualization
 */
export function getColorIntensity(count: number, maxCount: number): string {
    if (count === 0) return '#e5e7eb'; // gray for no data

    const intensity = Math.min(count / maxCount, 1);

    // Red gradient: light red (low) to dark red (high)
    const red = Math.floor(255 - (intensity * 100));
    const green = Math.floor(200 - (intensity * 150));
    const blue = Math.floor(200 - (intensity * 150));

    return `rgb(${red}, ${green}, ${blue})`;
}

/**
 * Process GeoJSON and add country counts for heatmap visualization
 */
export function processGeoJsonWithCounts(
    countriesGeoJson: any,
    countryCounts: CountryCounts
): { geoJson: any; matchedCount: number; unmatched: string[] } {
    if (!countriesGeoJson || !countryCounts) {
        return { geoJson: null, matchedCount: 0, unmatched: [] };
    }

    const maxCount = Math.max(...Object.values(countryCounts), 1);
    let matchedCount = 0;
    const unmatched: string[] = [];

    const processedGeoJson = {
        ...countriesGeoJson,
        features: countriesGeoJson.features.map((feature: any) => {
            const countryCode = extractCountryCode(feature);
            const count = matchCountryCount(countryCode, countryCounts);

            if (count > 0) {
                matchedCount++;
            } else if (countryCode && Object.keys(countryCounts).length > 0) {
                // Track unmatched countries for debugging
                unmatched.push(countryCode);
            }

            return {
                ...feature,
                properties: {
                    ...feature.properties,
                    count,
                    color: getColorIntensity(count, maxCount),
                    matchedCode: countryCode,
                }
            };
        })
    };


    return { geoJson: processedGeoJson, matchedCount, unmatched };
}

/**
 * Load world countries GeoJSON from CDN
 */
export async function loadCountriesGeoJson(): Promise<any> {
    try {
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');

        if (!response.ok) {
            throw new Error('Failed to load countries GeoJSON');
        }

        const data = await response.json();

        return data;
    } catch (err) {
        console.error('Error loading countries GeoJSON:', err);
        throw err;
    }
}

