import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

export default function ThreeViewport({
  rotation,
  scale,
  lights,
  cameraConfig,
  selected,
  focusSignal,
  onModelLoaded,
  onTransform,
}) {
  const canvasRef = useRef(null)
  const modelRef = useRef(null)
  const objectsRef = useRef(new Map())
  const baseScaleRef = useRef(1)
  const [label, setLabel] = useState('透视视图 · 左键旋转 / 右键平移 / 滚轮缩放')

  useEffect(() => {
    const canvas = canvasRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    const orbit = new OrbitControls(camera, canvas)
    const transform = new TransformControls(camera, canvas)

    scene.background = new THREE.Color('#111722')
    camera.position.set(3.4, 2.4, 5.4)
    orbit.target.set(0, 0, 0)
    orbit.enableDamping = true
    orbit.dampingFactor = 0.08
    orbit.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    scene.add(new THREE.HemisphereLight('#b8d9ff', '#1a2030', 0.7))
    scene.add(transform)

    transform.addEventListener('dragging-changed', (event) => {
      orbit.enabled = !event.value
    })

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
      new THREE.MeshStandardMaterial({ color: '#7c92ff', metalness: 0.35, roughness: 0.25 }),
    )
    starter.userData.sceneId = 'model'
    scene.add(starter)
    modelRef.current = starter
    objectsRef.current.set('model', starter)

    const lightGroup = new THREE.Group()
    const cameraGroup = new THREE.Group()
    scene.add(lightGroup, cameraGroup)

    canvas._three = { scene, camera, renderer, orbit, transform, lightGroup, cameraGroup }
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
      orbit.update()
      renderer.render(scene, camera)
    }
    render()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      orbit.dispose()
      transform.dispose()
      renderer.dispose()
      canvas._three = null
    }
  }, [])

  useEffect(() => {
    const runtime = canvasRef.current?._three
    if (!runtime) return
    runtime.lightGroup.clear()
    lights.forEach((item) => {
      const light =
        item.type === 'point'
          ? new THREE.PointLight(item.color, item.intensity, 20)
          : new THREE.DirectionalLight(item.color, item.intensity)
      light.position.fromArray(item.position)
      light.userData.sceneId = item.id
      runtime.lightGroup.add(light)
      objectsRef.current.set(item.id, light)
      if (item.type === 'point') {
        runtime.lightGroup.add(new THREE.PointLightHelper(light, 0.4, item.color))
      } else {
        runtime.lightGroup.add(new THREE.DirectionalLightHelper(light, 1, item.color))
      }
    })
  }, [lights])

  useEffect(() => {
    const runtime = canvasRef.current?._three
    if (!runtime) return
    runtime.cameraGroup.clear()
    cameraConfig.all.forEach((item) => {
      const proxy = new THREE.Object3D()
      proxy.position.fromArray(item.position)
      proxy.userData.sceneId = item.id
      objectsRef.current.set(item.id, proxy)
      runtime.cameraGroup.add(proxy)
    })
  }, [cameraConfig.all])

  useEffect(() => {
    const runtime = canvasRef.current?._three
    const object = objectsRef.current.get(selected)
    if (!runtime || !object) return
    runtime.transform.attach(object)
  }, [selected, lights, cameraConfig.all])

  useEffect(() => {
    const runtime = canvasRef.current?._three
    if (!runtime) return
    const listener = () => {
      const object = runtime.transform.object
      if (!object) return
      onTransform?.(
        object.userData.sceneId,
        object.position.toArray(),
        object.rotation.y,
        object.scale.x,
      )
    }
    runtime.transform.addEventListener('objectChange', listener)
    return () => runtime.transform.removeEventListener('objectChange', listener)
  }, [onTransform])

  useEffect(() => {
    const runtime = canvasRef.current?._three
    if (!runtime) return
    const onKey = (event) => {
      if (event.target instanceof HTMLInputElement) return
      const mode = { g: 'translate', r: 'rotate', s: 'scale' }[event.key.toLowerCase()]
      if (mode) runtime.transform.setMode(mode)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (modelRef.current) modelRef.current.rotation.y = THREE.MathUtils.degToRad(rotation)
  }, [rotation])
  useEffect(() => {
    if (modelRef.current) modelRef.current.scale.setScalar(baseScaleRef.current * scale)
  }, [scale])
  useEffect(() => {
    const runtime = canvasRef.current?._three
    if (!runtime) return
    runtime.camera.position.fromArray(cameraConfig.active.position)
    runtime.orbit.target.set(0, 0, 0)
    runtime.orbit.update()
  }, [cameraConfig.active])
  useEffect(() => {
    const runtime = canvasRef.current?._three
    if (!runtime) return
    runtime.camera.position.set(3.4, 2.4, 5.4)
    runtime.orbit.target.set(0, 0, 0)
    runtime.orbit.update()
  }, [focusSignal])

  const importModel = (event) => {
    const file = event.target.files?.[0]
    const runtime = canvasRef.current?._three
    if (!file || !runtime) return
    if (!/\.(glb|gltf)$/i.test(file.name)) {
      setLabel('请使用 .glb 或 .gltf 文件')
      return
    }
    setLabel(`正在导入 · ${file.name}`)
    const url = URL.createObjectURL(file)
    new GLTFLoader().load(
      url,
      (gltf) => {
        const root = gltf.scene
        const bounds = new THREE.Box3().setFromObject(root)
        const size = bounds.getSize(new THREE.Vector3())
        const center = bounds.getCenter(new THREE.Vector3())
        const fit = 2 / (Math.max(size.x, size.y, size.z) || 1)
        runtime.scene.remove(modelRef.current)
        baseScaleRef.current = fit
        root.scale.setScalar(fit * scale)
        root.position.set(
          -center.x * fit * scale,
          -bounds.min.y * fit * scale - 1.18,
          -center.z * fit * scale,
        )
        root.rotation.y = THREE.MathUtils.degToRad(rotation)
        root.userData.sceneId = 'model'
        modelRef.current = root
        objectsRef.current.set('model', root)
        runtime.scene.add(root)
        onModelLoaded?.(file.name.replace(/\.(glb|gltf)$/i, '') || '导入模型')
        setLabel(`已导入 · ${file.name}`)
        URL.revokeObjectURL(url)
      },
      undefined,
      () => {
        setLabel('模型读取失败，请优先尝试单文件 GLB')
        URL.revokeObjectURL(url)
      },
    )
    event.target.value = ''
  }

  return (
    <section className="viewport">
      <canvas
        className="three-canvas"
        ref={canvasRef}
        onContextMenu={(event) => event.preventDefault()}
      />
      <div className="view-label">{label}</div>
      <div className="gizmo-help">G 移动 · R 旋转 · S 缩放</div>
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
