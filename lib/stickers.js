let botUsername
async function getBotUsername(tg) {
  if (!botUsername) {
    const me = await tg.getMe()
    botUsername = me.username
  }

  return botUsername
}

async function getStickerSetName(ctx) {
  const username = await getBotUsername(ctx.tg)

  const stickerSetName = `c3memories_${ctx.from.id}_by_${username}`
  const stickerSetPrettyName = `35c3memories of ${ctx.from.first_name}`

  return {
    stickerSetName,
    stickerSetPrettyName
  }
}

async function doesStickerSetExist(tg, name) {
  try {
    const result = await tg.getStickerSet(name)
    return result
  } catch (error) {
    return false
  }
}

async function initStickerpack(ctx) {
  const {stickerSetName, stickerSetPrettyName} = await getStickerSetName(ctx)
  let data = await doesStickerSetExist(ctx.tg, stickerSetName)
  const exists = Boolean(data)
  if (!exists) {
    await ctx.createNewStickerSet(stickerSetName, stickerSetPrettyName, {
      png_sticker: {source: 'base-stickers/35c3transparent.png'},
      emojis: '👾'
    })
    data = await doesStickerSetExist(ctx.tg, stickerSetName)
  }

  return {
    isNew: !exists,
    data
  }
}

async function getStickerSet(ctx) {
  const {stickerSetName} = await getStickerSetName(ctx)
  return doesStickerSetExist(ctx.tg, stickerSetName)
}

async function add(ctx, emojis, pngSticker) {
  const {stickerSetName} = await getStickerSetName(ctx)
  await ctx.addStickerToSet(stickerSetName, {png_sticker: pngSticker, emojis})
}

module.exports = {
  initStickerpack,
  getStickerSet,
  add
}
