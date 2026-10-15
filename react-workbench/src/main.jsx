import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import ThreeViewport from './ThreeViewport.jsx'

function Slider({ label, value, suffix = '', onChange, min = 0, max = 100, step = 1 }) {
  return (
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
}

function App() {
  const [rotation, setRotation] = useState(18)
  const [scale, setScale] = useState(1)
  const [modelName, setModelName] = useState('默认模型')
  const [selected, setSelected] = useState('model')
  const [focus, setFocus] = useState(0)
  const [toast, setToast] = useState('')
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
  const activeLight = lights.find((item) => item.id === selected)
  const activeCamera = cameras.find((item) => item.id === selected) || cameras[0]
  const flash = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 1800)
  }
  const updateLight = (key, value) =>
    setLights((all) =>
      all.map((item) => (item.id === activeLight.id ? { ...item, [key]: value } : item)),
    )
  const updateCamera = (axis, value) =>
    setCameras((all) =>
      all.map((item) =>
        item.id === activeCamera.id
          ? {
              ...item,
              position: item.position.map((position, index) => (index === axis ? value : position)),
            }
          : item,
      ),
    )
  const addLight = () => {
    const index = lights.length + 1
    const light = {
      id: `light-${Date.now()}`,
      name: `Light_${index}`,
      type: 'point',
      intensity: 20,
      color: '#ffe4b5',
      position: [-3, 3, 2],
    }
    setLights((all) => [...all, light])
    setSelected(light.id)
  }
  const addCamera = () => {
    const index = cameras.length + 1
    const camera = {
      id: `camera-${Date.now()}`,
      name: `Camera_${String(index).padStart(2, '0')}`,
      position: [4, 3, 5],
    }
    setCameras((all) => [...all, camera])
    setSelected(camera.id)
  }
  const deleteObject = (id, type) => {
    if (type === 'light') setLights((all) => all.filter((item) => item.id !== id))
    if (type === 'camera' && cameras.length > 1)
      setCameras((all) => all.filter((item) => item.id !== id))
    setSelected('model')
  }
  const syncTransform = (id, position, rotationY, objectScale) => {
    if (id === 'model') {
      setRotation(Math.round((rotationY * 180) / Math.PI))
      setScale(Number(objectScale.toFixed(2)))
    } else if (lights.some((item) => item.id === id)) {
      setLights((all) => all.map((item) => (item.id === id ? { ...item, position } : item)))
    } else {
      setCameras((all) => all.map((item) => (item.id === id ? { ...item, position } : item)))
    }
  }
  const TreeItem = ({ id, icon, name, type }) => (
    <div className="tree-row">
      <button className={selected === id ? 'active' : ''} onClick={() => setSelected(id)}>
        <span>{icon}</span>
        {name}
        <small>{type}</small>
      </button>
      {(type === '灯光' || (type === '相机' && cameras.length > 1)) && (
        <button
          className="delete-object"
          title={`删除${name}`}
          onClick={() => deleteObject(id, type === '灯光' ? 'light' : 'camera')}
        >
          ×
        </button>
      )}
    </div>
  )
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
              <TreeItem id="model" icon="◇" name={modelName} type="模型" />
              {lights.map((item) => (
                <TreeItem key={item.id} id={item.id} icon="☼" name={item.name} type="灯光" />
              ))}
              {cameras.map((item) => (
                <TreeItem key={item.id} id={item.id} icon="◉" name={item.name} type="相机" />
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
          selected={selected}
          cameraConfig={{ active: activeCamera, all: cameras }}
          focusSignal={focus}
          onModelLoaded={(name) => {
            setModelName(name)
            setSelected('model')
          }}
          onTransform={syncTransform}
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
                onChange={(event) => setRotation(+event.target.value)}
              />
              <Slider
                label="缩放"
                value={scale.toFixed(2)}
                suffix="×"
                min={0.1}
                max={3}
                step={0.01}
                onChange={(event) => setScale(+event.target.value)}
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
                  onChange={(event) => updateLight('color', event.target.value)}
                />
              </div>
              <Slider
                label="强度"
                value={activeLight.intensity}
                min={0}
                max={50}
                step={0.1}
                onChange={(event) => updateLight('intensity', +event.target.value)}
              />
              <p>用 Gizmo 移动灯光位置。</p>
            </section>
          ) : (
            <section className="section">
              <h2>相机 · {activeCamera.name}</h2>
              <button className="neutral" onClick={() => setFocus((value) => value + 1)}>
                聚焦模型 / 重置视角
              </button>
              {['X', 'Y', 'Z'].map((axis, index) => (
                <Slider
                  key={axis}
                  label={`位置 ${axis}`}
                  value={activeCamera.position[index].toFixed(1)}
                  min={-10}
                  max={10}
                  step={0.1}
                  onChange={(event) => updateCamera(index, +event.target.value)}
                />
              ))}
              <p>用 Gizmo 移动相机位置。</p>
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
