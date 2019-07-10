const {existsSync, readFileSync} = require('fs')
const Telegraf = require('telegraf')

const stickers = require('./lib/stickers')

const partGenerate = require('./parts/generate')

const {Extra} = Telegraf

const stickerApiWarning = '\n\n⚠️ The Telegram Sticker API seems slow sometimes. The official documentation contains "wait up to an hour".'

const tokenFilePath = existsSync('/run/secrets') ? '/run/secrets/bot-token.txt' : 'bot-token.txt'
const token = readFileSync(tokenFilePath, 'utf8').trim()
const bot = new Telegraf(token)

if (process.env.NODE_ENV !== 'production') {
  bot.use(async (ctx, next) => {
    const identifier = `${new Date().toISOString()} ${ctx.from && ctx.from.first_name} ${ctx.updateType}`
    console.time(identifier)
    await next()
    const callbackData = ctx.callbackQuery && ctx.callbackQuery.data
    const inlineQuery = ctx.inlineQuery && ctx.inlineQuery.query
    const messageText = ctx.message && ctx.message.text
    const data = callbackData || inlineQuery || messageText
    if (data) {
      const indexOfNewLine = data.indexOf('\n')
      const length = indexOfNewLine >= 0 ? Math.min(indexOfNewLine, 50) : 50
      console.timeLog(identifier, data && data.length, data && data.substr(0, length))
    } else {
      console.timeLog(identifier)
    }
  })
}

bot.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    if (error.message.indexOf('Too Many Requests') >= 0) {
      console.log('Telegraf Too Many Requests error. Skip.', error)
      return
    }

    console.log('try to send error to user', error)
    let text = '🔥 Something went wrong here!'

    text += '\n'
    text += '\nError: `'
    text += error.message
    text += '`'

    text += stickerApiWarning

    const target = (ctx.chat && ctx.chat.id) || ctx.from.id
    return ctx.tg.sendMessage(target, text, Extra.markdown())
  }
})

bot.command('start', async ctx => {
  const {isNew, data} = await stickers.initStickerpack(ctx)
  const firstSticker = data.stickers[0].file_id

  const stickerMessage = await ctx.replyWithSticker(firstSticker)
  const extra = Extra.inReplyTo(stickerMessage.message_id)

  let text = ''
  if (isNew) {
    text += 'I created you your own sticker set!'
  } else {
    text += 'You already have your own sticker set.'
  }

  text += '\n\n' + helpText()

  return ctx.reply(text, extra)
})

bot.command([
  'admin',
  'delete',
  'edit',
  'move',
  'settings'
], ctx => {
  let text = 'Use the offical @Stickers for that.'

  text += stickerApiWarning

  return ctx.reply(text)
})

bot.use(partGenerate.bot)

bot.use(ctx => ctx.replyWithMarkdown(`Hey ${ctx.from.first_name}!\n` + helpText()))

function helpText() {
  let text = ''
  text += 'In order to create some stickers send me a text or use /random.'

  return text
}

bot.catch(error => {
  console.error('Telegraf Error', error.response || error)
})

bot.startPolling()
