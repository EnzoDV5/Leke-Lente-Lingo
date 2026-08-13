import heroBackground from '../assets/elements/cloud-background.webp'
import campaignLogo from '../assets/elements/Leke-lente-lingo.webp'

type FriendChallengeShareInput = {
  phrase: string
  inviterUsername: string
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = source
  })
}

function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.width, height / image.height)
  const sourceWidth = width / scale
  const sourceHeight = height / scale
  context.drawImage(image, (image.width - sourceWidth) / 2, (image.height - sourceHeight) / 2, sourceWidth, sourceHeight, x, y, width, height)
}

function drawContain(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.min(width / image.width, height / image.height)
  const renderedWidth = image.width * scale
  const renderedHeight = image.height * scale
  context.drawImage(image, x + (width - renderedWidth) / 2, y + (height - renderedHeight) / 2, renderedWidth, renderedHeight)
}

function wrappedLines(context: CanvasRenderingContext2D, text: string, maximumWidth: number) {
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let line = ''
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word
    if (line && context.measureText(candidate).width > maximumWidth) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  })
  if (line) lines.push(line)
  return lines
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Die uitnodigingsprent kon nie geskep word nie.')),
      'image/jpeg',
      .94,
    )
  })
}

export async function createFriendChallengeShare({ phrase, inviterUsername }: FriendChallengeShareInput) {
  await document.fonts?.ready
  const [background, logo] = await Promise.all([loadImage(heroBackground), loadImage(campaignLogo)])
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1080
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Die uitnodigingsprent kon nie geskep word nie.')

  drawCover(context, background, 0, 0, canvas.width, canvas.height)
  const wash = context.createLinearGradient(0, 0, 0, canvas.height)
  wash.addColorStop(0, 'rgba(18, 94, 193, .04)')
  wash.addColorStop(1, 'rgba(5, 68, 160, .34)')
  context.fillStyle = wash
  context.fillRect(0, 0, canvas.width, canvas.height)
  drawContain(context, logo, 310, 55, 460, 210)

  const kicker = 'CHALLENGE ’N CHOMMIE'
  context.font = '900 30px "ltr-ncnd-variable", Arial, sans-serif'
  const kickerWidth = context.measureText(kicker).width + 70
  const kickerX = (canvas.width - kickerWidth) / 2
  context.fillStyle = '#f2c230'
  context.strokeStyle = '#16150f'
  context.lineWidth = 7
  context.beginPath()
  context.roundRect(kickerX, 270, kickerWidth, 68, 34)
  context.fill()
  context.stroke()
  context.fillStyle = '#16150f'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(kicker, canvas.width / 2, 306)

  context.fillStyle = '#fff'
  context.font = '800 34px "itc-american-typewriter", Georgia, serif'
  context.shadowColor = '#16150f'
  context.shadowOffsetX = 2
  context.shadowOffsetY = 3
  context.fillText(`${inviterUsername || '@jou_maat'} daag jou uit om hierdie oomblik te doop:`, canvas.width / 2, 395, 940)

  let phraseSize = 88
  let lines: string[] = []
  do {
    context.font = `500 ${phraseSize}px "brush-up", "Arial Black", sans-serif`
    lines = wrappedLines(context, phrase, 900)
    if (lines.length <= 5) break
    phraseSize -= 6
  } while (phraseSize > 52)

  const lineHeight = phraseSize * .98
  let lineY = 670 - (lines.length * lineHeight) / 2
  context.lineJoin = 'round'
  context.strokeStyle = '#16150f'
  context.lineWidth = 10
  context.fillStyle = '#fbf7ef'
  context.shadowColor = '#e8432b'
  context.shadowOffsetX = 7
  context.shadowOffsetY = 9
  lines.forEach((line) => {
    const displayLine = line.toLocaleUpperCase('af-ZA')
    context.strokeText(displayLine, canvas.width / 2, lineY, 930)
    context.fillText(displayLine, canvas.width / 2, lineY, 930)
    lineY += lineHeight
  })

  context.shadowColor = 'transparent'
  context.fillStyle = '#fbf7ef'
  context.font = '800 32px "itc-american-typewriter", Georgia, serif'
  context.fillText('Kliek die skakel en skep ’n woord wat nog nie bestaan nie.', canvas.width / 2, 955, 940)

  const blob = await canvasToBlob(canvas)
  return new File([blob], 'challenge-n-chommie-uitnodiging.jpg', { type: 'image/jpeg' })
}
