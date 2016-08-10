### Основні модулі фреймворку
- stream - дає можливість створювати та комбінувати потоки данних
- vdom та v-node - спрощена реалызація віртуального DOM
- h - обгортка над v-node для спрощення створення віртуальних DOM вузлів
- app - центральний модуль що ініціює роботу додатку

### Схема роботи фреймворку
Для запуску додатку потрібно викликати функцію ```(app:create)``` передавши їй 2 параметри
1) функцію, що повертає потік віртуальних DOM вузлів
2) id елемента, в якому буде генеруватися реальний DOM

### Приклад простого додатку, що рахує кількість натискань на кнопку

```
(module "button-click-counter" (app stream h)
    (app:create
      (lambda ()
        (all
          (set on-click$ (stream:create))
          (set clicks$
            (stream:map
              (lambda (e)
                (if (not (? e))
                  (1)
                )
              )
              on-click$
            )
          )
          (set count$
            (stream:scan
              (lambda (sum value)
                (all
                  (+ sum value)
                )
              )
              0
              clicks$
            )
          )
          (stream:map
            (lambda (click-count)
              (h:div "app" (hash-map)
                (array
                  (h:text (concat "Clicks: " click-count))
                  (h:br)
                  (h:button "clicker"
                    (hash-map
                      (on
                        (hash-map
                          (click on-click$)
                        )
                      )
                    )
                    (array (h:text "Click me"))
                  )
                )
              )
            )
            count$
          )
        )
      )
      "app"
    )
)

```
