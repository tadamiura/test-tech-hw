<script setup lang="ts">
import { computed } from 'vue'
import type { Contributor, GitHubRepo } from '@/types/github'
import { formatDateFr } from '@/utils/date'

const props = defineProps<{
  repo: GitHubRepo
  expanded: boolean
  contributors?: Contributor[]
  contributorsLoading: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const panelId = computed(() => `repo-panel-${props.repo.id}`)
const titleId = computed(() => `repo-title-${props.repo.id}`)

const licenseName = computed(() => props.repo.license?.name ?? '—')
const homepage = computed(() => props.repo.homepage?.trim() || null)
</script>

<template>
  <article class="repo-card" :class="{ 'repo-card--expanded': expanded }">
    <header class="repo-card__header">
      <button
        :id="titleId"
        type="button"
        class="repo-card__title"
        :aria-expanded="expanded"
        :aria-controls="panelId"
        @click="emit('toggle')"
      >
        <span class="repo-card__title-text">{{ repo.full_name }}</span>
        <span class="repo-card__chevron" aria-hidden="true">{{ expanded ? '▾' : '▸' }}</span>
      </button>

      <p v-if="repo.description" class="repo-card__description">
        {{ repo.description }}
      </p>
      <p v-else class="repo-card__description repo-card__description--empty">Aucune description</p>

      <ul class="repo-card__meta" aria-label="Informations du dépôt">
        <li v-if="repo.language" class="repo-card__badge repo-card__badge--lang">
          {{ repo.language }}
        </li>
        <li class="repo-card__badge">
          <span aria-hidden="true">⑂</span>
          {{ repo.forks_count }} fork{{ repo.forks_count > 1 ? 's' : '' }}
        </li>
        <li class="repo-card__badge">
          <span aria-hidden="true">★</span>
          {{ repo.watchers_count }} watcher{{ repo.watchers_count > 1 ? 's' : '' }}
        </li>
        <li class="repo-card__meta-item">
          Licence : <strong>{{ licenseName }}</strong>
        </li>
        <li class="repo-card__meta-item">
          Modifié le <time :datetime="repo.updated_at">{{ formatDateFr(repo.updated_at) }}</time>
        </li>
      </ul>
    </header>

    <div
      :id="panelId"
      class="repo-card__panel"
      role="region"
      :aria-labelledby="titleId"
      :aria-hidden="!expanded"
    >
      <div class="repo-card__panel-inner">
        <section class="repo-card__section">
          <h3 class="repo-card__section-title">Contributeurs</h3>
          <p v-if="contributorsLoading" class="repo-card__loading" role="status">
            Chargement des contributeurs…
          </p>
          <p
            v-else-if="contributors !== undefined && contributors.length === 0"
            class="repo-card__empty"
          >
            Aucun contributeur
          </p>
          <ul v-else-if="contributors && contributors.length > 0" class="repo-card__contributors">
            <li
              v-for="contributor in contributors"
              :key="contributor.id"
              class="repo-card__contributor"
            >
              <img
                :src="contributor.avatar_url"
                :alt="`Avatar de ${contributor.login}`"
                class="repo-card__avatar"
                width="32"
                height="32"
                loading="lazy"
              />
              <a
                :href="contributor.html_url"
                target="_blank"
                rel="noopener noreferrer"
                class="repo-card__contributor-link"
              >
                {{ contributor.login }}
              </a>
              <span class="repo-card__contributions">
                {{ contributor.contributions }} contribution{{
                  contributor.contributions > 1 ? 's' : ''
                }}
              </span>
            </li>
          </ul>
        </section>
        <div class="repo-card__details">
          <dl class="repo-card__detail">
            <dt>Page d'accueil</dt>
            <dd>
              <a
                v-if="homepage"
                :href="homepage"
                target="_blank"
                rel="noopener noreferrer"
                class="repo-card__link"
              >
                {{ homepage }}
              </a>
              <span v-else>—</span>
            </dd>
          </dl>
          <dl class="repo-card__detail">
            <dt>Abonnés</dt>
            <dd>{{ repo.subscribers_count }}</dd>
          </dl>
          <dl class="repo-card__detail">
            <dt>Issues ouvertes</dt>
            <dd>{{ repo.open_issues_count }}</dd>
          </dl>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.repo-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 1px 3px var(--color-shadow);
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.repo-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: 0 4px 12px var(--color-shadow);
}

.repo-card__header {
  padding: var(--spacing-md) var(--spacing-lg);
}

.repo-card__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-primary);
  font-size: 1.125rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.repo-card__title:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

.repo-card__title:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.repo-card__chevron {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.repo-card__description {
  margin: var(--spacing-sm) 0 0;
  color: var(--color-text);
  line-height: 1.5;
}

.repo-card__description--empty {
  color: var(--color-text-muted);
  font-style: italic;
}

.repo-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 0 0;
  padding: 0;
  list-style: none;
}

.repo-card__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 0.125rem 0.5rem;
  border-radius: 2rem;
  background: var(--color-badge-bg);
  color: var(--color-badge-text);
  font-size: 0.8125rem;
  font-weight: 500;
}

.repo-card__badge--lang {
  background: #dafbe1;
  color: #116329;
}

.repo-card__meta-item {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.repo-card__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
  border-top: 1px solid transparent;
}

.repo-card--expanded .repo-card__panel {
  grid-template-rows: 1fr;
  border-top-color: var(--color-border);
}

.repo-card__panel-inner {
  overflow: hidden;
}

.repo-card--expanded .repo-card__panel-inner {
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);
}

.repo-card__section-title {
  margin: 0 0 var(--spacing-sm);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-muted);
}

.repo-card__loading,
.repo-card__empty {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.repo-card__contributors {
  margin: 0;
  padding: 0;
  list-style: none;
}

.repo-card__contributor {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
}

.repo-card__avatar {
  border-radius: 50%;
  flex-shrink: 0;
}

.repo-card__contributor-link {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
}

.repo-card__contributor-link:hover {
  text-decoration: underline;
}

.repo-card__contributions {
  margin-left: auto;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.repo-card__details {
  display: grid;
  gap: var(--spacing-sm);
  margin: var(--spacing-lg) 0 0;
}

.repo-card__detail {
  display: grid;
  grid-template-columns: 10rem 1fr;
  gap: var(--spacing-sm);
  font-size: 0.875rem;
}

.repo-card__detail dt {
  color: var(--color-text-muted);
  font-weight: 500;
}

.repo-card__detail dd {
  margin: 0;
  word-break: break-word;
}

.repo-card__link {
  color: var(--color-primary);
  text-decoration: none;
}

.repo-card__link:hover {
  text-decoration: underline;
}

/* Media queries : mobile */
@media (max-width: 600px) {
  .repo-card__detail {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
  }

  .repo-card__contributions {
    margin-left: 0;
  }
}
</style>
