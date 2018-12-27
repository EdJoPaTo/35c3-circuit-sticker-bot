const util = require('util')
const childProcess = require('child_process')

const Telegraf = require('telegraf')

const stickers = require('../lib/stickers')
const {generateStandalone} = require('../lib/memories')

const {Extra, Markup} = Telegraf
const exec = util.promisify(childProcess.exec)

const bot = new Telegraf.Composer()

bot.command('random', ctx => createAndReplyPossibleSticker(ctx))
bot.action('random', ctx => createAndReplyPossibleSticker(ctx))

bot.on('text', ctx => createAndReplyPossibleSticker(ctx, ctx.message.text))
bot.action(/^text-(.+)$/, ctx => createAndReplyPossibleSticker(ctx, ctx.match[1].replace('\\n', '\n')))

async function createAndReplyPossibleSticker(ctx, text = '') {
  generateStandalone(text)
  await exec('inkscape -z -D -w 512 -e "possible-sticker.png" "output.svg"')

  const extra = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('Try another random', 'random', text !== ''),
    Markup.callbackButton('Try the same text again', 'text-' + text.replace('\n', '\\n'), text === ''),
    Markup.callbackButton('Add to your sticker set', 'add-sticker')
  ], {
    columns: 1
  }))

  return ctx.replyWithDocument({source: 'possible-sticker.png'}, extra)
}

bot.action('add-sticker', async ctx => {
  const fileId = ctx.callbackQuery.message.document.file_id

  await stickers.add(ctx, '👾', fileId)

  const result = await stickers.getStickerSet(ctx)
  const lastSticker = result.stickers.slice(-1)[0]

  const stickerMessage = await ctx.replyWithSticker(lastSticker.file_id, Extra.inReplyTo(ctx.callbackQuery.message.message_id))

  return Promise.all([
    ctx.editMessageReplyMarkup(),
    ctx.reply('Here is your new sticker.\n\n⚠️ Your sticker set will be up to date within an hour.', Extra.inReplyTo(stickerMessage.message_id)),
    ctx.answerCbQuery()
  ])
})

module.exports = {
  bot
}
