# [9.0.0](https://github.com/jquense/uncontrollable/compare/v8.0.4...v9.0.0) (2025-01-03)


### Features

* native esm build ([c2cd59b](https://github.com/jquense/uncontrollable/commit/c2cd59b1d5cffe3344e74dd2b76683034a1813bc))


### BREAKING CHANGES

* generate simpler real esm code





## [8.0.4](https://github.com/jquense/uncontrollable/compare/v8.0.3...v8.0.4) (2023-07-28)


### Bug Fixes

* types too strict ([2c135fb](https://github.com/jquense/uncontrollable/commit/2c135fbce2dc05f11bbb736a88400aed90d6bbac))





## [8.0.3](https://github.com/jquense/uncontrollable/compare/v8.0.2...v8.0.3) (2023-07-28)


### Bug Fixes

* pass throguh return value if present ([38c308a](https://github.com/jquense/uncontrollable/commit/38c308a7e5bd56460aafb2a20b38bdf633ec9350))





## [8.0.2](https://github.com/jquense/uncontrollable/compare/v8.0.1...v8.0.2) (2023-05-22)


### Bug Fixes

* move types out of deps ([400b834](https://github.com/jquense/uncontrollable/commit/400b834c5cafbc44706170a1ac137dbddf21c27e))





# [8.0.0](https://github.com/jquense/uncontrollable/compare/v7.2.0...v8.0.0) (2023-03-08)

### chore

- bump deps and remove HOC ([8924a68](https://github.com/jquense/uncontrollable/commit/8924a68880487e08cf3073d883cca6032be2e778))

### BREAKING CHANGES

- higher order component removed for just hooks, browser support bumped up to esm compatible
- dropped support for React 15

# [7.2.0](https://github.com/jquense/uncontrollable/compare/v7.1.1...v7.2.0) (2021-01-25)

### Features

- Allow React 17 types ([#50](https://github.com/jquense/uncontrollable/issues/50)) ([d1f5274](https://github.com/jquense/uncontrollable/commit/d1f527437b93af5baf4c1c038ee1d0afd4ce0d73))

## [7.1.1](https://github.com/jquense/uncontrollable/compare/v7.1.0...v7.1.1) (2019-10-31)

### Bug Fixes

- bump fstream from 1.0.11 to 1.0.12 ([#45](https://github.com/jquense/uncontrollable/issues/45)) ([97b1287](https://github.com/jquense/uncontrollable/commit/97b1287))
- bump sshpk from 1.11.0 to 1.16.1 ([#46](https://github.com/jquense/uncontrollable/issues/46)) ([80e19d5](https://github.com/jquense/uncontrollable/commit/80e19d5))
- clean up types ([bd29932](https://github.com/jquense/uncontrollable/commit/bd29932))

# [7.1.0](https://github.com/jquense/uncontrollable/compare/v7.0.2...v7.1.0) (2019-10-30)

### Features

- add useUncontrolledProp and types ([6e0837d](https://github.com/jquense/uncontrollable/commit/6e0837d))

## [7.0.2](https://github.com/jquense/uncontrollable/compare/v7.0.1...v7.0.2) (2019-10-03)

### Bug Fixes

- migrate unsafe lifecycle ([#40](https://github.com/jquense/uncontrollable/issues/40)) ([1607fff](https://github.com/jquense/uncontrollable/commit/1607fff))

## [7.0.1](https://github.com/jquense/uncontrollable/compare/v7.0.0...v7.0.1) (2019-09-06)

### Bug Fixes

- rename License.txt to LICENSE ([#39](https://github.com/jquense/uncontrollable/issues/39)) ([171e821](https://github.com/jquense/uncontrollable/commit/171e821))

# [7.0.0](https://github.com/jquense/uncontrollable/compare/v6.2.3...v7.0.0) (2019-06-18)

### Features

- consistent exports ([#37](https://github.com/jquense/uncontrollable/issues/37)) ([6b51ec6](https://github.com/jquense/uncontrollable/commit/6b51ec6))

### BREAKING CHANGES

- no more default export

* removed default export
* name files properly

- Use default exports

## [6.2.3](https://github.com/jquense/uncontrollable/compare/v6.2.2...v6.2.3) (2019-06-17)

### Bug Fixes

- republish again to fix build lol ([38f3bf8](https://github.com/jquense/uncontrollable/commit/38f3bf8))

## [6.2.2](https://github.com/jquense/uncontrollable/compare/v6.2.1...v6.2.2) (2019-06-17)

### Bug Fixes

- make default import ([e7ff375](https://github.com/jquense/uncontrollable/commit/e7ff375))

## [6.2.1](https://github.com/jquense/uncontrollable/compare/v6.2.0...v6.2.1) (2019-06-17)

### Bug Fixes

- bad publish ([82ef3fc](https://github.com/jquense/uncontrollable/commit/82ef3fc))

# [6.2.0](https://github.com/jquense/uncontrollable/compare/v6.1.0...v6.2.0) (2019-06-17)

### Features

- add esm support ([2457bf3](https://github.com/jquense/uncontrollable/commit/2457bf3))

# [6.1.0](https://github.com/jquense/uncontrollable/compare/v6.0.0...v6.1.0) (2019-02-12)

### Features

- add hook ([35c194d](https://github.com/jquense/uncontrollable/commit/35c194d))

<a name="6.0.0"></a>

# [6.0.0](https://github.com/jquense/uncontrollable/compare/v5.1.0...v6.0.0) (2018-05-02)

### Features

- Support forwardRef() ([a558754](https://github.com/jquense/uncontrollable/commit/a558754))

### BREAKING CHANGES

- attached refs are now the original components, and not
  the uncontrolled component instance
- removed getControlledInstance so there are no special
  methods on the uncontrolled component

<a name="5.1.0"></a>

# [5.1.0](https://github.com/jquense/uncontrollable/compare/v5.0.0...v5.1.0) (2018-03-31)

### Features

- better release tooling ([41bfc32](https://github.com/jquense/uncontrollable/commit/41bfc32))
