import React, { useState, useCallback } from 'react';
import { Member } from '../../types';
import { 
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  User,
  Calendar,
  Heart,
  Image,
  FileText,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { validateMemberForm, FormErrors } from './memberValidation';
import { MemberFormProps, FormSection, SECTIONS } from './MemberFormTypes';
import {
  BasicSection,
  DatesSection
} from './MemberFormSections';
import {
  FamilySection
} from './MemberFormFamily';
import {
  MediaSection,
  BioSection
} from './MemberFormMediaBio';

const ICON_MAP: Record<string, React.ReactNode> = {
  User: <User className="w-4 h-4" />,
  Calendar: <Calendar className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
  Image: <Image className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
};

export function MemberForm({ 
  initialData, 
  members, 
  allMembers, 
  families, 
  onSave, 
  onCancel,
  isLoading = false 
}: MemberFormProps) {
  const [currentSection, setCurrentSection] = useState<FormSection>('basic');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaName, setMediaName] = useState('');
  
  const [formData, setFormData] = useState<Partial<Member>>(() => {
    const base = {
      name: '',
      gender: 'male',
      fatherId: '',
      motherId: '',
      isAdoptedChild: false,
      spouseId: '',
      spouseIds: [],
      externalSpouseName: '',
      externalFamilyId: '',
      birthDate: '',
      photoUrl: '',
      bio: '',
      media: [],
      maritalStatus: 'single',
      ...initialData
    };
    
    if (base.spouseId && base.maritalStatus === 'single') {
      base.maritalStatus = 'married';
    }
    
    if (!base.spouseId && base.maritalStatus === 'married') {
      base.maritalStatus = 'single';
    }
    
    return base as Partial<Member>;
  });

  const validateCurrentSection = useCallback((): boolean => {
    const validation = validateMemberForm(formData, allMembers);
    setErrors(validation.errors);
    return validation.isValid;
  }, [formData, allMembers]);

  const handleFieldChange = (field: keyof Member, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFatherChange = (id: string) => {
    const father = allMembers.find(m => m.id === id);
    let updates: Partial<Member> = { fatherId: id };
    if (father?.spouseId && !formData.motherId) {
      const spouse = allMembers.find(m => m.id === father.spouseId);
      if (spouse && spouse.gender === 'female') {
        updates.motherId = spouse.id;
      }
    }
    setFormData(prev => ({ ...prev, ...updates }));
    setTouched(prev => ({ ...prev, fatherId: true, motherId: true }));
  };

  const handleMotherChange = (id: string) => {
    const mother = allMembers.find(m => m.id === id);
    let updates: Partial<Member> = { motherId: id };
    if (mother?.spouseId && !formData.fatherId) {
      const spouse = allMembers.find(m => m.id === mother.spouseId);
      if (spouse && spouse.gender === 'male') {
        updates.fatherId = spouse.id;
      }
    }
    setFormData(prev => ({ ...prev, ...updates }));
    setTouched(prev => ({ ...prev, motherId: true, fatherId: true }));
  };

  const handleSpouseChange = (id: string) => {
    const currentSpouseIds = formData.spouseIds || [];
    let newSpouseIds = [...currentSpouseIds];
    if (id && !newSpouseIds.includes(id)) {
      newSpouseIds.push(id);
    }
    
    let newStatus = formData.maritalStatus;
    if (id && formData.maritalStatus === 'single') {
      newStatus = 'married';
    } else if (!id && formData.maritalStatus === 'married') {
      newStatus = 'single';
    }
    
    setFormData(prev => ({ 
      ...prev, 
      spouseId: id, 
      spouseIds: newSpouseIds,
      maritalStatus: newStatus as any
    }));
    setTouched(prev => ({ ...prev, spouseId: true }));
  };

  const handleAddMedia = () => {
    setMediaUrl('');
    setMediaName('');
    setShowMediaModal(true);
  };

  const handleMediaModalSave = () => {
    if (mediaUrl && mediaName) {
      const type = (mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? 'image' : 'document';
      setFormData(prev => ({
        ...prev,
        media: [...(prev.media || []), { url: mediaUrl, name: mediaName, type: type as any }]
      }));
      setShowMediaModal(false);
      setMediaUrl('');
      setMediaName('');
    }
  };

  const handleMediaModalCancel = () => {
    setShowMediaModal(false);
    setMediaUrl('');
    setMediaName('');
  };

  const handleRemoveMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media?.filter((_, i) => i !== index) || []
    }));
  };

  const handleNext = () => {
    if (validateCurrentSection()) {
      const currentIndex = SECTIONS.findIndex(s => s.id === currentSection);
      if (currentIndex < SECTIONS.length - 1) {
        setCurrentSection(SECTIONS[currentIndex + 1].id);
      }
    } else {
      toast.error('Mohon perbaiki kesalahan pada form');
    }
  };

  const handlePrevious = () => {
    const currentIndex = SECTIONS.findIndex(s => s.id === currentSection);
    if (currentIndex > 0) {
      setCurrentSection(SECTIONS[currentIndex - 1].id);
    }
  };

  const handleSubmit = () => {
    const validation = validateMemberForm(formData, allMembers);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Mohon perbaiki kesalahan pada form');
      return;
    }
    onSave(formData);
  };

  const sectionProps = {
    formData,
    errors,
    touched,
    members,
    allMembers,
    families,
    initialData,
    onFieldChange: handleFieldChange,
    onFatherChange: handleFatherChange,
    onMotherChange: handleMotherChange,
    onSpouseChange: handleSpouseChange,
    onAddMedia: handleAddMedia,
    onRemoveMedia: handleRemoveMedia,
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'basic':
        return <BasicSection {...sectionProps} />;
      case 'dates':
        return <DatesSection {...sectionProps} />;
      case 'family':
        return <FamilySection {...sectionProps} />;
      case 'media':
        return <MediaSection {...sectionProps} />;
      case 'bio':
        return <BioSection {...sectionProps} />;
      default:
        return null;
    }
  };

  const currentSectionIndex = SECTIONS.findIndex(s => s.id === currentSection);
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === SECTIONS.length - 1;

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-6">
        {SECTIONS.map((section, index) => (
          <React.Fragment key={section.id}>
            <button
              type="button"
              onClick={() => {
                if (index <= currentSectionIndex) {
                  setCurrentSection(section.id);
                }
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                currentSection === section.id
                  ? 'bg-blue-100 text-blue-700'
                  : index < currentSectionIndex
                  ? 'bg-green-50 text-green-600 cursor-pointer hover:bg-green-100'
                  : 'bg-slate-50 text-slate-400 cursor-not-allowed'
              }`}
              disabled={index > currentSectionIndex}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentSection === section.id
                  ? 'bg-blue-500 text-white'
                  : index < currentSectionIndex
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {index < currentSectionIndex ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs font-semibold hidden sm:inline">{section.label}</span>
            </button>
            {index < SECTIONS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                index < currentSectionIndex ? 'bg-green-300' : 'bg-slate-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Content */}
      <div className="min-h-[400px]">
        {renderSection()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-6 border-t border-slate-100">
        {!isFirstSection && (
          <button 
            type="button"
            onClick={handlePrevious}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>
        )}
        
        <div className="flex-1" />
        
        {isLastSection ? (
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Simpan Anggota
              </>
            )}
          </button>
        ) : (
          <button 
            type="button"
            onClick={handleNext}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        
        <button 
          type="button"
          onClick={onCancel}
          className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-all"
        >
          Batal
        </button>
      </div>

      {/* Media URL Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Tambah Media</h3>
              <button 
                type="button"
                onClick={handleMediaModalCancel}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL Media
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/media.jpg"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Media
                </label>
                <input
                  type="text"
                  value={mediaName}
                  onChange={(e) => setMediaName(e.target.value)}
                  placeholder="Akta Kelahiran"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleMediaModalCancel}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleMediaModalSave}
                disabled={!mediaUrl || !mediaName}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
