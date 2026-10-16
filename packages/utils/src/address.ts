import type { Address, MatchLocation } from '@fulbito/types'

export function addressToMatchLocation(address: Address): MatchLocation {
  return {
    name: address.name,
    street: address.street,
    addressId: address.id,
  }
}

export function matchLocationMapsUrl(location: MatchLocation): string {
  const query = `${location.name} ${location.street}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
