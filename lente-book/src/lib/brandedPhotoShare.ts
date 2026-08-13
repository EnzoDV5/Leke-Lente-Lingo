import paperGrain from '../assets/elements/paper-grain.webp'
import squareShareFrame from '../assets/elements/poster elements/Leke-Lente-Lingo-square-transparent.webp'
import storyShareFrame from '../assets/elements/poster elements/Leke-Lente-Lingo-instagram-story-transparent.webp'

export type BrandedPhotoShareFormat = 'square' | 'story'

type BrandedPhotoShareInput = {
  photo: File
  word: string
  username: string
  avatarUrl?: string | null
  format?: BrandedPhotoShareFormat
}

type ShareLayout = {
  width: number
  height: number
  frame: string
  photoWindow: { x: number; y: number; width: number; height: number }
  nameplate: { y: number; width: number; height: number }
}

const LAYOUTS: Record<BrandedPhotoShareFormat, ShareLayout> = {
  square: {
    width: 1080,
    height: 1080,
    frame: squareShareFrame,
    photoWindow: { x: 138, y: 198, width: 804, height: 664 },
    nameplate: { y: 830, width: 590, height: 92 },
  },
  story: {
    width: 1080,
    height: 1920,
    frame: storyShareFrame,
    photoWindow: { x: 145, y: 278, width: 790, height: 1438 },
    nameplate: { y: 1595, width: 620, height: 112 },
  },
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = source
  })
}

function roundedRectangle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath()
  context.roundRect(x, y, width, height, Math.min(radius, width / 2, height / 2))
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource & { width: number; height: number },
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.width, height / image.height)
  const sourceWidth = width / scale
  const sourceHeight = height / scale
  const sourceX = (image.width - sourceWidth) / 2
  const sourceY = (image.height - sourceHeight) / 2
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
}

function drawPhoto(
  context: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  grain: HTMLImageElement,
  window: ShareLayout['photoWindow'],
) {
  context.save()
  roundedRectangle(context, window.x, window.y, window.width, window.height, 22)
  context.clip()

  // Crop from the centre so portrait and landscape photos always fill the
  // complete photo opening in both the square and Story share templates.
  drawCover(context, photo, window.x, window.y, window.width, window.height)

  context.globalAlpha = .16
  context.globalCompositeOperation = 'multiply'
  drawCover(context, grain, window.x, window.y, window.width, window.height)
  context.globalCompositeOperation = 'source-over'
  context.globalAlpha = 1
  context.restore()
}

function drawNameplate(
  context: CanvasRenderingContext2D,
  layout: ShareLayout,
  word: string,
  username: string,
  avatar: HTMLImageElement | null,
) {
  const { y, width: maximumWidth, height } = layout.nameplate
  const displayWord = (word.trim() || 'MY FEESOOMBlik').toLocaleUpperCase('af-ZA')
  const clippedWord = displayWord.length > 25 ? `${displayWord.slice(0, 24)}…` : displayWord
  const displayUsername = (username || '@jy').slice(0, 24)
  const wordFontSize = Math.round(height * .34)
  const usernameFontSize = Math.round(height * .2)
  const avatarSize = height * .66
  const avatarSpace = avatar ? 20 + avatarSize + 20 : 30

  context.font = `900 ${wordFontSize}px "Arial Black", Arial, sans-serif`
  const wordWidth = context.measureText(clippedWord).width
  context.font = `800 ${usernameFontSize}px Arial, sans-serif`
  const usernameWidth = context.measureText(displayUsername).width

  const minimumWidth = layout.height === 1920 ? 440 : 390
  const width = Math.min(
    maximumWidth,
    Math.max(minimumWidth, Math.ceil(avatarSpace + Math.max(wordWidth, usernameWidth) + 24)),
  )
  const x = (layout.width - width) / 2

  context.save()
  context.shadowColor = 'rgba(20,18,12,.4)'
  context.shadowOffsetX = 9
  context.shadowOffsetY = 11
  context.fillStyle = '#fbf7ef'
  roundedRectangle(context, x, y, width, height, height / 2)
  context.fill()
  context.shadowColor = 'transparent'
  context.strokeStyle = '#16150f'
  context.lineWidth = 5
  context.stroke()

  const avatarX = x + 20
  const avatarY = y + (height - avatarSize) / 2
  let textX = x + 30

  if (avatar) {
    context.save()
    context.beginPath()
    context.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
    context.clip()
    drawCover(context, avatar, avatarX, avatarY, avatarSize, avatarSize)
    context.restore()
    context.strokeStyle = '#ed4924'
    context.lineWidth = 4
    context.beginPath()
    context.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
    context.stroke()
    textX = avatarX + avatarSize + 20
  }

  context.fillStyle = '#16150f'
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.font = `900 ${wordFontSize}px "Arial Black", Arial, sans-serif`
  context.fillText(clippedWord, textX, y + height * .39, x + width - textX - 24)

  context.fillStyle = '#d73c26'
  context.font = `800 ${usernameFontSize}px Arial, sans-serif`
  context.fillText(displayUsername, textX, y + height * .72, x + width - textX - 24)
  context.restore()
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Die deelprent kon nie geskep word nie.')),
      'image/jpeg',
      .94,
    )
  })
}

export async function createBrandedPhotoShare({
  photo,
  word,
  username,
  avatarUrl,
  format = 'square',
}: BrandedPhotoShareInput) {
  await document.fonts?.ready

  const layout = LAYOUTS[format]
  const photoUrl = URL.createObjectURL(photo)
  try {
    const [photoImage, frameImage, grainImage, avatarImage] = await Promise.all([
      loadImage(photoUrl),
      loadImage(layout.frame),
      loadImage(paperGrain),
      avatarUrl ? loadImage(avatarUrl).catch(() => null) : Promise.resolve(null),
    ])

    const canvas = document.createElement('canvas')
    canvas.width = layout.width
    canvas.height = layout.height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Die deelprent kon nie geskep word nie.')

    context.fillStyle = '#ec4f99'
    context.fillRect(0, 0, layout.width, layout.height)
    drawPhoto(context, photoImage, grainImage, layout.photoWindow)
    context.drawImage(frameImage, 0, 0, layout.width, layout.height)
    drawNameplate(context, layout, word, username, avatarImage)

    const blob = await canvasToBlob(canvas)
    const safeWord = (word.trim() || 'feesfoto')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    return new File(
      [blob],
      `leke-lente-lingo-${safeWord || 'feesfoto'}-${format}.jpg`,
      { type: 'image/jpeg' },
    )
  } finally {
    URL.revokeObjectURL(photoUrl)
  }
}
