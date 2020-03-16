module.exports.isAdministrator = (guildMember) => {
    if (!guildMember.hasPermission('ADMINISTRATOR')) {
        return false
    }

    return true
}

module.exports.getArgs = (message) => {
    const args = message.split(' ')
    args.shift()

    return args
}

module.exports.mode = (arr) => {
    return arr.sort((a, b) =>
        arr.filter(v => v === a).length
        - arr.filter(v => v === b).length
    ).pop();
}