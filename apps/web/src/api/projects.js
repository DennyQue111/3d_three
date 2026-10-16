const apiUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000/api'

async function request(path, options) {
  const response = await fetch(`${apiUrl}${path}`, options)
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  return response.json()
}

export function saveProject(project) {
  return request('/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  })
}

export function listProjects() {
  return request('/projects')
}
