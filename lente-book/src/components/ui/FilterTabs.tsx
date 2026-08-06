import styles from './FilterTabs.module.css'

type Props = { opsies: { sleutel: string; etiket: string }[]; aktief: string; opKies: (s: string) => void }

export default function FilterTabs({ opsies, aktief, opKies }: Props) {
  return (
    <div className={styles.tabs}>
      {opsies.map((o) => (
        <button key={o.sleutel} onClick={() => opKies(o.sleutel)}
          className={`${styles.tab} ${aktief === o.sleutel ? styles.aktief : ''}`}>
          {o.etiket}
        </button>
      ))}
    </div>
  )
}