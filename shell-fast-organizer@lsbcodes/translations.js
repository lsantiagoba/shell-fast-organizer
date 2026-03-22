import GLib from 'gi://GLib';

export const TRANSLATIONS = {
    'en': {
        organizeAll: 'Auto-organize All',
        organizeByCategory: 'Organize by Category',
        categoryAudioVideo: 'Audio & Video',
        categoryDevelopment: 'Development',
        categoryEducation: 'Education',
        categoryGames: 'Games',
        categoryGraphics: 'Graphics',
        categoryInternet: 'Internet',
        categoryOffice: 'Office',
        categorySystem: 'System',
        categoryUtilities: 'Utilities',
        categoryOther: 'Other'
    },
    'es': {
        organizeAll: 'Auto-organizar Todo',
        organizeByCategory: 'Organizar por Categoría',
        categoryAudioVideo: 'Música y Video',
        categoryDevelopment: 'Desarrollo',
        categoryEducation: 'Educación',
        categoryGames: 'Juegos',
        categoryGraphics: 'Gráficos',
        categoryInternet: 'Internet',
        categoryOffice: 'Oficina',
        categorySystem: 'Sistema',
        categoryUtilities: 'Utilidades',
        categoryOther: 'Otros'
    }
};

export function _t(key) {
    // Basic language detection
    const lang = String(GLib.getenv('LANG') || 'en').split('_')[0];
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || key;
}
