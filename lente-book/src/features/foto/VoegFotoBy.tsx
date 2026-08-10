import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
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
import { useNavigate } from 'react-router-dom'

import {
  db,
  storage,
} from '../../lib/firebase'

import { useAuth } from '../auth/AuthContext'
import CompactHero from '../../components/ui/CompactHero'
import {
  fallbackProfileAvatar,
  resolveProfileAvatar,
  stableProfileAvatarId,
} from '../../lib/profileAvatars'
import styles from './VoegFotoBy.module.css'
import { completeChallenge } from '../../lib/challengeProgress'
import ChallengeSuccess from '../challenges/ChallengeSuccess'

const MAX_SIZE = 10 * 1024 * 1024
const PHOTO_FRAME_COLOUR = '#fbf7ef'

function cleanFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
}

type VoegFotoByProps = { challengeMode?: boolean }

export default function VoegFotoBy({ challengeMode = false }: VoegFotoByProps) {
  const previewStageRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
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

  const [uploading, setUploading] =
    useState(false)

  const [sharing, setSharing] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [challengeCompleted, setChallengeCompleted] = useState(false)

  const [fieldErrors, setFieldErrors] = useState({
    photo: '',
    word: '',
  })

  const creatorAvatar = profile?.useGooglePhoto
    ? user?.photoURL ?? profile.googlePhoto ?? fallbackProfileAvatar(profile.uid)
    : resolveProfileAvatar(profile?.character) ?? fallbackProfileAvatar(profile?.uid)

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

  useEffect(() => {
    const previewStage = previewStageRef.current
    if (!previewStage) return

    let frame = 0
    const syncGrass = () => {
      frame = 0
      const bounds = previewStage.getBoundingClientRect()
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return
      previewStage.style.setProperty('--grass-scroll-y', `${-bounds.top}px`)
    }
    const requestSync = () => {
      if (!frame) frame = window.requestAnimationFrame(syncGrass)
    }

    syncGrass()
    window.addEventListener('scroll', requestSync, { passive: true })
    window.addEventListener('resize', requestSync)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestSync)
      window.removeEventListener('resize', requestSync)
    }
  }, [])

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
    setFieldErrors((current) => ({ ...current, photo: '' }))
  }

  const uploadPhoto = async () => {
    const nextErrors = {
      photo: file ? '' : 'Neem eers ’n foto vir jou raam.',
      word: word.trim() ? '' : 'Gee jou foto eers ’n nuwe woord.',
    }
    setFieldErrors(nextErrors)

    if (nextErrors.photo || nextErrors.word) {
      setMessage('Voltooi die twee gemerkte stappe en probeer weer.')
      return
    }

    if (!file || !user || !profile) {
      setMessage('Ons kon nie jou profiel kry nie. Probeer asseblief weer.')
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
        profile.useGooglePhoto
          ? user.photoURL ?? profile.googlePhoto ?? ''
          : stableProfileAvatarId(profile.character)

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

          frameColour: PHOTO_FRAME_COLOUR,
          approved: false,

          createdAt:
            serverTimestamp(),
        },
      )

      setFile(null)
      setWord('')
      setFieldErrors({ photo: '', word: '' })
      if (challengeMode) {
        await completeChallenge(user.uid, 'photo', true)
        setChallengeCompleted(true)
      } else {
        navigate('/', { replace: true, state: { photoUploaded: true } })
      }
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

  const sharePhoto = async () => {
    if (!file) {
      setFieldErrors((current) => ({
        ...current,
        photo: 'Neem eers ’n foto voordat jy dit deel.',
      }))
      setMessage('Jou foto is nog nie gereed om te deel nie.')
      return
    }

    const shareData: ShareData = {
      title: word.trim() || 'My Lente Book-foto',
      text: word.trim()
        ? `Kyk na my Lente Book-foto: ${word.trim()}`
        : 'Kyk na my Lente Book-foto!',
      files: [file],
    }

    if (!navigator.share || (navigator.canShare && !navigator.canShare(shareData))) {
      setMessage('Hierdie toestel kan nie die foto direk deel nie. Probeer dit op jou foon.')
      return
    }

    setSharing(true)
    setMessage('')
    try {
      await navigator.share(shareData)
      setMessage('Foto gedeel — jy kan dit nou op die muur plaas!')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      console.error('Photo share failed:', error)
      setMessage('Die foto kon nie gedeel word nie. Probeer asseblief weer.')
    } finally {
      setSharing(false)
    }
  }

  return (
    <section className={styles.page}>
      {challengeCompleted && <ChallengeSuccess challengeId="photo" icon="📸" title="Oomblik gedoop!" text="Jou feesfoto het nou sy eie woord en jou Foto-doop-plakkaat is verdien." />}
      <CompactHero
        kicker={challengeMode ? '04 · FOTO-DOOP' : '★ Foto-doop ★'}
        title={challengeMode ? 'Doop jou feesoomblik' : 'Voeg ’n Foto By'}
        subtitle="Vang die oomblik, gee dit ’n woord en plaas dit op die muur."
      />

      <div className={styles.wrap}>
        <div className={styles.kaart} data-scroll-reveal="scale">
          <div
            ref={previewStageRef}
            className={styles.previewStage}
            style={{ '--grass-scroll-y': '0px' } as CSSProperties}
          >
            <figure className={styles.editorFrame}>
              <label className={styles.dropzone}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Foto-voorskou" className={styles.voorskou} />
                ) : (
                  <span className={styles.dropTeks}>
                    <span aria-hidden="true">📸</span>
                    <strong>Kies jou feesfoto</strong>
                    <small>Tik om jou eie foto by te voeg</small>
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={selectPhoto}
                  className={styles.versteek}
                />
                <span className={styles.changePhoto}>{previewUrl ? 'Neem weer' : 'Maak kamera oop'}</span>
              </label>
              <figcaption>
                <strong>{word.trim() || 'JOU WOORD'}</strong>
                <span className={styles.photoUser}>
                  <img src={creatorAvatar ?? ''} alt="" />
                  <span>{profile?.username ?? '@jy'}</span>
                </span>
              </figcaption>
            </figure>
            <p className={styles.previewHint}>So sal jou raam op die fotomuur lyk.</p>
            {fieldErrors.photo && (
              <p className={styles.fieldError} role="alert">
                <span aria-hidden="true">!</span>
                {fieldErrors.photo}
              </p>
            )}
          </div>

          <div className={styles.controls}>
            <div className={styles.controlHeading}>
              <span>01</span>
              <div><small>Maak dit joune</small><h2>Doop die oomblik</h2></div>
            </div>

            <label className={styles.fieldLabel}>
              Jou nuwe woord
              {fieldErrors.word && (
                <span id="photo-word-error" className={styles.inputError} role="alert">
                  {fieldErrors.word}
                </span>
              )}
              <input className={styles.veld} value={word} placeholder="Gee dit ’n woord…" maxLength={40} onChange={(event) => setWord(event.target.value)} />
            </label>

            <span className={styles.as}>Geplaas as {profile?.username}</span>

            <button className={styles.deel} disabled={sharing || uploading} onClick={() => void sharePhoto()}>
              {sharing ? 'Maak deelvenster oop...' : 'Deel eers'}
            </button>

            <button className={styles.plaas} disabled={uploading} onClick={() => void uploadPhoto()}>
              {uploading ? 'Laai foto op...' : 'Plaas op die muur'}
            </button>

            {message && <p className={styles.message}>{message}</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
