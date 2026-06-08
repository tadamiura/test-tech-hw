<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import RepoCard from '@/components/features/github/RepoCard.vue'
import { SORT_OPTIONS } from '@/const/sortOptions'
import { useGitHubReposStore } from '@/stores/githubRepos'
import type { SortOption } from '@/types/github'

const store = useGitHubReposStore()

const {
  org,
  page,
  repos,
  loading,
  error,
  hasNextPage,
  hasPrevPage,
  rateLimitMessage,
  expandedRepoId,
  sortSelectValue,
} = storeToRefs(store)

const { search, goToPage, toggleExpand, getContributors, isContributorsLoading } = store

const showPagination = computed(
  () => repos.value.length > 0 || hasNextPage.value || hasPrevPage.value,
)

function sortOptionKey(option: SortOption): string {
  return `${option.sort}-${option.direction}`
}
</script>

<template>
  <div class="org-repos-page">
    <header class="org-repos-page__header">
      <h1 class="org-repos-page__title">Dépôts GitHub par organisation</h1>
      <p class="org-repos-page__subtitle">Explorez les dépôts publics d'une organisation GitHub.</p>
    </header>

    <div
      v-if="rateLimitMessage"
      class="org-repos-page__banner org-repos-page__banner--warning"
      role="alert"
    >
      {{ rateLimitMessage }}
    </div>

    <form class="org-repos-page__form" @submit.prevent="search()">
      <div class="org-repos-page__field">
        <label for="org-input" class="org-repos-page__label">Organisation</label>
        <div class="org-repos-page__input-row">
          <input
            id="org-input"
            v-model="org"
            type="text"
            class="org-repos-page__input"
            placeholder="ex. vuejs"
            autocomplete="organization"
            :aria-invalid="!!error && !loading"
            :disabled="loading"
          />
          <button type="submit" class="org-repos-page__button" :disabled="loading">
            Rechercher
          </button>
        </div>
      </div>

      <div class="org-repos-page__field">
        <label for="sort-select" class="org-repos-page__label">Tri</label>
        <select
          id="sort-select"
          class="org-repos-page__select"
          v-model="sortSelectValue"
          :disabled="loading"
        >
          <option
            v-for="(option, index) in SORT_OPTIONS"
            :key="sortOptionKey(option)"
            :value="String(index)"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </form>

    <div v-if="loading" class="org-repos-page__loading" role="status" aria-live="polite">
      <span class="org-repos-page__spinner" aria-hidden="true" />
      Chargement des dépôts…
    </div>

    <section
      v-else-if="repos.length > 0"
      class="org-repos-page__results"
      aria-label="Liste des dépôts"
    >
      <p class="org-repos-page__count">
        {{ repos.length }} dépôt{{ repos.length > 1 ? 's' : '' }} affiché{{
          repos.length > 1 ? 's' : ''
        }}
      </p>

      <ul class="org-repos-page__list">
        <li v-for="repo in repos" :key="repo.id" class="org-repos-page__list-item">
          <RepoCard
            :repo="repo"
            :expanded="expandedRepoId === repo.id"
            :contributors="getContributors(repo.full_name)"
            :contributors-loading="isContributorsLoading(repo.full_name)"
            @toggle="toggleExpand(repo)"
          />
        </li>
      </ul>
    </section>

    <p v-else-if="!loading && !error && org.trim()" class="org-repos-page__empty">
      Aucun dépôt trouvé pour cette organisation.
    </p>

    <nav
      v-if="showPagination && !loading"
      class="org-repos-page__pagination"
      aria-label="Pagination des dépôts"
    >
      <button
        type="button"
        class="org-repos-page__page-button"
        :disabled="!hasPrevPage"
        @click="goToPage(page - 1)"
      >
        Précédent
      </button>

      <span class="org-repos-page__page-indicator" aria-current="page"> Page {{ page }} </span>

      <button
        type="button"
        class="org-repos-page__page-button"
        :disabled="!hasNextPage"
        @click="goToPage(page + 1)"
      >
        Suivant
      </button>
    </nav>
  </div>
</template>

<style scoped>
.org-repos-page {
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
}

.org-repos-page__header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.org-repos-page__title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
}

.org-repos-page__subtitle {
  margin: var(--spacing-sm) 0 0;
  color: var(--color-text-muted);
}

.org-repos-page__banner {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.org-repos-page__banner--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
  border: 1px solid #d4a72c;
}

.org-repos-page__form {
  display: grid;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 1px 3px var(--color-shadow);
}

.org-repos-page__field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.org-repos-page__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.org-repos-page__input-row {
  display: flex;
  gap: var(--spacing-sm);
}

.org-repos-page__input,
.org-repos-page__select {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 1rem;
  font-family: inherit;
}

.org-repos-page__input:focus-visible,
.org-repos-page__select:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 0;
  border-color: var(--color-primary);
}

.org-repos-page__input:disabled,
.org-repos-page__select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.org-repos-page__button {
  flex-shrink: 0;
  padding: 0.5rem 1.25rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}

.org-repos-page__button:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.org-repos-page__button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.org-repos-page__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.org-repos-page__error {
  margin: 0 0 var(--spacing-lg);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background: var(--color-error-bg);
  color: var(--color-error);
  border: 1px solid #ff818266;
}

.org-repos-page__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  color: var(--color-text-muted);
}

.org-repos-page__spinner {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.org-repos-page__count {
  margin: 0 0 var(--spacing-md);
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.org-repos-page__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin: 0;
  padding: 0;
  list-style: none;
}

.org-repos-page__empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--spacing-xl);
}

.org-repos-page__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.org-repos-page__page-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.org-repos-page__page-button:hover:not(:disabled) {
  border-color: var(--color-border-hover);
  background: var(--color-bg);
}

.org-repos-page__page-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.org-repos-page__page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.org-repos-page__page-indicator {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  min-width: 5rem;
  text-align: center;
}

@media (max-width: 600px) {
  .org-repos-page__input-row {
    flex-direction: column;
  }

  .org-repos-page__button {
    width: 100%;
  }

  .org-repos-page__pagination {
    flex-wrap: wrap;
  }
}
</style>
