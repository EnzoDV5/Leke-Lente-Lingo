export default function Placeholder({ titel }: { titel: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-4xl text-paper">{titel}</h1>
      <p className="mt-3 text-paper/90">Hierdie deel bou ons binnekort.</p>
    </div>
  )
}