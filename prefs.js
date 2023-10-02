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

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const GdkPixbuf = imports.gi.GdkPixbuf;
const Gettext = imports.gettext.domain("bigSur-StatusArea");
const _ = Gettext.gettext;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const MenuItems = Extension.imports.menuItems;

function init() {
    Convenience.initTranslations("bigSur-StatusArea");
}

const IconButton = GObject.registerClass({
    GTypeName: "IconButton",
},
class IconButton extends Gtk.Button {

    _init (params) {
        super._init({});
        if (params["circular"]) {
            let context = this.get_style_context();
            context.add_class("circular");
        }
        if (params["icon_name"]) {
            let image = new Gtk.Image({
                icon_name: params["icon_name"],
                xalign: 0.46
            });
            this.add(image);
        }
    }
});

var DialogWindow = GObject.registerClass({
    GTypeName: "DialogWindow",
},
class DialogWindow extends Gtk.Dialog {

    _init (title, parent) {
        super._init({
            title: title,
            transient_for: parent.get_toplevel(),
            use_header_bar: true,
            modal: true
        });
        let vbox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
        });
        vbox.set_homogeneous(false);
        vbox.set_spacing(20);

        this._createLayout(vbox);
        this.get_content_area().add(vbox);
    }

    _createLayout (vbox) {
        throw "Not implemented!";
    }
});

const NotebookPage = GObject.registerClass({
    GTypeName: "NotebookPage",
    
},
class NotebookPage extends Gtk.Box {

    _init  (title) {
        super._init({
            orientation: Gtk.Orientation.VERTICAL,
        });
        // this.set_margin(24);
        this.set_homogeneous(false);
	this.set_spacing(20);
        this.title = new Gtk.Label({
            label: "<b>" + title + "</b>",
            use_markup: true,
            xalign: 0
        });
    }
});

var FrameBox = GObject.registerClass({
    GTypeName: "FrameBox",
},
class FrameBox extends Gtk.Frame {
    _init (label) {
        this._listBox = new Gtk.ListBox();
        this._listBox.set_selection_mode(Gtk.SelectionMode.NONE);
        super._init({
            child: this._listBox
        });
        // label_yalign: 0.50;
        this.label = label;
    }

    add (boxRow) {
        this._listBox.append(boxRow);
    }
});

var FrameBoxRow = GObject.registerClass({
    GTypeName: "FrameBoxRow",
},
class FrameBoxRow extends Gtk.ListBoxRow {

    _init () {
        this._box = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
        });
        //this.set_margin(5);
        //this.set_row_spacing(20);
        //this.set_column_spacing(20);
        super._init({
            child: this._box
        });
    }

    add (widget) {
        this._box.append(widget);
    }
});

const PrefsWidget = GObject.registerClass({
    GTypeName: "PrefsWidget",
    //Name: "Prefs.Widget",
},
class PrefsWidgets extends Gtk.Box {

    _init () {
        super._init({
            orientation: Gtk.Orientation.VERTICAL,
        });
        this.set_spacing(5);
        // this.add_ccs_class("box-prefs-widget");
        this.settings = Convenience.getSettings();
        this.menuItems = new MenuItems.MenuItems(this.settings);

        let notebook = new Gtk.Notebook();
        notebook.set_margin_start(6);
        notebook.set_margin_end(6);

        let settingsPage = new SettingsPage(this.settings);

        notebook.append_page(settingsPage, settingsPage.title);

        let indicatorsPage = new IndicatorsPage(this.settings, this.menuItems);
        notebook.append_page(indicatorsPage, indicatorsPage.title);

        let aboutPage = new AboutPage(this.settings);
        notebook.append_page(aboutPage, aboutPage.title);

        this.append(notebook);
    }
});

var SettingsPage = GObject.registerClass({
    GTypeName: "SettingsPage",
},
class SettingsPage extends NotebookPage {

    _init (settings) {
        super._init(_("Settings"));
        this.settings = settings;
        this.desktopSettings = new Gio.Settings({
            schema_id: "org.gnome.desktop.interface"
        });

        //
         // User Settings
         //
        let userFrame = new FrameBox(_("User/System Indicator"));
        userFrame.show();
        let nameIconRow = new FrameBoxRow();
        nameIconRow.show();
        let nameIconLabel = new Gtk.Label({
            label: _("Show an icon instead of name"),
            xalign: 0,
            hexpand: true
        });
        let nameIconSwitch = new Gtk.Switch({
            halign: Gtk.Align.END
        });
        this.settings.bind("user-icon", nameIconSwitch, "active", Gio.SettingsBindFlags.DEFAULT);

        nameIconRow.add(nameIconLabel);
        nameIconRow.add(nameIconSwitch);

        userFrame.add(nameIconRow);

        //
         // Calendar Settings
         ///
        let calendarFrame = new FrameBox(_("Calendar Indicator"));
        calendarFrame.show();
        let dateFormatRow = new FrameBoxRow();
        dateFormatRow.show();

        let dateFormatLabel = new Gtk.Label({
            label: _("Change date format"),
            xalign: 0,
            hexpand: true
        });
        dateFormatLabel.show();
        let dateFormatWikiButton = new Gtk.LinkButton({
            label: _("wiki"),
            uri: "https://help.gnome.org/users/gthumb/unstable/gthumb-date-formats.html",
            //xalign: 0,
            //hexpand: true,
            //image: new Gtk.Image({
            //icon_name: "emblem-web",
            //xalign: 0.46
            //})
        });
        dateFormatWikiButton.show();
        let context = dateFormatWikiButton.get_style_context();
        context.add_class("circular");

        let dateFormatEntry = new Gtk.Entry({
            hexpand: true,
            halign: Gtk.Align.END
        });
        dateFormatEntry.show();
        this.settings.bind("date-format", dateFormatEntry, "text", Gio.SettingsBindFlags.DEFAULT);

        dateFormatRow.add(dateFormatLabel);
        dateFormatRow.add(dateFormatWikiButton);
        dateFormatRow.add(dateFormatEntry);

        calendarFrame.add(dateFormatRow);

        //
         // Power Settings
         ///
        let powerFrame = new FrameBox(_("Power Indicator"));
        let showPercentageLabelRow = new FrameBoxRow();

        showPercentageLabelRow.add(new Gtk.Label({
            label: _("Show battery percentage"),
            xalign: 0,
            hexpand: true
        }));
        let showPercentageLabelSwitch = new Gtk.Switch({
            halign: Gtk.Align.END
        });
        this.desktopSettings.bind("show-battery-percentage", showPercentageLabelSwitch, "active", Gio.SettingsBindFlags.DEFAULT);
        showPercentageLabelRow.add(showPercentageLabelSwitch);

        powerFrame.add(showPercentageLabelRow);

        // add the frames
        this.append(userFrame);
        this.append(calendarFrame);
        this.append(powerFrame);
    }
});

var IndicatorsPage = GObject.registerClass({
    GTypeName: "IndicatorsPage",
},
class IndicatorsPage extends NotebookPage {

    _init (settings, menuItems) {
        super._init(_("Position and size"));
        this.settings = settings;
        this.menuItems = menuItems;

        this.separatingBox = new FrameBox(_("Unified Calendar/Notification Indicator"));

        this.append(this.separatingBox);
/////////////////////////////////////////////////////////////////////////////////////
        this.spacingBox = new FrameBox(_("Indicator padding"));
	
        let activateSpacingLabelRow = new FrameBoxRow();

        activateSpacingLabelRow.add(new Gtk.Label({
            label: _("Enable toggle for custom indicator padding"),
            xalign: 0,
            hexpand: true
        }));
        let activateSpacingLabelSwitch = new Gtk.Switch({
            halign: Gtk.Align.END
        });
        this.spacingBox.add(activateSpacingLabelRow);

        this.spacingRow = new FrameBoxRow();

        this.spacingLabel = new Gtk.Label({
            label: "",
            xalign: 0,
            hexpand: true
        });
        this.spacingScale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 15,
                step_increment: 1,
                page_increment: 1,
                page_size: 0
            }),
            digits: 0,
            round_digits: 0,
            hexpand: true,
            value_pos: Gtk.PositionType.RIGHT
        });
        this.spacingScale.connect("value-changed", function (scale, value) {
            return (value ? value.toString(): "0") + " px";
        });
        this.spacingScale.add_mark(9, Gtk.PositionType.BOTTOM, "");
        this.spacingScale.set_value(this.settings.get_int("spacing"));
        this.spacingScale.connect("value-changed", this.getSpacingScale.bind(this));

        this.spacingRow.add(this.spacingLabel);
        this.spacingRow.add(this.spacingScale);

        this.spacingBox.add(this.spacingRow);

        this.settings.bind("activate-spacing" , activateSpacingLabelSwitch, "active", Gio.SettingsBindFlags.DEFAULT);
        activateSpacingLabelSwitch.connect("notify", this.spacingEnable.bind(this));
        activateSpacingLabelRow.add(activateSpacingLabelSwitch);

        this.append(this.spacingBox);


        this.indicatorsFrame = new FrameBox("");
        this.buildList();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
        let activateSeparatingLabelRow = new FrameBoxRow();

        activateSeparatingLabelRow.add(new Gtk.Label({
            label: _("Enable toggle for individual calendar and notification indicators (gnome-shell restart required for effect)"),
            xalign: 0,
            hexpand: true
        }));
        let activateSeparatingLabelSwitch = new Gtk.Switch({
            halign: Gtk.Align.END
        });
        this.settings.bind("separate-date-and-notification" , activateSeparatingLabelSwitch, "active", Gio.SettingsBindFlags.DEFAULT);
        activateSeparatingLabelSwitch.connect("notify", this.separatingEnable.bind(this));
        activateSeparatingLabelRow.add(activateSeparatingLabelSwitch);

        this.separatingBox.add(activateSeparatingLabelRow);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // add the frames
        this.append(this.indicatorsFrame);
        this.spacingBox.show(); //add_actor(this.spacingRow);
    }

    getSpacingScale () {
            this.settings.set_int("spacing", this.spacingScale.get_value());
    }

    buildList () {

        this.remove(this.indicatorsFrame);
        this.indicatorsFrame = new FrameBox(_("Indicators Order"));
        this.append(this.indicatorsFrame);

        this.indicatorsArray = new Array();
        this.statusArray = new Array();
        this.labelsArray = new Array();
        let items = this.menuItems.getItems();

        for (let indexItem in items) {
            let item = items[indexItem];

            let indicatorRow = new FrameBoxRow();

            let indicatorLabel = new Gtk.Label({
                label: _(item["label"]),
                xalign: 0,
                hexpand: true
            });

            let positionCombo = new Gtk.ComboBoxText({
                halign: Gtk.Align.END
            });
            positionCombo.append_text(_("Left"));
            positionCombo.append_text(_("Center"));
            positionCombo.set_active(item["position"]);
            positionCombo.connect("changed", () => {
                 this.enableCenter(positionCombo, indexItem);
            });

            let statusSwitch = new Gtk.Switch({
                active: (item["enable"] == "1"),
                halign: Gtk.Align.END
            });
            statusSwitch.connect("notify", () => {
                this.changeEnable(statusSwitch, null, indexItem);
            });


            let buttonBox = new Gtk.Box({
                halign: Gtk.Align.END
            });

            let context = buttonBox.get_style_context();
            context.add_class("linked");

            let buttonUp = new Gtk.Button();
            buttonUp.set_icon_name("go-up-symbolic");

            if (indexItem > 0) {
                buttonUp.connect("clicked", () => {
                      this.changeOrder(null, indexItem, -1);
                });
            }

            let buttonDown = new Gtk.Button();
            buttonDown.set_icon_name("go-down-symbolic");

            if (indexItem < items.length - 1) {
                buttonDown.connect("clicked", () => {
                      this.changeOrder(null, indexItem, 1);
                });
            }

            buttonBox.append(buttonUp);
            buttonBox.append(buttonDown);

            indicatorRow.add(indicatorLabel);
            indicatorRow.add(statusSwitch);
            indicatorRow.add(positionCombo);
            indicatorRow.add(buttonBox);

            this.indicatorsFrame.add(indicatorRow);
            this.indicatorsArray.push(indicatorRow);
            this.statusArray.push(statusSwitch);
            this.labelsArray.push(_(item["label"]));
        }

        let positionRow = new FrameBoxRow();
        positionRow.add(new Gtk.Label({
            label: _("Top to bottom -> Left to right"),
            hexpand: true
        }));
        let resetIndicatorsRow = new FrameBoxRow();
        resetIndicatorsRow.add(new Gtk.Label({
            label: _("Reset Indicators"),
            halign: 2,
            hexpand: true
        }));
        let resetButton = new Gtk.Button({
            visible: true,
            label: _("Reset"),
            can_focus: true
        });
        // resetButton.get_style_context().add_class(Gtk.STYLE_CLASS_DESTRUCTIVE_ACTION);
        resetButton.connect("clicked", this.resetPosition.bind(this));

        resetIndicatorsRow.add(resetButton);
        this.indicatorsFrame.add(positionRow);
        this.indicatorsFrame.add(resetIndicatorsRow);

        this.indicatorsArray.push(positionRow);
        this.indicatorsArray.push(resetIndicatorsRow);
    }

    changeOrder (o, index, order) {
        this.menuItems.changeOrder(index, order);
        this.buildList();
    }

    changeEnable (object, p, index) {
        let items = this.menuItems.getItems();
        let item = items[index];

        if (_(item["label"]) == _("Calendar") &&
           !this.settings.get_boolean("separate-date-and-notification")) {
            object.set_active(false);
       }
       else
            this.menuItems.changeEnable(index, object.active);
    }

    enableCenter (object, index) {
        this.menuItems.changePosition(index, object.get_active());
        this.changeOrder(null, index, -index);
    }

    resetPosition () {
        this.settings.set_value("items", this.settings.get_default_value("items"));
        this.buildList();
    }

    spacingEnable (object, p) {
        if (object.active) {
            this.settings.set_boolean("activate-spacing", true);
            this.spacingRow.show();
	}
	else {
            this.spacingRow.hide();
            this.settings.set_boolean("activate-spacing", false);
	}
    }

    separatingEnable (object, p) {
        if (object.active) {
            this.settings.set_boolean("separate-date-and-notification" , true);
	}
	else {
	    for(let x = 0; x < this.labelsArray.length; x++) {
		 if (this.labelsArray[x] == _("Calendar")) {
                     this.statusArray[x].set_active(false);
		 }
	    }
            this.settings.set_boolean("separate-date-and-notification" , false);
	}
    }
});

var AboutPage = GObject.registerClass({
    GTypeName: "AboutPage",
},
class AboutPage extends NotebookPage {

    _init (settings) {
        super._init(_("About"));
        this.settings = settings;

        let releaseVersion = Me.metadata["version"];
        let projectName = Me.metadata["name"];
        let projectDescription = Me.metadata["description"];
        let projectUrl = Me.metadata["url"];
        let logoPath = Me.path + "/icons/logo.svg";
        let [imageWidth, imageHeight] = [128, 128];
        let pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_size(logoPath, imageWidth, imageHeight);
        let menuImage = new Gtk.Image();
        menuImage.set_from_pixbuf(pixbuf);
        let menuImageBox = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL});
        menuImageBox.append(menuImage);

        // Create the info box
        let menuInfoBox = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL});
        let menuLabel = new Gtk.Label({
            label: "<b>Panel Indicators</b>",
            use_markup: true,
        });
        let versionLabel = new Gtk.Label({
            label: "<b>" + _("Version: ") + releaseVersion + "</b>",
            use_markup: true,
        });
        let projectDescriptionLabel = new Gtk.Label({
            label: "\n" + _(projectDescription),
        });
        let helpLabel = new Gtk.Label({
            label: "\n" + _("If something breaks, don\'t hesitate to leave a comment at "),
        });
        let projectLinkButton = new Gtk.LinkButton({
            label: _("Webpage/Github"),
            uri: projectUrl,
        });
        menuInfoBox.append(menuLabel);
        menuInfoBox.append(versionLabel);
        menuInfoBox.append(projectDescriptionLabel);
        menuInfoBox.append(helpLabel);
        menuInfoBox.append(projectLinkButton);

        let authorLabel = new Gtk.Label({
            label: _("This extension is a fork of Extend Panel Menu, thanks to julio641742"),
            justify: Gtk.Justification.CENTER,
        });

        // Create the GNU software box
        let gnuSofwareLabel = new Gtk.Label({
            label: '<span size="small">This program comes with ABSOLUTELY NO WARRANTY.\n' +
                'See the <a href="http://www.gnu.org/licenses/gpl-3.0.html">GNU General Public License version 3</a> for details.</span>',
            use_markup: true,
            justify: Gtk.Justification.CENTER,
        });
        let gnuSofwareLabelBox = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL});
        gnuSofwareLabelBox.append(gnuSofwareLabel);

        this.append(menuImageBox);
        this.append(menuInfoBox);
        this.append(authorLabel);
        this.append(gnuSofwareLabelBox);
    }
});

function buildPrefsWidget() {
    let widget = new PrefsWidget();
    widget.show();

    return widget;
}


