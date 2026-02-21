type NominatimAddress = {
  city?: string
  town?: string
  village?: string
  hamlet?: string
  suburb?: string
  county?: string
  state?: string
  region?: string
  country?: string
}

type NominatimReverseResult = {
  display_name?: string
  address?: NominatimAddress
}

const STREET_TOKEN_REGEX =
  /\b(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|way|court|ct|place|pl|highway|hwy)\b/i
const POSTAL_CODE_REGEX = /^\d{4,}(?:-\d+)?$/
const COUNTY_REGEX = /\bcounty\b/i

function splitDisplayNameParts(displayName: string): string[] {
  return displayName
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function isStreetyPart(part: string): boolean {
  return STREET_TOKEN_REGEX.test(part)
}

function isPostalCodePart(part: string): boolean {
  return POSTAL_CODE_REGEX.test(part.replace(/\s+/g, ''))
}

function pickFriendlyFromDisplayName(displayName: string): string {
  const parts = splitDisplayNameParts(displayName)
  if (parts.length <= 2) return displayName.trim()

  const filtered = parts.filter(
    (part) => !isPostalCodePart(part) && !isStreetyPart(part) && !COUNTY_REGEX.test(part),
  )

  if (filtered.length >= 2) {
    return `${filtered[0]}, ${filtered[1]}`
  }
  if (filtered.length === 1) return filtered[0]

  return parts.slice(0, 2).join(', ')
}

export function humanizeLocation(rawLocation: string | null | undefined): string {
  if (!rawLocation) return ''
  const trimmed = rawLocation.trim()
  if (!trimmed) return ''
  return pickFriendlyFromDisplayName(trimmed)
}

export function formatNominatimLocation(result: NominatimReverseResult, fallback: string): string {
  const locality =
    result.address?.city ??
    result.address?.town ??
    result.address?.village ??
    result.address?.hamlet ??
    result.address?.suburb ??
    result.address?.county
  const region = result.address?.state ?? result.address?.region
  const country = result.address?.country

  if (locality && region) return `${locality}, ${region}`
  if (locality && country) return `${locality}, ${country}`
  if (locality) return locality
  if (region && country) return `${region}, ${country}`
  if (region) return region
  if (result.display_name) return pickFriendlyFromDisplayName(result.display_name)
  return fallback
}
