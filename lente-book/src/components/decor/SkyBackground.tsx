import styles from './SkyBackground.module.css'

const hide = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = 'none'
}

export default function SkyBackground() {
  return (
    <div className={styles.sky} aria-hidden="true">
      <img src="/elements/cloud1.webp" onError={hide} className={`${styles.cloud} ${styles.bob}`}
           style={{ top: '6%', left: '-4%', width: 180 }} />
      <img src="/elements/cloud3.webp" onError={hide} className={`${styles.cloud} ${styles.bob}`}
           style={{ top: '22%', right: '-6%', width: 260, animationDelay: '1.2s' }} />
      <img src="/elements/cloud2.webp" onError={hide} className={`${styles.cloud} ${styles.bob}`}
           style={{ bottom: '10%', left: '2%', width: 150, animationDelay: '2s' }} />
      <img src="/elements/star1.webp" onError={hide} className={`${styles.star} ${styles.twinkle}`}
           style={{ top: '14%', right: '12%', width: 34 }} />
      <img src="/elements/star2.webp" onError={hide} className={`${styles.star} ${styles.twinkle}`}
           style={{ top: '40%', left: '8%', width: 22, animationDelay: '1s' }} />
    </div>
  )
}