import { useLocalStorage } from "../hooks/useLocalStorage";
import { Box } from "./Box";

export const CollapseableBox = ({ children, title, forceOpen, saveState, saveStateKey }:
  {
    children: React.ReactNode,
    title?: string,
    forceOpen?: boolean,
    saveState?: boolean,
    saveStateKey?: string
  }) => {
  const [isOpen, setIsOpen] = useLocalStorage(saveStateKey ?? title ?? 'collapseable-box', true, saveState && !forceOpen);

  function toggleOpen() {
    setIsOpen(!isOpen)
  }

  return <Box className="px-0! py-0!">
    <button title={isOpen ? "Collapse" : "Expand"} onClick={toggleOpen} disabled={forceOpen} className="w-full  disabled:cursor-not-allowed flex flex-row min-h-12 px-6 py-4 hover:bg-tuna-700 items-center">
      <div className="">
        {title && <h2 className="text-tuna-400 font-semibold uppercase">{title}</h2>}
      </div>
    </button>
    {(isOpen || forceOpen) && <div className="px-6 py-4">{children}</div>}
  </Box>
}