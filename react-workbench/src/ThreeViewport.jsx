import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default function ThreeViewport({
  rotation,
  scale,
  lights,
  cameraConfig,
  focusSignal,
  onModelLoaded,
}) {
  const canvasRef = useRef(null),
    modelRef = useRef(null),
    baseScaleRef = useRef(1),
    [label, setLabel] = useState('透视视图 · 35 mm')
  useEffect(() => {
    const canvas = canvasRef.current,
      scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100),
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    scene.background = new THREE.Color('#111722')
    camera.position.set(3.4, 2.4, 5.4)
    camera.lookAt(0, 0, 0)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    scene.add(new THREE.HemisphereLight('#b8d9ff', '#1a2030', 0.7))
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: '#172130', roughness: 0.9 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.2
    scene.add(floor)
    const grid = new THREE.GridHelper(12, 12, '#40546d', '#253445')
    grid.position.y = -1.19
    scene.add(grid)
    const starter = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 2),
      new THREE.MeshStandardMaterial({
        color: '#7c92ff',
        metalness: 0.35,
        roughness: 0.25,
      }),
    )
    scene.add(starter)
    modelRef.current = starter
    const lightGroup = new THREE.Group()
    scene.add(lightGroup)
    canvas._three = { scene, camera, renderer, lightGroup }
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    let frame
    const render = () => {
      frame = requestAnimationFrame(render)
      renderer.render(scene, camera)
    }
    render()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.dispose()
      canvas._three = null
    }
  }, [])
  useEffect(() => {
    if (!canvasRef.current?._three) return
    const g = canvasRef.current._three.lightGroup
    g.clear()
    lights.forEach((item) => {
      const l =
        item.type === 'point'
          ? new THREE.PointLight(item.color, item.intensity, 20)
          : new THREE.DirectionalLight(item.color, item.intensity)
      l.position.fromArray(item.position)
      l.name = item.name
      g.add(l)
      if (item.type === 'directional') g.add(new THREE.DirectionalLightHelper(l, 0.35, item.color))
    })
  }, [lights])
  useEffect(() => {
    if (modelRef.current) modelRef.current.rotation.y = THREE.MathUtils.degToRad(rotation)
  }, [rotation])
  useEffect(() => {
    if (modelRef.current) modelRef.current.scale.setScalar(baseScaleRef.current * scale)
  }, [scale])
  useEffect(() => {
    const c = canvasRef.current?._three?.camera
    if (c) {
      c.position.fromArray(cameraConfig.position)
      c.lookAt(0, 0, 0)
    }
  }, [cameraConfig])
  useEffect(() => {
    const c = canvasRef.current?._three?.camera
    if (c) {
      c.position.set(3.4, 2.4, 5.4)
      c.lookAt(0, 0, 0)
    }
  }, [focusSignal])
  const importModel = (e) => {
    const file = e.target.files?.[0],
      canvas = canvasRef.current
    if (!file || !canvas?._three) return
    if (!/\.(glb|gltf)$/i.test(file.name)) {
      setLabel('请使用 .glb 或 .gltf 文件')
      return
    }
    setLabel(`正在导入 · ${file.name}`)
    const url = URL.createObjectURL(file)
    new GLTFLoader().load(
      url,
      (gltf) => {
        const root = gltf.scene,
          bounds = new THREE.Box3().setFromObject(root),
          size = bounds.getSize(new THREE.Vector3()),
          center = bounds.getCenter(new THREE.Vector3()),
          fit = 2 / (Math.max(size.x, size.y, size.z) || 1)
        canvas._three.scene.remove(modelRef.current)
        baseScaleRef.current = fit
        root.scale.setScalar(fit * scale)
        root.position.set(
          -center.x * fit * scale,
          -bounds.min.y * fit * scale - 1.18,
          -center.z * fit * scale,
        )
        root.rotation.y = THREE.MathUtils.degToRad(rotation)
        root.name = file.name.replace(/\.(glb|gltf)$/i, '') || '导入模型'
        modelRef.current = root
        canvas._three.scene.add(root)
        onModelLoaded?.(root.name)
        setLabel(`已导入 · ${file.name}`)
        URL.revokeObjectURL(url)
      },
      undefined,
      () => {
        setLabel('模型读取失败，请优先尝试单文件 GLB')
        URL.revokeObjectURL(url)
      },
    )
    e.target.value = ''
  }
  return (
    <section className="viewport">
      <canvas className="three-canvas" ref={canvasRef} />
      <div className="view-label">{label}</div>
      <label className="viewport-import">
        导入 GLB / GLTF
        <input id="model-file-picker" type="file" accept=".glb,.gltf" onChange={importModel} />
      </label>
      <div className="axis">
        <b>Y</b>
        <em>X</em>
        <span>Z</span>
      </div>
    </section>
  )
}
