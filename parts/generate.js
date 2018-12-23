const Telegraf = require('telegraf')

const stickers = require('../lib/stickers')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

bot.command('random', firstAttempt)

bot.on('text', ctx => ctx.reply('TODO create sticker by given text'))

function firstAttempt(ctx) {
  const files = ['base-stickers/1.png', 'base-stickers/2.png']

  const rand = Math.floor(Math.random() * files.length)

  const extra = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('Add to your sticker set', 'add-sticker')
  ]))

  return ctx.replyWithDocument({source: files[rand]}, extra)
}

bot.action('add-sticker', async ctx => {
  const fileId = ctx.callbackQuery.message.document.file_id

  await stickers.add(ctx, '👾', fileId)

  const result = await stickers.getStickerSet(ctx)
  const lastSticker = result.stickers.slice(-1)[0]

  const stickerMessage = await ctx.replyWithSticker(lastSticker.file_id, Extra.inReplyTo(ctx.callbackQuery.message.message_id))

  return Promise.all([
    ctx.editMessageReplyMarkup(),
    ctx.reply('Here is your new sticker. Your sticker set will be up to date within an hour.', Extra.inReplyTo(stickerMessage.message_id)),
    ctx.answerCbQuery()
  ])
})

module.exports = {
  bot
}
