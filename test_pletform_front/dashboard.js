// Шаблони завдань (тепер це справжні об'єкти, а не текст)
const templates = {
    radio: {
        "type": "radio",
        "title": "Тестові завдання (Один варіант)",
        "theme": { "bg": "bg-cyan-500/20", "text": "text-cyan-400" },
        "points": 5,
        "data": [
          { "q": "1. Питання перше?", "opts": ["Варіант 1", "Правильний варіант", "Варіант 3"], "ans": 1 },
          { "q": "2. Питання друге?", "opts": ["Правильний варіант", "Варіант 2", "Варіант 3"], "ans": 0 }
        ]
    },
    pairs: {
        "type": "pairs",
        "title": "Логічні пари (Виберіть тип даних)",
        "theme": { "bg": "bg-purple-500/20", "text": "text-purple-400" },
        "points": 3,
        "data": [
          { "ext": ".docx", "type": "text", "desc": "Текстовий документ" },
          { "ext": ".jpg", "type": "img", "desc": "Графічне зображення" }
        ]
    },
    ordering: {
        "type": "ordering",
        "title": "Впорядкування (Перетягни картки)",
        "theme": { "bg": "bg-pink-500/20", "text": "text-pink-400" },
        "points": 10,
        "lists": [
          {
            "id": "list1",
            "name": "Розставте по порядку:",
            "items": [
              { "id": "1", "text": "Перша дія" },
              { "id": "3", "text": "Третя дія" },
              { "id": "2", "text": "Друга дія" }
            ],
            "correct": ["1", "2", "3"]
          }
        ]
    },
    sorting: {
        "type": "sorting",
        "title": "Сортування по папках",
        "theme": { "bg": "bg-emerald-500/20", "text": "text-emerald-400" },
        "points": 3,
        "folders": [
          { "id": "cat1", "name": "Категорія 1", "color": "text-blue-400" },
          { "id": "cat2", "name": "Категорія 2", "color": "text-pink-400" }
        ],
        "files": [
          { "id": "f1", "n": "Елемент 1", "t": "cat1" },
          { "id": "f2", "n": "Елемент 2", "t": "cat2" },
          { "id": "f3", "n": "Елемент 3", "t": "cat1" }
        ]
    },
    mistakes: {
        "type": "mistakes",
        "title": "Знайдіть помилкові варіанти",
        "subtitle": "Відмітьте пункти, які містять помилку:",
        "theme": { "bg": "bg-orange-500/20", "text": "text-orange-400" },
        "points": 2,
        "data": [
          { "n": "Правильний варіант", "bad": false },
          { "n": "Варіант з помилкою", "bad": true },
          { "n": "Ще один неправильний", "bad": true }
        ]
    },
    fillIn: {
        "type": "fill-in",
        "title": "Доповніть речення",
        "theme": { "bg": "bg-indigo-500/20", "text": "text-indigo-400" },
        "points": 5,
        "data": [
          { "pre": "Початок речення ", "placeholder": "підказка", "post": " кінець речення.", "ans": "відповідь" },
          { "pre": "Введіть слово ", "placeholder": "щось", "post": " сюди.", "ans": "щось" }
        ]
    },
    open: {
        "type": "open",
        "title": "Вільна відповідь",
        "subtitle": "Опишіть ситуацію своїми словами.",
        "theme": { "bg": "bg-teal-500/20", "text": "text-teal-400" },
        "data": [
          { "id": "q1", "q": "Коротка відповідь...", "type": "text", "points": 2 },
          { "id": "q2", "q": "Розгорнута відповідь...", "type": "textarea", "points": 3 }
        ]
    },
    typing: {
        "type": "typing",
        "title": "Тренажер швидкості (Бонус)",
        "theme": { "bg": "bg-rose-500/20", "text": "text-rose-400" },
        "text": "Введіть цей текст без помилок для перевірки швидкості."
    }
};

const editor = document.getElementById('modules-editor');
const errorMsg = document.getElementById('json-error');

// Надійна функція вставки шаблону
function insertTemplate(type) {
    try {
        // Беремо поточний текст. Якщо пусто — робимо порожній масив
        let currentText = editor.value.trim() || "[]";
        let currentArr = JSON.parse(currentText);
        
        if (!Array.isArray(currentArr)) {
            currentArr = [];
        }
        
        // Додаємо новий блок
        currentArr.push(templates[type]);
        
        // Конвертуємо назад у текст з ідеальними відступами (2 пробіли)
        editor.value = JSON.stringify(currentArr, null, 2);
        
        // Ховаємо повідомлення про помилку, якщо воно було
        errorMsg.classList.add('hidden');
    } catch (e) {
        // Якщо користувач до цього зламав JSON руками (забув кому тощо), просимо виправити
        errorMsg.classList.remove('hidden');
        errorMsg.innerText = "Спочатку виправте синтаксичну помилку в коді вище, щоб додати новий блок.";
    }
}

// Збереження тесту
document.getElementById('saveBtn').addEventListener('click', async () => {
    errorMsg.classList.add('hidden');
    
    // 1. Збираємо Meta-дані
    const metaData = {
        titleHighlight: document.getElementById('meta-highlight').value.trim(),
        titleMain: document.getElementById('meta-main').value.trim(),
        subtitle: document.getElementById('meta-subtitle').value.trim(),
        pageTitle: "Платформа тестувань | Кабінет"
    };

    // 2. Валідуємо JSON завдань
    let modulesData = [];
    try {
        modulesData = JSON.parse(editor.value);
        if (!Array.isArray(modulesData)) throw new Error("Має бути масив!");
    } catch (e) {
        errorMsg.classList.remove('hidden');
        errorMsg.innerText = "Помилка у структурі завдань! Перевірте коми та дужки.";
        return; // Зупиняємо відправку
    }

    const payload = {
        meta: metaData,
        modules: modulesData
    };

    const saveBtn = document.getElementById('saveBtn');
    saveBtn.innerText = "Збереження...";
    saveBtn.disabled = true;

    try {
        const response = await fetch('http://127.0.0.1:8000/api/tests/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            const currentHost = window.location.origin; 
            const finalLink = `${currentHost}/index.html?id=${result.test_id}`;
            
            document.getElementById('generated-link').value = finalLink;
            document.getElementById('result-box').classList.remove('hidden');
            
            saveBtn.innerText = "Зберегти тест у базу";
            saveBtn.disabled = false;
        } else {
            alert("Помилка на сервері: " + JSON.stringify(result));
            saveBtn.innerText = "Зберегти тест у базу";
            saveBtn.disabled = false;
        }

    } catch (err) {
        alert("Не вдалося підключитися до бази даних. Перевірте, чи працює FastAPI.");
        saveBtn.innerText = "Зберегти тест у базу";
        saveBtn.disabled = false;
        console.error(err);
    }
});

function copyLink() {
    const linkInput = document.getElementById('generated-link');
    linkInput.select();
    document.execCommand('copy');
    alert('Посилання скопійовано!');
}

// ==========================================
// ГЕНЕРАТОР ШІ-ПРОМПТА
// ==========================================

// ==========================================
// ГЕНЕРАТОР ШІ-ПРОМПТА
// ==========================================

const aiPromptText = `Ти — досвідчений викладач та експерт зі створення інтерактивних тестів.
Твоє завдання — згенерувати навчальний тест на задану тему у строго визначеному форматі JSON. Цей JSON буде використано для рендеру тестів на кастомній веб-платформі.

ОБОВ'ЯЗКОВІ ПРАВИЛА:
1. Відповідь має містити ЛИШЕ валідний JSON-масив (починається з [ і закінчується ]). 
2. Обов'язково форматуй код "драбинкою" (pretty-print з відступами 2 пробіли). Кожен об'єкт та властивість мають бути з нового рядка. Не пиши код в один суцільний рядок!
3. Жодних вступних чи завершальних слів, форматування Markdown (без \`\`\`json) не використовувати, видавай лише чистий код.
4. Не змінюй ключі (type, title, theme, points, data, lists, folders, files).
5. Теми оформлення (theme) залишай як у прикладі або використовуй кольори з палітри Tailwind CSS (cyan, purple, pink, emerald, orange, indigo, teal, rose).

ОПИС ТИПІВ ЗАВДАНЬ (використовуй їх для розуміння логіки):
- "radio": Класичний тест. Один правильний варіант (ans — це індекс правильного варіанту, починається з 0). створи від 4 до 8 таких питань.
- "pairs": Логічні пари. Треба з'єднати термін (ext) із його описом (desc). від 4 до 6 пар.
- "ordering": Алгоритм або хронологія. Елементи (items) треба розставити у правильному порядку, який вказано у масиві correct. від 1 до 3 списків (lists), кожен з 3–5 елементами.
- "sorting": Сортування. Розподілити файли (files) по відповідних папках (folders) за допомогою ідентифікаторів. від 2 до 4 папок, кожна з 3–5 файлами.
- "mistakes": Пошук помилок. Чекбокси, де хибне твердження має значення "bad": true. від 5 до 7 тверджень, з яких 1–3 хибні.
- "fill-in": Пропуски в тексті. Учень вписує слово (ans) у пропуск між текстом pre та post. від 2 до 5 пропусків.
- "open": Вільна відповідь. type: "text" для короткої, type: "textarea" для розгорнутої.

ЕТАЛОННА СТРУКТУРА JSON (використовуй її як шаблон, але наповни контентом на потрібну тему):
[
  {
    "type": "radio",
    "title": "Тестові завдання (Один варіант)",
    "theme": { "bg": "bg-cyan-500/20", "text": "text-cyan-400" },
    "points": 5,
    "data": [
      { "q": "1. Ваше перше запитання?", "opts": ["Неправильно", "Правильно", "Неправильно"], "ans": 1 },
      { "q": "2. Ваше друге запитання?", "opts": ["Правильно", "Неправильно", "Неправильно"], "ans": 0 }
    ]
  },
  {
    "type": "pairs",
    "title": "Логічні пари",
    "theme": { "bg": "bg-purple-500/20", "text": "text-purple-400" },
    "points": 3,
    "data": [
      { "ext": "Термін 1", "type": "key1", "desc": "Пояснення 1" },
      { "ext": "Термін 2", "type": "key2", "desc": "Пояснення 2" }
    ]
  },
  {
    "type": "ordering",
    "title": "Впорядкування (хронологія/алгоритм)",
    "theme": { "bg": "bg-pink-500/20", "text": "text-pink-400" },
    "points": 10,
    "lists": [
      {
        "id": "list1",
        "name": "Розставте у правильному порядку:",
        "items": [
          { "id": "1", "text": "Перша подія/крок" },
          { "id": "3", "text": "Третя подія/крок" },
          { "id": "2", "text": "Друга подія/крок" }
        ],
        "correct": ["1", "2", "3"]
      }
    ]
  },
  {
    "type": "sorting",
    "title": "Сортування по категоріях",
    "theme": { "bg": "bg-emerald-500/20", "text": "text-emerald-400" },
    "points": 3,
    "folders": [
      { "id": "cat1", "name": "Категорія 1", "color": "text-blue-400" },
      { "id": "cat2", "name": "Категорія 2", "color": "text-pink-400" }
    ],
    "files": [
      { "id": "f1", "n": "Елемент для категорії 1", "t": "cat1" },
      { "id": "f2", "n": "Елемент для категорії 2", "t": "cat2" },
      { "id": "f3", "n": "Інший елемент для категорії 1", "t": "cat1" }
    ]
  },
  {
    "type": "mistakes",
    "title": "Знайдіть помилкові твердження",
    "subtitle": "Відмітьте ті варіанти, які є неправильними:",
    "theme": { "bg": "bg-orange-500/20", "text": "text-orange-400" },
    "points": 2,
    "data": [
      { "n": "Це правильне твердження (його не треба виділяти)", "bad": false },
      { "n": "Це твердження містить помилку (його треба виділити)", "bad": true }
    ]
  },
  {
    "type": "fill-in",
    "title": "Пропуски в тексті",
    "theme": { "bg": "bg-indigo-500/20", "text": "text-indigo-400" },
    "points": 5,
    "data": [
      { "pre": "Столиця України — це місто ", "placeholder": "назва", "post": ".", "ans": "київ" }
    ]
  },
  {
    "type": "open",
    "title": "Вільна відповідь",
    "subtitle": "Дайте розгорнуту відповідь:",
    "theme": { "bg": "bg-teal-500/20", "text": "text-teal-400" },
    "data": [
      { "id": "q1", "q": "Поясніть, чому...", "type": "textarea", "points": 5 }
    ]
  }
]

ТЕМА ТЕСТУ ДЛЯ ГЕНЕРАЦІЇ: `;

function copyAIPrompt() {
    navigator.clipboard.writeText(aiPromptText).then(() => {
        alert("✨ Промпт скопійовано!\n\n1. Відкрийте ChatGPT або Claude.\n2. Вставте цей текст.\n3. Впишіть свою тему замість [ВСТАВТЕ ВАШУ ТЕМУ ТУТ].\n4. Скопіюйте результат і вставте його сюди в редактор.");
    }).catch(err => {
        console.error('Помилка копіювання: ', err);
        alert("Не вдалося скопіювати текст. Перевірте дозволи браузера.");
    });
}