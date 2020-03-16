const Discord = require('discord.js')
require('dotenv').config()

const { getArgs } = require('./utils')
const { startBallot, voteExclude, endRound, stopBallot } = require('./commands')

const bot = new Discord.Client()
bot.login(process.env.TOKEN)

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`)
})

bot.on('message', msg => {
  const args = getArgs(msg.content)

  console.log(`${msg.author.username}: ${msg.content}`)

  if (msg.content.startsWith('/ballot')) return startBallot(msg, args)
  if (msg.content.startsWith('/exclude')) return voteExclude(msg, args)
  if (msg.content.startsWith('/round')) return endRound(msg, args)
  if (msg.content.startsWith('/mirandainvaded')) return stopBallot(msg, args)
});
