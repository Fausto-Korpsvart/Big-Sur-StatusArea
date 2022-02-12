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

const { St, Shell } = imports.gi;
const GObject = imports.gi.GObject;
const PanelMenu = imports.ui.panelMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

var CustomButton = GObject.registerClass({
    GTypeName: 'CustomButton',
},
class CustomButton extends PanelMenu.Button {

    _init (name) {
        super._init(0.5, name);
        this.settings = Convenience.getSettings();
        this.name = name;
        this._center = false;
        this.box = new St.BoxLayout({
            vertical: false,
            style_class: "panel-status-menu-box"
        });;
        this.add_child(this.box);
    }

    _openApp (app) {
        Shell.AppSystem.get_default().lookup_app(app).activate();
    }

    set_spacing (spacing) {
        this._default_spacing = spacing;
        this.update_spacing(spacing);
    }

    update_spacing (spacing) {
        if (this.settings.get_boolean("activate-spacing")) {
            let style = '-natural-hpadding: %dpx'.format(spacing);
            if (spacing < 6) {
                style += '; -minimum-hpadding: %dpx'.format(spacing);
            }
            this.set_style(style);
	}
	else
            this.set_style("");
    }

    calculate_spacing () {
        let style = this.get_style();
        if (style) {
            let start = style.indexOf("-natural-hpadding: ");
            let end = style.indexOf("px;");
            let val = parseInt(style.substring(start + 19, end));
            return val;
        }
        return NaN
    }

    destroy () {
        super.destroy()
    }
});
