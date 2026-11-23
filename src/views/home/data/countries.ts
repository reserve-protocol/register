export type CountryService = 'custodial' | 'selfCustody'

type Country = { code: string; name: string }

// `name` is the tag in geography.json; `code` gives the localized display name.
// Full service is BFF United's approved list plus BFF Classic (Venezuela); only the US is confirmed for self-custody.
export const COUNTRIES: Record<CountryService, Country[]> = {
  custodial: [
    { code: 'AR', name: 'Argentina' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'HN', name: 'Honduras' },
    { code: 'MX', name: 'Mexico' },
    { code: 'PA', name: 'Panama' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Peru' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BN', name: 'Brunei' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'GE', name: 'Georgia' },
    { code: 'IN', name: 'India' },
    { code: 'JO', name: 'Jordan' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'MV', name: 'Maldives' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'OM', name: 'Oman' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PH', name: 'Philippines' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'TH', name: 'Thailand' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'AO', name: 'Angola' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'CI', name: 'Ivory Coast' },
    { code: 'KE', name: 'Kenya' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'MW', name: 'Malawi' },
    { code: 'ML', name: 'Mali' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'SN', name: 'Senegal' },
    { code: 'SZ', name: 'Eswatini' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'TG', name: 'Togo' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'UG', name: 'Uganda' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'VE', name: 'Venezuela' },
  ],
  selfCustody: [{ code: 'US', name: 'United States' }],
}

export const COUNTRY_COUNT =
  COUNTRIES.custodial.length + COUNTRIES.selfCustody.length

export const COUNTRY_SERVICE: Record<string, CountryService | undefined> =
  Object.fromEntries(
    (Object.keys(COUNTRIES) as CountryService[]).flatMap((service) =>
      COUNTRIES[service].map(({ name }) => [name, service])
    )
  )

export const COUNTRY_COLORS: Record<CountryService, string> = {
  custodial: 'hsl(var(--primary))',
  selfCustody: 'hsl(var(--success))',
}
