export interface GallerySettings {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  gridAspectRatio: number;
}

export const DEFAULT_SETTINGS: GallerySettings = {
  siteTitle: 'Silvia Art',
  siteDescription: 'Paintings gallery by Silvia',
  contactEmail: 'ilvijorbus@hotmail.com',
  gridAspectRatio: 1,
};

export const ADMIN_CMS_URL = 'https://jorbush.github.io/silvia-art-content/admin/';
export const REPO_AUTHOR_URL = 'https://github.com/jorbush';
export const REPO_SOURCE_URL = 'https://github.com/jorbush/silvia-art';
export const SITE_URL = import.meta.env.SITE || 'https://silvia-art.vercel.app';
