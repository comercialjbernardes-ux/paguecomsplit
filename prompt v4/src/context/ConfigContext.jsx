/**
 * ConfigContext — Persistência de parametrizações do dashboard.
 * Tabs: Vendedores, Comissionamento, Metas.
 */
import { createContext, useContext, useState, useCallback } from 'react'

const STORAGE_KEY = 'vf_config'

const DEFAULT_CONFIG = {
  // Metas mensais por vendedor (id → valor)
  metasCustomizadas: {},
  // Comissão base por vendedor (id → pct)
  comissoesCustomizadas: {},
  // Bônus por vendedor (id → pct)
  bonusCustomizados: {},
  // Meta global padrão quando não há personalização
  metaGlobalPadrao: 160000,
  // Comissão base padrão
  comissaoBasePadrao: 3.5,
  // Bônus padrão
  bonusPadrao: 1.5,
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONFIG
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_CONFIG
  }
}

function saveConfig(cfg) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
}

const ConfigContext = createContext(null)

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(() => loadConfig())

  const updateConfig = useCallback((partial) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial }
      saveConfig(next)
      return next
    })
  }, [])

  const setMetaVendedor = useCallback((id, valor) => {
    setConfig((prev) => {
      const next = { ...prev, metasCustomizadas: { ...prev.metasCustomizadas, [id]: valor } }
      saveConfig(next)
      return next
    })
  }, [])

  const setComissaoVendedor = useCallback((id, pct) => {
    setConfig((prev) => {
      const next = { ...prev, comissoesCustomizadas: { ...prev.comissoesCustomizadas, [id]: pct } }
      saveConfig(next)
      return next
    })
  }, [])

  const setBonusVendedor = useCallback((id, pct) => {
    setConfig((prev) => {
      const next = { ...prev, bonusCustomizados: { ...prev.bonusCustomizados, [id]: pct } }
      saveConfig(next)
      return next
    })
  }, [])

  const resetConfig = useCallback(() => {
    saveConfig(DEFAULT_CONFIG)
    setConfig(DEFAULT_CONFIG)
  }, [])

  return (
    <ConfigContext.Provider value={{ config, updateConfig, setMetaVendedor, setComissaoVendedor, setBonusVendedor, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used inside ConfigProvider')
  return ctx
}

export default ConfigContext
