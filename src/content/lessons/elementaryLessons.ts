import type { FullLessonContent, LessonExerciseTemplate, SchoolGrade } from '@/types/domain'

export interface ElementaryTopicSeed {
  id: string
  atlasTitle: string
  title: string
  shortDescription: string
  subtopics: string[]
  tags: string[]
  gradeLevels: SchoolGrade[]
  groupId: string
  prerequisiteTopicIds: string[]
  skillIds: string[]
  estimatedMinutes: number
}

interface ElementaryTopicDefinition {
  id: string
  curriculumId?: string
  skillId?: string
  title: string
  grade: 1 | 2 | 3 | 4
  idea: string
  question: string
  answer: string
  solution: string
}

interface ElementaryGroupDefinition {
  id: string
  tag: string
  topics: ElementaryTopicDefinition[]
}

const elementaryGroups: ElementaryGroupDefinition[] = [
  {
    id: 'grade-1-thinking',
    tag: 'Математичне мислення',
    topics: [
      {
        id: 'same-and-different',
        title: 'Однакове й різне',
        grade: 1,
        idea: 'Порівнюємо предмети за кольором, формою, розміром і кількістю.',
        question: 'У ряду 🟢 🟢 🔵 🟢 скільки предметів відрізняються кольором?',
        answer: '1',
        solution: 'Три кружечки зелені, а один синій, тому відрізняється 1 предмет.',
      },
      {
        id: 'classifying-objects',
        title: 'Класифікація предметів',
        grade: 1,
        idea: 'Об’єднуємо предмети в групи за спільною ознакою.',
        question: 'Є 3 круги, 2 трикутники й 1 квадрат. Скільки тут груп за формою?',
        answer: '3',
        solution: 'Окремі групи утворюють круги, трикутники та квадрати: усього 3.',
      },
      {
        id: 'more-less-equal',
        title: 'Більше, менше, стільки ж',
        grade: 1,
        idea: 'Установлюємо пари й порівнюємо кількості без здогадування.',
        question: 'У Мурки 5 зірок, а в Лапки 3. На скільки більше зірок у Мурки?',
        answer: '2',
        solution: 'Утворюємо 3 пари. Без пари залишаються 2 зірки, отже 5 більше за 3 на 2.',
      },
      {
        id: 'patterns-and-sequences',
        title: 'Послідовності та закономірності',
        grade: 1,
        idea: 'Знаходимо правило повторення або зміни й продовжуємо ряд.',
        question: 'Продовж ряд: 2, 4, 6, 8, …',
        answer: '10',
        solution: 'Кожне наступне число на 2 більше: після 8 буде 10.',
      },
      {
        id: 'spatial-concepts',
        title: 'Просторові поняття',
        grade: 1,
        idea: 'Розрізняємо ліворуч, праворуч, вище, нижче, попереду та позаду.',
        question:
          'Мурка стоїть на 2 сходинки нижче від верхньої. Скільки кроків угору їй треба зробити?',
        answer: '2',
        solution: 'Кожна сходинка — один крок, тому до верхньої потрібно 2 кроки.',
      },
      {
        id: 'counting-forward-backward',
        title: 'Лічба вперед і назад',
        grade: 1,
        idea: 'Називаємо числа по порядку в обох напрямках.',
        question: 'Полічи назад: 7, 6, 5, … Яке число наступне?',
        answer: '4',
        solution: 'Під час лічби назад щоразу віднімаємо 1, тому після 5 йде 4.',
      },
      {
        id: 'object-number-match',
        title: 'Відповідність «предмет — число»',
        grade: 1,
        idea: 'Кожному предмету під час лічби відповідає одне число.',
        question: 'На малюнку 6 лапок. Яке число відповідає цій кількості?',
        answer: '6',
        solution: 'Торкаємося кожної лапки один раз і рахуємо: 1, 2, 3, 4, 5, 6.',
      },
      {
        id: 'digits-zero-nine',
        title: 'Цифри від 0 до 9',
        grade: 1,
        idea: 'Розпізнаємо десять цифр і складаємо з них записи чисел.',
        question: 'Скільки цифр у записі числа 407?',
        answer: '3',
        solution: 'Число 407 записане цифрами 4, 0 і 7 — це 3 цифри.',
      },
      {
        id: 'number-zero',
        title: 'Число нуль',
        grade: 1,
        idea: 'Нуль показує, що предметів немає, і є початком відліку.',
        question: 'Було 4 клубочки, усі 4 віддали кошенятам. Скільки залишилося?',
        answer: '0',
        solution: '4 − 4 = 0. Жодного клубочка не залишилося.',
      },
      {
        id: 'number-bonds-ten',
        title: 'Склад чисел до 10',
        grade: 1,
        idea: 'Розкладаємо число на дві частини й збираємо його назад.',
        question: 'Доповни склад числа: 7 = 3 + …',
        answer: '4',
        solution: 'До 3 треба додати 4, бо 3 + 4 = 7.',
      },
    ],
  },
  {
    id: 'grade-1-numbers',
    tag: 'Числа й дії',
    topics: [
      {
        id: 'numbers-to-twenty',
        title: 'Числа до 20',
        grade: 1,
        idea: 'Читаємо, записуємо й утворюємо числа другого десятка.',
        question: 'Скільки десятків і одиниць у числі 14? Введи кількість одиниць.',
        answer: '4',
        solution: '14 = 10 + 4, тому в числі 4 окремі одиниці.',
      },
      {
        id: 'elementary-number-line',
        title: 'Числова пряма',
        grade: 1,
        idea: 'Кожен крок праворуч збільшує число, а ліворуч — зменшує.',
        question: 'Почни з 5 і зроби 3 кроки праворуч. На якому числі зупинишся?',
        answer: '8',
        solution: 'Рухаємося: 6, 7, 8. Отже, зупинка — 8.',
      },
      {
        id: 'previous-next-number',
        title: 'Попереднє й наступне число',
        grade: 1,
        idea: 'Попереднє число на 1 менше, наступне — на 1 більше.',
        question: 'Яке число є наступним після 16?',
        answer: '17',
        solution: '16 + 1 = 17, тому наступне число — 17.',
      },
      {
        id: 'elementary-number-comparison',
        title: 'Порівняння чисел',
        grade: 1,
        idea: 'Порівнюємо числа за кількістю та положенням на числовій прямій.',
        question: 'Яке число більше: 13 чи 18?',
        answer: '18',
        solution: '18 розташоване правіше від 13 на числовій прямій, тому воно більше.',
      },
      {
        id: 'addition-as-joining',
        title: 'Додавання як об’єднання',
        grade: 1,
        idea: 'Додавання збирає дві кількості в одну спільну.',
        question: 'У кошику 6 яблук, поклали ще 3. Скільки стало?',
        answer: '9',
        solution: 'Об’єднуємо дві кількості: 6 + 3 = 9.',
      },
      {
        id: 'subtraction-removal-difference',
        title: 'Віднімання як вилучення та різниця',
        grade: 1,
        idea: 'Віднімання показує, скільки залишилося або на скільки числа різняться.',
        question: 'Було 9 рибок, 4 попливли. Скільки залишилося?',
        answer: '5',
        solution: 'Вилучаємо 4 з 9: 9 − 4 = 5.',
      },
      {
        id: 'addition-subtraction-relationship',
        title: 'Зв’язок додавання і віднімання',
        grade: 1,
        idea: 'Додавання та віднімання — взаємно обернені дії.',
        question: 'Якщо 5 + 3 = 8, то 8 − 3 = …',
        answer: '5',
        solution: 'Від суми віднімаємо один доданок і отримуємо інший: 8 − 3 = 5.',
      },
      {
        id: 'addition-commutative',
        title: 'Переставна властивість додавання',
        grade: 1,
        idea: 'Від перестановки доданків сума не змінюється.',
        question: 'Обчисли зручно: 2 + 7 = 7 + …',
        answer: '2',
        solution: 'Доданки можна переставити: 2 + 7 = 7 + 2.',
      },
      {
        id: 'unknown-addend',
        title: 'Невідомий доданок',
        grade: 1,
        idea: 'Щоб знайти невідомий доданок, від суми віднімаємо відомий.',
        question: 'Знайди невідоме число: 6 + □ = 10.',
        answer: '4',
        solution: '10 − 6 = 4, перевірка: 6 + 4 = 10.',
      },
      {
        id: 'mental-arithmetic-twenty',
        title: 'Усне додавання й віднімання до 20',
        grade: 1,
        idea: 'Використовуємо склад числа й перехід через десяток.',
        question: 'Обчисли: 8 + 7.',
        answer: '15',
        solution: 'Доповнюємо 8 до 10 двома одиницями, залишається 5: 10 + 5 = 15.',
      },
      {
        id: 'simple-word-problems',
        title: 'Прості текстові задачі',
        grade: 1,
        idea: 'Знаходимо в умові відомі дані, запитання та потрібну дію.',
        question: 'На гілці сиділо 7 птахів, 2 відлетіли. Скільки залишилося?',
        answer: '5',
        solution: 'Слово «відлетіли» означає зменшення: 7 − 2 = 5.',
      },
    ],
  },
  {
    id: 'grade-2-place-value',
    tag: 'Розряди й обчислення',
    topics: [
      {
        id: 'ones-tens-hundreds',
        title: 'Одиниці, десятки, сотні',
        grade: 2,
        idea: 'Значення цифри залежить від її місця в записі числа.',
        question: 'Скільки десятків у числі 347?',
        answer: '4',
        solution: 'У розряді десятків стоїть цифра 4, тобто 4 десятки.',
      },
      {
        id: 'expanded-form',
        title: 'Розклад числа за розрядами',
        grade: 2,
        idea: 'Подаємо число сумою його розрядних доданків.',
        question: 'Який доданок позначає десятки в розкладі 582 = 500 + … + 2?',
        answer: '80',
        solution: 'У числі 582 є 8 десятків, тобто 80.',
      },
      {
        id: 'ordering-numbers',
        title: 'Порівняння й упорядкування чисел',
        grade: 2,
        idea: 'Спочатку порівнюємо найстарші розряди, потім наступні.',
        question: 'Яке число найбільше: 208, 280 чи 228?',
        answer: '280',
        solution: 'Сотні однакові, а десятків найбільше у числі 280.',
      },
      {
        id: 'rounding-whole-numbers',
        title: 'Округлення',
        grade: 4,
        idea: 'Замінюємо число найближчим круглим і дивимося на наступну цифру.',
        question: 'Округли 347 до десятків.',
        answer: '350',
        solution: 'Цифра одиниць 7, тому 34 десятки збільшуємо до 35: отримуємо 350.',
      },
      {
        id: 'estimating-results',
        title: 'Оцінювання результату',
        grade: 4,
        idea: 'Округлення допомагає швидко перевірити, чи відповідь правдоподібна.',
        question: 'Оціни 198 + 304, округливши кожне число до сотень.',
        answer: '500',
        solution: '198 ≈ 200, 304 ≈ 300, тому сума приблизно 500.',
      },
      {
        id: 'written-addition',
        title: 'Письмове додавання',
        grade: 3,
        idea: 'Записуємо однакові розряди один під одним і додаємо справа наліво.',
        question: 'Обчисли: 268 + 157.',
        answer: '425',
        solution: '8 + 7 = 15, 6 + 5 + 1 = 12, 2 + 1 + 1 = 4. Отримуємо 425.',
      },
      {
        id: 'written-subtraction',
        title: 'Письмове віднімання',
        grade: 3,
        idea: 'Віднімаємо порозрядно, за потреби розмінюючи десяток або сотню.',
        question: 'Обчисли: 503 − 278.',
        answer: '225',
        solution: 'Після розміну розрядів віднімаємо справа наліво й отримуємо 225.',
      },
      {
        id: 'checking-calculations',
        title: 'Перевірка обчислень',
        grade: 3,
        idea: 'Перевіряємо результат оберненою дією або оцінюванням.',
        question: 'Для перевірки 436 − 129 = 307 обчисли 307 + 129.',
        answer: '436',
        solution: '307 + 129 = 436, тому віднімання виконано правильно.',
      },
      {
        id: 'multi-step-problems',
        title: 'Задачі на кілька дій',
        grade: 3,
        idea: 'Складаємо план і виконуємо дії в логічній послідовності.',
        question: 'Було 24 сині й 18 рожевих кульок. 15 кульок використали. Скільки залишилось?',
        answer: '27',
        solution: 'Спочатку 24 + 18 = 42, потім 42 − 15 = 27.',
      },
    ],
  },
  {
    id: 'grade-2-4-operations',
    tag: 'Множення й ділення',
    topics: [
      {
        id: 'multiplication-repeated-addition',
        title: 'Множення як повторне додавання',
        grade: 2,
        idea: 'Множення коротко записує додавання однакових доданків.',
        question: 'Обчисли 4 + 4 + 4 як добуток.',
        answer: '12',
        solution: 'Є 3 однакові доданки по 4: 3 × 4 = 12.',
      },
      {
        id: 'arrays-groups-area-models',
        title: 'Масиви, групи й моделі площі',
        grade: 2,
        idea: 'Прямокутні масиви показують множення рядами та стовпцями.',
        question: 'У масиві 3 ряди по 5 кружечків. Скільки кружечків?',
        answer: '15',
        solution: 'Три однакові ряди по п’ять: 3 × 5 = 15.',
      },
      {
        id: 'multiplication-table',
        title: 'Таблиця множення',
        grade: 2,
        idea: 'Будуємо факти множення через групи, подвоєння й відомі добутки.',
        question: 'Обчисли: 7 × 8.',
        answer: '56',
        solution: '7 × 8 = 56. Перевірка: 8 × 7 також дорівнює 56.',
      },
      {
        id: 'multiplication-properties',
        title: 'Переставна і сполучна властивості',
        grade: 3,
        idea: 'Множники можна переставляти та зручно групувати.',
        question: 'Обчисли зручно: 2 × 5 × 7.',
        answer: '70',
        solution: 'Групуємо 2 × 5 = 10, потім 10 × 7 = 70.',
      },
      {
        id: 'distributive-property',
        title: 'Розподільна властивість',
        grade: 3,
        idea: 'Розкладаємо множник на зручні частини.',
        question: 'Обчисли 7 × 13 як 7 × (10 + 3).',
        answer: '91',
        solution: '7 × 10 + 7 × 3 = 70 + 21 = 91.',
      },
      {
        id: 'division-equal-groups',
        title: 'Ділення на рівні групи',
        grade: 2,
        idea: 'Ділення розподіляє кількість порівну або знаходить число груп.',
        question: 'Розклади 18 ягід порівну на 3 тарілки. Скільки ягід на кожній?',
        answer: '6',
        solution: '18 : 3 = 6, тому на кожній тарілці буде 6 ягід.',
      },
      {
        id: 'multiplication-division-relationship',
        title: 'Зв’язок множення і ділення',
        grade: 2,
        idea: 'Ділення перевіряємо множенням, а множення — діленням.',
        question: 'Якщо 6 × 4 = 24, то 24 : 6 = …',
        answer: '4',
        solution: 'Ділення повертає другий множник: 24 : 6 = 4.',
      },
      {
        id: 'unknown-multiplication-components',
        title: 'Невідомий множник, ділене та дільник',
        grade: 3,
        idea: 'Застосовуємо зв’язок між компонентами множення й ділення.',
        question: 'Знайди невідомий множник: □ × 7 = 42.',
        answer: '6',
        solution: '42 : 7 = 6, перевірка: 6 × 7 = 42.',
      },
      {
        id: 'multidigit-multiplication',
        title: 'Множення багаторозрядних чисел',
        grade: 4,
        idea: 'Множимо порозрядно й додаємо часткові добутки.',
        question: 'Обчисли: 126 × 4.',
        answer: '504',
        solution:
          '4 × 6 = 24, 4 × 2 десятки з переносом = 10 десятків, 4 × 1 сотню з переносом = 5 сотень: 504.',
      },
      {
        id: 'long-division',
        title: 'Письмове ділення',
        grade: 4,
        idea: 'Послідовно ділимо розряди й щоразу перевіряємо множенням.',
        question: 'Обчисли: 864 : 4.',
        answer: '216',
        solution: '8 сотень : 4 = 2, 6 десятків : 4 = 1 з остачею 2, 24 : 4 = 6. Отримуємо 216.',
      },
      {
        id: 'compound-word-problems',
        title: 'Складені текстові задачі',
        grade: 4,
        idea: 'Перекладаємо умову на послідовність пов’язаних арифметичних дій.',
        question: 'У 6 коробках по 8 олівців. 13 олівців роздали. Скільки залишилось?',
        answer: '35',
        solution: 'Спочатку 6 × 8 = 48, потім 48 − 13 = 35.',
      },
    ],
  },
  {
    id: 'grade-1-4-measurement',
    tag: 'Величини й геометрія',
    topics: [
      {
        id: 'length-units',
        title: 'Довжина й одиниці довжини',
        grade: 1,
        idea: 'Вимірюємо відрізки однаковими одиницями та правильно читаємо шкалу.',
        question: 'Скільки сантиметрів у 1 дециметрі?',
        answer: '10',
        solution: 'Один дециметр складається з 10 сантиметрів.',
      },
      {
        id: 'mass-capacity-temperature',
        title: 'Маса, місткість і температура',
        grade: 2,
        idea: 'Добираємо відповідну величину, одиницю та вимірювальний прилад.',
        question: 'Скільки грамів у 1 кілограмі?',
        answer: '1000',
        solution: 'Префікс «кіло» означає тисячу: 1 кг = 1000 г.',
      },
      {
        id: 'time-calendar',
        title: 'Час і календар',
        grade: 2,
        idea: 'Читаємо годинник і пов’язуємо хвилини, години, доби, тижні та місяці.',
        question: 'Скільки хвилин у 2 годинах?',
        answer: '120',
        solution: 'В одній годині 60 хвилин, тому 2 × 60 = 120.',
      },
      {
        id: 'money',
        title: 'Гроші',
        grade: 1,
        idea: 'Рахуємо вартість, оплату й решту в гривнях і копійках.',
        question: 'Іграшка коштує 37 грн. Заплатили 50 грн. Скільки гривень решти?',
        answer: '13',
        solution: 'Від оплати віднімаємо ціну: 50 − 37 = 13 грн.',
      },
      {
        id: 'unit-conversion-elementary',
        title: 'Перетворення одиниць',
        grade: 3,
        idea: 'Множимо або ділимо за співвідношенням між одиницями.',
        question: 'Перетвори 4 м у сантиметри.',
        answer: '400',
        solution: '1 м = 100 см, тому 4 × 100 = 400 см.',
      },
      {
        id: 'point-line-ray-segment',
        title: 'Точка, пряма, промінь і відрізок',
        grade: 2,
        idea: 'Розрізняємо геометричні об’єкти за кількістю кінців і напрямків.',
        question: 'Скільки кінців має відрізок?',
        answer: '2',
        solution: 'Відрізок обмежений двома точками, тому має 2 кінці.',
      },
      {
        id: 'parallel-perpendicular-lines',
        title: 'Паралельні й перпендикулярні прямі',
        grade: 4,
        idea: 'Паралельні прямі не перетинаються, перпендикулярні утворюють прямі кути.',
        question: 'Скільки градусів має кут між перпендикулярними прямими?',
        answer: '90',
        solution: 'За означенням перпендикулярні прямі утворюють кут 90°.',
      },
      {
        id: 'triangles-quadrilaterals',
        title: 'Трикутники та чотирикутники',
        grade: 2,
        idea: 'Класифікуємо многокутники за кількістю сторін і властивостями.',
        question: 'Скільки сторін разом мають один трикутник і один чотирикутник?',
        answer: '7',
        solution: 'У трикутника 3 сторони, у чотирикутника 4: 3 + 4 = 7.',
      },
      {
        id: 'circle-and-disk',
        curriculumId: 'circle-measurements-grade6',
        skillId: 'circle-elements',
        title: 'Коло і круг',
        grade: 2,
        idea: 'Коло є межею, а круг містить і межу, і внутрішню область.',
        question: 'Скільки центрів має одне коло?',
        answer: '1',
        solution: 'Усі точки кола однаково віддалені від єдиного центра.',
      },
      {
        id: 'perimeter-elementary',
        title: 'Периметр',
        grade: 2,
        idea: 'Периметр — це сума довжин усіх сторін фігури.',
        question: 'Знайди периметр прямокутника зі сторонами 6 см і 3 см.',
        answer: '18',
        solution: 'P = 6 + 3 + 6 + 3 = 18 см.',
      },
      {
        id: 'rectangle-area-elementary',
        title: 'Площа прямокутника',
        grade: 3,
        idea: 'Площа прямокутника дорівнює добутку його довжини та ширини.',
        question: 'Знайди площу прямокутника 7 см на 4 см.',
        answer: '28',
        solution: 'S = 7 × 4 = 28 см².',
      },
      {
        id: 'composite-area',
        title: 'Площа складених фігур',
        grade: 4,
        idea: 'Ділимо складену фігуру на прості прямокутники та додаємо їхні площі.',
        question:
          'Фігуру складено з прямокутників площами 12 см² і 8 см² без перекриття. Яка загальна площа?',
        answer: '20',
        solution: 'Частини не перекриваються, тому 12 + 8 = 20 см².',
      },
      {
        id: 'symmetry-elementary',
        title: 'Симетрія',
        grade: 2,
        idea: 'Вісь симетрії ділить фігуру на дві дзеркально однакові частини.',
        question: 'Скільки осей симетрії має квадрат?',
        answer: '4',
        solution: 'Дві осі проходять через середини протилежних сторін і дві — через діагоналі.',
      },
      {
        id: 'coordinate-grid-elementary',
        title: 'Координатна сітка',
        grade: 4,
        idea: 'Положення точки визначаємо впорядкованою парою: спочатку по горизонталі, потім по вертикалі.',
        question: 'Точка A(3; 2). Яка її перша координата?',
        answer: '3',
        solution: 'У парі (3; 2) першою записана горизонтальна координата 3.',
      },
      {
        id: 'rectangular-prism-volume-elementary',
        title: 'Об’єм прямокутного паралелепіпеда',
        grade: 4,
        idea: 'Об’єм дорівнює добутку довжини, ширини та висоти.',
        question: 'Знайди об’єм коробки 3 см × 2 см × 4 см.',
        answer: '24',
        solution: 'V = 3 × 2 × 4 = 24 см³.',
      },
      {
        id: 'solid-shapes-elementary',
        curriculumId: 'solid-figures-grade6',
        skillId: 'cylinder',
        title: 'Циліндр, конус, куля і сфера',
        grade: 2,
        idea: 'Розпізнаємо об’ємні фігури за поверхнями, вершинами та формою.',
        question: 'Скільки вершин має конус?',
        answer: '1',
        solution: 'Конус має одну вершину, круглу основу та бічну поверхню.',
      },
    ],
  },
]

const definitions = elementaryGroups.flatMap((group) =>
  group.topics.map((topic) => ({ ...topic, groupId: group.id, tag: group.tag })),
)

const newDefinitions = definitions.filter((topic) => !topic.curriculumId)

export const elementaryTopicIds = newDefinitions.map((topic) => topic.id)

export const elementaryTopicSeeds: ElementaryTopicSeed[] = newDefinitions.map((topic, index) => {
  const previous = newDefinitions[index - 1]
  return {
    id: topic.id,
    atlasTitle: topic.title,
    title: topic.title,
    shortDescription: topic.idea,
    subtopics: [
      topic.idea,
      `Розбираємо приклад: ${topic.question}`,
      'Закріплюємо правило самостійною перевіркою.',
    ],
    tags: [topic.tag, `${topic.grade} клас`],
    gradeLevels: [topic.grade],
    groupId: topic.groupId,
    prerequisiteTopicIds: previous ? [previous.id] : [],
    skillIds: [`elementary-${topic.id}`],
    estimatedMinutes: 10,
  }
})

function distractors(answer: string): string[] {
  const numeric = Number(answer)
  if (Number.isFinite(numeric)) {
    return [String(numeric + 1), String(Math.max(0, numeric - 1))]
  }
  return ['Інша відповідь', 'Недостатньо даних']
}

function buildExercises(topic: (typeof definitions)[number]): LessonExerciseTemplate[] {
  const topicId = topic.curriculumId ?? topic.id
  const skillId = topic.skillId ?? `elementary-${topic.id}`
  return [
    {
      templateId: `${topicId}-elementary-apply`,
      skillIds: [skillId],
      difficulty: 1,
      kind: 'numericInput',
      title: 'Застосуй правило',
      prompt: topic.question,
      expectedAnswer: topic.answer,
      hints: [topic.idea, `Подумай над кроком: ${topic.solution.split('.')[0]}.`],
      solutionSteps: [topic.idea, topic.solution],
    },
    {
      templateId: `${topicId}-elementary-explain`,
      skillIds: [skillId],
      difficulty: 1,
      kind: 'numericInput',
      title: 'Перевір розуміння',
      prompt: `Скільки частин має наш план вивчення теми «${topic.title}»: правило, приклад і перевірка?`,
      expectedAnswer: '3',
      hints: ['Назви кожну частину плану.', 'Правило — перша, приклад — друга, перевірка — третя.'],
      solutionSteps: ['Рахуємо: правило, приклад, перевірка.', 'Усього маємо 3 частини.'],
    },
    {
      templateId: `${topicId}-elementary-self-check`,
      skillIds: [skillId],
      difficulty: 2,
      kind: 'numericInput',
      title: 'Зроби самоперевірку',
      prompt: `Введи 1, якщо твердження правильне: «${topic.idea}»`,
      expectedAnswer: '1',
      hints: [
        'Порівняй твердження з правилом уроку.',
        'Це головна ідея уроку, тому твердження правильне.',
      ],
      solutionSteps: ['Твердження повторює правило, яке ми щойно дослідили.', 'Отже, вводимо 1.'],
    },
  ]
}

export const elementaryLessons: Record<string, FullLessonContent> = Object.fromEntries(
  definitions.map((topic) => {
    const topicId = topic.curriculumId ?? topic.id
    const wrong = distractors(topic.answer)
    const lesson: FullLessonContent = {
      topicId,
      preview: {
        topicId,
        hook: topic.idea,
        question: topic.question,
        choices: [topic.answer, wrong[0]!, wrong[1]!],
        correctChoiceIndex: 0,
        explanation: topic.solution,
        challengeLabel: 'Перевірити на прикладі',
      },
      introTitle: `Відкриваємо тему «${topic.title}»`,
      introText: `${topic.idea} У цьому уроці спочатку побачимо правило на конкретному прикладі, потім пояснимо кожен крок і перевіримо себе.`,
      mascotMessage: 'Не поспішай: покажи собі, чому відповідь правильна, і лише тоді записуй її.',
      interactionKind: 'conceptCards',
      explorationTitle: 'Відкрий правило крок за кроком',
      explorationItems: [
        { label: 'Головна ідея', content: topic.idea },
        { label: 'Навчальний приклад', content: topic.question },
        { label: 'Пояснення', content: topic.solution },
      ],
      guidedTitle: `Розбираємо: ${topic.question}`,
      guidedSteps: [
        `Пригадуємо правило: ${topic.idea}`,
        `Застосовуємо його до умови: ${topic.question}`,
        `Отримуємо ${topic.answer}. ${topic.solution}`,
      ],
      summaryText: `Ти опрацював тему «${topic.title}», застосував правило до прикладу та виконав самоперевірку.`,
      exercises: buildExercises(topic),
    }
    return [topicId, lesson]
  }),
)

export function findElementaryLesson(topicId: string): FullLessonContent | undefined {
  return elementaryLessons[topicId]
}
