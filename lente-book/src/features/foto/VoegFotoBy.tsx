import {
  useEffect,
  useState,
} from 'react'

import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore'

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage'

import {
  db,
  storage,
} from '../../lib/firebase'

import { useAuth } from '../auth/AuthContext'
import styles from './VoegFotoBy.module.css'

const MAX_SIZE = 10 * 1024 * 1024

function cleanFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
}

export default function VoegFotoBy() {
  const {
    user,
    profile,
  } = useAuth()

  const [file, setFile] =
    useState<File | null>(null)

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null)

  const [word, setWord] =
    useState('')

  const [frameColour, setFrameColour] =
    useState('pienk')

  const [uploading, setUploading] =
    useState(false)

  const [message, setMessage] =
    useState('')

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const nextPreviewUrl =
      URL.createObjectURL(file)

    setPreviewUrl(nextPreviewUrl)

    return () => {
      URL.revokeObjectURL(
        nextPreviewUrl,
      )
    }
  }, [file])

  const selectPhoto = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile =
      event.target.files?.[0]

    setMessage('')

    if (!selectedFile) return

    if (
      !selectedFile.type.startsWith(
        'image/',
      )
    ) {
      setMessage(
        'Kies asseblief ’n geldige foto.',
      )

      return
    }

    if (selectedFile.size > MAX_SIZE) {
      setMessage(
        'Die foto moet kleiner as 10 MB wees.',
      )

      return
    }

    setFile(selectedFile)
  }

  const uploadPhoto = async () => {
    if (
      !file ||
      !word.trim() ||
      !user ||
      !profile
    ) {
      return
    }

    setUploading(true)
    setMessage('')

    const fileName =
      `${Date.now()}-${cleanFileName(
        file.name,
      )}`

    const storagePath =
      `photoWall/${user.uid}/${fileName}`

    const storageReference = ref(
      storage,
      storagePath,
    )

    try {
      await uploadBytes(
        storageReference,
        file,
        {
          contentType: file.type,
        },
      )

      const downloadUrl =
        await getDownloadURL(
          storageReference,
        )

      const avatar =
        profile.useGooglePhoto &&
        user.photoURL
          ? user.photoURL
          : profile.character

      await addDoc(
        collection(db, 'photos'),
        {
          word: word.trim(),

          storagePath,
          downloadUrl,

          createdByUid: user.uid,
          createdByUsername:
            profile.username,
          createdByAvatar: avatar,

          frameColour,
          approved: false,

          createdAt:
            serverTimestamp(),
        },
      )

      setFile(null)
      setWord('')
      setFrameColour('pienk')

      setMessage(
        'Jou foto is op die fotomuur!',
      )
    } catch (error) {
      console.error(
        'Photo upload failed:',
        error,
      )

      try {
        await deleteObject(
          storageReference,
        )
      } catch {
        // No uploaded file to remove.
      }

      setMessage(
        'Die foto kon nie opgelaai word nie.',
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className={styles.wrap}>
      <header className={styles.kop}>
        <p className={styles.kicker}>
          ★ Foto-doop ★
        </p>

        <h1 className={styles.titel}>
          Voeg ’n Foto By
        </h1>

        <p className={styles.onder}>
          Vang die oomblik, gee dit ’n
          woord en plaas dit op die muur.
        </p>
      </header>

      <div className={styles.kaart}>
        <label
          className={styles.dropzone}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Foto-voorskou"
              className={styles.voorskou}
            />
          ) : (
            <span
              className={styles.dropTeks}
            >
              📸
              <br />
              Tik om ’n foto te kies
            </span>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={selectPhoto}
            className={styles.versteek}
          />
        </label>

        <input
          className={styles.veld}
          value={word}
          placeholder="Gee dit ’n woord…"
          maxLength={40}
          onChange={(event) =>
            setWord(event.target.value)
          }
        />

        <span className={styles.as}>
          as {profile?.username}
        </span>

        <select
          className={styles.veld}
          value={frameColour}
          onChange={(event) =>
            setFrameColour(
              event.target.value,
            )
          }
        >
          <option value="pienk">
            Pienk raam
          </option>

          <option value="goud">
            Geel raam
          </option>

          <option value="groen">
            Groen raam
          </option>

          <option value="blou">
            Blou raam
          </option>

          <option value="pers">
            Pers raam
          </option>
        </select>

        <button
          className={styles.plaas}
          disabled={
            uploading ||
            !file ||
            !word.trim()
          }
          onClick={() =>
            void uploadPhoto()
          }
        >
          {uploading
            ? 'Laai foto op...'
            : 'Plaas op die muur →'}
        </button>

        {message && <p>{message}</p>}
      </div>
    </section>
  )
}