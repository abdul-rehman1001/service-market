import type { AvailabilityCheckProvider } from '@/hooks/useAvailabilityFilter';

type HomeProvider = {
  id: string;
  mainService?: { id: string } | null;
  allServices?: { id: string }[] | null;
};

type ServicesProvider = {
  id: string;
  services?: { id: string }[] | null;
};

function isHomeProvider(
  provider: HomeProvider | ServicesProvider
): provider is HomeProvider {
  return 'mainService' in provider || 'allServices' in provider;
}

function getServiceId(provider: HomeProvider | ServicesProvider): string | null {
  if (isHomeProvider(provider)) {
    return provider.mainService?.id || provider.allServices?.[0]?.id || null;
  }
  return provider.services?.[0]?.id || null;
}

export function toAvailabilityCheckItems(
  providers: Array<HomeProvider | ServicesProvider>
): AvailabilityCheckProvider[] {
  return providers
    .map((provider) => {
      const serviceId = getServiceId(provider);
      if (!serviceId) {
        return null;
      }
      return { providerId: provider.id, serviceId };
    })
    .filter((item): item is AvailabilityCheckProvider => item !== null);
}
