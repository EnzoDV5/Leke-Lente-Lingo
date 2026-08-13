import TextLoop from '../ui/TextLoop'
import styles from './Marquee.module.css'

export default function Marquee() {
  return (
    <TextLoop
      className={styles.loop}
      text="Lentedag 2026 · 16 September · Lente Book · Gee jou woord ’n opstem · Pretoria"
      shape="wave"
      speed={58}
      direction="forward"
      separator="✦"
      curviness={21}
      fontSize={30}
      fontWeight={800}
      letterSpacing={2}
      uppercase
      color="#16150f"
      ribbon
      ribbonColor="#f2e23e"
      ribbonWidth={48}
      underlayColor="#fbf7ef"
      pauseOnHover={false}
    />
  )
}
