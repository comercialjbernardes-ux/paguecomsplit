/**
 * Skeleton — placeholders animados para estados de carregamento.
 * Requer a classe .skeleton definida em index.css.
 */

export function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }) {
  return <div className={`skeleton rounded ${width} ${height} ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="card p-6 space-y-3">
      <SkeletonLine width="w-1/2" height="h-3" />
      <SkeletonLine width="w-3/4" height="h-8" />
      <SkeletonLine width="w-1/3" height="h-3" />
    </div>
  )
}

export function SkeletonTableRow({ cols = 5 }) {
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

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} cols={cols} />
      ))}
    </>
  )
}

export function SkeletonChart({ height = 280 }) {
  return (
    <div className="space-y-2" style={{ height }}>
      <div className="flex items-end gap-2 h-full px-4 pb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 skeleton rounded-t"
            style={{ height: `${45 + (i * 13) % 55}%` }}
          />
        ))}
      </div>
    </div>
  )
}
