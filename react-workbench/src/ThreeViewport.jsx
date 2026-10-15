import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default function ThreeViewport({ rotation, scale, intensity, onModelLoaded }) {
  const canvasRef = useRef(null)
  const modelRef = useRef(null)
  const baseScaleRef = useRef(1)
  const [label, setLabel] = useState('透视视图 · 35 mm')

  useEffect(() => {
    const canvas = canvasRef.current
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#111722')
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(3.4, 2.4, 5.4)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const ambient = new THREE.HemisphereLight('#b8d9ff', '#1a2030', 0.7)
    const key = new THREE.DirectionalLight('#b5ffe5', intensity / 35)
    key.position.set(4, 5, 3)
    scene.add(ambient, key)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: '#172130', roughness: 0.9 }))
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.2
    scene.add(floor)
    const grid = new THREE.GridHelper(12, 12, '#40546d', '#253445')
    grid.position.y = -1.19
    scene.add(grid)
    const starter = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), new THREE.MeshStandardMaterial({ color: '#7c92ff', metalness: 0.35, roughness: 0.25 }))
    starter.name = '默认模型'
    scene.add(starter)
    modelRef.current = starter

    const resize = () => { const { width, height } = canvas.getBoundingClientRect(); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix() }
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize()
    let frame
    const render = () => { frame = requestAnimationFrame(render); renderer.render(scene, camera) }; render()
    canvas._three = { scene, key, starter, renderer }
    return () => { cancelAnimationFrame(frame); observer.disconnect(); renderer.dispose(); canvas._three = null }
  }, [])

  useEffect(() => { if (modelRef.current) modelRef.current.rotation.y = THREE.MathUtils.degToRad(rotation) }, [rotation])
  useEffect(() => { if (modelRef.current) modelRef.current.scale.setScalar(baseScaleRef.current * scale) }, [scale])
  useEffect(() => { if (canvasRef.current?._three) canvasRef.current._three.key.intensity = intensity / 35 }, [intensity])

  const importModel = (event) => {
    const file = event.target.files?.[0]
    const canvas = canvasRef.current
    if (!file || !canvas?._three) return
    if (!/\.(glb|gltf)$/i.test(file.name)) { setLabel('请使用 .glb 或 .gltf 文件'); return }
    setLabel(`正在导入 · ${file.name}`)
    const url = URL.createObjectURL(file)
    new GLTFLoader().load(url, (gltf) => {
      const { scene, starter } = canvas._three
      scene.remove(modelRef.current || starter)
      const root = gltf.scene
      const bounds = new THREE.Box3().setFromObject(root)
      const size = bounds.getSize(new THREE.Vector3())
      const center = bounds.getCenter(new THREE.Vector3())
      const largestSide = Math.max(size.x, size.y, size.z) || 1
      baseScaleRef.current = 2 / largestSide
      root.scale.setScalar(baseScaleRef.current * scale)
      root.position.sub(center.multiplyScalar(baseScaleRef.current * scale))
      root.position.y = -1.18
      root.rotation.y = THREE.MathUtils.degToRad(rotation)
      root.name = file.name.replace(/\.(glb|gltf)$/i, '') || '导入模型'
      modelRef.current = root
      scene.add(root)
      onModelLoaded?.(root.name)
      setLabel(`已导入 · ${file.name}`)
      URL.revokeObjectURL(url)
    }, undefined, () => { setLabel('模型读取失败，请优先尝试单文件 GLB'); URL.revokeObjectURL(url) })
    event.target.value = ''
  }

  return <section className="viewport">
    <canvas className="three-canvas" ref={canvasRef} />
    <div className="view-label">{label}</div>
    <label className="viewport-import">导入 GLB / GLTF<input id="model-file-picker" type="file" accept=".glb,.gltf,model/gltf-binary,model/gltf+json" onChange={importModel} /></label>
    <div className="axis"><b>Y</b><em>X</em><span>Z</span></div>
  </section>
}
