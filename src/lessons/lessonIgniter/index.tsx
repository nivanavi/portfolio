import React, {useContext} from 'react';

export type SceneIgniterContextType = {
  canvas: HTMLCanvasElement;
}

const SceneIgniterContext = React.createContext<SceneIgniterContextType>({} as SceneIgniterContextType);
export const useSceneIgniterContext = () => useContext(SceneIgniterContext);

export const SceneIgniterContextProvider: React.FC = (props) => {
  const {children} = props;
  const refCanvas = React.useRef<HTMLCanvasElement | null>(null)
  const [stateCanvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (!refCanvas.current) return;
    setCanvas(refCanvas.current);
  }, [])

  const contextValue: SceneIgniterContextType = {
    canvas: stateCanvas!
  };

  return (
    <SceneIgniterContext.Provider value={contextValue}>
      <canvas ref={refCanvas}/>
      {stateCanvas ? children : null}
    </SceneIgniterContext.Provider>
  )
};

export default React.memo<React.FC>(SceneIgniterContextProvider);