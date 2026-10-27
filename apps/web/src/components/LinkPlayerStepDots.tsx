type LinkPlayerStepDotsProps = {
  current: number
  total: number
}

export default function LinkPlayerStepDots({ current, total }: LinkPlayerStepDotsProps) {
  return (
    <div role="img" aria-label={`Paso ${current} de ${total}`} className="mb-5 flex justify-center gap-2">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          aria-hidden
          className={`h-1.5 rounded-full transition-all duration-300 ${
            index + 1 === current ? 'w-8 bg-brand' : index + 1 < current ? 'w-4 bg-brand/50' : 'w-4 bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}
