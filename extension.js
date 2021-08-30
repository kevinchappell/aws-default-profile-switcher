#!/usr/bin/env gjs
const {main: Main, panelMenu: PanelMenu, popupMenu: PopupMenu} = imports.ui;
const {GLib, GObject, Gio, St, Clutter} = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const {parseIniString, stringifyCreds, stringifyProfileCreds, toTitleCase} = Me.imports.utils;
const byteArray = imports.byteArray

let awsProfileSwitcher, activeAwsProfile, awsProfileLabel;
let panelButton, panelButtonText, timeout;
let allProfileCredentials;

const CREDENTIALS_FILE = GLib.get_home_dir() + '/.aws/credentials'

function getActiveAwsProfile() {
    const accessKeys = Object.entries(allProfileCredentials).reduce((acc, [key, {aws_access_key_id}]) => {
        acc[key] = aws_access_key_id
        return acc;
    }, {});
    const [activeProfile] = Object.entries(accessKeys).find(([key, val]) => key !== 'default' && val === accessKeys.default)
    return toTitleCase(activeProfile);
}

function getAwsNamedProfiles() {
    return Object.keys(getAwsCredentials()).filter(profileName => profileName !== 'default');
}

function getAwsCredentials() {
    const [ok, contents] = GLib.file_get_contents(CREDENTIALS_FILE)
    return ok && parseIniString(byteArray.toString(contents))
}

function setDefaultProfile(profileName) {
    const restCreds = Object.entries(allProfileCredentials).reduce((acc, [key, val]) => {
        if (key !== 'default') {
            acc[key] = val;
        }
        return acc;
    }, {});
    const profileCreds = allProfileCredentials[profileName];
    const updatedCredentialsFile = stringifyProfileCreds(restCreds) + '[default]\n' + stringifyCreds(profileCreds);
    activeAwsProfile.label.set_text(toTitleCase(profileName));
    GLib.file_set_contents(CREDENTIALS_FILE, updatedCredentialsFile);
}

function awsProfileMenuItem(profileName) {
    const menuItem = new PopupMenu.PopupMenuItem(toTitleCase(profileName));
    menuItem.connect('activate', () => setDefaultProfile(profileName));
    return menuItem;
}


const AwsProfileSwitcher = GObject.registerClass(
    class MyPopup extends PanelMenu.Button {

        _init() {
            super._init(0);

            const icon = new St.Icon({
                gicon : Gio.icon_new_for_string( Me.dir.get_path() + '/aws-iam-logo.svg' ),
                style_class : 'system-status-icon',
            });

            this.add_child(icon);

            // AWS profiles menu
            const subItem = new PopupMenu.PopupSubMenuMenuItem('Profiles');
            this.menu.addMenuItem(subItem);
            const awsProfiles = getAwsNamedProfiles();
            awsProfiles.forEach(profileName => {
                subItem.menu.addMenuItem(awsProfileMenuItem(profileName));
            });

            // Active AWS profile
            activeAwsProfile = new PopupMenu.PopupImageMenuItem(getActiveAwsProfile(), 'emblem-default-symbolic');
            this.menu.addMenuItem(activeAwsProfile);
        }

    });

function enable() {
    allProfileCredentials = getAwsCredentials();
    awsProfileSwitcher = new AwsProfileSwitcher();
    Main.panel.addToStatusArea('awsProfileSwitcher', awsProfileSwitcher, 1);
}

function disable() {
    allProfileCredentials = null;
    awsProfileSwitcher.destroy();
}
