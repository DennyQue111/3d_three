import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import ThreeViewport from './ThreeViewport.jsx'

const baseSceneItems = [['◇', 'Ground'], ['☼', 'Key_Light'], ['◉', 'Camera_01']]

function Slider({ label, value, suffix = '', onChange, min = 0, max = 100, step = 1 }) {
  return <div className="control"><label>{label}<strong>{value}{suffix}</strong></label><input type="range" min={min} max={max} step={step} value={value} onChange={onChange} /></div>
}

function App() {
  const [rotation, setRotation] = useState(18)
  const [scale, setScale] = useState(1)
  const [intensity, setIntensity] = useState(75)
  const [isPlaying, setIsPlaying] = useState(false)
  const [modelName, setModelName] = useState('默认模型')
  const [selected, setSelected] = useState('默认模型')
  const [toast, setToast] = useState('')
  const flash = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2200) }
  const loadModel = (name) => { setModelName(name); setSelected(name); flash(`已导入 ${name}`) }

  return <div className="app-shell">
    <header className="topbar"><div className="logo" aria-hidden="true" /><div className="brand">3D THREE <small>Motion Studio</small></div><div className="grow" /><button className="neutral" onClick={() => flash('项目保存将在下一阶段接入')}>保存草稿</button><button className="export" onClick={() => flash('视频导出将在动画阶段接入')}>导出视频</button></header>
    <main>
      <aside className="panel left-panel">
        <section className="section"><h2>资源库</h2><div className="drop-zone"><b>导入 3D 模型</b><span>已支持 GLB / GLTF；建议优先使用 GLB</span><button onClick={() => document.getElementById('model-file-picker')?.click()}>选择文件</button></div></section>
        <section className="section"><h2>场景结构</h2><nav className="tree"><button className={selected === modelName ? 'active' : ''} onClick={() => setSelected(modelName)}><span>◇</span>{modelName}<small>模型</small></button>{baseSceneItems.map(([icon, name]) => <button key={name} className={selected === name ? 'active' : ''} onClick={() => setSelected(name)}><span>{icon}</span>{name}</button>)}</nav></section>
        <section className="section"><h2>快速添加</h2><div className="quick"><button onClick={() => flash('灯光编辑将在下一闭环加入')}>＋ 灯光</button><button onClick={() => flash('相机编辑将在下一闭环加入')}>＋ 相机</button><button onClick={() => flash('环境编辑将在下一闭环加入')}>＋ 环境</button></div></section>
      </aside>
      <ThreeViewport rotation={rotation} scale={scale} intensity={intensity} onModelLoaded={loadModel} />
      <aside className="panel inspector"><section className="section"><h2>检查器 · {selected}</h2><div className="tabs"><button className="active">变换</button><button onClick={() => flash('材质编辑将在后续闭环加入')}>材质</button></div><Slider label="旋转 Y" value={rotation} suffix="°" min={-180} max={180} onChange={(e) => setRotation(Number(e.target.value))} /><Slider label="缩放" value={scale.toFixed(2)} suffix="×" min={0.1} max={3} step={0.01} onChange={(e) => setScale(Number(e.target.value))} /></section><section className="section"><h2>灯光</h2><Slider label="主光强度" value={intensity} suffix="%" onChange={(e) => setIntensity(Number(e.target.value))} /></section><section className="section"><h2>后期特效</h2><div className="effects"><button className="enabled">Bloom</button><button>DOF</button><button>颗粒</button></div></section><section className="section"><h2>动画</h2><p>下一阶段将接入真实关键帧与播放控制。</p></section></aside>
    </main>
    <footer className="timeline"><div className="transport"><button className="play" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? '❚❚' : '▶'}</button><span>{isPlaying ? '播放预览中' : '00:00:00:00'}</span></div><div className="track-area"><div className="ruler">0s　1s　2s　3s　4s　5s　6s</div><i className="playhead" /><i className="keyframe" /></div><div className="render-status"><b>1920 × 1080 · 30 FPS</b><span>● 准备就绪</span></div></footer>
    {toast && <div className="toast">{toast}</div>}
  </div>
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
