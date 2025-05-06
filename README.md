# MORE / Front-End
The Management & Monitoring Backend (MMB) is the front-end to manage and monitor the back-end.
The [frontend`s architecture](docs/adr) is based upon an Architectural Decision Records (ADR).
Mainly, Vue 3, vite, TS, tailwindCSS and PrimeVue are used.
To have a consistent code style and quality, we use Eslint in combination with prettier.

# Setup
```
nvm use                   # Optional, let nvm use the needed version
npm i                     # install all dependencies
npm run generate:api      # generate needed sourced from BE, for generation as in the pipeline, java 17 must be set in your path
npm run dev               # start local development server
```
See [nvm](https://github.com/nvm-sh/nvm) for more. The local front-end can be visited on http://localhost:3000, the [gateway](https://github.com/MORE-Platform/more-data-gateway), [back-end](https://github.com/MORE-Platform/more-studymanager-backend) with their dependencies must also run locally. See `vite.config.ts` for the required port for localhost.

## Intellij, Webstorm ESLint configuration
Set the EsLint settings for Webstorm in Preferences --> Languages & Frameworks --> Javascript --> Code Quality Tools --> ESLint

- Automatic ESLint config check
- File extensions to check: `{**/*,*}.{js,ts,html,vue,json}`
- Check on run eslint fix on save

**Currently not working because of Intellij IDEs..., use `npm run lint:fix` for now**

# Scripts
- `npm i`: install dependencies / node modules
- `npm run`: shows all possible `npm` run commands including generation, development, linting, testing, and building

# Dependencies

- [EsLint 8](https://eslint.org/docs/user-guide/getting-started) for code formatting
- [Headless UI](https://headlessui.dev/vue/menu)
- [Heroicons](https://github.com/tailwindlabs/heroicons#vue)
- [i18n](https://vue-i18n.intlify.dev/)
- [jsDom](https://github.com/jsdom/jsdom)
- [PostCSS](https://postcss.org/): install PostCSS plugin for VS Code and Jetbrains Editors
- [Prettier](https://prettier.io/docs/en/install.html): install Prettier plugin for VS Code, Jetbrains Editors have it
  included
- [prettier-plugin-tailwindcss](https://tailwindcss.com/blog/automatic-class-sorting-with-prettier)
- [PrimeVue](https://www.primefaces.org/primevue/): for components
- [Tailwind CSS 3](https://tailwindcss.com/docs/configuration)
- [Typescript 5](https://www.typescriptlang.org/)
- [Vite 6](https://vitejs.dev/guide/)
- [Vitest 3](https://vitest.dev/)
- [Vue 3](https://staging.vuejs.org/guide/introduction.html)
- [Vue Router v4](https://github.com/vuejs/vue-router-next)
- [Vue Test Library](https://testing-library.com/docs/vue-testing-library/intro/)
- [Vue Test Utils](https://github.com/vuejs/test-utils)

First-party plugins needed for Tailwind UI:

- [tailwindcss/forms](https://github.com/tailwindlabs/tailwindcss-forms)
- [tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)
- [tailwindcss/aspect-ratio](https://github.com/tailwindlabs/tailwindcss-aspect-ratio)


The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.


## Generation
Make sure that the enum structure within `openapi/StudyManagerApi.yml` is

```
1574  StudyDuration:
            type: object
            properties:
              value:
                type: integer
              unit:
                $ref: '#/components/schemas/DurationUnit'
          DurationUnit:
            type: string
            description: unit of time
            enum:
              - MINUTE
              - HOUR
              - DAY

```
Otherwise, the generated enums will be duplicated, leading to errors.

## Testing Environment with Vitest
Run

```
npm run test:unit
```

- [Vitest Documentation](https://vitest.dev/api/)
- [Vitest quick explanation](https://www.youtube.com/watch?v=snCLQmINqCU&ab_channel=LearnVue)
- [Vite introduction with Vue](https://www.youtube.com/watch?v=FJRuG85tXV0&ab_channel=ProgramWithErik)
