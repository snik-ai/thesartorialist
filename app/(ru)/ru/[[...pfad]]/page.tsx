import { sprachRoute } from '@/components/seiten/sprachRoute';

// Alle Seiten der Sprache «ru» mit ihren lokalisierten Slugs (lib/i18n/routen.json).
const route = sprachRoute('ru');

export const dynamicParams = false;
export const revalidate = 900;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Seite;
