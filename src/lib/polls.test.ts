import { describe, expect, it } from 'vitest'
import { parseOptions, tally, validatePoll } from './polls'

describe('validatePoll', () => {
  it('accepts a normal poll', () => {
    expect(validatePoll('Which tee?', ['Black', 'White'])).toBeNull()
  })
  it('rejects empty question', () => {
    expect(validatePoll('   ', ['a', 'b'])).toMatch(/question/)
  })
  it('ignores blank options when counting', () => {
    expect(validatePoll('Q', ['a', '  '])).toMatch(/at least 2/)
  })
  it('rejects too many options', () => {
    expect(validatePoll('Q', ['a', 'b', 'c', 'd', 'e'])).toMatch(/at most 4/)
  })
  it('rejects duplicate options (case-insensitive)', () => {
    expect(validatePoll('Q', ['Red', 'red'])).toMatch(/different/)
  })
  it('rejects over-long question', () => {
    expect(validatePoll('x'.repeat(121), ['a', 'b'])).toMatch(/120/)
  })
})

describe('parseOptions', () => {
  it('parses a JSON array', () => {
    expect(parseOptions('["a","b"]')).toEqual(['a', 'b'])
  })
  it('returns [] for bad data', () => {
    expect(parseOptions('not json')).toEqual([])
    expect(parseOptions('{"a":1}')).toEqual([])
    expect(parseOptions(undefined)).toEqual([])
  })
})

describe('tally', () => {
  it('counts votes per option and ignores out-of-range indexes', () => {
    expect(tally(3, [{ optionIndex: 0 }, { optionIndex: 2 }, { optionIndex: 2 }, { optionIndex: 9 }, { optionIndex: -1 }]))
      .toEqual([1, 0, 2])
  })
})
