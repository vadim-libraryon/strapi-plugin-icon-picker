import { getTranslation } from './utils/getTranslation';
import type { StrapiApp } from '@strapi/strapi/admin';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';

export default {
  register(app: StrapiApp) {
    app.customFields.register({
      name: 'icon', // used in schema: customField: 'plugin::icon-picker.icon'
      pluginId: PLUGIN_ID,
      type: 'string', // MVP stores just the slug string (v4-compatible)
      intlLabel: {
        id: `${PLUGIN_ID}.field.label`,
        defaultMessage: 'Icon',
      },
      intlDescription: {
        id: `${PLUGIN_ID}.field.description`,
        defaultMessage: 'Choose an icon',
      },
      components: {
        Input: async () => {
          const mod: any = await import('./components/IconPickerInput');
          // Cast to the shape Strapi expects for async-loaded components:
          return { default: mod.default } as any;
        },
      },
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
