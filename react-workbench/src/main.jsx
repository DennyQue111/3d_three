import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import ThreeViewport from './ThreeViewport.jsx'
const Slider = ({ label, value, suffix = '', onChange, min = 0, max = 100, step = 1 }) => (
  <div className="control">
    <label>
      {label}
      <strong>
        {value}
        {suffix}
      </strong>
    </label>
    <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} />
  </div>
)
function App() {
  const [rotation, setRotation] = useState(18),
    [scale, setScale] = useState(1),
    [modelName, setModelName] = useState('默认模型'),
    [selected, setSelected] = useState('model'),
    [focus, setFocus] = useState(0),
    [toast, setToast] = useState('')
  const [lights, setLights] = useState([
    {
      id: 'light-1',
      name: 'Key_Light',
      type: 'directional',
      intensity: 2.1,
      color: '#b5ffe5',
      position: [4, 5, 3],
    },
  ])
  const [cameras, setCameras] = useState([
    { id: 'camera-1', name: 'Camera_01', position: [3.4, 2.4, 5.4] },
  ])
  const activeCamera = cameras.find((c) => c.id === selected) || cameras[0],
    activeLight = lights.find((l) => l.id === selected)
  const flash = (m) => {
    setToast(m)
    setTimeout(() => setToast(''), 1800)
  }
  const updateLight = (key, value) =>
    setLights((a) => a.map((l) => (l.id === activeLight.id ? { ...l, [key]: value } : l)))
  const updateCamera = (axis, value) =>
    setCameras((a) =>
      a.map((c) =>
        c.id === activeCamera.id
          ? {
              ...c,
              position: c.position.map((p, i) => (i === axis ? value : p)),
            }
          : c,
      ),
    )
  const addLight = () => {
    const n = lights.length + 1,
      item = {
        id: `light-${Date.now()}`,
        name: `Light_${n}`,
        type: 'point',
        intensity: 20,
        color: '#ffe4b5',
        position: [-3, 3, 2],
      }
    setLights((a) => [...a, item])
    setSelected(item.id)
  }
  const addCamera = () => {
    const n = cameras.length + 1,
      item = {
        id: `camera-${Date.now()}`,
        name: `Camera_${String(n).padStart(2, '0')}`,
        position: [4, 3, 5],
      }
    setCameras((a) => [...a, item])
    setSelected(item.id)
  }
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="logo" />
        <div className="brand">
          3D THREE <small>Motion Studio</small>
        </div>
        <div className="grow" />
        <button className="neutral" onClick={() => flash('项目保存将在下一阶段接入')}>
          保存草稿
        </button>
        <button className="export" onClick={() => flash('视频导出将在动画阶段接入')}>
          导出视频
        </button>
      </header>
      <main>
        <aside className="panel left-panel">
          <section className="section">
            <h2>资源库</h2>
            <div className="drop-zone">
              <b>导入 3D 模型</b>
              <span>支持 GLB / GLTF</span>
              <button onClick={() => document.getElementById('model-file-picker')?.click()}>
                选择文件
              </button>
            </div>
          </section>
          <section className="section">
            <h2>场景结构</h2>
            <nav className="tree">
              <button
                className={selected === 'model' ? 'active' : ''}
                onClick={() => setSelected('model')}
              >
                <span>◇</span>
                {modelName}
                <small>模型</small>
              </button>
              {lights.map((l) => (
                <button
                  key={l.id}
                  className={selected === l.id ? 'active' : ''}
                  onClick={() => setSelected(l.id)}
                >
                  <span>☼</span>
                  {l.name}
                  <small>灯光</small>
                </button>
              ))}
              {cameras.map((c) => (
                <button
                  key={c.id}
                  className={selected === c.id ? 'active' : ''}
                  onClick={() => setSelected(c.id)}
                >
                  <span>◉</span>
                  {c.name}
                  <small>相机</small>
                </button>
              ))}
            </nav>
          </section>
          <section className="section">
            <h2>快速添加</h2>
            <div className="quick">
              <button onClick={addLight}>＋ 灯光</button>
              <button onClick={addCamera}>＋ 相机</button>
              <button onClick={() => flash('环境编辑将在后续加入')}>＋ 环境</button>
            </div>
          </section>
        </aside>
        <ThreeViewport
          rotation={rotation}
          scale={scale}
          lights={lights}
          cameraConfig={activeCamera}
          focusSignal={focus}
          onModelLoaded={(n) => {
            setModelName(n)
            setSelected('model')
          }}
        />
        <aside className="panel inspector">
          {selected === 'model' ? (
            <section className="section">
              <h2>检查器 · {modelName}</h2>
              <Slider
                label="旋转 Y"
                value={rotation}
                suffix="°"
                min={-180}
                max={180}
                onChange={(e) => setRotation(+e.target.value)}
              />
              <Slider
                label="缩放"
                value={scale.toFixed(2)}
                suffix="×"
                min={0.1}
                max={3}
                step={0.01}
                onChange={(e) => setScale(+e.target.value)}
              />
            </section>
          ) : activeLight ? (
            <section className="section">
              <h2>灯光 · {activeLight.name}</h2>
              <div className="control">
                <label>颜色</label>
                <input
                  type="color"
                  value={activeLight.color}
                  onChange={(e) => updateLight('color', e.target.value)}
                />
              </div>
              <Slider
                label="强度"
                value={activeLight.intensity}
                min={0}
                max={50}
                step={0.1}
                onChange={(e) => updateLight('intensity', +e.target.value)}
              />
            </section>
          ) : (
            <section className="section">
              <h2>相机 · {activeCamera.name}</h2>
              <button className="neutral" onClick={() => setFocus((x) => x + 1)}>
                聚焦模型 / 重置视角
              </button>
              {['X', 'Y', 'Z'].map((n, i) => (
                <Slider
                  key={n}
                  label={`位置 ${n}`}
                  value={activeCamera.position[i]}
                  min={-10}
                  max={10}
                  step={0.1}
                  onChange={(e) => updateCamera(i, +e.target.value)}
                />
              ))}
            </section>
          )}
          <section className="section">
            <h2>后期特效</h2>
            <div className="effects">
              <button className="enabled">Bloom</button>
              <button>DOF</button>
              <button>颗粒</button>
            </div>
          </section>
        </aside>
      </main>
      <footer className="timeline">
        <div className="transport">
          <button className="play">▶</button>
          <span>00:00:00:00</span>
        </div>
        <div className="track-area">
          <div className="ruler">0s　1s　2s　3s　4s　5s　6s</div>
          <i className="playhead" />
          <i className="keyframe" />
        </div>
        <div className="render-status">
          <b>1920 × 1080 · 30 FPS</b>
          <span>● 准备就绪</span>
        </div>
      </footer>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
