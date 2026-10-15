import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import ThreeViewport from './ThreeViewport.jsx'

const sceneItems = [
  ['◇', 'Product_Model', true], ['◇', 'Ground'], ['☼', 'Key_Light'], ['◉', 'Camera_01'],
]

function Slider({ label, value, suffix = '', onChange, min = 0, max = 100 }) {
  return <div className="control">
    <label>{label}<strong>{value}{suffix}</strong></label>
    <input type="range" min={min} max={max} value={value} onChange={onChange} />
  </div>
}

function Viewport({ rotation, intensity, isPlaying }) {
  const cubeStyle = {
    transform: `translate(-50%, -50%) rotateX(-24deg) rotateY(${rotation}deg)`,
    filter: `drop-shadow(0 0 ${Math.round(intensity * .55)}px rgba(114,245,196,.68))`,
    animationPlayState: isPlaying ? 'running' : 'paused',
  }
  return <section className="viewport">
    <div className="view-label">透视视图 · 35 mm</div>
    <div className="floor" />
    <div className="cube" style={cubeStyle}>
      <i className="face front" /><i className="face back" /><i className="face right" />
      <i className="face left" /><i className="face top" /><i className="face bottom" />
    </div>
    <div className="axis"><b>Y</b><em>X</em><span>Z</span></div>
  </section>
}

function App() {
  const [rotation, setRotation] = React.useState(18)
  const [intensity, setIntensity] = React.useState(75)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [selected, setSelected] = React.useState('Product_Model')
  const [toast, setToast] = React.useState('')
  const flash = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2200) }

  return <div className="app-shell">
    <header className="topbar">
      <div className="logo" aria-hidden="true" /><div className="brand">3D THREE <small>Motion Studio</small></div>
      <div className="grow" />
      <button className="neutral" onClick={() => flash('草稿已保存')}>保存草稿</button>
      <button className="export" onClick={() => flash('导出队列已创建（演示）')}>导出视频</button>
    </header>

    <main>
      <aside className="panel left-panel">
        <section className="section"><h2>资源库</h2><div className="drop-zone">
          <b>导入 3D 模型</b><span>支持 GLB / GLTF / FBX / OBJ</span>
          <button onClick={() => document.getElementById('model-file-picker')?.click()}>选择文件</button>
        </div></section>
        <section className="section"><h2>场景结构</h2><nav className="tree">
          {sceneItems.map(([icon, name, initial]) => <button key={name} className={selected === name ? 'active' : ''} onClick={() => setSelected(name)}><span>{icon}</span>{name}{initial && <small>主对象</small>}</button>)}
        </nav></section>
        <section className="section"><h2>快速添加</h2><div className="quick"><button>＋ 灯光</button><button>＋ 相机</button><button>＋ 环境</button></div></section>
      </aside>

      <ThreeViewport rotation={rotation} intensity={intensity} />

      <aside className="panel inspector">
        <section className="section"><h2>检查器 · {selected}</h2><div className="tabs"><button className="active">变换</button><button>材质</button></div>
          <Slider label="旋转 Y" value={rotation} suffix="°" min={-180} max={180} onChange={(e) => setRotation(Number(e.target.value))} />
          <Slider label="缩放" value={100} suffix="%" onChange={() => {}} />
        </section>
        <section className="section"><h2>灯光</h2><Slider label="主光强度" value={intensity} suffix="%" onChange={(e) => setIntensity(Number(e.target.value))} /><Slider label="环境亮度" value={20} suffix="%" onChange={() => {}} /></section>
        <section className="section"><h2>后期特效</h2><div className="effects"><button className="enabled">Bloom</button><button>DOF</button><button>颗粒</button></div></section>
        <section className="section"><h2>动画</h2><p>在时间轴添加关键帧，制作镜头与模型运动。</p></section>
      </aside>
    </main>

    <footer className="timeline">
      <div className="transport"><button className="play" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? '❚❚' : '▶'}</button><span>00:00:02:12</span></div>
      <div className="track-area"><div className="ruler">0s　1s　2s　3s　4s　5s　6s</div><i className="playhead" /><i className="keyframe" /></div>
      <div className="render-status"><b>1920 × 1080 · 30 FPS</b><span>● 准备就绪</span></div>
    </footer>
    {toast && <div className="toast">{toast}</div>}
  </div>
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
