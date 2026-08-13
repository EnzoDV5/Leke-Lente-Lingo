import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { createPortal } from 'react-dom'

import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
  where,
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
import styles from './FotoDoopPage.module.css'
import { completeChallenge } from '../../lib/challengeProgress'
import { createBrandedPhotoShare, type BrandedPhotoShareFormat } from '../../lib/brandedPhotoShare'
import ChallengeSuccess from '../challenges/ChallengeSuccess'
import { useScannedPosterClaim } from '../../hooks/useScannedPosterClaim'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { useScrollSyncedBackground } from '../../hooks/useScrollSyncedBackground'

const MAX_SIZE = 10 * 1024 * 1024
const PHOTO_FRAME_COLOUR = '#fbf7ef'

function cleanFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
}

type FotoDoopPageProps = { challengeMode?: boolean }

type ExistingPhoto = {
  id: string
  word: string
  storagePath: string
  downloadUrl: string
  createdAt: Timestamp | null
  updatedAt?: Timestamp | null
}

export default function FotoDoopPage({ challengeMode = false }: FotoDoopPageProps) {
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

  const [existingPhoto, setExistingPhoto] =
    useState<ExistingPhoto | null>(null)

  const hydratedPhotoId =
    useRef<string | null>(null)

  const [word, setWord] =
    useState('')

  const [uploading, setUploading] =
    useState(false)

  const [sharing, setSharing] =
    useState(false)

  const [sharePickerOpen, setSharePickerOpen] =
    useState(false)

  useBodyScrollLock(sharePickerOpen)

  useEffect(() => {
    if (!sharePickerOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSharePickerOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [sharePickerOpen])

  const [message, setMessage] =
    useState('')

  const [challengeCompleted, setChallengeCompleted] = useState(false)

  const [fieldErrors, setFieldErrors] = useState({
    photo: '',
    word: '',
  })

  const creatorAvatar =
    resolveProfileAvatar(profile?.character) ?? fallbackProfileAvatar(profile?.uid)
  const displayedPreviewUrl =
    previewUrl ?? existingPhoto?.downloadUrl ?? null
  const photoReady = Boolean(displayedPreviewUrl && word.trim())
  const { claimed: previouslyCompletedClaimed } = useScannedPosterClaim(user?.uid, 'photo', challengeMode)

  useEffect(() => {
    if (!user) {
      setExistingPhoto(null)
      hydratedPhotoId.current = null
      return
    }

    return onSnapshot(
      query(
        collection(db, 'photos'),
        where('createdByUid', '==', user.uid),
      ),
      (snapshot) => {
        const latest = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }) as ExistingPhoto)
          .sort((first, second) => (
            second.updatedAt?.toMillis?.() ??
            second.createdAt?.toMillis?.() ??
            0
          ) - (
            first.updatedAt?.toMillis?.() ??
            first.createdAt?.toMillis?.() ??
            0
          ))[0] ?? null

        setExistingPhoto(latest)

        if (
          latest &&
          hydratedPhotoId.current !== latest.id
        ) {
          hydratedPhotoId.current = latest.id
          setWord(latest.word ?? '')
        }
      },
      (error) => {
        console.error('Existing photo load failed:', error)
        setMessage('Ons kon nie jou bestaande foto laai nie.')
      },
    )
  }, [user])

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

  useScrollSyncedBackground(true, previewStageRef)

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
      photo: displayedPreviewUrl ? '' : 'Neem eers ’n foto vir jou raam.',
      word: word.trim() ? '' : 'Gee jou foto eers ’n nuwe woord.',
    }
    setFieldErrors(nextErrors)

    if (nextErrors.photo || nextErrors.word) {
      setMessage('Voltooi die twee gemerkte stappe en probeer weer.')
      return
    }

    if (!user || !profile || !displayedPreviewUrl) {
      setMessage('Ons kon nie jou profiel kry nie. Probeer asseblief weer.')
      return
    }

    setUploading(true)
    setMessage('')

    const fileName = file
      ? `${Date.now()}-${cleanFileName(file.name)}`
      : ''
    const nextStoragePath = file
      ? `photoWall/${user.uid}/${fileName}`
      : existingPhoto?.storagePath ?? ''
    const storageReference = file
      ? ref(storage, nextStoragePath)
      : null
    let photoSaved = false

    try {
      let downloadUrl = existingPhoto?.downloadUrl ?? ''

      if (file && storageReference) {
        await uploadBytes(
          storageReference,
          file,
          {
            contentType: file.type,
          },
        )

        downloadUrl = await getDownloadURL(
          storageReference,
        )
      }

      const avatar =
        stableProfileAvatarId(profile.character)
      const cleanWord = word.trim()
      const photoDocumentId =
        existingPhoto?.id ?? user.uid
      const photoReference = doc(
        db,
        'photos',
        photoDocumentId,
      )

      await setDoc(
        photoReference,
        {
          word: cleanWord,

          storagePath: nextStoragePath,
          downloadUrl,

          createdByUid: user.uid,
          createdByUsername:
            profile.username,
          createdByAvatar: avatar,

          frameColour: PHOTO_FRAME_COLOUR,
          approved: false,

          ...(!existingPhoto
            ? { createdAt: serverTimestamp() }
            : {}),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      photoSaved = true

      await completeChallenge(user.uid, 'photo', challengeMode, {
        kind: 'photo',
        word: cleanWord,
        photoUrl: downloadUrl,
        itemId: photoDocumentId,
      })

      if (
        file &&
        existingPhoto?.storagePath &&
        existingPhoto.storagePath !== nextStoragePath
      ) {
        try {
          await deleteObject(
            ref(storage, existingPhoto.storagePath),
          )
        } catch (cleanupError) {
          console.warn('Old photo cleanup failed:', cleanupError)
        }
      }

      setFile(null)
      setFieldErrors({ photo: '', word: '' })
      if (challengeMode) {
        setChallengeCompleted(true)
      } else {
        navigate('/', {
          replace: true,
          state: {
            photoUploaded: true,
            photoId: photoDocumentId,
          },
        })
      }
    } catch (error) {
      console.error(
        'Photo upload failed:',
        error,
      )

      if (storageReference && !photoSaved) {
        try {
          await deleteObject(
            storageReference,
          )
        } catch {
          // No newly uploaded file to remove.
        }
      }

      setMessage(
        'Die foto kon nie opgelaai word nie.',
      )
    } finally {
      setUploading(false)
    }
  }

  const sharePhoto = async (format: BrandedPhotoShareFormat) => {
    if (!displayedPreviewUrl || !word.trim()) {
      setFieldErrors((current) => ({
        ...current,
        photo: displayedPreviewUrl ? '' : 'Neem eers ’n foto voordat jy dit deel.',
        word: word.trim() ? '' : 'Gee jou foto eers ’n nuwe woord.',
      }))
      setMessage('Kies ’n foto en gee dit ’n woord voordat jy dit deel.')
      return
    }

    setSharePickerOpen(false)
    setSharing(true)
    setMessage('')
    try {
      let photoForShare = file

      if (!photoForShare && existingPhoto?.downloadUrl) {
        const response = await fetch(existingPhoto.downloadUrl)
        if (!response.ok) {
          throw new Error('Die bestaande foto kon nie afgelaai word nie.')
        }

        const blob = await response.blob()
        photoForShare = new File(
          [blob],
          'lente-feesfoto.jpg',
          { type: blob.type || 'image/jpeg' },
        )
      }

      if (!photoForShare) {
        throw new Error('Kies eers ’n foto.')
      }

      const brandedPhoto = await createBrandedPhotoShare({
        photo: photoForShare,
        word,
        username: profile?.username ?? '@jy',
        avatarUrl: creatorAvatar,
        format,
      })
      const cleanWord = word.trim()
      const displayWord = cleanWord ? `“${cleanWord}”` : 'My Lentedag-oomblik'
      const shareMessage = cleanWord
        ? `Ek het hierdie Lentedag-oomblik ${displayWord} gedoop! 🌼📸\n\nWat sou jy dit noem? Skep jou eie Leke Lente Lingo-woord hier:\n${window.location.origin}`
        : `Kyk na my Lentedag-oomblik! 🌼📸\n\nWat sou jy dit noem? Skep jou eie Leke Lente Lingo-woord hier:\n${window.location.origin}`
      const shareData: ShareData = {
        title: `${displayWord} · Leke Lente Lingo`,
        text: shareMessage,
        files: [brandedPhoto],
      }
      const canShareFile = navigator.canShare?.({ files: [brandedPhoto] }) ?? false

      if (navigator.share && canShareFile) {
        await navigator.share(shareData)
        setMessage(format === 'story' ? 'Jou Instagram Story-prent is gereed om by jou storie te voeg!' : 'Jou vierkantige Leke Lente Lingo-feeskaart is gedeel!')
      } else {
        const downloadUrl = URL.createObjectURL(brandedPhoto)
        const download = document.createElement('a')
        download.href = downloadUrl
        download.download = brandedPhoto.name
        download.click()
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
        setMessage(format === 'story' ? 'Jou Story-prent is afgelaai. Voeg dit nou by jou Instagram- of WhatsApp-storie.' : 'Jou vierkantige feeskaart is afgelaai en gereed vir WhatsApp of enige ander app.')
      }
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
      {previouslyCompletedClaimed && <ChallengeSuccess challengeId="photo" icon="📸" unlockOnly title="Foto-doop ontsluit!" text="Jy het reeds ’n oomblik gedoop, so hierdie QR-kode het jou poster onmiddellik ontsluit." />}
      {challengeCompleted && <ChallengeSuccess challengeId="photo" icon="📸" title="Oomblik gedoop!" text="Jou feesfoto het nou sy eie woord en jou Foto-doop-poster is verdien." />}
      {sharePickerOpen && createPortal(
        <div className={styles.shareBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSharePickerOpen(false)}>
          <section className={styles.sharePicker} role="dialog" aria-modal="true" aria-labelledby="share-format-title">
            <button type="button" className={styles.shareClose} onClick={() => setSharePickerOpen(false)} aria-label="Maak deelkeuse toe">×</button>
            <small>KIES JOU FORMAAT</small>
            <h2 id="share-format-title">Waar wil jy dit deel?</h2>
            <p>Ons maak die regte Leke Lente Lingo-raam vir jou.</p>
            <div className={styles.shareChoices}>
              <button type="button" onClick={() => void sharePhoto('square')}>
                <span className={styles.squareFormat} aria-hidden="true"><i /></span>
                <span><strong>WhatsApp & Deel</strong><small>Vierkantige feeskaart</small></span>
              </button>
              <button type="button" onClick={() => void sharePhoto('story')}>
                <span className={styles.storyFormat} aria-hidden="true"><i /></span>
                <span><strong>Instagram Story</strong><small>Volskerm 9:16-storie</small></span>
              </button>
            </div>
          </section>
        </div>,
        document.body,
      )}
      <CompactHero
        kicker={challengeMode ? '04 · FOTO-DOOP' : '★ Foto-doop ★'}
        title={challengeMode ? 'Doop jou feesoomblik' : 'Voeg ’n Foto By'}
        subtitle="Vang die oomblik, gee dit ’n woord en sit dit op die oomblikmuur."
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
                {displayedPreviewUrl ? (
                  <img src={displayedPreviewUrl} alt="Foto-voorskou" className={styles.voorskou} />
                ) : (
                  <span className={styles.dropTeks}>
                    <span aria-hidden="true">📸</span>
                    <strong>Kies jou feesfoto</strong>
                    <small>Kliek om ’n foto by te voeg</small>
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={selectPhoto}
                  className={styles.versteek}
                />
                <span className={styles.changePhoto}>{displayedPreviewUrl ? 'Neem weer' : 'Kies foto'}</span>
              </label>
              <figcaption>
                <strong>{word.trim() || 'JOU WOORD'}</strong>
                <span className={styles.photoUser}>
                  <img src={creatorAvatar ?? ''} alt="" />
                  <span>{profile?.username ?? '@jy'}</span>
                </span>
              </figcaption>
            </figure>
            <p className={styles.previewHint}>Jou plek op die oomblikmuur.</p>
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

            <span className={styles.as}>Ingesit as {profile?.username}</span>

            <div className={styles.actions}>
              <button className={styles.deel} disabled={!photoReady || sharing || uploading} onClick={() => setSharePickerOpen(true)} aria-label={sharing ? 'Maak deelprent' : 'Kies hoe om die foto te deel'} title={photoReady ? 'Kies jou deelformaat' : 'Kies ’n foto en gee dit eers ’n woord'}>
                {sharing ? <span className={styles.shareLoading} aria-hidden="true" /> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V3m0 0L7 8m5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>}
              </button>
              <button className={styles.plaas} disabled={!photoReady || uploading} onClick={() => void uploadPhoto()} title={photoReady ? 'Plak op die oomblikmuur' : 'Kies ’n foto en gee dit eers ’n woord'}>
                {uploading ? 'Laai op...' : 'Plak'}
              </button>
            </div>

            {message && <p className={styles.message}>{message}</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
