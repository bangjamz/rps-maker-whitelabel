import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user, token) => set({
                user,
                token,
                isAuthenticated: true
            }),

            logout: () => set({
                user: null,
                token: null,
                isAuthenticated: false
            }),

            updateUser: (userData) => set((state) => ({
                user: { ...state.user, ...userData }
            })),

            // Helper getters for organizational context
            getInstitusi: () => get().user?.institusi,
            getFakultas: () => get().user?.fakultas,
            getProdi: () => get().user?.prodi,

            // Permission helpers
            hasRole: (...roles) => {
                const role = get().user?.role;
                return role && roles.includes(role);
            },

            isAdminInstitusi: () => get().user?.role === 'admin_institusi',
            isDekan: () => get().user?.role === 'dekan',
            isKaprodi: () => get().user?.role === 'kaprodi',
            isDosen: () => get().user?.role === 'dosen',
            isMahasiswa: () => get().user?.role === 'mahasiswa',

            // Organization access helpers
            canManageProdi: (prodiId) => {
                const user = get().user;
                if (!user) return false;
                if (user.role === 'admin_institusi') return true;
                if (user.role === 'dekan') {
                    // Dekan can manage prodi in their fakultas
                    return user.fakultas_id && prodiId; // Would need prodi details to check
                }
                if (user.role === 'kaprodi') {
                    return user.prodi_id === prodiId;
                }
                return false;
            },

            canAssignLecturers: () => {
                const role = get().user?.role;
                return role === 'kaprodi' || role === 'dekan';
            },

            canApproveRPS: () => {
                const role = get().user?.role;
                return role === 'kaprodi' || role === 'dekan';
            }
        }),
        {
            name: 'rps-auth-storage',
        }
    )
);

export default useAuthStore;
