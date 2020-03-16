const { mode, isAdministrator } = require('./utils')

const ballots = {}

async function removeReply(msg, reply, timeout = 30000) {
    const message = await msg.reply(reply + ' ▱▱▱')

    for (let i = 0; i < 2; i++) {
        setTimeout(async () => {
            await message.edit(message.content.slice(0, -4) + ' ' + '▰'.repeat(i + 1) + '▱'.repeat(2 - i))
        }, timeout * (i + 1) / 3)
    }

    return (await message).delete(timeout)
}

module.exports.startBallot = async (msg, args) => {
    const channel = msg.channel.id
    const guildMember = msg.guild.member(msg.author.id)

    await msg.delete(0)

    if (args.length < 2) {
        return removeReply(msg, `Start a ballot with: /ballot <target> <target2> <target3>
Vote on a ballot item with /exclude <target>
End a voting round with /round`)
    }

    if (!isAdministrator(guildMember)) return removeReply(msg, `Only administrators can use this command.`)

    msg.channel.send(`Starting an anti-ballot with ${args.length} entries: ${args.join(', ')}.  Vote with \`/exclude <item>\``)
    ballots[channel] = {
        targets: args,
        round: 1,
        votes: {},
        running: true,
        remove: []
    }
}

module.exports.voteExclude = async (msg, args) => {
    const channel = msg.channel.id

    await msg.delete(0)

    if (args.length < 1) {
        return removeReply(msg, `Usage: /exclude <target>`)
    }

    if (!(channel in ballots) || !ballots[channel].running) {
        return removeReply(msg, `Afraid there is no ballot running for this channel at the moment.`)
    }

    if (!ballots[channel].targets.find(a => a === args[0])) {
        return removeReply(msg, `That item wasn't found`)
    }

    ballots[channel].votes[msg.author.id] = args[0]
    const response = await msg.reply(`Accepted vote for ${args[0]}!`)
    ballots[channel].remove.push(response)
}

module.exports.endRound = async (msg, args) => {
    const channel = msg.channel.id
    const guildMember = msg.guild.member(msg.author.id)

    if (!(channel in ballots) || !ballots[channel].running) {
        return removeReply(msg, `Afraid there is no ballot running for this channel at the moment.`)
    }

    if (!guildMember.hasPermission('ADMINISTRATOR')) {
        return removeReply(msg, `Only administrators can use this command.`)
    }

    await msg.delete(0)

    ballots[channel].round += 1
    const excluded = mode(Object.values(ballots[channel].votes))
    const index = ballots[channel].targets.findIndex(a => a === excluded)
    const person = ballots[channel].targets.find(a => a === excluded)
    if (index > -1) {
        ballots[channel].targets.splice(index, 1);
    } else {
        console.log('thing not found???')
    }

    if (ballots[channel].targets.length === 1) {
        ballots[channel].running = false
        for (let message of ballots[channel].remove) {
            await message.delete(0)
        }
        ballots[channel].remove = []
        return msg.reply(`ended the last round.  We have a winner! ${ballots[channel].targets[0]}`)
    } else {
        const message = await msg.reply(`ended the round.  We are onto round ${ballots[channel].round} of voting.  Participants: ${ballots[channel].targets.join(', ')}`)
        ballots[channel].remove.push(message)
    }
}

module.exports.stopBallot = async (msg, args) => {
    const channel = msg.channel.id
    const guildMember = msg.guild.member(msg.author.id)

    await msg.delete(0)

    if (!guildMember.hasPermission('ADMINISTRATOR')) {
        return removeReply(msg, `Only administrators can use this command.`)
    }

    ballots[channel].running = false
    return msg.reply(`Your will be done, this ballot has ended.`)
}