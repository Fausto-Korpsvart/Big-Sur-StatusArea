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

const { St } = imports.gi;
const GObject = imports.gi.GObject;
const Main = imports.ui.main;
const Config = imports.misc.config;
const PopupMenu = imports.ui.popupMenu;
const Gettext = imports.gettext.domain("bigSur-StatusArea");
const _ = Gettext.gettext;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const CustomButton = Extension.imports.indicators.button.CustomButton;

var NetworkIndicator = GObject.registerClass({
    GTypeName: "NetworkIndicator",
},
class NetworkIndicator extends CustomButton {

    _init () {
        super._init("NetworkIndicator");
        //this.menu.box.set_width(270);
        this.menu.actor.add_style_class_name("aggregate-menu");

        this._is_rfkill = false;
        this._is_location = false;
        this._network = null;
        this._rfkill = Main.panel.statusArea.aggregateMenu._rfkill;

        if (Config.HAVE_NETWORKMANAGER) {
            this._network = Main.panel.statusArea.aggregateMenu._network;
        }

        this._location = Main.panel.statusArea.aggregateMenu._location;
        if(this._location._indicator){
            this._location.remove_actor(this._location._indicator);
            this._location._indicator.hide();
        }

        if (this._network) {
            this._network.remove_actor(this._network._primaryIndicator);
            this._network.remove_actor(this._network._vpnIndicator);
            this.box.add_child(this._network._primaryIndicator);
            this.box.add_child(this._network._vpnIndicator);
            this._network._vpnIndicator.hide();
        }

        this._rfkill.remove_actor(this._rfkill._indicator);
        this._rfkill._indicator.hide();

        this._arrowIcon = new St.Icon({
            icon_name: "airplane-mode-symbolic",
            style_class: "system-status-icon"
        });

        this.box.add_child(this._arrowIcon);

        if (this._network) {
            Main.panel.statusArea.aggregateMenu.menu.box.remove_actor(this._network.menu.actor);
            this.menu.addMenuItem(this._network.menu);
        }

        Main.panel.statusArea.aggregateMenu.menu.box.remove_actor(this._location.menu.actor);
        this.menu.addMenuItem(this._location.menu);

        Main.panel.statusArea.aggregateMenu.menu.box.remove_actor(this._rfkill.menu.actor);
        this.menu.addMenuItem(this._rfkill.menu);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        let network = new PopupMenu.PopupMenuItem(_("Network Settings"));
        network.connect("activate", () => this._openApp("gnome-network-panel.desktop"));
        this.menu.addMenuItem(network);

        this._rfkill_properties_changed = this._rfkill._manager._proxy.connect("g-properties-changed", () => this._sync());

        if (this._network) {
            this._network_notify = this._network._primaryIndicator.connect("notify", () => this._sync());
        }

        this._rfkill._sync();
        this._location.notify('in-use');
        this._sync();

        Main.sessionMode.connect('updated', () => this._sync());

    }

    _sync () {
        this._arrowIcon.hide();
        if (!this._network._primaryIndicator.visible &&
            !this._network._vpnIndicator.visible) {

            if (this._is_rfkill == true) {
	         this.box.remove_child(this._rfkill._indicator);
                 this._is_rfkill = false;
	    }
            if (this._is_location == true) {
	         this.box.remove_child(this._location._indicator);
                 this._is_location = false;
	    }
            if (this._is_location == false && this._is_rfkill == false)
                 this._arrowIcon.show();
        }
        else {
			if (!this._rfkill.airplaneMode) {
                                if (this._is_rfkill == false) {
				       this.box.add_child(this._rfkill._indicator);
                                       this._is_rfkill = true;
				}
			} else {
                                if (this._is_rfkill == true) {
				       this.box.remove_child(this._rfkill._indicator);
                                       this._is_rfkill = false;
				}
			}

			if (this._location._managerProxy != null) {
                                if (this._is_location == false) {
				       this.box.add_child(this._location._indicator);
                                       this._is_location = true;
				}
			} else {
                                if (this._is_location == true) {
				       this.box.remove_child(this._location._indicator);
                                       this._is_location = false;
				}
			}
	    }
	    log("Number Object : [" + this.box.get_n_children() + "]");
	    /*
	    if (this.box.get_n_children() > 2){
	          var child = this.box.get_child_at_index(1);
                  this.box.remove_child(child);
	    }*/
    }

    destroy () {
        this._rfkill._manager._proxy.disconnect(this._rfkill_properties_changed);
        if (this._network) {
            this._network._primaryIndicator.disconnect(this._network_notify);
        }

        this.box.remove_child(this._location._indicator);
        this.menu.box.remove_actor(this._location.menu.actor);

        this._location.add_actor(this._location._indicator);
        Main.panel.statusArea.aggregateMenu.menu.box.add_actor(this._location.menu.actor);

        this.box.remove_child(this._rfkill._indicator);
        this.menu.box.remove_actor(this._rfkill.menu.actor);

        this._rfkill.add_actor(this._rfkill._indicator);
        Main.panel.statusArea.aggregateMenu.menu.box.add_actor(this._rfkill.menu.actor);

        this.box.remove_child(this._network._primaryIndicator);
        this.box.remove_child(this._network._vpnIndicator);
        this.menu.box.remove_actor(this._network.menu.actor);

        this._network.add_actor(this._network._primaryIndicator);
        this._network.add_actor(this._network._vpnIndicator);
        
        Main.panel.statusArea.aggregateMenu.menu.box.add_actor(this._network.menu.actor);

        super.destroy()
    }
});
