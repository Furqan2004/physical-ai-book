import { AuthContext, useAuth } from '../theme/Root';

/**
 * Re-export useAuth hook from Root
 * This provides a cleaner import path for components
 */
export { useAuth, AuthContext };
export type { User } from '../theme/Root';
