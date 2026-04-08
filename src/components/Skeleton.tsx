/**
 * Skeleton loading components.
 * Usa a animação `shimmer` definida em index.css.
 * Altura dos skeletons = altura real dos elementos que substituem.
 */

interface SkeletonLineProps {
  width?: string
  height?: string
  className?: string
}

export function SkeletonLine({
  width = 'w-full',
  height = 'h-4',
  className = '',
}: SkeletonLineProps) {
  return <div className={`skeleton rounded ${width} ${height} ${className}`} />
}

/** Skeleton de um card KPI (equivalente ao card p-6 com valor grande) */
export function SkeletonCard() {
  return (
    <div className="card p-6 space-y-3">
      <SkeletonLine width="w-1/2" height="h-3" />
      <SkeletonLine width="w-3/4" height="h-8" />
      <SkeletonLine width="w-1/3" height="h-3" />
    </div>
  )
}

/** Skeleton de uma linha de tabela */
export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-[#E2E8F0]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <SkeletonLine height="h-4" />
        </td>
      ))}
    </tr>
  )
}

/** Skeleton de N linhas de tabela */
export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} cols={cols} />
      ))}
    </>
  )
}

/** Skeleton de área de gráfico */
export function SkeletonChart({ height = 280 }: { height?: number }) {
  return (
    <div className="space-y-2" style={{ height }}>
      <div className="flex items-end gap-2 h-full px-4 pb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-1 skeleton rounded-t" style={{ height: `${40 + Math.random() * 60}%` }} />
        ))}
      </div>
    </div>
  )
}
