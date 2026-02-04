import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
    persist(
        (set) => ({
            theme: 'light', // 'light' or 'dark'

            setTheme: (theme) => {
                set({ theme });
                // Apply theme to document
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            },

            toggleTheme: () => set((state) => {
                const newTheme = state.theme === 'light' ? 'dark' : 'light';
                if (newTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                return { theme: newTheme };
            }),
        }),
        {
            name: 'rps-theme-storage',
        }
    )
);

// Initialize theme on load
const initTheme = () => {
    const theme = useThemeStore.getState().theme;
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    }
};

initTheme();

export default useThemeStore;
