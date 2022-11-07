# MORE - MMB: Management & Monitoring Backend (Frontend)

## Important Notes

### Storybook
The Version of <font color="red">Storybook has 33 Vunerabilites </color> and will be fixed
in a future version of storybook. Since Storybook won't be deployed and is only used for
dumb component development in dev process, they can be ignored for now. The API will
replace storybook development in the future.


* [Architecture Decision Records](docs/adr)

## Vue Environment

### Scripts

- `npm i`: install dependencies / node modulse
- `npm run dev`: run app in dev environment
- `npm run package`: build app
- `npm run preview`: test vite for production
- `npm run test:unit`: runs unit tests and watches for changes
- `npm run test:unit:once`: runs unit tests once, doesn't watch for changes
- `npm run coverage`: creates code coverage. run twice after installation
- `test:unit`: runs unit test files in components/__tests__ and watches for changes
- `test:unit:once`: runs unit test files once and writes a log file
- `storybook`: runs storybook on 6006
- `storybook-addon-i18n`: too use i18n also with storybook

### Testing Environment with Vitest

Vitest + Vue Test Utils + Vue Test Library + jsDom

- [Vitest Documentation](https://vitest.dev/api/)
- [Vitest quick explanation](https://www.youtube.com/watch?v=snCLQmINqCU&ab_channel=LearnVue)
- [Vite introduction with Vue](https://www.youtube.com/watch?v=FJRuG85tXV0&ab_channel=ProgramWithErik)


### Project setup

Vue 3 + Vite + Tailwind + TypeScript + PostCSS + Vitest

Includes ESlint and Prettier for formatation and i18n for multilanguage option.

#### Project includes
- [Vite](https://vitejs.dev/guide/)
- [Vue 3](https://staging.vuejs.org/guide/introduction.html)
- [Vue Router v4](https://github.com/vuejs/vue-router-next)
- [Tailwind CSS v3](https://tailwindcss.com/docs/configuration)
- [Headless UI](https://headlessui.dev/vue/menu)
- [Heroicons](https://github.com/tailwindlabs/heroicons#vue)
- [Typescript](https://www.typescriptlang.org/)
- [Eslint](https://eslint.org/docs/user-guide/getting-started)
- [Prettier](https://prettier.io/docs/en/install.html): install Prettier plugin
- [prettier-plugin-tailwindcss](https://tailwindcss.com/blog/automatic-class-sorting-with-prettier)
- [PostCSS](https://postcss.org/): install PostCSS plugin
- [i18n V.9](https://vue-i18n.intlify.dev/)
- [Vitest](https://vitest.dev/)
- [Vue Test Utils](https://github.com/vuejs/test-utils)
- [Vue Test Library](https://testing-library.com/docs/vue-testing-library/intro/)
- [jsDom](https://github.com/jsdom/jsdom)
- [PrimeVue](https://www.primefaces.org/primevue/): for components

First-party plugins needed for Tailwind UI:

- [tailwindcss/forms](https://github.com/tailwindlabs/tailwindcss-forms)
- [tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)
- [tailwindcss/line-clamp](https://github.com/tailwindlabs/tailwindcss-line-clamp)
- [tailwindcss/aspect-ratio](https://github.com/tailwindlabs/tailwindcss-aspect-ratio)


The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

