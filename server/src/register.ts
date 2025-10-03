import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  // Make the custom field known to the server
  strapi.customFields.register({
    name: 'icon', // -> 'plugin::icon-picker.icon'
    plugin: 'icon-picker', // your plugin id (no 'plugin::' prefix here)
    type: 'string', // base type stored in DB (matches your admin field)
    // (optionally you can add "validator" here later)
  });
};

export default register;
