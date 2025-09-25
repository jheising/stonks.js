import React from 'react'
import type { CodeVersion } from '../types'
import { getCodeVersions } from '../utils/codeVersions'

interface VersionModalProps {
  show: boolean
  onClose: () => void
  onLoadVersion: (version: CodeVersion) => void
}

export const VersionModal: React.FC<VersionModalProps> = ({
  show,
  onClose,
  onLoadVersion
}) => {
  if (!show) return null

  const versions = getCodeVersions()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Code Versions</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {versions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No saved versions yet.</p>
              <p className="text-sm mt-2">Versions will be saved automatically when you run backtests with different code.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div key={version.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Version {versions.length - index}
                        {index === 0 && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Latest</span>}
                      </h4>
                      <p className="text-sm text-gray-600">{version.description}</p>
                    </div>
                    <button
                      onClick={() => onLoadVersion(version)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
                      type="button"
                    >
                      Load
                    </button>
                  </div>
                  <div className="bg-gray-100 rounded p-3">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {version.code.slice(0, 300)}{version.code.length > 300 ? '...' : ''}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
