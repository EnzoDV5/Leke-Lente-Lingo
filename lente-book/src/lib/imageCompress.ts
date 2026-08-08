export type CompressOptions = {
  maxSize?: number
  quality?: number
  type?: 'image/jpeg' | 'image/webp'
}

export type CompressedImage = {
  blob: Blob
  dataUrl: string
  width: number
  height: number
}

/**
 * Skaal 'n foto af na maxSize en her-kodeer dit as WebP/JPEG.
 * Gee 'n blob (vir Firebase Storage) en 'n dataUrl (vir 'n vinnige voorskou).
 */
export async function compressImage(
  file: File,
  { maxSize = 1280, quality = 0.82, type = 'image/webp' }: CompressOptions = {},
): Promise<CompressedImage> {
  const sourceUrl = await readAsDataUrl(file)
  const image = await loadImage(sourceUrl)

  let width = image.width
  let height = image.height

  if (width > height && width > maxSize) {
    height = Math.round((height * maxSize) / width)
    width = maxSize
  } else if (height >= width && height > maxSize) {
    width = Math.round((width * maxSize) / height)
    height = maxSize
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Kon nie die foto verwerk nie.')
  }

  context.drawImage(image, 0, 0, width, height)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result
          ? resolve(result)
          : reject(new Error('Kon nie die foto stoor nie.')),
      type,
      quality,
    )
  })

  return {
    blob,
    dataUrl: canvas.toDataURL(type, quality),
    width,
    height,
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Kon nie die lêer lees nie.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Kon nie die beeld laai nie.'))
    image.src = src
  })
}
