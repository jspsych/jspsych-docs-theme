/**
 * Enhances theme-classic's NavbarItem ComponentTypes registry with the jsPsych
 * ecosystem switcher, exposed under the `custom-jspsychEcosystem` navbar item
 * type. Docusaurus allows navbar item `type` values prefixed `custom-`.
 *
 * Sites (or the preset factory) opt in by adding a navbar item:
 *
 *     {type: 'custom-jspsychEcosystem', position: 'right'}
 */
import ComponentTypes from '@theme-init/NavbarItem/ComponentTypes';
import EcosystemSwitcher from './EcosystemSwitcher';

export default {
  ...ComponentTypes,
  'custom-jspsychEcosystem': EcosystemSwitcher,
};
