// Country eligibility supplied by Luis Maya from the BSA/AML Policy and service structures.
// Full service: BFF United's approved list plus BFF Classic (Venezuela).
// PORTFOLIO: only the US is confirmed here; BFF Prime custodial availability is pending.
export const V26_COUNTRY_GROUPS = {
  custodial: [
    'Argentina', 'Bolivia', 'Chile', 'Colombia', 'Costa Rica',
    'Dominican Republic', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras',
    'Mexico', 'Panama', 'Paraguay', 'Peru', 'Uruguay',
    'Armenia', 'Azerbaijan', 'Brunei', 'Fiji', 'Georgia', 'India', 'Jordan',
    'Kuwait', 'Kyrgyzstan', 'Maldives', 'New Zealand', 'Oman', 'Pakistan',
    'Philippines', 'Saudi Arabia', 'Solomon Islands', 'Sri Lanka', 'Thailand', 'Vietnam',
    'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Cameroon',
    'Central African Republic', 'Ghana', 'Guinea-Bissau', 'Ivory Coast',
    'Kenya', 'Lesotho', 'Malawi', 'Mali', 'Mozambique', 'Nigeria', 'Rwanda',
    'Senegal', 'Eswatini', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia',
    'Venezuela',
  ],
  selfCustody: ['United States'],
} as const

export const V26_COUNTRY_COUNT =
  V26_COUNTRY_GROUPS.custodial.length + V26_COUNTRY_GROUPS.selfCustody.length

export const V26_COUNTRY_COLORS = {
  custodial: 'hsl(var(--tvl))',
  selfCustody: 'hsl(160 35% 52%)',
} as const
