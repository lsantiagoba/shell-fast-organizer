import Clutter from 'gi://Clutter';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { AppCategorizer, STANDARD_FOLDERS } from './appCategorizer.js';
import { _t } from './translations.js';

export default class ShellFastOrganizerExtension extends Extension {
    enable() {
        this._dashSignalIds = [];
        this._appDisplaySignalIds = [];
        
        // Create the right-click menu
        this._createMenu();
        
        // Hook into Dash
        if (Main.overview.dash) {
            // Dash container is more reliable for background clicks
            const dashActor = Main.overview.dash._background || Main.overview.dash;
            this._dashSignalIds.push(
                dashActor.connect('button-press-event', this._onButtonPress.bind(this))
            );
            
            if (Main.overview.dash.showAppsButton) {
                this._dashSignalIds.push(
                    Main.overview.dash.showAppsButton.connect('button-press-event', this._onButtonPress.bind(this))
                );
            }
        }
        
        // Hook into AppGrid background (controls layout)
        // GNOME 45+ uses _controls or overviewControls
        const controls = Main.overview.overviewControls || (Main.overview._overview ? (Main.overview._overview._controls || Main.overview._overview.controls) : null);
        
        if (controls) {
            const appDisplay = controls.appDisplay || controls._appGrid;
            const target = appDisplay ? (appDisplay._scroll || appDisplay) : controls;
            
            this._appDisplaySignalIds.push(
                target.connect('button-press-event', this._onButtonPress.bind(this))
            );
        }

        // Also hook into Top Bar (Panel) as requested/suggested
        if (Main.panel) {
            this._appDisplaySignalIds.push(
                Main.panel.connect('button-press-event', this._onButtonPress.bind(this))
            );
        }
    }

    disable() {
        if (this._menu) {
            this._menu.close();
            this._menu.destroy();
            this._menu = null;
        }
        
        this._menuManager = null;

        if (Main.overview.dash) {
            const dashActor = Main.overview.dash._background || Main.overview.dash;
            for (const id of this._dashSignalIds) {
                try { dashActor.disconnect(id); } catch (e) {}
                try { Main.overview.dash.showAppsButton.disconnect(id); } catch (e) {}
            }
        }
        
        const controls = Main.overview.overviewControls || (Main.overview._overview ? (Main.overview._overview._controls || Main.overview._overview.controls) : null);
        if (controls) {
            const appDisplay = controls.appDisplay || controls._appGrid;
            const target = appDisplay ? (appDisplay._scroll || appDisplay) : controls;
            for (const id of this._appDisplaySignalIds) {
                try { target.disconnect(id); } catch (e) {}
            }
        }

        if (Main.panel) {
            for (const id of this._appDisplaySignalIds) {
                try { Main.panel.disconnect(id); } catch (e) {}
            }
        }
        
        this._dashSignalIds = [];
        this._appDisplaySignalIds = [];
    }

    _createMenu() {
        // We use a simple popup menu that we position at the pointer context
        this._menu = new PopupMenu.PopupMenu(Main.layoutManager.dummyCursor, 0.5, St.Side.BOTTOM);
        this._menu.actor.add_style_class_name('shell-fast-organizer-menu');
        
        Main.uiGroup.add_child(this._menu.actor);
        this._menu.actor.hide();
        
        this._menuManager = new PopupMenu.PopupMenuManager(this);
        this._menuManager.addMenu(this._menu);

        // Auto-organize All
        const organizeAllItem = new PopupMenu.PopupMenuItem(_t('organizeAll'));
        organizeAllItem.connect('activate', () => {
            this._menu.close();
            AppCategorizer.organizeApps(null); // All
        });
        this._menu.addMenuItem(organizeAllItem);

        // Separator
        this._menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Organize by Category (Submenu)
        const categorySubMenu = new PopupMenu.PopupSubMenuMenuItem(_t('organizeByCategory'));
        
        for (const folder of STANDARD_FOLDERS) {
            const item = new PopupMenu.PopupMenuItem(_t(folder.nameKey));
            item.connect('activate', () => {
                this._menu.close();
                AppCategorizer.organizeApps(folder.id);
            });
            categorySubMenu.menu.addMenuItem(item);
        }
        
        this._menu.addMenuItem(categorySubMenu);
    }

    _onButtonPress(actor, event) {
        const button = event.get_button();
        
        // Right click is button 3
        if (button === 3) {
            const [x, y] = event.get_coords();
            
            // Close any open menu first
            if (this._menu.isOpen) {
                this._menu.close();
            }

            // Move our dummy cursor to the pointer position
            // Since dummyCursor is a child of nothing, we should probably add it or use another approach
            // But let's try to set it correctly in stage coordinates
            Main.layoutManager.dummyCursor.set_position(x, y);
            
            this._menu.open(true);
            
            return Clutter.EVENT_STOP; // Stop propagation to avoid default menus
        }
        
        // Close menu on left click elsewhere
        if (this._menu.isOpen && button === 1) {
            this._menu.close();
        }
        
        return Clutter.EVENT_PROPAGATE;
    }
}

