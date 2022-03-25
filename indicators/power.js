/* Panel indicators GNOME Shell extension
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

const { St, UPowerGlib, Clutter } = imports.gi;
const GObject = imports.gi.GObject;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const Gettext = imports.gettext.domain("bigSur-StatusArea");
const _ = Gettext.gettext;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const CustomButton = Extension.imports.indicators.button.CustomButton;

var PowerIndicator = GObject.registerClass({
    Name: "PowerIndicator",
},
class PowerIndicator extends CustomButton {

    _init () {
        super._init("PowerIndicator");
        this.menu.actor.add_style_class_name("aggregate-menu");
        this._power = Main.panel.statusArea.aggregateMenu._power;
        this._power.remove_actor(this._power._indicator);
    
        this._percentageLabel = new St.Label({
            text: "",
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
            visible: false
        });
        this.box.add_child(this._power._indicator);
        this.box.add_child(this._percentageLabel);

        this._power.remove_actor(this._power._percentageLabel);
        Main.panel.statusArea.aggregateMenu.menu.box.remove_actor(this._power.menu.actor);

        this._separator = new PopupMenu.PopupSeparatorMenuItem();
        this.menu.addMenuItem(this._separator);
        
        this._label = new St.Label({
            style_class: "label-menu"
        });
        this.menu.box.add_child(this._label);
        this._settings = new PopupMenu.PopupMenuItem(_("Power Settings"));
        this._settings.connect("activate", () => this._openApp("gnome-power-panel.desktop"));
        this.menu.addMenuItem(this._settings);
        this._properties_changed = this._power._proxy.connect("g-properties-changed", () => this._sync());
        this._show_battery_signal = this._power._desktopSettings.connect("changed::show-battery-percentage", () => this._sync());
        this._sync();
    }

    _sync () {
        let powertype = this._power._proxy.IsPresent;
        if (!powertype) {
            this._power._indicator.hide();
            this._percentageLabel.hide();
            this._separator.actor.hide();
            this._label.hide();
            this._settings.actor.hide();

            this.hide();
            
        } else {
            this._power._indicator.show();
            this._percentageLabel.visible = this._power._desktopSettings.get_boolean("show-battery-percentage");
            this._percentageLabel.clutter_text.set_markup('<span size="smaller">' + Math.round(this._power._proxy.Percentage) + " %</span>");
            this._separator.actor.show();
            this._label.show();
            this._settings.actor.show();

            let hideOnFull = this._hideOnFull && (this._power._proxy.State == UPowerGlib.DeviceState.FULLY_CHARGED);
            let hideAtPercent = this._hideOnPercent && (this._power._proxy.Percentage >= this._hideWhenPercent);

            this.show();

            if (hideOnFull) {
                this.actor.hide();
            } else if (hideAtPercent) {
                this._actor.hide();
            }

        }
        this._label.set_text(this._power._getStatus());
    }

    showPercentageLabel (status) {
        this._power._desktopSettings.set_boolean(status);
        this._sync();
    }

    setHideOnFull (status) {
        this._hideOnFull = status;
        this._sync();
    }

    setHideOnPercent (status, percent, element) {
        this._actor = (element == 0) ? this.actor : this._percentageLabel;
        this._hideOnPercent = status;
        this._hideWhenPercent = percent;
        this._sync();
    }

    destroy () {
        this._power._proxy.disconnect(this._properties_changed);
        this._power._desktopSettings.disconnect(this._show_battery_signal);

        this.box.remove_child(this._power._indicator);
        
        this._power.add_actor(this._power._indicator);

        Main.panel.statusArea.aggregateMenu.menu.box.add_actor(this._power.menu.actor);
        
        super.destroy()
    }
});
