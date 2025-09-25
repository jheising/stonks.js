import type { CodeVersion } from '../types'
import { STORAGE_KEYS } from '../constants/storage'

// Get stored code versions
export const getCodeVersions = (): CodeVersion[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CODE_VERSIONS)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save code versions to localStorage
export const saveCodeVersions = (versions: CodeVersion[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CODE_VERSIONS, JSON.stringify(versions))
  } catch (error) {
    console.error('Failed to save code versions:', error)
  }
}

// Save current code as a new version if it's different
export const saveCodeVersion = (codeToSave: string) => {
  const versions = getCodeVersions()
  const trimmedCode = codeToSave.trim()
  
  // Check if this exact code already exists in any previous version
  const codeExists = versions.some(version => version.code === trimmedCode)
  if (codeExists) {
    return // Code already exists, don't save duplicate
  }

  // Create new version
  const newVersion: CodeVersion = {
    id: Date.now().toString(),
    code: trimmedCode,
    timestamp: Date.now(),
    description: `Version from ${new Date().toLocaleString()}`
  }

  // Add to beginning of array and limit to 100 versions
  const updatedVersions = [newVersion, ...versions].slice(0, 100)
  saveCodeVersions(updatedVersions)
}
