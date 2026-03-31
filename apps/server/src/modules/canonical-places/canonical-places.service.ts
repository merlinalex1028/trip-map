import { Injectable } from '@nestjs/common'
import type {
  CanonicalPlaceCandidate,
  CanonicalResolveFailedReason,
  CanonicalResolveResponse,
  ConfirmCanonicalPlaceRequest,
  ResolvedCanonicalPlace,
  ResolveCanonicalPlaceRequest,
} from '@trip-map/contracts'

import {
  CANONICAL_RESOLVE_FIXTURES,
  MAX_CANONICAL_CANDIDATES,
  type CanonicalPlaceId,
  type CanonicalResolveFixture,
  canonicalPlaceCatalog,
} from './fixtures/canonical-place-fixtures.js'

@Injectable()
export class CanonicalPlacesService {
  resolve(input: ResolveCanonicalPlaceRequest): CanonicalResolveResponse {
    const fixture = this.findFixture(input)

    if (!fixture) {
      return this.createFailedResponse(
        input,
        'OUTSIDE_SUPPORTED_DATA',
        '当前点击位置不在 Phase 12 临时 authoritative catalog 覆盖范围内。',
      )
    }

    return this.buildResponse(input, fixture)
  }

  confirm(input: ConfirmCanonicalPlaceRequest): CanonicalResolveResponse {
    const fixture = this.findFixture(input)

    if (!fixture) {
      return this.createFailedResponse(
        input,
        'OUTSIDE_SUPPORTED_DATA',
        '当前点击位置不在 Phase 12 临时 authoritative catalog 覆盖范围内。',
      )
    }

    if (fixture.kind === 'ambiguous') {
      const candidateIds = fixture.candidatePlaceIds.slice(0, MAX_CANONICAL_CANDIDATES)
      const candidatePlaceId = input.candidatePlaceId as CanonicalPlaceId

      if (!candidateIds.includes(candidatePlaceId)) {
        return this.createCandidateMismatchResponse(input)
      }

      return {
        status: 'resolved',
        click: {
          lat: input.lat,
          lng: input.lng,
        },
        place: this.getPlace(candidatePlaceId),
      }
    }

    if (fixture.kind === 'resolved' && fixture.placeId === input.candidatePlaceId) {
      return this.buildResponse(input, fixture)
    }

    return this.createCandidateMismatchResponse(input)
  }

  private buildResponse(
    input: ResolveCanonicalPlaceRequest,
    fixture: CanonicalResolveFixture,
  ): CanonicalResolveResponse {
    if (fixture.kind === 'resolved') {
      return {
        status: 'resolved',
        click: {
          lat: input.lat,
          lng: input.lng,
        },
        place: this.getPlace(fixture.placeId),
      }
    }

    if (fixture.kind === 'ambiguous') {
      const candidates = fixture.candidatePlaceIds
        .slice(0, MAX_CANONICAL_CANDIDATES)
        .map(candidatePlaceId => this.getCandidate(candidatePlaceId, fixture.candidateHints[candidatePlaceId]))

      return {
        status: 'ambiguous',
        click: {
          lat: input.lat,
          lng: input.lng,
        },
        prompt: fixture.prompt,
        recommendedPlaceId: fixture.recommendedPlaceId,
        candidates,
      }
    }

    return this.createFailedResponse(input, fixture.reason, fixture.message)
  }

  private createCandidateMismatchResponse(
    input: ResolveCanonicalPlaceRequest,
  ): CanonicalResolveResponse {
    return this.createFailedResponse(
      input,
      'CANDIDATE_MISMATCH',
      'candidatePlaceId 不属于该点击位置的 authoritative 候选集，无法确认。',
    )
  }

  private createFailedResponse(
    input: ResolveCanonicalPlaceRequest,
    reason: CanonicalResolveFailedReason,
    message: string,
  ): CanonicalResolveResponse {
    return {
      status: 'failed',
      click: {
        lat: input.lat,
        lng: input.lng,
      },
      reason,
      message,
    }
  }

  private findFixture(input: ResolveCanonicalPlaceRequest): CanonicalResolveFixture | undefined {
    return CANONICAL_RESOLVE_FIXTURES.find(fixture => (
      Math.abs(fixture.click.lat - input.lat) < 0.0001
      && Math.abs(fixture.click.lng - input.lng) < 0.0001
    ))
  }

  private getPlace(placeId: string): ResolvedCanonicalPlace {
    return canonicalPlaceCatalog[placeId as CanonicalPlaceId]
  }

  private getCandidate(
    candidatePlaceId: CanonicalPlaceId,
    candidateHint: string,
  ): CanonicalPlaceCandidate {
    return {
      ...this.getPlace(candidatePlaceId),
      candidateHint,
    }
  }
}
