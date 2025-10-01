import React from "react";
import type { CodeVersion } from "../types";
import { getCodeVersions } from "../utils/codeVersions";

interface VersionModalProps {
    show: boolean;
    onClose: () => void;
    onLoadVersion: (version: CodeVersion) => void;
}

export const VersionModal: React.FC<VersionModalProps> = ({ show, onClose, onLoadVersion }) => {
    if (!show) return null;

    const versions = getCodeVersions();

    return (
        <div className="fixed inset-0 bg-tuna-900/75 flex items-center justify-center z-50">
            <div className="bg-tuna-700 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-lg font-semibold">Code Versions</h3>
                    <button onClick={onClose} className=" hover:text-tuna-600 " type="button">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {versions.length === 0 ? (
                        <div className="text-center py-8">
                            <p>No saved versions yet.</p>
                            <p className="text-sm mt-2">Versions will be saved automatically when you run backtests with different code.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {versions.map((version, index) => (
                                <div key={version.id} className="bg-tuna-600 rounded-lg p-4 hover:bg-tuna-500">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-medium">
                                                Version {versions.length - index}
                                                {index === 0 && <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">Latest</span>}
                                            </h4>
                                            <p className="text-sm text-tuna-300">{version.description}</p>
                                        </div>
                                        <button
                                            onClick={() => onLoadVersion(version)}
                                            className="px-3 py-1 text-sm bg-teal-400 text-tuna-900 rounded hover:bg-teal-700 transition-colors "
                                            type="button"
                                        >
                                            Load
                                        </button>
                                    </div>
                                    <div className="bg-tuna-100 rounded p-3">
                                        <pre className="text-xs text-tuna-700 whitespace-pre-wrap">
                                            {version.code.slice(0, 300)}
                                            {version.code.length > 300 ? "..." : ""}
                                        </pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
