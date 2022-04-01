AsyncConnect
============

## Создание асинхронного сервиса в Next.js

Создать папку **`pages/api/queues`**, родительскую для всех асинхронных API. 

Для отдельного сервиса создать папку и исходный файл, например для сервиса распознавания изображений: 

**`pages/api/queues/recognition/[...recognition].js`**

В файле объявить AsyncConnect:

```javascript
import { AsyncConnect, QueueTaskManager } from '@ilb/node-rest/async';

export default AsyncConnect({
  path: '/api/queues/recognition',
  taskManager: new QueueTaskManager(),
  task: new SomeUsecase().process,
  onError // обработчик ошибок
});

```

## Использование

### Создание задачи:

**POST** запрос на **`/api/queues/QUEUE_NAME`**:

```javascript
fetch('/api/queues/recognition', { 
  method: 'POST', 
  body: JSON.stringify({ контекст })
  headers: {
    'Content-Type': 'application/json'
  }
})
```

либо напрямую на сервере:

```javascript
import Recognition from '../pages/queues/recognition/[[...recognition]]';

export default (req, res) => {
  const executeResponse = Reconition.addTask({ контекст }); // executeResponse - функция для применения редиректа на API получения результата
  executeResponse(res);
}
```

### Получение результата задачи

**GET** запрос на **`/api/queues/QUEUE_NAME/:uuid`**:

```javascript
fetch('/api/queues/recognition/634e80c0-2b7d-44b0-bc07-4c7cf604f127', { 
  method: 'GET', 
})

В случае если задача ещё выполняется, статус ответа будет 202, а в хэдере Refresh будет находится ссылка и интервал в секундах для повторного запроса в виде '3;/api/queues/recognition/634e80c0-2b7d-44b0-bc07-4c7cf604f127'
```