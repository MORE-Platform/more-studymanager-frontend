# MORE - MMB: Management & Monitoring Backend (Frontend)

The [frontend`s architecture](docs/adr) is based upon an Architectural Decision Records (ADR).

Mainly, Vue 3, vite, TS, tailwindCSS and PrimeVue are used.

## Things to do to start development
```
npm i
npm run dev
npm run generate:api
```
go to http://localhost:3000

To have a consistent code style and quality, we use Eslint in combination with prettier.

Node.js version known to work well as of 2024-12: v20.14.0
NPM version known to work well as of 2024-12: v10.7.0

### Selecting backend 

You can modify which backend you want to connect to by modifying the `package.json` file. E.g. to point to a remote backend:
- Look for the following parameter `scripts->dev:local`
- Change `VITE_LOCAL_BACKEND=true` to `VITE_LOCAL_BACKEND=false`
- Change the backend in the vite.config.ts file by replacing `https://studymanager.platform-test.more.redlink.io/api` with your URL path.

### Intellij, Webstorm ESLint configuration
Set the EsLint settings for Webstorm in Preferences --> Languages & Frameworks --> Javascript --> Code Quality Tools --> ESLint

- Automatic ESLint config check
- File extensions to check: `{**/*,*}.{js,ts,html,vue,json}`
- Check on run eslint fix on save

**Currently not working because of Intellij IDEs..., use `npm run lint:fix` for now**

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


# NPM Package update Notes 31.01.2023

- [Vite](https://vitejs.dev/): Update from Vite ^2.0.0 to 3.2.5 was made because of compatibility problems
- [Vite](https://vitejs.dev/) 3.2.5 (to 4.0.4): Vite 4 is relatively new. Dependencies are stable and dependent/working on Vite ^3.0.0. Check on a later date if update to ^4.0.0 is  advisable.
- [@vitejs/plugin-vue](https://www.npmjs.com/package/@vitejs/plugin-vue/v/4.0.0-beta.0 update from 3.2.0 to 4.0.0: works only with Vite ^4.0.0
- [Primevue](https://primevue.org/) 3.17.0 to 3.23.0: 3.23.0. still has the bug, where table row edit blocks the space. Check on a later date for update patches.
- [Primicons](https://www.primefaces.org/diamond/icons.xhtml) 5.0.0 to 6.0.1:  Primicons 6.0.1 need the newest Primevue version 3.23.0. Can be updated with Primevue, when known issue is fixed.
- [Heroicons](https://heroicons.com/) Update from 1.0.6 to ^2.0.14: All icons were changed to another design. There is no need to update if current design of icons are fine.
