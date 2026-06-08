import axios, { type AxiosInstance } from 'axios'

/**
 * Axios instance for the GitHub REST API (public, unauthenticated by default).
 */
export const githubClient: AxiosInstance = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 10_000,
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2026-03-10',
  },
})

export default githubClient
