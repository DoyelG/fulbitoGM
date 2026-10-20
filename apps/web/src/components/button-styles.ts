export type ButtonVariant = 'primary' | 'secondary'

const base =
  'inline-flex justify-center rounded-md border py-2 px-4 text-sm font-medium shadow-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500'

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-brand text-white hover:bg-brand/90',
  secondary: 'border-gray-300 bg-white text-black hover:bg-gray-50',
}

export function buttonClasses(variant: ButtonVariant = 'primary', className = '') {
  return `${base} ${variantStyles[variant]} ${className}`.trim()
}
