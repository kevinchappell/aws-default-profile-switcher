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
    return Object.entries(profileCreds).reduce((acc, [key, val]) => acc + '[' + key + ']\n' + stringifyCreds(val) + '\n', '');
}
function stringifyCreds(creds) {
    return Object.entries(creds).reduce((acc, [key, val]) => acc + key + ' = ' + val + '\n', '');
}

const toTitleCaseLowers =
'a an and as at but by for for from in into near nor of on onto or the to with'.split(
    ' ',
);

function toTitleCase(str) {

    const lowers = toTitleCaseLowers.map(lower => '\\s' + lower + '\\s');
    const regexString = '(?!' + lowers.join('|') + '})\\w\\S*';
    const regex = new RegExp(regexString, 'g');
    return str.replace(
        regex,
        txt =>
            txt.charAt(0).toUpperCase() +
  txt.substr(1).replace(/[A-Z]/g, word => ' ' + word),
    );
}
