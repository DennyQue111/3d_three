import cors from '@fastify/cors'
import Fastify from 'fastify'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import type { SceneProject } from '@3d-three/shared'

const here = path.dirname(fileURLToPath(import.meta.url))
const dataDirectory = path.resolve(here, '../data')
const projectsPath = path.join(dataDirectory, 'projects.json')
const app = Fastify({ logger: true })

const vector3 = z.tuple([z.number(), z.number(), z.number()])
const projectSchema = z.object({
  name: z.string().min(1).max(100),
  scene: z.object({
    modelName: z.string(),
    modelRotationY: z.number(),
    modelScale: z.number().positive(),
    lights: z.array(z.object({
      id: z.string(), name: z.string(), type: z.enum(['directional', 'point']),
      intensity: z.number().nonnegative(), color: z.string(), position: vector3,
    })),
    cameras: z.array(z.object({ id: z.string(), name: z.string(), position: vector3 })),
  }),
})

async function readProjects(): Promise<SceneProject[]> {
  try { return JSON.parse(await readFile(projectsPath, 'utf8')) as SceneProject[] }
  catch { return [] }
}

async function saveProjects(projects: SceneProject[]) {
  await mkdir(dataDirectory, { recursive: true })
  await writeFile(projectsPath, JSON.stringify(projects, null, 2), 'utf8')
}

await app.register(cors, { origin: 'http://localhost:5173' })

app.get('/api/health', async () => ({ status: 'ok' }))

app.get('/api/projects', async () => readProjects())

app.get<{ Params: { id: string } }>('/api/projects/:id', async (request, reply) => {
  const project = (await readProjects()).find((item) => item.id === request.params.id)
  return project ?? reply.code(404).send({ message: 'Project not found' })
})

app.post('/api/projects', async (request, reply) => {
  const parsed = projectSchema.safeParse(request.body)
  if (!parsed.success) return reply.code(400).send({ message: 'Invalid project', issues: parsed.error.issues })
  const now = new Date().toISOString()
  const project: SceneProject = { id: crypto.randomUUID(), createdAt: now, updatedAt: now, ...parsed.data }
  const projects = await readProjects()
  projects.push(project)
  await saveProjects(projects)
  return reply.code(201).send(project)
})

await app.listen({ port: 3000, host: '127.0.0.1' })
