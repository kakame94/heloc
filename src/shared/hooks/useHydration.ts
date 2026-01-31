/**
 * PlexInvest V2 - Hook anti-hydration mismatch
 *
 * Gère la synchronisation entre le rendu serveur et client
 */

'use client'

import { useState, useEffect } from 'react'
import { usePlexStore } from '@/stores'

/**
 * Hook pour vérifier si le store est hydraté
 * Évite les erreurs de mismatch entre SSR et client
 */
export function useHydration(): boolean {
  const [isHydrated, setIsHydrated] = useState(false)
  const storeHydrated = usePlexStore((state) => state._hasHydrated)

  useEffect(() => {
    // Le composant est monté côté client
    setIsHydrated(true)
  }, [])

  // Retourner true seulement quand les deux sont prêts
  return isHydrated && storeHydrated
}

/**
 * Hook pour utiliser des valeurs côté client uniquement
 * Retourne la valeur serveur pendant le SSR, puis la valeur client après hydratation
 */
export function useClientValue<T>(serverValue: T, clientValue: T): T {
  const isHydrated = useHydration()
  return isHydrated ? clientValue : serverValue
}

/**
 * Hook pour différer le rendu d'un composant jusqu'à l'hydratation
 */
export function useDeferredRender(): {
  isReady: boolean
  isMounted: boolean
} {
  const [isMounted, setIsMounted] = useState(false)
  const isHydrated = useHydration()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return {
    isReady: isMounted && isHydrated,
    isMounted,
  }
}

/**
 * Hook pour accéder au localStorage de manière sécurisée
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const isHydrated = useHydration()

  useEffect(() => {
    if (!isHydrated) return

    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.warn(`Erreur lecture localStorage[${key}]:`, error)
    }
  }, [key, isHydrated])

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.warn(`Erreur écriture localStorage[${key}]:`, error)
    }
  }

  return [storedValue, setValue]
}
