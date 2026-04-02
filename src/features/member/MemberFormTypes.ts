import { Member, Family } from '../../types';

export interface MemberFormProps {
  initialData: Partial<Member>;
  members: Member[];
  allMembers: Member[];
  families: Family[];
  onSave: (data: Partial<Member>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export type FormSection = 'basic' | 'dates' | 'family' | 'media' | 'bio';

export interface SectionConfig {
  id: FormSection;
  label: string;
  icon: React.ReactNode;
}

export const SECTIONS: SectionConfig[] = [
  { id: 'basic', label: 'Informasi Dasar', icon: 'User' },
  { id: 'dates', label: 'Tanggal Penting', icon: 'Calendar' },
  { id: 'family', label: 'Hubungan Keluarga', icon: 'Heart' },
  { id: 'media', label: 'Arsip & Galeri', icon: 'Image' },
  { id: 'bio', label: 'Biografi', icon: 'FileText' },
];
