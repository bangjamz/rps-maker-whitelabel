import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAcademicStore = create(
    persist(
        (set) => ({
            activeSemester: 'Ganjil', // 'Ganjil' or 'Genap'
            activeYear: '2025/2026',

            setSemester: (semester) => set({ activeSemester: semester }),
            setYear: (year) => set({ activeYear: year }),
        }),
        {
            name: 'academic-storage',
        }
    )
);

export default useAcademicStore;
