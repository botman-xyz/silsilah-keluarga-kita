import { FamilyService, MemberService, ExportService } from '../application/services';
import { 
  FirebaseFamilyRepository, 
  FirebaseMemberRepository, 
  FirebaseAuthRepository 
} from './repositories';
import { firebaseExportService } from './services/ExportService';

/**
 * Dependency Injection Container
 * This is where we wire up the infrastructure to the application layer
 */

// Infrastructure - Repositories
const familyRepository = new FirebaseFamilyRepository();
const memberRepository = new FirebaseMemberRepository();
const authRepository = new FirebaseAuthRepository();

// Application Services (injecting repositories)
export const familyService = new FamilyService(familyRepository);
export const memberService = new MemberService(memberRepository);
export const exportService = new ExportService();
export const authService = authRepository; // Direct access to auth repository

// Infrastructure Services
export { firebaseExportService };

// Re-export for convenience
export { familyRepository, memberRepository, authRepository };
