<template>
  <NeoCollapse
    :open="expanded"
    animation="slide"
    class="border-bottom"
    :class="{ 'fluid-padding-left': fluidPadding }">
    <template #trigger="{ open }">
      <div class="flex" role="button" :aria-expanded="open">
        <p class="card-header-title has-text-weight-normal">
          {{ $t('offer.status') }}
        </p>
        <a class="card-header-icon">
          <NeoIcon :icon="open ? 'minus' : 'plus'" />
        </a>
      </div>
    </template>
    <div class="p-4">
      <NeoField>
        <NeoCheckbox v-model="listed" data-testid="filter-checkbox-buynow">
          {{ $t('sort.listed') }}</NeoCheckbox
        >
      </NeoField>
      <NeoField>
        <NeoCheckbox v-model="owned" :disabled="!accountId">
          {{ $t('sort.own') }}
        </NeoCheckbox>
      </NeoField>
    </div>
  </NeoCollapse>
</template>

<script lang="ts" setup>
import { useExploreFiltersStore } from '@/stores/exploreFilters'
import { NeoCheckbox, NeoCollapse, NeoField, NeoIcon } from '@kodadot1/brick'

const exploreFiltersStore = useExploreFiltersStore()
const route = useRoute()
const { accountId } = useAuth()
const { replaceUrl: replaceURL } = useReplaceUrl()

type DataModel = 'query' | 'store'

const props = withDefaults(
  defineProps<{
    expanded?: boolean
    dataModel?: DataModel
    fluidPadding?: boolean
  }>(),
  {
    expanded: false,
    dataModel: 'query',
    fluidPadding: false,
  },
)

const emit = defineEmits(['resetPage'])

const listed =
  props.dataModel === 'query'
    ? computed({
        get: () => route.query?.listed?.toString() === 'true',
        set: (value) => applyToUrl({ listed: String(value) }),
      })
    : computed({
        get: () => exploreFiltersStore.listed,
        set: (value) => exploreFiltersStore.setListed(value),
      })

const owned =
  props.dataModel === 'query'
    ? computed({
        get: () => route.query?.owned?.toString() === 'true',
        set: (value) => applyToUrl({ owned: String(value) }),
      })
    : computed({
        get: () => exploreFiltersStore.owned,
        set: (value) => exploreFiltersStore.setOwned(value),
      })

const applyToUrl = (queryCondition: { [key: string]: any }) => {
  replaceURL(queryCondition)
  emit('resetPage')
}
</script>
