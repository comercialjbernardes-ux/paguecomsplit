import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main
          style={{
            marginTop: 64,
            padding: 24,
            background: '#F7F8FA',
            minHeight: 'calc(100vh - 64px)',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
