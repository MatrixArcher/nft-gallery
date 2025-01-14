import { getCollectionIds } from '@/utils/queryParams'
// search items by keywords
function useSearchKeywords() {
  const route = useRoute()

  return {
    keywords: computed(() => {
      const search = route.query.search?.toString()
      const conditions = [{ name_containsInsensitive: search }]

      if (!isNaN(Number(search))) {
        conditions.push({ sn_contains: search })
      }

      return search?.length
        ? {
            OR: conditions,
          }
        : {}
    }),
  }
}

// search items by price range
function useSearchPriceRange() {
  const route = useRoute()
  const priceRange = computed(() => {
    const minPrice = route.query.min ?? undefined

    if (route.query.listed !== 'true') {
      return {}
    }

    const defaultParams = {
      price_gt: '0',
      price_gte: minPrice && Number(minPrice),
    }

    if (route.query.max) {
      return {
        ...defaultParams,
        price_lte: Number(route.query.max),
      }
    }

    return defaultParams
  })

  return { priceRange: computed(() => [priceRange.value]) }
}

// search items by owner
function useSearchOwner() {
  const route = useRoute()
  const { accountId } = useAuth()

  return {
    owner: computed(() => {
      return route.query.owned === 'true' && accountId.value
        ? [{ currentOwner_eq: accountId.value }]
        : []
    }),
  }
}

// search items by collection id
function useSearchByCollectionId() {
  const route = useRoute()

  return {
    collectionId: computed(() => {
      return route.name === 'prefix-collection-id'
        ? [{ collection: { id_eq: route.params.id } }]
        : []
    }),
  }
}

function useSearchByCollections() {
  const route = useRoute()

  return {
    collections: computed(() => {
      if (route.query.collections) {
        return [
          {
            collection: {
              id_in: getCollectionIds(),
            },
          },
        ]
      }
      return []
    }),
  }
}

// search items by user id
function useSearchByUserId() {
  const route = useRoute()

  return {
    userId: computed(() => {
      return route.name === 'prefix-u-id'
        ? [{ issuer_eq: route.params.id }]
        : []
    }),
  }
}

export function useSearchParams() {
  const { keywords } = useSearchKeywords()
  const { priceRange } = useSearchPriceRange()
  const { owner } = useSearchOwner()
  const { collectionId } = useSearchByCollectionId()
  const { userId } = useSearchByUserId()
  const { collections } = useSearchByCollections()

  const searchParams = computed(() => {
    return [
      keywords.value,
      ...priceRange.value,
      ...owner.value,
      ...collectionId.value,
      ...userId.value,
      ...collections.value,
    ]
  })

  return {
    searchParams,
  }
}
