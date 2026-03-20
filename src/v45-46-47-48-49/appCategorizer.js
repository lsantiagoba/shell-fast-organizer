import Gio from 'gi://Gio';
import { AppFolderManager } from './appFolderManager.js';

export const CATEGORY_MAP = {
    'AudioVideo': { id: 'AudioVideo', nameKey: 'categoryAudioVideo' },
    'Audio': { id: 'AudioVideo', nameKey: 'categoryAudioVideo' },
    'Video': { id: 'AudioVideo', nameKey: 'categoryAudioVideo' },
    'Development': { id: 'Development', nameKey: 'categoryDevelopment' },
    'Education': { id: 'Education', nameKey: 'categoryEducation' },
    'Game': { id: 'Games', nameKey: 'categoryGames' },
    'Graphics': { id: 'Graphics', nameKey: 'categoryGraphics' },
    'Network': { id: 'Network', nameKey: 'categoryInternet' },
    'Office': { id: 'Office', nameKey: 'categoryOffice' },
    'System': { id: 'System', nameKey: 'categorySystem' },
    'Utility': { id: 'Utilities', nameKey: 'categoryUtilities' }
};

export const STANDARD_FOLDERS = [
    { id: 'AudioVideo', nameKey: 'categoryAudioVideo' },
    { id: 'Development', nameKey: 'categoryDevelopment' },
    { id: 'Education', nameKey: 'categoryEducation' },
    { id: 'Games', nameKey: 'categoryGames' },
    { id: 'Graphics', nameKey: 'categoryGraphics' },
    { id: 'Network', nameKey: 'categoryInternet' },
    { id: 'Office', nameKey: 'categoryOffice' },
    { id: 'System', nameKey: 'categorySystem' },
    { id: 'Utilities', nameKey: 'categoryUtilities' },
    { id: 'Other', nameKey: 'categoryOther' }
];

export class AppCategorizer {
    static organizeApps(categoryId = null) {
        const appsInfo = Gio.AppInfo.get_all();
        const folderMapping = {}; // { folderId: [appIds...] }
        
        appsInfo.forEach(app => {
            if (app.should_show()) {
                const categories = app.get_categories() || '';
                const catsArray = categories.split(';').filter(c => c.trim() !== '');
                let mappedId = 'Other';

                for (const cat of catsArray) {
                    if (CATEGORY_MAP[cat]) {
                        mappedId = CATEGORY_MAP[cat].id;
                        break;
                    }
                }
                
                if (categoryId && mappedId !== categoryId) {
                    return;
                }
                
                const appId = app.get_id();
                if (!folderMapping[mappedId]) {
                    folderMapping[mappedId] = [];
                }
                if (!folderMapping[mappedId].includes(appId)) {
                    folderMapping[mappedId].push(appId);
                }
            }
        });

        AppFolderManager.createOrUpdateFolders(folderMapping, STANDARD_FOLDERS);
    }
}
