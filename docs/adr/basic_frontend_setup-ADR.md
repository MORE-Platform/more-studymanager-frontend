# Basic Frontend Setup ADR

**Created: [18.07.2022]**

**Last Updated: [19.07.2022]**

---

**Date: [19.07.2022]**

**State**: [RFC]

(
- OPEN: Initial state. Collecting data.
- IN PROGRESS: Discussion is ongoing.
- RFC:  A proposed decision has been made and now everyone can comment on it.
- DECIDED. Final state. A decision has been made and everyone had a fair chance to contribute.
)

**Participants**: [Names (Company) of all participants]

## Situation

The More configurator is a tool for creating and managing studies. It helps researcher to easily manage and review study progress of different participants.

## Problem

 To enable an easy access and effective basis for implementation, this document will compare different options for Frontend Tools and Frameworks. It comments about different possibilities and shows why different decisions were made.

The Documentation is structured in different parts and will cover Frontend Framework Component Libraries, Best Practice regulations, 3rd Party Components and Testing.


---

## 1. The Frontend Framework

###  1.1. Vuejs or Angular

[Angular](https://www.shapefield.de/services/development) and [Vue](https://vuejs.org/) are two of the most popular JavaScript front-end frameworks in 2022 and share some features altogether. Though Angular handles large-scale applications well, due to its many in-built functionalities, it is farly complex, looses flexibility and lags behind in terms of creating faster data flow.

Vue on the other hand is a lightweight and flexible JavaScript framework and provides advanced web tools for developing modern SPAs and front-end web applications. It is easily managable and opens up to the possibility to extend functionalities with customized modules and visual components, as well as customization and inbuilt templates. Its better support of virtual DOM (Document Object Model) helps in terms of performance. Moreover, it has a robust ecosystem with pretty good syntax designed for building user interfaces and solving complex problems.

#### 1.1.1. Decision
Deciding a framework is not a decision based on the capability of each framework, but it's about weighing the business needs against what each framework can offer for the project. Applications in scale of More can be handled well by Angular or Vue. Nevertheless, since More's Web application has a straightforward approach and usage, as well as needing only few specific custom modules, which have to be constructed nevertheless, Vue presents itself more suitable due to its flexibility and easier access to customized modules. Moreover, the development team has more insight and know-how with the Vue Framework. Thus, the application will be developed with [**Vue**](https://vuejs.org/).

### 1.2. Vue2 and Vue3

Vue 3 is built upon Vue 2 and includes all of its functionalities, as well as improvements (Instantiation, Provide & Infect, Teleport, Multi-Root Nodes, Composition API …). The Composition API helps to better encapsulate functionalities and to improve readability, maintainability, extensibility and reactivity (also see links to specific improvements3 and differences4). Vue 3 ended its beta phase in February 2022 and is now used as the New Default for Vue Applications. It fully supports TypeScript. Though there are some minor known issues referring to newer versions of TypeScript, working with custom models refines the internal framework workflow. It covers features desired by the community in a stable manner.

#### 1.2.1. Decision
Since downgrading to Vue 2 wouldn't bring any benefits and Vue 3 was declared the New Default and is running stable, [**Vue 3**](https://vuejs.org/guide/introduction.html) is used for the Frontend Framework.

### 1.3. Vue CLI or Vite

[Vite](https://vitejs.dev/) is a build tool for Vue and was developed by Vue's creator Evan You to improve on Vue's developement workflow and work with native ES modules of modern browsers. Vue and Vites functioinalities and in project workflow are very similar. As for now, due to its good community feedback and integration, it was extended for other Frameworks too.

[Vue CLI](https://cli.vuejs.org/) is a tool for quickly setting up a Vue-based project with standard build tools and best-practice configuration. Its main features include project scaffolding, dev server with hot-module reloading, plugin system and a user interface. It is built on top of Webpack and the development server, build functionality and performance will be a superset of Webpack.

Vite is also a build tool providing basic project scaffolding and a development server but isn’t based on Webpack and has its own development server which utilizes native ES modules in the browser. This architecture allows it to work faster (min. 10 times faster than Vue CLI). Vite also employs Rollup for the building process. It is currently in beta and its focus lies on providing a fast development server and basic build tools.

Different to Vue CLI, which builds the entire application into a JavaScript-based bundle by resolving every import and requirement in the app and transforming files through Webpack, Vite does not bundle the app server side but relies on the browser’s native support for JavaScript modules. It does not work with CommonJS and uses the native ES Modules of modern Browsers directly instead of generating bundles. The browser will request any JS module as needed via HTTP and process it during runtime. The development server will transform any files on-demand, which allows Vite to provide a significantly faster environment. Vite is only supporting browser with dynamic imports and thus is unable to create bundles tragetting old browsers and web components. Most modern browsers are supportert, except Internet Explorer, Opera Mini and Baidu.
Since 15th June, MS dropped support for IE11 and More is a modern Web Application and no Component library. Thus, the Vite’s few downsides will be of no consequence, and it will hardly provide problems in terms of the production process. Moreover, external components are built in NPM packages and are building themselves to provide as much compatibility as possible. Though it is advisable to look for Components without CommonJS, Vite can automatically bundle CommonJS to ES Modules and there are many Workarounds in case some CommonJS unexpectedly do make problems. Trends also show that Vite gained rapidly popularity and usage in the last year and is slowly outpacing Vue CLI.

#### 1.3.1. Vue CLI vs. Vite

| [Vue CLI](https://cli.vuejs.org/)                                                                         | [Vite](https://vitejs.dev/)                                                                                                                                                                                                          |
|:----------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Based on Webpack                                                                                          | Based on JavaScript ES Modules                                                                                                                                                                                                       |
| Bundle all Assets through Webpack, rebuilding everything into one large file each time                    | Uses browser native ES Modules and loads just the few ES modules needed for rendering a page                                                                                                                                         |
| Offers large ecosystem of plugins with features and loaders                                               | Has good plugin support which is steadily growing                                                                                                                                                                                    |
| Accessible to any Packages on the internet                                                                | Supports ES Modules, and bundles CommonJS into ES Modules                                                                                                                                                                            |
| Support of older and newest Browser                                                                       | Support the newest Browsers, except Internet Explorer, Opera Mini and Baidu                                                                                                                                                          |
| Processes is time consuming<ul><li>	Rebuilding everything into large files each time costs time</li></ul> | Min. 10 times faster than Vue CLI<ul><li>	Leverages the browser cache to do as little as possible</li><li>	Prebundles big libraries once into one single file, when starting the server</li><li>	Loads only needed modules</li></ul> |
| Uses Webpack, weak Rollup support                                                                         | Natural Rollup support (ES6 Modules)                                                                                                                                                                                                 |

##### 1.3.2. Sidenote NX
Vue standarizes Vue CLI or Vite as its build. [NX](https://nx.dev/) is another fast and extensible build system. There are only few examples where Vue was used together with NX inside the community. Due to its low support and missing documentation it would be to risky to use NX with Vue.


####  1.3.3. Decision
**[Vue 3](https://vuejs.org/guide/introduction.html) and [Vite](https://vitejs.dev/guide/)** will be used as Frontend Framework for More. Experiences with Vite did show that it shows view to none differences for the Frontend workflow process. It prioritizes code-splitting, which makes the code more understandable and speeds up compiling processes extensively.

 ## 2. Component Libraries

### 2.1. Bootstrap and Material Design

[Bootstrap](https://getbootstrap.com/) is the most popular HTML, CSS and JS framework for developing responsive, mobile first projects on the web. It offers build-in UI components, as well as a styling library. It comes with its own custom styles, which are often difficult to undo. However, experience did show that components, such as DateRangePicker and Datatable, which are also used inside More’s desktop application, often don’t work properly and thus, they has to be replaced with 3rd party components anyway.

[Vuetify](https://vuetifyjs.com/en/), which is Vue’s Material Design version and presents itself as complete UI-Framework for VueJs, is being adapted for Vue 3 at this moment and is currently in its Beta Phase. It was released two weeks before now and is not a stabile option.

### 2.2 Tailwind CSS

[Tailwind](https://tailwindcss.com/) works differently from Bootstrap. It is mainly a style library, which enables a faster development process. Though, it has first headless CSS approaches for UI components with [Tailwind UI](https://tailwindui.com/), it has to be handled with caution, because not all of them are working properly with Vue's reactivty system. In contrast to Bootstrap, Tailwind doesn’t present its own default theme, or imposes design decisions upon the application and thus makes it easier to use it with custom Designs. Tailwind CSS also gained popularity during the last few years.

Tailwind has with [Flowbite](https://flowbite.com/) another 3rd party extension for UI components which are hard to use with Vue’s reactivity. The Flowbite-vue version does partially work but former experience shows that it has still too many bugs to work properly. It won’t be used inside More.

###  2.3. Decision

More's Desktop Application uses very specific components, like the Timetable Chart or the Jitai Module, that have to be prepared seperately from libraries like Bootstrap or Material Design. Other smaller modules and design elements, based on the current design proposals, will have to be modeled after it's usage even if an additional component library was chosen. For modules like Datatable and DateRangePicker/TimePicker, where Bootstraps implementation can be highly flawed, there are already good free packages available, which will be used instead. Since the libraries won't give any additional value for the implementation, [**Tailwind**](https://tailwindcss.com/) presents itself as a better fit. It enables a fast workflow and doesn't impose on design decisions.


## 3. Workflow Practice (Best Practice)

### 3.1. Single File Components vs. Seperation of Concerns

Single File Components (SFC) are presented as Vue’s best practice variant. It enables encapsulation of templates, logic and styling of a Vue component through templates. An SFC contains CSS, JS and HTML used for the specific template and allows template-based loading and rendering of features and components based on their usage. This helps compile-time optimization and hot module replacement and has better IDE support in total. On the other hand, Separation of Concerns (RFC) practiced via separation of file types will separate files based on the useage of a specific language and divide the codebase into three huge layers that interweave with each other.

Inside a Vue project it makes more sense to divide functionalities into loosely-coupled components and compose them inside templates as SFC. This enables encapsulating based on functionalities and makes the component more cohesive and maintainable. Furthermore, there is still the possibility to encapsulate based on component and languages, if a component presents itself overly complex.

#### 3.1.1. Decision
Due to its better maintainability, better encapsulation and Vues template-based loading functionality, we will use [**Single File Components**](https://vuejs.org/guide/scaling-up/sfc.html) with More. Moreover, Vite loads only modules that are needed (even in development) where SFC will support the workflow with Vue and Vite better.

### 3.2 Typescript

TypeScript can detect common errors via static analysis, which reduces runtime error in production. It also helps developers to work more structured and methodical. It helps the work processes between Frontend and Backend-Developers by defining Datamodules for APIs and intersections. TypeScript also improves developer ergonomics via type-based auto-completion in IDEs and is fully supported by Vue.

#### 3.2.1. Decision

Since [**TypeScript**](https://www.typescriptlang.org/) will improve the workflow, structure and teamwork between developers, it will be used with More as well.

### 3.2. Stylesheet Language

[CSS](https://developer.mozilla.org/de/docs/Web/CSS) is an easy stylesheet language to design websites, but its simple form has limits. A preprocessor or Framework can offer an extended use of CSS, gives better handling and overview as well as extended functionalities.

#### 3.2.1. Preprocessor LESS and SASS (SCSS)

[LESS](https://lesscss.org/) and [SASS](https://sass-lang.com/) enable the use of variables and Mixins that can be configured so that they are only used with specific situations. They enable nesting of CSS classes, inheritance between selectors and partial stylesheets with imports (@import). LESS easily exhausts itself when working with logic operations. SASS on the other hand enables loops and conditions. It can use mathematic operations and functions. It also provides two different syntax styles: original SASS with intends or the newer SCSS version with brackets, similar to CSS. In terms of Preprocessors, SCSS would be the best option, because it includes more functionalities than LESS and is easier to read than SASS.

#### 3.2.2. PostCSS
Normal preprocessors are not easily extendable. [PostCSS](https://postcss.org/) provides an easy alternative to SASS/SCSS. PostCSS is a JavaScript library that transforms CSS into JavaScript and enables the manipulation of as Javascript objects based on the represented CSS. It enables all functionalities that SASS has too and extends the functionalities further. Its syntax is like SCSS, but it comes with its own config files.

#### 3.2.3. Decision
Since PostCSS is a perfect replacement for and uses the same syntax as SCSS, but extends its functionalities further, [**PostCSS**](https://postcss.org/) will be used in More’s Desktop Application. Furthermore, Tailwind and Vue Vite are both already working with PostCSS, which makes using another additional preprocessor obsolete.

###### Needed Extensions
- postcss-nested: enables nested syntax
- postcss-each: enables loops and variables for functions

### 3.3 Stylesheet Workflow and naming regulation

#### 3.3.1. Stylesheets and scoped styles
Tailwind style classes can be used to minimize custom classes. More complex stylings, that TailwindCSS’s library can’t provide are handled via custom classes.

Global styles will be split into different thematically adequate stylesheets, that are imported into a global style.pcss, which is included globally into the Vue setup. Naming of the stylesheets are determined due to their general purpose.
Component styles, as suggested by [Vues Style Guide](https://v2.vuejs.org/v2/style-guide/?redirect=true#Component-files-strongly-recommended) are sustained inside the specific SFC (single file component). This guarantees that styles are only used for their specific component and prevents styling conflicts or unintentional overrides.

##### 3.3.1.1. Naming and Prefixes
For an efficient workflow practice naming and naming prefixes can help to make code more readable and components/snippets easier to find.

###### Naming Conventions
- Components will be named after its main function (e.g. datatable.vue)
- Classes will be named after its component (e.g. datatable__list)
- Classes have only one usage. Style and JavaScript will have separate classes. Prefixes will help to determain their general purpose:
  - Style classes: no Prefix (datatable)
  - JavaScript classes: js- Prefix (js-datatable)

###### BEM
The [BEM](http://getbem.com/) rules were design to clarify relations between parent and children elements through class names. Though it can help with relations it easily makes code unreadable and classes complicated when names are getting too long. Since Tailwind already provides many classes to modify and style elements and the style is scoped inside its component, the BEM rules won’t mostly be necessary. More important is reasonable naming to improve detectability and manageability.
An only and possible exception is provided when working on components with many custom styles. Here BEM could be a possible concept to extend reasonable naming regulation, when needed.

### 3.4. Accessibility

Web Accessibility can help to provide access to Websites for (partially) disabled people. W3C defines [accessibilty standards](https://www.w3.org/WAI/standards-guidelines/) and additional [attributes](https://www.w3.org/WAI/standards-guidelines/aria/) to help with developing Web applications with accessibility approach. It mainly depends on the Applications use cases if Accessibility is included or not.

<font color="red"> Important: Accessibility wasn’t included in the proposal and will create additional work and expenses(?). Needs to be clearified with the clients.</font>

### 3.5. Authentication

Provider O-Auth. will be used for the authentication process. Here the user will be connected to a login site, which checks the session status or offers to enter the login data. After successfully logging in the user will be redirected to the More landing page.

For the specific authentication server the backend will use [Keycloak](https://www.psimms.de/keycloak-integration-in-vuejs-3/) or [Logto](https://docs.logto.io/docs/recipes/integrate-logto/vue/). Though Logto is more often used with Vue, both can be integrated with Vue. After the backend has prepered the authentication server with its tool of joice, the Vue for the specific tool can be implemented.

### 3.6. API Calls

The Backend will provide an already generated NPM packaged based on Open API generator, which can be easily fetched via Axios. The [Axois Typescript Generator](https://openapi-generator.tech/docs/generators/typescript-axios/) is used to generate said npm package out of the Open API yaml file. Configurations has to be made to provide separate components (models, api, enums …) (used in [Tailored-Media project](https://github.com/TailoredMediaProject/tm-openapi-client-typescript/blob/main/package.json)).

### 3.7. i18n

[i18n](https://www.npmjs.com/package/i18n) is a lightweight simple translation module with dynamic JSON storage. It helps to develop web applications for different languages by storing different language expressions in specific language JSON files. Vue implements its version of the module with [Vue I18n](https://vue-i18n.intlify.dev/) and enables an easy access to its functionalities.

#### 3.7.1. Decision
Since More has the potential to open access to different language groups, More will be developed with Vue's [i18n](https://vue-i18n.intlify.dev/) module. This will enable easier access to translation processes in later stages.

## 4. Assets and external components

### 4.1. Licensing Notes

When looking for external assets, components and packages, we will mainly work with free and open-source assets. Vue is already a free framework and most of the packages are open-source based. Specific licences can be checked with the [npm package checker](https://www.npmjs.com/package/license-checker).

#### 4.1.1. Assets
Images and Icons can be covered with free libraries that are licenced for noun project license. Libraries like [Tailwind’s HeroIcons](https://heroicons.com/), [Font Awesome](https://fontawesome.com/) or [Flaticon](https://www.flaticon.com/) are possibilities. Furthermore, Redlink has access to [Noun Project](https://thenounproject.com/icons/) icons, due to a NounPro subscription plan. Some of the icon libraries assets will need to be listed in the impressum, to gain free usage.

#### 4.1.2. Decision
The use of licence free icon libraries is for More mendatory. Only **royalty free icons** will be used throughout More. Thus, a **documentation of all licence and licence types** to list will be prepared during the development phase. Moreover, for the design used icons, which don't have a free licence, will be replaced.


### 4.3. External Components

Some of the components and functionalities are more complex and time-consuming than others. Therefore external 3rd party libraries will be used to handle their functionalities more effectively. Following features are included inside the existing design and will be researched documented in additional ADRs, before implementation:
-	Jitai Module
-	Timetable Chart
-	Datatable
-	DateRangePicker with TimePicker

### 5. Testing

The development process will include testing on the level of Unit Tests.
Since the Framework environment consists of Vue and Vite, Vitest is a good choice to use. It is based on Vue Test Utils and developed and extended specifically for Vue and Vite, as well as native to Vite itself.

The alternative Jest was created in a different context and is used throughout different Frameworks and environments, which makes it mandatory to configure Jest separately from the used environment for the environment. Vitest is similar in syntax, structure and usage to Jest, but enables the creation of a simple runner that doesn’t need to deal with the complexity of transforming source files. Thus, it can solely focus on providing the best DX during testing. Its test runner uses the same configuration for tests as Vite (vite.config.js) and shares a common transformation pipeline during development, build and test time, but can be additionally configured too. It provides first-class integration with Vite by using Vite development server to transform files during testing.

#### 5.1. Decision

Vitest represents a native testing tool for Vite, which is very similar to Jest. Through it's nativeness there are lesser to none issues because of compatibility or configuration. It is lightweight and covers Unit and Components which can be easily written and tested. Because its similarity with Jest and native integration, More will use **Vitest** for testing purposes.

---

## List of References

1. Angular vs. Vue: Which Frmework to Choose in 2022?: [Simform.com](https://www.simform.com/blog/angular-vs-vue/)
2. Composition API FAQ: [vuejs.org](https://vuejs.org/guide/extras/composition-api-faq.html)
3. Vue 2 vs. Vue 3 – Das sind die Unterschiede: [visyu.de](https://visyu.de/blog/vue-2-vs-vue-3-das-sind-die-unterschiede/)
4. Differences between Vue 2 and Vue : [javascript.plainenglish.io](https://javascript.plainenglish.io/differences-between-vue-2-and-vue-3-ee627e2c83a8)
5. Vuejs.org, Releases: [vuejs.org](https://vuejs.org/about/releases.html#typescript-definitions)
6. Vuejs.org Blog: Vue 3 as the New Default: [vuejs.org Blog](https://blog.vuejs.org/posts/vue-3-as-the-new-default.html)
7. Vue/Cli-Service vs. Vite Statistics: [npmtrends.com](https://npmtrends.com/@vue/cli-service-vs-vite)
8. Getting started with Vite and Vue 3: [blog.ninja-squad.com](https://blog.ninja-squad.com/2022/02/23/getting-started-with-vite-and-vue/)
9. Tailwind CSS vs. Bootstrap: Is it time to ditch UI kits?: [blog.logrocket.com](https://blog.logrocket.com/tailwind-css-vs-bootstrap-ui-kits/)
10. Bootstrap: [getbootstrap.com](https://getbootstrap.com/)
11. TailwindCSS: [tailwindcss.com](https://tailwindcss.com/)
12. Tailwind Flowbite: [flowbite.com](https://flowbite.com/)
13. Flowbite Vue: [github.com](https://github.com/themesberg/flowbite-vue#components)
14. Introducing Vite: A Better Vue CLI?: [codemag.com](https://www.codemag.com/Article/2109071/Introducing-Vite-A-Better-Vue-CLI)
15. Which is better, vite or Vue cli: [qdmana.com](https://qdmana.com/2022/01/202201291707232110.html)
16. Building for Production: [vitejs.dev](https://vitejs.dev/guide/build.html)
17. Has Vite Made Vue CLI Obsolete?: [vuejsdevelopers.com](https://vuejsdevelopers.com/2020/12/07/vite-vue-cli/) (careful: article from 2020, things have changed):
18. Vite and VitePress: [youtube.com](https://www.youtube.com/watch?v=xXrhg26VCSc&t=314s&ab_channel=VueConfToronto)
19. Vite and VitePress – Evan You: [youtube.com](https://www.youtube.com/watch?v=xXrhg26VCSc&ab_channel=VueConfToronto)
20. Dependency Pre-Bundling: [vitejs.dev](https://vitejs.dev/guide/dep-pre-bundling.html#the-why)
21. Vuetify 3 Beta; [next.vuetifyjs.com](https://next.vuetifyjs.com/en/getting-started/installation/)
22. Was ist Vuetify: [mobile forschungsgruppe](https://mfg.fhstp.ac.at/allgemein/was-ist-vuetify/)
23. Bootstrap vs. Tailwind Statistics: [npmtrends.com](https://npmtrends.com/bootstrap-vs-tailwindcss)
24. SFC Syntax Specifications: [vuejs.org](https://vuejs.org/api/sfc-spec.html#src-imports)
25. Seperation of Concerns Re-Revisited: [markus.oberlehner.net Blog](https://markus.oberlehner.net/blog/separation-of-concerns-re-revisited/)
26. Why are “.vue” Single File Components preferred to separate files in TypeScript: [stackoverflow.com](https://stackoverflow.com/questions/49176735/why-are-vue-single-file-components-preferred-to-separate-files-in-typescript)
27. Using Vue with Typescript: [vuejs.org](https://vuejs.org/guide/typescript/overview.html)
28. SASS: CSS auf dem nächsten Level?: [ionos.at](https://www.ionos.at/digitalguide/websites/web-entwicklung/sass/)
29. Using with Preprocessors: [tailwindcss.com](https://tailwindcss.com/docs/using-with-preprocessors)
30. PostCSS vs. SASS: Why You Should Use PostCSS With Vue (+How): [zerotomastery.io](https://zerotomastery.io/blog/postcss-vs-sass/)
31. Vuejs/test-utils: [github.com](https://github.com/vuejs/test-utils)
32. Vitest – Getting Started: [vitest.dev](https://vitest.dev/guide/)
33. Documentation for the typescript-axios Generator: [openapi-generator.tech](https://openapi-generator.tech/docs/generators/typescript-axios/)
34. Tm-openapi-client-typescript: [github.com](https://github.com/TailoredMediaProject/tm-openapi-client-typescript/blob/main/package.json)
35. NPM License Checker: [npmjs.com](https://www.npmjs.com/package/license-checker)
36. Vue Style Guide: [vuejs.org](https://v2.vuejs.org/v2/style-guide/?redirect=true#Component-files-strongly-recommended)
37. Why Vitest: [Vitest](https://vitest.dev/guide/why.html)
38. Angular Vs. Vue: Which Framework to Choos in 2022?: [javascript.plainenglish.io](https://javascript.plainenglish.io/angular-vs-vue-which-framework-to-choose-in-2022-579efcb50e82)
39. Angular vs. React vs. Vue.js: Which is the Best Choice for 2022?: [javascript.plainenglish.io](https://javascript.plainenglish.io/angular-vs-react-vs-vue-js-which-is-the-best-choice-for-2022-5ef83f2257ab)
40. Vue: Integrate @logto/vue: [docs.logto.io](https://docs.logto.io/docs/recipes/integrate-logto/vue/)
41. Keycloak Integration in Vuejs 3: [www.psimms.de](https://www.psimms.de/keycloak-integration-in-vuejs-3/)
42. Github vue-keycloak Repository: [github.com](https://github.com/baloise/vue-keycloak)
43. NX: [nx.dev](https://nx.dev/)
44. Tailwind UI: [tailwindui.com](https://tailwindui.com/)
45. Typescript: [typescriptlang.org](https://www.typescriptlang.org/)
46. W3C Accessibility Rules: [www.w3.org](https://www.w3.org/WAI/standards-guidelines/)
47. W3C Wai-AIRA Overview: [www.w3.org](https://www.w3.org/WAI/standards-guidelines/aria/)
48. Block Element Modifier (BEM): [getbem.com](http://getbem.com/)
49. CSS: [developer.mozilla.org](https://developer.mozilla.org/de/docs/Web/CSS)
50. LESS: [lesscss.org](https://lesscss.org/)
51. SASS: [sass-lang.com](https://sass-lang.com/)
52. PostCSS: [postcss.org](https://postcss.org/)
53. i18n: [npmjs.com](https://www.npmjs.com/package/i18n)
54. Vue i18n: [vue-i18n.infinity.dev](https://vue-i18n.intlify.dev/)
55. Vue i18n Introduction: [vue-i18n.intlify.dev](https://vue-i18n.intlify.dev/introduction.html)
56. Noun Project: [thenounproject.com](https://thenounproject.com/icons/)
57. Flaticon: [flaticon.com](https://www.flaticon.com/)
58. Font Awesome: [fontawesome.com](https://fontawesome.com/)
59. Heroicons: [heroicons.com](https://heroicons.com/)

---
