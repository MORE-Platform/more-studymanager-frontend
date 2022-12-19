# MORE - MMB: Management & Monitoring Backend (Frontend)

The [frontend`s architecture](docs/adr) is based upon an Architectural Decision Records (ADR).

Mainly, Vue 3, vite, TS, tailwindCSS and PrimeVue are used.

## Things to do to start development
```
npm i
npm run dev
```
go to http://localhost:3000

To have a consistent code style and quality, we use Eslint in combination with prettier.


### Intellij, Webstorm ESLint configuration
Set the EsLint settings for Webstorm in Preferences --> Languages & Frameworks --> Javascript --> Code Quality Tools --> ESLint

- Automatic ESLint config check
- File extensions to check: `{**/*,*}.{js,ts,html,vue,json}`
- Check on run eslint fix on save

## Vue Environment

### Scripts

- `npm i`: install dependencies / node modules
- `npm run dev`: run app locally in dev environment
- `npm run package`: build app
- `npm run preview`: builds app and lets the build run on a server locally - more production like preview
- `npm run test:unit`: runs unit tests and watches for changes
- `npm run test:unit:once`: runs unit tests once, doesn't watch for changes
- `npm run coverage`: creates code coverage. run twice after installation
- `npm run storybook`: runs storybook on 6006
- `npm run lint`: runs eslint to check code quality


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
- [Prettier](https://prettier.io/docs/en/install.html): install Prettier plugin for VS Code, Jetbrains Editors have it included
- [prettier-plugin-tailwindcss](https://tailwindcss.com/blog/automatic-class-sorting-with-prettier)
- [PostCSS](https://postcss.org/): install PostCSS plugin for VS Code and Jetbrains Editors
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


### Testing Environment with Vitest

Vitest + Vue Test Utils + Vue Test Library + jsDom

- [Vitest Documentation](https://vitest.dev/api/)
- [Vitest quick explanation](https://www.youtube.com/watch?v=snCLQmINqCU&ab_channel=LearnVue)
- [Vite introduction with Vue](https://www.youtube.com/watch?v=FJRuG85tXV0&ab_channel=ProgramWithErik)


### Storybook
The Version of <font color="red">Storybook has 33 Vunerabilites </font> and will be fixed
in a future version of storybook. Since Storybook won't be deployed and is only used for
dumb component development in dev process, they can be ignored for now. The API will
replace storybook development in the future.
