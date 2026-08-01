import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

// Bundled fallbacks used until an admin uploads custom branding assets
// (or if they reset to default) from the /admin "Marca" tab.
export const DEFAULT_LOGO_URL = "/logo-brincae.png";
export const DEFAULT_HERO_IMAGE_URL = "/logo-brincae.png";

/**
 * Shared, cached read of the site_settings singleton row (logo + hero
 * image URLs). Every consumer uses the same react-query key, so saving
 * changes in the admin panel and invalidating ["site-settings"] updates
 * the header, footer and homepage everywhere at once.
 */
export function useSiteSettings() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("logo_url, hero_image_url")
        .eq("id", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    logoUrl: data?.logo_url || DEFAULT_LOGO_URL,
    heroImageUrl: data?.hero_image_url || DEFAULT_HERO_IMAGE_URL,
    isLoading,
    isError,
  };
}
