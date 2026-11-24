/**
 * Polls and votes.
 *
 * - `polls`: anyone can read; signed-in members create; only the creator
 *   can edit (close) or delete their poll.
 * - `votes`: one row per (poll, voter). `voterId` is stamped server-side
 *   (`userBound`), so a client can't vote as someone else, and `uniqueOn`
 *   makes double-voting impossible at the database level. Changing your
 *   vote is an update to your own row.
 */

import type { CollectionSchema } from 'deepspace/schema'

export interface Poll {
  title: string
  /** JSON array of 2–4 option labels. */
  options: string
  ownerId: string
  /** 1 = closed to new votes, 0 = open. */
  closed: number
}

export interface Vote {
  pollId: string
  voterId: string
  optionIndex: number
}

export const pollsSchema: CollectionSchema = {
  name: 'polls',
  ownerField: 'ownerId',
  columns: [
    { name: 'title', storage: 'text', interpretation: 'plain', required: true, maxLength: 120 },
    { name: 'options', storage: 'text', interpretation: 'plain', required: true, maxLength: 2000 },
    { name: 'ownerId', storage: 'text', interpretation: 'plain', userBound: true, immutable: true },
    { name: 'closed', storage: 'number', interpretation: { kind: 'boolean' }, default: 0 },
  ],
  permissions: {
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: true, update: 'own', delete: 'own', writableFields: ['title', 'options', 'closed'] },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

export const votesSchema: CollectionSchema = {
  name: 'votes',
  ownerField: 'voterId',
  uniqueOn: ['pollId', 'voterId'],
  columns: [
    { name: 'pollId', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'voterId', storage: 'text', interpretation: 'plain', userBound: true, immutable: true },
    { name: 'optionIndex', storage: 'number', interpretation: 'plain', required: true },
  ],
  permissions: {
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: true, update: 'own', delete: 'own', writableFields: ['pollId', 'optionIndex'] },
    admin: { read: true, create: true, update: true, delete: true },
  },
}
