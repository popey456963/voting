require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

function mode(arr) {
  return arr.sort((a, b) =>
    arr.filter(v => v === a).length
    - arr.filter(v => v === b).length
  ).pop();
}

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

const ballots = {}

bot.on('message', msg => {
  const channel = msg.channel.id
  const guildMember = msg.guild.member(msg.author.id)

  args = msg.content.split(' ')
  args.shift()

  console.log(`${msg.author.username}: ${msg.content}`)

  if (msg.content.startsWith('/ballot')) {
    if (args.length < 2) {
      return msg.reply(`Start a ballot with: /ballot <target> <target2> <target3>
Vote on a ballot item with /exclude <target>
End a voting round with /round`)
    }

    if (!guildMember.hasPermission('ADMINISTRATOR')) {
      return msg.reply(`Only administrators can use this command.`)
    }

    msg.channel.send(`Starting an anti-ballot with ${args.length} entries: ${args.join(', ')}.  Vote with \`/exclude <item>\``)
    ballots[channel] = {
      targets: args,
      round: 1,
      votes: {},
      running: true
    }
  } else if (msg.content.startsWith('/exclude')) {
    if (args.length < 1) {
      return msg.reply(`Usage: /exclude <target>`)
    }

    if (!(channel in ballots) || !ballots[channel].running) {
      return msg.reply(`Afraid there is no ballot running for this channel at the moment.`)
    }

    if (!ballots[channel].targets.find(a => a === args[0])) {
      return msg.reply(`That item wasn't found`)
    }

    ballots[channel].votes[msg.author.id] = args[0]
    msg.reply(`Accepted vote!`)
  } else if (msg.content.startsWith('/round')) {
    if (!(channel in ballots) || !ballots[channel].running) {
      return msg.reply(`Afraid there is no ballot running for this channel at the moment.`)
    }

    if (!guildMember.hasPermission('ADMINISTRATOR')) {
      return msg.reply(`Only administrators can use this command.`)
    }

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
      return msg.channel.send(`We have a winner! ${ballots[channel].targets[0]}`)
      ballots[channel].running = false
    } else {
      return msg.channel.send(`We are onto round ${ballots[channel].round} of voting.  Participants: ${ballots[channel].targets.join(', ')}`)
    }
  }
});
