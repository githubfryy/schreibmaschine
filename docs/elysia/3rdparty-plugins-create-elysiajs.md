## create-elysiajs




[![npm](https://camo.githubusercontent.com/af3b98bb92355225cd95ce6003c7e6ae7393e56c9deb40fcfc14ffb77e80167b/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f6372656174652d656c797369616a733f6c6f676f3d6e706d267374796c653d666c6174266c6162656c436f6c6f723d30303026636f6c6f723d336238326636)](https://www.npmjs.org/package/create-elysiajs) [![npm downloads](https://camo.githubusercontent.com/6f5bf36d35e8bccad9edb5db18ac8fc502ffb85b95949e47aa5fb0677d5472d8/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f64772f6372656174652d656c797369616a733f6c6f676f3d6e706d267374796c653d666c6174266c6162656c436f6c6f723d30303026636f6c6f723d336238326636)](https://www.npmjs.org/package/create-elysiajs)


## Scaffolding your [Elysia](https://elysiajs.com/) project with the environment with easy!





### With [bun](https://bun.sh/)




```
bun create elysiajs <dir\>
```

> Support for other package managers will appear later (Maybe, huh)


## Supported environment




-   Linters
-   -   [Biome](https://biomejs.dev/)
-   -   [ESLint](https://eslint.org/) with [@antfu/eslint-config](https://eslint-config.antfu.me/rules)
-   ORM/Query builders
-   -   [Prisma](https://www.prisma.io/)
-   -   [Drizzle](https://orm.drizzle.team/)
-   Plugins
-   -   [CORS](https://elysiajs.com/plugins/cors.html)
-   -   [Swagger](https://elysiajs.com/plugins/swagger.html)
-   -   [JWT](https://elysiajs.com/plugins/jwt.html)
-   -   [Autoload](https://github.com/kravetsone/elysia-autoload)
-   -   [Oauth 2.0](https://github.com/kravetsone/elysia-oauth2)
-   -   [HTML/JSX](https://elysiajs.com/plugins/html.html)
-   -   [Logger](https://github.com/bogeychan/elysia-logger)
-   -   [Static](https://elysiajs.com/plugins/static.html)
-   -   [Bearer](https://elysiajs.com/plugins/bearer.html)
-   -   [Server Timing](https://elysiajs.com/plugins/server-timing.html)
-   Test with bun:test and mocks for
-   -   [PGLite](https://pglite.dev/) for Postgres
-   -   [IoRedisMock](https://www.npmjs.com/package/ioredis-mock) for Redis
-   Others
-   -   [Dockerfile](https://www.docker.com/) + [docker-compose.yml](https://docs.docker.com/compose/)
-   -   [Jobify](https://github.com/kravetsone/jobify) ([Bullmq](https://docs.bullmq.io/) wrapper)
-   -   [Posthog](https://posthog.com/docs/libraries/node)
-   -   [Verrou](https://github.com/kravetsone/verrou) (Locks)
-   -   [Env-var](https://github.com/evanshortiss/env-var) (Environment variables)
-   -   [.vscode](https://code.visualstudio.com/) (VSCode settings)
-   -   [Husky](https://typicode.github.io/husky/) (Git hooks)
-   And more soon...

> With renovate, we keep dependencies up to date

> The environment can work `together`
> When you select [ESLint](https://eslint.org/) and [Drizzle](https://orm.drizzle.team/), you get [eslint-plugin-drizzle](https://orm.drizzle.team/docs/eslint-plugin)
> When you select [Husky](https://typicode.github.io/husky/) and one of the [linters](#supported-environment) - the `pre-commit` hook will contain the command `lint:fix`