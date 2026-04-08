/**
 * Domain Services Index
 * Pure business logic services
 */

export * from './RelationshipCalculator';
export { default as relationshipCalculator } from './RelationshipCalculator';
export * from './MarriagePolicy';
export { MarriagePolicy, MarriageErrorCode, getMarriageErrorMessage } from './MarriagePolicy';