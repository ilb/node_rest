Асинхронное выполнение кода
=======================

Установка
-----------------
```
$ npm install --save @bb/node-async
```


Оглавление
-----------------
1. [run](#run)
2. [checkResult](#checkResult)
3. [clearResult](#clearResult)

Роутинг
-----------------

#### Использование

Для одиночного роута
```js
export default router(createScope).post(CreateOffer).put(EditOffer).build();
```
Для группы роутов:
```js
export default (() =>
  router(createScope).setPrefix('/api/offers/:uuid/')
    .post('', CreateOffer)
    .put('monitor', MonitorOffer)
    .get('templates/:code', DownloadTemplates)
    .build()
)();
```
* `createScope` - замыкание, которое выполняется перед запуском `usecase`
* CreateOffer, MonitorOffer, DownloadTemplates - классы `usecase`

Юзкейсы
-----------------
Должны наследоваться от `ApiUsecase`, `AccessorUsecase` или `FileUsecase`

```js
export default class EditOffer extends ApiUsecase {

  constructor({ ...scope }) {
    super(scope);
    this.permission = 'update_offers';
  }

  async initialize({ uuid }) {
    // constructor
  }
  
  async process() {
    // do something
  }

  async schema() {
    // ajv schema for validation
  }
}
```
```js
export default class MonitorOffer extends AccessorUsecase {
  constructor({ ...scope }) {
    super(scope);
  }

  async process() {
    // ...
    if (condition) {
      return { /* ... */ }; // завершение работы accessor
    }

    return null; // продолжение работы accessor
  }
}

```
```js
export default class DownloadTemplates extends FileUsecase {
  constructor({ ...scope }) {
    super(scope);
  }

  async process({ uuid }) {
    // ...
    return { file, contentType, filename };
  }
}
```

<a name="run">run</a>
---------------
Функция запускает выполнение переданной функции или промиса и возвращает `UUID` операции.

`run(fn, needClear = true)`

#### Аргументы:
* `fn: (Function | Promise)` - обычная функция или асинхронная функция (async fn() ...) или промис.
* `needClear: (boolean) = true` - флаг определяет требуется ли удалять файлы с результатами операции после того как [checkResult](#checkResult) вернул результат вызывающей стороне (по умолчанию `true` - т.е. удаляются). Срабатывает после возвращения результатов даже если функция завершилась с ошибкой (произошло исключение throw new Error) или успешном выполнении функции.

#### Ответ:
UUID операции.

#### Исключения (throw new Error):
Ошибки связанные с созданием файла во временной директории ОС с PID-ом процесса.



<a name="checkResult">checkResult</a>
---------------
Функция проверки результата выполнения операции.

`checkResult(uuid)`

#### Аргументы:
`uuid: string` - UUID операции из функции [run](#run).

#### Ответ:
* Если сервис отработал без ошибок:
  ```
  {
    status: string,
    data: string
  }
  ```
  , где `status` = `complete`, `data` - результат операции.

* Если ошибки в процессе выполнения:
  ```
  {
    status: string,
    message: string
  }
  ```
  , где `status` = `error`, `message` - текст сообщения об ошибке.

* Если запущенная операция всё ещё выполняется:
  ```
  {
    status: string
  }
  ```
  , где `status` = `launched`.

#### Исключения (throw new Error):
Ошибки чтения файла результата, файла ошибок, файла c PID процесса или ошибки при выполнении проверки наличия процесса по PID-у.


<a name="clearResult">clearResult</a>
---------------
Удаляет файлы результатов операции.

`clearResult(): void`

#### Аргументы:
Отсутствуют.

#### Ответ:
Отсутствует.

#### Исключения (throw new Error):
Отсутствуют (любые ошибки связанные с удалением файлов не возвращаются).
