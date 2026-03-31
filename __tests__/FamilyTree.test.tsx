import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FamilyTree from '../src/features/tree/FamilyTree';
import { Member } from '../src/domain/entities';

// Mock D3 to avoid SVG rendering issues in tests
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({
      remove: vi.fn()
    })),
    attr: vi.fn(() => ({
      style: vi.fn(() => ({
        style: vi.fn(() => ({
          append: vi.fn(() => ({
            attr: vi.fn(() => ({
              append: vi.fn(() => ({
                attr: vi.fn(() => ({
                  transition: vi.fn(() => ({
                    duration: vi.fn(() => ({
                      call: vi.fn()
                    }))
                  }))
                }))
              }))
            }))
          }))
        }))
      }))
    })),
    on: vi.fn()
  })),
  hierarchy: vi.fn(() => ({
    descendants: vi.fn(() => []),
    links: vi.fn(() => [])
  })),
  tree: vi.fn(() => vi.fn()),
  zoomIdentity: { translate: vi.fn(), scale: vi.fn() },
  zoom: vi.fn(() => ({
    on: vi.fn(),
    transform: vi.fn()
  }))
}));

describe('FamilyTree Component', () => {
  const mockMember: Member = {
    id: 'test-member-1',
    familyId: 'test-family',
    name: 'Test Member',
    gender: 'male',
    createdBy: 'test-user',
    updatedAt: new Date().toISOString()
  };

  const defaultProps = {
    members: [mockMember],
    searchTerm: '',
    onSelectMember: vi.fn(),
    onAddRelative: vi.fn(),
    onFamilySelect: vi.fn(),
    isHeaderHidden: false,
    onToggleHeader: vi.fn(),
    treePov: 'suami' as const,
    onTogglePov: vi.fn()
  };

  it('renders without crashing', () => {
    render(<FamilyTree {...defaultProps} />);
    // Component should render without throwing errors
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders POV toggle button', () => {
    render(<FamilyTree {...defaultProps} />);

    // Should have POV toggle button with correct title
    const povButton = screen.getByTitle('POV: Suami di kiri');
    expect(povButton).toBeInTheDocument();
    expect(povButton).toHaveTextContent('👨');
  });

  it('displays zoom level indicator', () => {
    render(<FamilyTree {...defaultProps} />);

    // Should display zoom level percentage
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders zoom control buttons', () => {
    render(<FamilyTree {...defaultProps} />);

    // Should have zoom in button with correct title
    expect(screen.getByTitle('Perbesar')).toBeInTheDocument();

    // Should have zoom out button with correct title
    expect(screen.getByTitle('Perkecil')).toBeInTheDocument();

    // Should have reset zoom button with correct title
    expect(screen.getByTitle('Fit ke Layar')).toBeInTheDocument();
  });

  it('displays zoom controls', () => {
    render(<FamilyTree {...defaultProps} />);

    // Should have zoom control buttons
    const buttons = document.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles empty members array', () => {
    render(<FamilyTree {...defaultProps} members={[]} />);

    // Should still render SVG even with no members
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});