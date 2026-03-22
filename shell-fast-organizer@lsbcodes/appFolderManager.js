import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { _t } from './translations.js';

const DESKTOP_APP_FOLDERS_SCHEMA = 'org.gnome.desktop.app-folders';
const FOLDER_SCHEMA = 'org.gnome.desktop.app-folders.folder';

export class AppFolderManager {
    static createOrUpdateFolders(folderMapping, standardFolders) {
        const appFoldersSettings = new Gio.Settings({ schema_id: DESKTOP_APP_FOLDERS_SCHEMA });
        let existingFolders = appFoldersSettings.get_strv('folder-children') || [];
        
        const newFoldersList = [...existingFolders];
        let listChanged = false;

        for (const [folderId, appIds] of Object.entries(folderMapping)) {
            if (!newFoldersList.includes(folderId)) {
                newFoldersList.push(folderId);
                listChanged = true;
            }

            const folderSettings = new Gio.Settings({
                schema_id: FOLDER_SCHEMA,
                path: `/org/gnome/desktop/app-folders/folders/${folderId}/`
            });

            const folderNameKey = this._getFolderNameKeyFromId(folderId, standardFolders);
            const translatedName = _t(folderNameKey);

            folderSettings.set_string('name', translatedName);
            folderSettings.set_boolean('translate', false);
            
            const currentApps = folderSettings.get_strv('apps') || [];
            
            const mergedApps = [...new Set([...currentApps, ...appIds])];
            if (mergedApps.length !== currentApps.length) {
                folderSettings.set_strv('apps', mergedApps);
            }
        }

        if (listChanged) {
            appFoldersSettings.set_strv('folder-children', newFoldersList);
        }
    }

    static _getFolderNameKeyFromId(folderId, standardFolders) {
        const folderInfo = standardFolders.find(f => f.id === folderId);
        return folderInfo ? folderInfo.nameKey : 'categoryOther';
    }
}
