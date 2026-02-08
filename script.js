/**
 * CODE TRANSLATOR 2026 - ENGINE
 * Авторы: Шевцов Даниил и команда
 */

document.addEventListener('DOMContentLoaded', () => {
    initInterface();
});

// Глобальное состояние
let currentSource = 'python';
let currentTarget = 'pascal';

// === ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА ===
function initInterface() {
    // 1. Обработка выбора языков
    setupLanguageSelectors('source-selector', (lang) => {
        currentSource = lang;
        updateUI();
    });
    
    setupLanguageSelectors('target-selector', (lang) => {
        currentTarget = lang;
        updateUI();
    });

    // 2. Кнопки
    document.getElementById('translateBtn').addEventListener('click', performTranslation);
    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('source-code').value = '';
        document.getElementById('result-code').value = '';
    });
    document.getElementById('copyBtn').addEventListener('click', copyResult);
    document.getElementById('swapBtn').addEventListener('click', swapLanguages);
    
    // 3. Примеры кода
    document.getElementById('examples-dropdown').addEventListener('change', loadExample);

    // Первоначальное обновление UI
    updateUI();
}

function setupLanguageSelectors(containerId, callback) {
    const container = document.getElementById(containerId);
    const options = container.querySelectorAll('.lang-option');
    
    options.forEach(opt => {
        opt.addEventListener('click', () => {
            // Удаляем активный класс у всех
            options.forEach(o => o.classList.remove('active'));
            // Добавляем нажатому
            opt.classList.add('active');
            // Вызываем коллбек с выбранным языком
            callback(opt.getAttribute('data-value'));
        });
    });
}

function updateUI() {
    document.getElementById('source-badge').textContent = formatLangName(currentSource);
    document.getElementById('target-badge').textContent = formatLangName(currentTarget);
    document.getElementById('display-source').textContent = formatLangName(currentSource);
    document.getElementById('display-target').textContent = formatLangName(currentTarget);
}

function formatLangName(lang) {
    const map = { 'python': 'Python', 'pascal': 'Pascal', 'java': 'Java', 'cpp': 'C++' };
    return map[lang] || lang;
}

function swapLanguages() {
    // Меняем переменные
    let temp = currentSource;
    currentSource = currentTarget;
    currentTarget = temp;

    // Меняем визуальные селекторы (классы active)
    updateSelectorVisuals('source-selector', currentSource);
    updateSelectorVisuals('target-selector', currentTarget);

    // Меняем код местами
    const sourceArea = document.getElementById('source-code');
    const resultArea = document.getElementById('result-code');
    let tempCode = sourceArea.value;
    sourceArea.value = resultArea.value;
    resultArea.value = ''; // Очищаем результат, чтобы пользователь нажал "Перевести" заново

    updateUI();
}

function updateSelectorVisuals(containerId, value) {
    const container = document.getElementById(containerId);
    const options = container.querySelectorAll('.lang-option');
    options.forEach(opt => {
        if (opt.getAttribute('data-value') === value) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

// === ЛОГИКА ПЕРЕВОДА (ENGINE) ===

function performTranslation() {
    const code = document.getElementById('source-code').value;
    if (!code.trim()) {
        showNotification('Введите код для перевода!', 'error');
        return;
    }

    if (currentSource === currentTarget) {
        document.getElementById('result-code').value = code;
        showNotification('Языки совпадают', 'warning');
        return;
    }

    let result = '';
    
    try {
        // Маршрутизация перевода
        if (currentSource === 'python') {
            if (currentTarget === 'pascal') result = pythonToPascal(code);
            else if (currentTarget === 'java') result = pythonToJava(code);
            else if (currentTarget === 'cpp') result = pythonToCpp(code);
        } else if (currentSource === 'pascal') {
            if (currentTarget === 'python') result = pascalToPython(code);
            else result = commonToCommon(code, 'pascal', currentTarget);
        } else if (currentSource === 'java') {
            if (currentTarget === 'python') result = javaToPython(code);
            else result = commonToCommon(code, 'java', currentTarget);
        } else if (currentSource === 'cpp') {
            if (currentTarget === 'python') result = cppToPython(code);
            else result = commonToCommon(code, 'cpp', currentTarget);
        }

        document.getElementById('result-code').value = result;
        showNotification('Успешно переведено!', 'success');
    } catch (e) {
        console.error(e);
        document.getElementById('result-code').value = "// Ошибка перевода. Проверьте синтаксис.";
        showNotification('Ошибка перевода', 'error');
    }
}

// === ФУНКЦИИ ТРАНСЛЯЦИИ ===

// 1. PYTHON -> PASCAL
function pythonToPascal(code) {
    let res = code;
    // Print
    res = res.replace(/print\(f"(.+){(.+)}(.+)"\)/g, "writeln('$1', $2, '$3');");
    res = res.replace(/print\("(.+)"\)/g, "writeln('$1');");
    res = res.replace(/print\((.+)\)/g, "writeln($1);");
    // Loops
    res = res.replace(/for (\w+) in range\((\d+),\s*(\d+)\):/g, 'for $1 := $2 to $3 - 1 do begin');
    // If
    res = res.replace(/if (.+):/g, 'if $1 then begin');
    res = res.replace(/else:/g, 'end else begin');
    // Assign (Исправлено: ловит не только цифры)
    res = res.replace(/^(\s*)(\w+) = (.+)$/gm, '$1$2 := $3;');
    
    // Formatting
    res = finalizeBlock(res, 'pascal');
    return `program Translated;\n\nbegin\n${res}\nend.`;
}

// 2. PYTHON -> JAVA
function pythonToJava(code) {
    let res = code;
    res = res.replace(/print\(f"(.+){(.+)}(.+)"\)/g, 'System.out.println("$1" + $2 + "$3");');
    res = res.replace(/print\("(.+)"\)/g, 'System.out.println("$1");');
    res = res.replace(/print\((.+)\)/g, 'System.out.println($1);');
    
    res = res.replace(/for (\w+) in range\((\d+),\s*(\d+)\):/g, 'for (int $1 = $2; $1 < $3; $1++) {');
    res = res.replace(/if (.+):/g, 'if ($1) {');
    res = res.replace(/else:/g, '} else {');
    
    // Smart Type Inference for variables
    res = res.replace(/^(\s*)(\w+) = "(.+)"$/gm, '$1String $2 = "$3";'); // Strings
    res = res.replace(/^(\s*)(\w+) = (\d+)$/gm, '$1int $2 = $3;');       // Ints
    res = res.replace(/^(\s*)(\w+) = (.+)$/gm, '$1var $2 = $3;');         // Others (Java 10+)
    
    res = finalizeBlock(res, 'java');
    return `public class Main {\n    public static void main(String[] args) {\n${res}\n    }\n}`;
}

// 3. PYTHON -> C++
function pythonToCpp(code) {
    let res = code;
    res = res.replace(/print\(f"(.+){(.+)}(.+)"\)/g, 'cout << "$1" << $2 << "$3" << endl;');
    res = res.replace(/print\("(.+)"\)/g, 'cout << "$1" << endl;');
    res = res.replace(/print\((.+)\)/g, 'cout << $1 << endl;');
    
    res = res.replace(/for (\w+) in range\((\d+),\s*(\d+)\):/g, 'for (int $1 = $2; $1 < $3; $1++) {');
    res = res.replace(/if (.+):/g, 'if ($1) {');
    res = res.replace(/else:/g, '} else {');
    
    // C++ uses 'auto' for unknown types
    res = res.replace(/^(\s*)(\w+) = (.+)$/gm, '$1auto $2 = $3;');
    
    res = finalizeBlock(res, 'cpp');
    return `#include <iostream>\nusing namespace std;\n\nint main() {\n${res}\n    return 0;\n}`;
}

// 4. ANYTHING -> PYTHON (Simplified logic)
function toPythonCommon(code) {
    let res = code;
    // Remove headers/wrappers
    res = res.replace(/#include.+|using namespace.+|public class.+|public static void main.+|program.+|begin|end\.|return 0;/g, '');
    res = res.replace(/[{}]/g, ''); // Remove braces
    res = res.replace(/;/g, '');    // Remove semicolons
    
    // Prints
    res = res.replace(/System\.out\.println\("(.+)" \+ (.+)\)/g, 'print(f"$1{$2}")');
    res = res.replace(/System\.out\.println\((.+)\)/g, 'print($1)');
    res = res.replace(/cout << "(.+)" << endl/g, 'print("$1")');
    res = res.replace(/cout << (.+) << endl/g, 'print($1)');
    res = res.replace(/writeln\('(.+)', (.+)\)/g, 'print(f"$1{$2}")');
    
    // Loops
    res = res.replace(/for\s*\(.*int (\w+) = (\d+).+< (\d+).+\)/g, 'for $1 in range($2, $3):');
    res = res.replace(/for (\w+) := (\d+) to (\d+) do/g, 'for $1 in range($2, $3 + 1):');
    
    // Ifs
    res = res.replace(/if \((.+)\)/g, 'if $1:');
    res = res.replace(/if (.+) then/g, 'if $1:');
    res = res.replace(/else/g, 'else:');
    
    // Var cleaning
    res = res.replace(/(int|String|auto|var) /g, '');
    res = res.replace(/:=/g, '=');

    return res.split('\n').filter(l => l.trim() !== '').map(l => l.trim()).join('\n'); // Simple reformat
}

const pascalToPython = (c) => toPythonCommon(c);
const javaToPython = (c) => toPythonCommon(c);
const cppToPython = (c) => toPythonCommon(c);

// 5. COMMON -> COMMON (Java <-> C++ <-> Pascal)
// Перевод между статическими языками проще делать заменой ключевых слов
function commonToCommon(code, from, to) {
    let res = code;
    
    // 1. Очистка оберток
    if (from === 'java' || from === 'cpp') {
        res = res.replace(/public class.+|#include.+|using namespace.+|main.+|return 0;/gs, '');
        res = res.replace(/^[\s\S]*?\{/, '').replace(/\}[^}]*$/, ''); // Remove outer braces
    }
    if (from === 'pascal') {
        res = res.replace(/program.+|begin|end\./gs, '');
    }

    // 2. Синтаксис Print
    if (to === 'pascal') {
        res = res.replace(/System\.out\.println\((.+)\);/g, "writeln($1);");
        res = res.replace(/cout << (.+) << endl;/g, "writeln($1);");
    } else if (to === 'cpp') {
        res = res.replace(/System\.out\.println\("(.+)"\);/g, 'cout << "$1" << endl;');
        res = res.replace(/writeln\('(.+)'\);/g, 'cout << "$1" << endl;');
    } else if (to === 'java') {
        res = res.replace(/cout << "(.+)" << endl;/g, 'System.out.println("$1");');
        res = res.replace(/writeln\('(.+)'\);/g, 'System.out.println("$1");');
    }

    // 3. Обертки результата
    if (to === 'pascal') return `program Translated;\nbegin\n${res}\nend.`;
    if (to === 'cpp') return `#include <iostream>\nusing namespace std;\nint main() {\n${res}\nreturn 0;\n}`;
    if (to === 'java') return `public class Main {\n public static void main(String[] args) {\n${res}\n}\n}`;
    
    return res;
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

function finalizeBlock(code, lang) {
    // Простая расстановка отступов
    const lines = code.split('\n');
    let indent = 1;
    let res = [];
    lines.forEach(line => {
        let trim = line.trim();
        if(!trim) return;
        
        if (trim.startsWith('}') || trim.startsWith('end')) indent--;
        res.push('    '.repeat(Math.max(0, indent)) + trim);
        if (trim.endsWith('{') || trim.endsWith('begin')) indent++;
    });
    return res.join('\n');
}

function loadExample() {
    const val = document.getElementById('examples-dropdown').value;
    const examples = {
        'py_hello': 'print("Привет, мир!")',
        'py_calc': 'x = 10\ny = 20\nprint(f"Сумма: {x + y}")',
        'pas_loop': 'program Test;\nbegin\n  for i := 1 to 5 do\n    writeln(i);\nend.',
        'java_class': 'public class Test {\n  public static void main(String[] args) {\n    int x = 5;\n    System.out.println(x);\n  }\n}',
        'cpp_cond': '#include <iostream>\nusing namespace std;\nint main() {\n  int x = 10;\n  if (x > 5) {\n    cout << "Big" << endl;\n  }\n}'
    };
    
    if (examples[val]) {
        document.getElementById('source-code').value = examples[val];
        // Автоматически ставим правильный исходный язык
        if (val.startsWith('py')) setLanguage('python');
        if (val.startsWith('pas')) setLanguage('pascal');
        if (val.startsWith('java')) setLanguage('java');
        if (val.startsWith('cpp')) setLanguage('cpp');
    }
}

function setLanguage(lang) {
    currentSource = lang;
    updateSelectorVisuals('source-selector', lang);
    updateUI();
}

function copyResult() {
    const text = document.getElementById('result-code').value;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Скопировано в буфер!', 'success');
    });
}

function showNotification(msg, type) {
    const div = document.createElement('div');
    div.className = `notification ${type}`; // нужны стили для .success, .error
    div.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}
