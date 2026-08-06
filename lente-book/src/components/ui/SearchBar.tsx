import styles from './SearchBar.module.css'

type Props = { waarde: string; opVerander: (v: string) => void; plekhouer?: string }

export default function SearchBar({ waarde, opVerander, plekhouer = 'Soek…' }: Props) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>⌕</span>
      <input className={styles.input} value={waarde} type="search"
        onChange={(e) => opVerander(e.target.value)} placeholder={plekhouer} />
    </div>
  )
}