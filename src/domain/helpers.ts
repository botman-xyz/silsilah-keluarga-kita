/**
 * Domain Helper Functions
 * Pure business logic with no external dependencies
 */

/**
 * Validates if a relationship type is valid
 */
export const isValidRelationship = (relationship: string): boolean => {
  const validRelationships = [
    'parent', 'child', 'spouse', 'sibling',
    'grandparent', 'grandchild', 'uncle', 'aunt',
    'nephew', 'niece', 'cousin'
  ];
  return validRelationships.includes(relationship.toLowerCase());
};

/**
 * Gets the inverse relationship type
 */
export const getInverseRelationship = (relationship: string): string => {
  const inverses: Record<string, string> = {
    parent: 'child',
    child: 'parent',
    spouse: 'spouse',
    sibling: 'sibling',
    grandparent: 'grandchild',
    grandchild: 'grandparent',
    uncle: 'nephew',
    aunt: 'niece',
    nephew: 'uncle',
    niece: 'aunt',
    cousin: 'cousin'
  };
  return inverses[relationship.toLowerCase()] || relationship;
};

export default { isValidRelationship, getInverseRelationship };