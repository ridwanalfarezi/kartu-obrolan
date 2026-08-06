import {
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config';

const brandBackground = '#251153';

export default defineConfig({
  images: ['public/favicon.svg'],
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: {
        fit: 'contain',
        background: brandBackground,
      },
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: {
        fit: 'contain',
        background: brandBackground,
      },
    },
  },
});
