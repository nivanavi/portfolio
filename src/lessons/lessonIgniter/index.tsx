import React, {useContext} from 'react';

export type SceneIgniterContext = {
  canvas: HTMLCanvasElement;
}

const SceneIgniterContext = React.createContext<SceneIgniterContext>({} as SceneIgniterContext);
export const useSceneIgniterContext = () => useContext(SceneIgniterContext);

export const SceneIgniterContextProvider: React.FC = (props) => {
  const {children} = props;
  const refCanvas = React.useRef<HTMLCanvasElement | null>(null)
  const [stateCanvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (!refCanvas.current) return;
    setCanvas(refCanvas.current);
  }, [])

  const contextValue: SceneIgniterContext = {
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