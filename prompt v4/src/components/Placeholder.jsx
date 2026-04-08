export default function Placeholder({ titulo }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed"
      style={{
        minHeight: 400,
        borderColor: '#E2E8F0',
        background: '#fff',
      }}
    >
      <p style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 600, color: '#0D1B2A', margin: 0 }}>
        {titulo}
      </p>
      <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#6B7280', marginTop: 8 }}>
        Em construção...
      </p>
    </div>
  )
}
