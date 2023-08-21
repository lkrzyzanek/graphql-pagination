# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.11.0](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.10.1...@graphql-pagination/core@1.11.0) (2023-08-21)


### Bug Fixes

* pager args first/last validation on non-negative number [#123](https://github.com/lkrzyzanek/graphql-pagination/issues/123) ([24c072a](https://github.com/lkrzyzanek/graphql-pagination/commit/24c072a33bc2a7af70fd903234b77a29cc58955d))


### Features

* typescript 5.0 release ([1ceb44a](https://github.com/lkrzyzanek/graphql-pagination/commit/1ceb44ae2e54ecbf7942c4f0dfc0b31d43b7f2c1))
* typescript 5.0 release ([f771cef](https://github.com/lkrzyzanek/graphql-pagination/commit/f771cef8fc844ac587ce271592ff47fbb4b79abe))





## [1.10.1](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.10.0...@graphql-pagination/core@1.10.1) (2023-04-12)


### Bug Fixes

* removed sourceRoot fixes [#114](https://github.com/lkrzyzanek/graphql-pagination/issues/114) ([71fb898](https://github.com/lkrzyzanek/graphql-pagination/commit/71fb898f46d9f7061f7bdaffad7790f31ce42ca1))





# [1.10.0](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.9.0...@graphql-pagination/core@1.10.0) (2023-03-30)


### Features

* Support MongoDB DataSource fixes [#111](https://github.com/lkrzyzanek/graphql-pagination/issues/111) ([#113](https://github.com/lkrzyzanek/graphql-pagination/issues/113)) ([f612ca3](https://github.com/lkrzyzanek/graphql-pagination/commit/f612ca3ec873977decc170a9900d79da2931981c))





# [1.9.0](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.8.0...@graphql-pagination/core@1.9.0) (2023-03-24)


### Features

* dataloader integration via dataloaderPagerWrapper & dataSourceLoaderPager fixes [#107](https://github.com/lkrzyzanek/graphql-pagination/issues/107) ([c3be565](https://github.com/lkrzyzanek/graphql-pagination/commit/c3be565d325e5686c9053dbe8fc8d8411f67e58e))





# [1.8.0](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.7.0...@graphql-pagination/core@1.8.0) (2023-03-23)


### Features

* Remove apollo-datasource package fixes [#105](https://github.com/lkrzyzanek/graphql-pagination/issues/105) ([5837a23](https://github.com/lkrzyzanek/graphql-pagination/commit/5837a2323cb25c446e9b05aec2c4bec6acf1147b))
* Remove DataSourcePager class fixes [#104](https://github.com/lkrzyzanek/graphql-pagination/issues/104) ([7481282](https://github.com/lkrzyzanek/graphql-pagination/commit/7481282cb92ce11626e9e04d16430c227d8a1127))





# [1.7.0](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.6.0...@graphql-pagination/core@1.7.0) (2023-03-20)


### Features

* Generics for Args fixes [#102](https://github.com/lkrzyzanek/graphql-pagination/issues/102) ([b96a251](https://github.com/lkrzyzanek/graphql-pagination/commit/b96a2517a4314864dd8ac599938397be89ecb4bb))





# [1.6.0](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.5.5...@graphql-pagination/core@1.6.0) (2023-03-16)


### Features

* Generics on pager, data source, configs fixes [#99](https://github.com/lkrzyzanek/graphql-pagination/issues/99) ([851cc39](https://github.com/lkrzyzanek/graphql-pagination/commit/851cc39f6e2c0a231e5e1729d0d2c86f9ec5abd4))





## [1.5.5](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.5.4...@graphql-pagination/core@1.5.5) (2023-03-15)


### Bug Fixes

* correct handling when ArrayDatasource's id is number starting with 0 fixes [#96](https://github.com/lkrzyzanek/graphql-pagination/issues/96) ([e306268](https://github.com/lkrzyzanek/graphql-pagination/commit/e30626805404b00452662b78f02588e63c275084))





## [1.5.4](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.5.3...@graphql-pagination/core@1.5.4) (2023-03-08)


### Bug Fixes

* Connection.pageInfo TS type should required fixes [#94](https://github.com/lkrzyzanek/graphql-pagination/issues/94) ([6dcab23](https://github.com/lkrzyzanek/graphql-pagination/commit/6dcab23be88d0493b3a198a72f7dd8e576df0eee))





## [1.5.3](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.5.2...@graphql-pagination/core@1.5.3) (2023-03-08)


### Bug Fixes

* Use primitive types in PageInfo object ([ed8d3fe](https://github.com/lkrzyzanek/graphql-pagination/commit/ed8d3fe7475a81d7abfb87204bffe50253935931))





## [1.5.2](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.5.1...@graphql-pagination/core@1.5.2) (2023-02-27)

**Note:** Version bump only for package @graphql-pagination/core





## [1.5.1](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.5.0...@graphql-pagination/core@1.5.1) (2023-02-16)


### Bug Fixes

* throw GraphQLError with bad_user_input in all cases of decoding cursor [#73](https://github.com/lkrzyzanek/graphql-pagination/issues/73) ([989594c](https://github.com/lkrzyzanek/graphql-pagination/commit/989594c00c4b8db13abb4424577a2bb50525ba76))





# [1.5.0](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.4.5...@graphql-pagination/core@1.5.0) (2023-02-16)


### Features

* use GraphQLError with extensions [#73](https://github.com/lkrzyzanek/graphql-pagination/issues/73) ([6251df1](https://github.com/lkrzyzanek/graphql-pagination/commit/6251df12741ba586008839eeefba04bc78e27700))





## [1.4.5](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.4.4...@graphql-pagination/core@1.4.5) (2022-12-20)

**Note:** Version bump only for package @graphql-pagination/core





## [1.4.4](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.4.3...@graphql-pagination/core@1.4.4) (2022-12-19)

**Note:** Version bump only for package @graphql-pagination/core





## [1.4.3](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.4.2...@graphql-pagination/core@1.4.3) (2022-12-19)

**Note:** Version bump only for package @graphql-pagination/core





## [1.4.2](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.4.1...@graphql-pagination/core@1.4.2) (2022-12-19)

**Note:** Version bump only for package @graphql-pagination/core





## [1.4.1](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.4.0...@graphql-pagination/core@1.4.1) (2022-10-20)

**Note:** Version bump only for package @graphql-pagination/core





# [1.4.0](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.3.2...@graphql-pagination/core@1.4.0) (2022-10-20)


### Features

* Allow to add directives to autogenerated pager objects - publish [#65](https://github.com/lkrzyzanek/graphql-pagination/issues/65) ([8ca8a9a](https://github.com/lkrzyzanek/graphql-pagination/commit/8ca8a9a2e708b937373f90c4c670d0a5845e2ae8))
* Allow to add directives to autogenerated pager objects - publish [#65](https://github.com/lkrzyzanek/graphql-pagination/issues/65) ([0a5871c](https://github.com/lkrzyzanek/graphql-pagination/commit/0a5871c9adef4b62576355cb5bc32efa9bdbf11d))
* Allow to add directives to autogenerated pager objects fixes [#65](https://github.com/lkrzyzanek/graphql-pagination/issues/65) ([b17d4df](https://github.com/lkrzyzanek/graphql-pagination/commit/b17d4dfd21a716dc84acdd5c5262c2f369d18695))





## [1.3.2](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.3.1...@graphql-pagination/core@1.3.2) (2022-05-30)


### Bug Fixes

* cursor decode fix on values with underscore [#53](https://github.com/lkrzyzanek/graphql-pagination/issues/53) ([98bbbe8](https://github.com/lkrzyzanek/graphql-pagination/commit/98bbbe8801e4ca183bdfd70f67a5aeeb8bb3af92))





## [1.3.1](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.3.0...@graphql-pagination/core@1.3.1) (2022-05-11)


### Bug Fixes

* OffsetDataSourceWrapper export [#49](https://github.com/lkrzyzanek/graphql-pagination/issues/49) ([b7f0bce](https://github.com/lkrzyzanek/graphql-pagination/commit/b7f0bce3e54bc28c8627f004a918811a4533380e))





# [1.3.0](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.2.2...@graphql-pagination/core@1.3.0) (2022-05-11)


### Features

* Offset Style DataSource fixes [#49](https://github.com/lkrzyzanek/graphql-pagination/issues/49) ([9aaca6a](https://github.com/lkrzyzanek/graphql-pagination/commit/9aaca6a40dce9634a93e51d03c320e64f052f0ec))





## [1.2.2](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.2.1...@graphql-pagination/core@1.2.2) (2022-05-10)


### Bug Fixes

* DataSourceBase - getId value can be zero fixes [#47](https://github.com/lkrzyzanek/graphql-pagination/issues/47) ([2459271](https://github.com/lkrzyzanek/graphql-pagination/commit/2459271181254ff4d78e10ca16282e202c30d0ea))





## [1.2.1](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.2.0...@graphql-pagination/core@1.2.1) (2022-05-06)

**Note:** Version bump only for package @graphql-pagination/core





# [1.2.0](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.1.0...@graphql-pagination/core@1.2.0) (2022-05-06)


### Features

* ArrayDataSource - async function as source of data fixes [#43](https://github.com/lkrzyzanek/graphql-pagination/issues/43) ([7332ce8](https://github.com/lkrzyzanek/graphql-pagination/commit/7332ce83814b2c955f6484dee62475ae01ce7a5a))
* ArrayDataSource - string type for ID fixes [#44](https://github.com/lkrzyzanek/graphql-pagination/issues/44) ([fbba778](https://github.com/lkrzyzanek/graphql-pagination/commit/fbba7782c757c2c3dbe260a165d36f3a20a9f4d3))





# [1.1.0](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.0.4...@graphql-pagination/core@1.1.0) (2022-04-21)


### Features

* improved totalCount resolver [#38](https://github.com/lkrzyzanek/graphql-pagination/issues/38) ([5fda048](https://github.com/lkrzyzanek/graphql-pagination/commit/5fda048e235a707c79afb0975b430ed306a38816))





## [1.0.4](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.0.3...@graphql-pagination/core@1.0.4) (2022-04-21)

**Note:** Version bump only for package @graphql-pagination/core





## [1.0.3](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.0.2...@graphql-pagination/core@1.0.3) (2022-04-20)

**Note:** Version bump only for package @graphql-pagination/core





## [1.0.2](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.0.1...@graphql-pagination/core@1.0.2) (2022-04-19)

**Note:** Version bump only for package @graphql-pagination/core





## [1.0.1](https://github.com/lkrzyzanek/graphql-pagination/compare/@graphql-pagination/core@1.0.0...@graphql-pagination/core@1.0.1) (2022-04-13)

**Note:** Version bump only for package @graphql-pagination/core





## 0.4.2 (2022-04-13)

**Note:** Version bump only for package @graphql-pagination/core





## 0.4.1 (2022-04-13)

**Note:** Version bump only for package @graphql-pagination/core





# 0.4.0 (2022-04-13)


### Features

* Module sql-knex fixes [#18](https://github.com/lkrzyzanek/graphql-pagination/issues/18) ([c1233e9](https://github.com/lkrzyzanek/graphql-pagination/commit/c1233e9a014e195da46292971e1cf208ccca1a28))





# 0.3.0 (2022-04-13)


* refactor!: Async Resolvers and DataSource fixes #16 ([c3ce555](https://github.com/lkrzyzanek/graphql-pagination/commit/c3ce5557d9e3c8941c2d014313dc02ac0bf1f8d0)), closes [#16](https://github.com/lkrzyzanek/graphql-pagination/issues/16)


### BREAKING CHANGES

* CursorPager interface returns Promise<Connection> to be fully async model. Same for DataSource and its implementations.





## 0.2.2 (2022-04-12)

**Note:** Version bump only for package @graphql-pagination/core





## 0.2.1 (2022-04-12)

**Note:** Version bump only for package @graphql-pagination/core





# 0.2.0 (2022-04-12)


### Features

* custom input args validations fixes [#11](https://github.com/lkrzyzanek/graphql-pagination/issues/11) ([f24c905](https://github.com/lkrzyzanek/graphql-pagination/commit/f24c9058cbeabd6d745fdf72cec69e7e664ad56f))





## 0.1.6 (2022-04-11)

**Note:** Version bump only for package @graphql-pagination/core





## 0.1.5 (2022-04-11)

**Note:** Version bump only for package @graphql-pagination/core





## 0.1.4 (2022-04-11)

**Note:** Version bump only for package @graphql-pagination/core





## 0.1.3 (2022-04-11)

**Note:** Version bump only for package @graphql-pagination/core





## 0.1.2 (2022-04-11)

**Note:** Version bump only for package @graphql-pagination/core





## 0.1.1 (2022-04-11)

**Note:** Version bump only for package @graphql-pagination/core
