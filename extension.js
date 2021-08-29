const Main = imports.ui.main;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const St = imports.gi.St;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();
// const parseIniString = Me.imports.utils.parseIniString;
// const stringifyCreds = Me.imports.utils.stringifyCreds;
// const stringifyProfileCreds = Me.imports.utils.stringifyProfileCreds;
// const toTitleCase = Me.imports.utils.toTitleCase;

let myPopup;


function getAwsNamedProfiles() {
    const [ok, out, err, exit] = GLib.spawn_command_line_sync('aws configure list-profiles');
    return out.toString().split('\n').reduce((acc, profileName) => {

        if (profileName && profileName !== 'default') {
            // acc.push(toTitleCase(profileName));
            acc.push(profileName);
        }
        return acc;
    }, []);
}

// function getAwsCredentials() {
//     const [ok, out, err, exit] = GLib.spawn_command_line_sync('cat < $HOME/.aws/credentials');
//     return parseIniString(out.toString());
// }

// function setDefaultProfile(profileName) {
//     const {default: _, [profileName]: profileCreds, ...restCreds } = getAwsCredentials();
//     const updatedCredentialsFile = `${stringifyProfileCreds(restCreds)}[default]\n${stringifyCreds(profileCreds)}`;
//     GLib.spawn_command_line_sync('cat < $HOME/.aws/credentials');
//     return updatedCredentialsFile;
// }

function awsProfileMenuItem(profileName) {
    const menuItem = new PopupMenu.PopupMenuItem(profileName);
    menuItem.connect('activate', () => {
        log('setDefaultProfile(profileName)');
        // log(setDefaultProfile(profileName));
    });
    return menuItem;
}


const MyPopup = GObject.registerClass(
    class MyPopup extends PanelMenu.Button {


        _init() {

            super._init(0);

            const icon = new St.Icon({
                gicon : Gio.icon_new_for_string( Me.dir.get_path() + '/aws-iam-logo.svg' ),
                style_class : 'system-status-icon',
            });

            this.add_child(icon);

            // AWS profiles menu
            let subItem = new PopupMenu.PopupSubMenuMenuItem('Profiles');
            this.menu.addMenuItem(subItem);
            const awsProfiles = getAwsNamedProfiles();
            log('opened');
            awsProfiles.forEach(profileName => {
                log(profileName);
                subItem.menu.addMenuItem( new PopupMenu.PopupMenuItem(profileName) );
                // subItem.menu.addMenuItem( awsProfileMenuItem(profileName) );
            });

            // image item
            const popupImageMenuItem = new PopupMenu.PopupImageMenuItem(
                'Menu Item with Icon',
                'emblem-default-symbolic',
            );
            this.menu.addMenuItem(popupImageMenuItem);

            this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem() );

            this.menu.connect('open-state-changed', (menu, open) => {
                if (open) {
                    log('opened');
                } else {
                    log('closed');
                }
            });
        }

    });

function init() {
}

function enable() {
    myPopup = new MyPopup();
    Main.panel.addToStatusArea('myPopup', myPopup, 1);
}

function disable() {
    myPopup.destroy();
}


















function parseIniString(data) {
    let regex = {
        section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
        param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
        comment: /^\s*;.*$/
    };
    let value = {};
    let lines = data.split(/[\r\n]+/);
    let section = null;
    lines.forEach(line => {
        if (regex.comment.test(line)) {

        } else if (regex.param.test(line)) {
            const match = line.match(regex.param);
            if (section) {
                value[section][match[1]] = match[2];
            } else {
                value[match[1]] = match[2];
            }
        } else if (regex.section.test(line)) {
            const match = line.match(regex.section);
            value[match[1]] = {};
            section = match[1];
        } else if (line.length == 0 && section) {
            section = null;
        }
    });
    return value;
}

function stringifyProfileCreds(profileCreds) {
    return Object.entries(profileCreds).reduce((acc, [key, val]) => `${acc}[${key}]\n${stringifyCreds(val)}\n\n`, '');
}
function stringifyCreds(creds) {
    return Object.entries(creds).reduce((acc, [key, val]) => `${acc}${key} = ${val}\n`, '');
}



const toTitleCaseLowers =
'a an and as at but by for for from in into near nor of on onto or the to with'.split(
    ' ',
);

function toTitleCase(str) {
    const lowers = toTitleCaseLowers.map(lower => `\\s${lower}\\s`);
    const regex = new RegExp(`(?!${lowers.join('|')})\\w\\S*`, 'g');
    return str.replace(
        regex,
        txt =>
            txt.charAt(0).toUpperCase() +
    txt.substr(1).replace(/[A-Z]/g, word => ` ${word}`),
    );
}
