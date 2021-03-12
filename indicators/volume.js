/* Panel Indicators GNOME Shell extension
 *
 * Copyright (C) 2019 Leandro Vital <leavitals@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const { St, Shell, Clutter } = imports.gi;
const Lang = imports.lang;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const Gettext = imports.gettext.domain("panel-indicators");
const _ = Gettext.gettext;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const CustomButton = Extension.imports.indicators.button.CustomButton;
const Convenience = Extension.imports.convenience;

var VolumeIndicator = new Lang.Class({
    Name: "VolumeIndicator",
    Extends: CustomButton,

    _init: function () {
        this.parent("VolumeIndicator");
        this._settings = Convenience.getSettings();
        this.menu.actor.add_style_class_name("aggregate-menu");
        this._volume = Main.panel.statusArea.aggregateMenu._volume;
        this._volume.remove_actor(this._volume._primaryIndicator);
        this.box.add_child(this._volume._primaryIndicator);
        Main.panel.statusArea.aggregateMenu.menu.box.remove_actor(this._volume.menu.actor);
        this.menu.box.add_actor(this._volume.menu.actor);
        this.connect("scroll-event", (actor, event) => this._volume._onScrollEvent(actor, event));

        let settings = new PopupMenu.PopupMenuItem(_("Volume Settings"));
        settings.connect("activate", () => this._openApp("gnome-sound-panel.desktop"));
        this.menu.addMenuItem(settings);
        this.menu.box.connect("scroll-event", (actor, event) => this._volume._onScrollEvent(actor, event));
    },
    destroy: function () {
        //this._mediaSection.disconnect(this._mediaVisible);
        this.box.remove_child(this._volume._primaryIndicator);
        this.menu.box.remove_actor(this._volume.menu.actor);
        //this.menu.box.remove_actor(this._mediaSection);
        this._volume.add_actor(this._volume._primaryIndicator);
        //this._mediaSection.remove_style_class_name("music-box");
        Main.panel.statusArea.aggregateMenu.menu.box.add_actor(this._volume.menu.actor);
        //Main.panel.statusArea.dateMenu._messageList._addSection(this._mediaSection);
        this.parent();
    }
});
