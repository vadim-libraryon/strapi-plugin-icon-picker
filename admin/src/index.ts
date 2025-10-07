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
      options: {
        advanced: [
          {
            sectionTitle: { id: `${PLUGIN_ID}.options.section`, defaultMessage: 'Icon Picker' },
            items: [
              {
                name: 'options.grid',
                type: 'checkbox',
                intlLabel: { id: `${PLUGIN_ID}.options.grid`, defaultMessage: 'Grid mode (tiles)' },
                intlDescription: {
                  id: `${PLUGIN_ID}.options.grid.hint`,
                  defaultMessage: 'Show icons as clickable tiles instead of a dropdown.',
                },
                defaultValue: false,
              },
              {
                name: 'options.search',
                type: 'checkbox',
                intlLabel: { id: `${PLUGIN_ID}.options.search`, defaultMessage: 'Search input' },
                intlDescription: {
                  id: `${PLUGIN_ID}.options.search.hint`,
                  defaultMessage: 'Show a search box to filter icons.',
                },
                defaultValue: false,
              },
            ],
          },
        ],
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
