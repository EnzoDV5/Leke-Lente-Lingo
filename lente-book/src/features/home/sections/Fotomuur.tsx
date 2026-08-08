import type {
  CSSProperties,
} from 'react'

import {
  useLiveWordCount,
} from '../../../hooks/useLiveWords'

import {
  useLivePhotos,
  type LivePhoto,
} from '../../../hooks/useLivePhotos'

import styles from './Fotomuur.module.css'

type PhotoStyle =
  CSSProperties & {
    '--x': string
    '--y': string
    '--rotation': string
    '--scale': string
    '--layer': number
  }

/*
 * Creates a repeatable random position from
 * the Firestore photo ID. The photographs
 * will not jump around on every render.
 */
function createNumberFromText(
  text: string,
) {
  let value = 0

  for (
    let index = 0;
    index < text.length;
    index += 1
  ) {
    value =
      (value * 31 +
        text.charCodeAt(index)) >>>
      0
  }

  return value
}

function randomFromSeed(seed: number) {
  const value = Math.sin(seed) * 10000

  return value - Math.floor(value)
}

function createPhotoStyle(
  photo: LivePhoto,
  index: number,
): PhotoStyle {
  const seed =
    createNumberFromText(photo.id) +
    index * 107

  /*
   * Some photographs are intentionally close
   * to the edges so the wall feels cropped
   * and filled beyond the screen.
   */
  const x =
    3 +
    randomFromSeed(seed + 1) * 94

  const y =
    8 +
    randomFromSeed(seed + 2) * 84

  const rotation =
    -16 +
    randomFromSeed(seed + 3) * 32

  const scale =
    0.76 +
    randomFromSeed(seed + 4) * 0.48

  const layer =
    2 +
    Math.floor(
      randomFromSeed(seed + 5) * 11,
    )

  return {
    '--x': `${x}%`,
    '--y': `${y}%`,
    '--rotation': `${rotation}deg`,
    '--scale': `${scale}`,
    '--layer': layer,
  }
}

export default function Fotomuur() {
  const {
    count,
    loading: wordsLoading,
  } = useLiveWordCount()

  const {
    photos,
    loading: photosLoading,
    error,
  } = useLivePhotos()

  /*
   * Limit the first view to 28 photographs
   * so the homepage stays fast.
   */
  const visiblePhotos =
    photos.slice(0, 28)

  return (
    <section className={styles.hero}>
      <div
        className={styles.decorativeStar}
        aria-hidden="true"
      >
        ✦
      </div>

      <div
        className={styles.decorativeStarTwo}
        aria-hidden="true"
      >
        ✧
      </div>

      <div className={styles.wall}>
        {visiblePhotos.map(
          (photo, index) => (
            <figure
              key={photo.id}
              className={
                styles.polaroid
              }
              data-colour={
                photo.frameColour
              }
              style={createPhotoStyle(
                photo,
                index,
              )}
            >
              <img
                src={photo.downloadUrl}
                alt={photo.word}
                className={styles.photo}
                loading="lazy"
              />

              <figcaption
                className={styles.caption}
              >
                <strong
                  className={styles.word}
                >
                  {photo.word}
                </strong>

                <span
                  className={styles.handle}
                >
                  {
                    photo.createdByUsername
                  }
                </span>
              </figcaption>
            </figure>
          ),
        )}
      </div>

      <div className={styles.centre}>
        <img
          src="/element/LENTEDAG-logo2.webp"
          alt="Lentedag"
          className={styles.logo}
        />

        <div className={styles.bookLabel}>
          Lente Book
        </div>

        <p className={styles.counter}>
          {wordsLoading
            ? 'Woorde word getel...'
            : `${count.toLocaleString(
                'af-ZA',
              )} woorde geplak`}
        </p>
      </div>

      {!photosLoading &&
        photos.length === 0 && (
          <div className={styles.empty}>
            <span>📸</span>

            <p>
              Die muur wag vir sy eerste
              foto.
            </p>
          </div>
        )}

      {photosLoading && (
        <p className={styles.loading}>
          Foto’s word opgeplak...
        </p>
      )}

      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}
    </section>
  )
}