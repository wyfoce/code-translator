// КОНФИГУРАЦИЯ
let currentSourceLang = 'python';
let currentTargetLang = 'pascal';

// ПРИМЕРЫ КОДА
const codeExamples = {
    'python_hello': {
        lang: 'python',
        code: `print("Hello, World!")
for i in range(1, 6):
    print(f"Number: {i}")`
    },
    'python_factorial': {
        lang: 'python',
        code: `def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

num = 5
print(f"Factorial of {num} is {factorial(num)}")`
    },
    'python_if': {
        lang: 'python',
        code: `x = 10
if x > 0:
    print("Positive")
elif x < 0:
    print("Negative")
else:
    print("Zero")`
    },
    'pascal_hello': {
        lang: 'pascal',
        code: `program HelloWorld;
begin
  writeln('Hello, World!');
  for i := 1 to 5 do
    writeln('Number: ', i);
end.`
    },
    'java_hello': {
        lang: 'java',
        code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        for (int i = 1; i <= 5; i++) {
            System.out.println("Number: " + i);
        }
    }
}`
    },
    'cpp_hello': {
        lang: 'cpp',
        code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    for (int i = 1; i <= 5; i++) {
        cout << "Number: " << i << endl;
    }
    return 0;
}`
    }
};

// ==================== ФУНКЦИИ ПЕРЕВОДА ====================

// Python → Pascal
function translatePythonToPascal(code) {
    let warnings = [];
    let result = code;
    
    // print → writeln
    result = result.replace(/print\((.*)\)/g, function(match, content) {
        if (content.includes("end='")) {
            return `write(${content.split(",")[0]})`;
        }
        return `writeln(${content})`;
    });
    
    // for i in range(start, end):
    result = result.replace(/for\s+(\w+)\s+in\s+range\((\d+),\s*(\d+)\):/g, 'for $1 := $2 to $3 do');
    
    // def function(): → procedure function();
    result = result.replace(/def\s+(\w+)\(\):/g, 'procedure $1();');
    
    // if condition: → if condition then
    result = result.replace(/if\s+(.+):/g, 'if $1 then');
    
    // Комментарии
    result = result.replace(/#\s*(.*)/g, '// $1');
    
    return {
        code: `program TranslatedCode;\n\nbegin\n${result}\nend.`,
        warnings: warnings
    };
}

// Pascal → Python
function translatePascalToPython(code) {
    let warnings = [];
    let result = code;
    
    // Удаляем program ...;
    result = result.replace(/program\s+\w+;/g, '');
    
    // writeln → print
    result = result.replace(/writeln\((.*)\);/g, 'print($1)');
    result = result.replace(/write\((.*)\);/g, 'print($1, end="")');
    
    // for i := 1 to 10 do → for i in range(1, 11):
    result = result.replace(/for\s+(\w+)\s*:=\s*(\d+)\s+to\s+(\w+)\s+do/g, 'for $1 in range($2, $3 + 1):');
    
    // if condition then → if condition:
    result = result.replace(/if\s+(.+)\s+then/g, 'if $1:');
    
    // Удаляем begin/end
    result = result.replace(/begin|end\.?/g, '');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '# $1');
    result = result.replace(/\{\$(.*)\}/g, '# $1');
    result = result.replace(/\{(.*)\}/g, '# $1');
    
    // Убираем лишние пустые строки
    result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return {
        code: result.trim(),
        warnings: warnings
    };
}

// Python → Java
function translatePythonToJava(code) {
    let warnings = [];
    let result = code;
    
    // print → System.out.println
    result = result.replace(/print\((.*)\)/g, 'System.out.println($1)');
    
    // for i in range(start, end): → for (int i = start; i < end; i++)
    result = result.replace(/for\s+(\w+)\s+in\s+range\((\d+),\s*(\d+)\):/g, 'for (int $1 = $2; $1 < $3; $1++) {');
    
    // def function(): → public static void function() {
    result = result.replace(/def\s+(\w+)\(\):/g, 'public static void $1() {');
    
    // if condition: → if (condition) {
    result = result.replace(/if\s+(.+):/g, 'if ($1) {');
    result = result.replace(/elif\s+(.+):/g, 'else if ($1) {');
    result = result.replace(/else:/g, 'else {');
    
    // Комментарии
    result = result.replace(/#\s*(.*)/g, '// $1');
    
    // Обработка отступов для фигурных скобок
    const lines = result.split('\n');
    let indentLevel = 0;
    let newLines = [];
    
    for (let line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.endsWith('{')) {
            newLines.push('    '.repeat(indentLevel) + trimmed);
            indentLevel++;
        } else if (trimmed.startsWith('}')) {
            indentLevel--;
            newLines.push('    '.repeat(indentLevel) + trimmed);
        } else if (trimmed === '') {
            newLines.push('');
        } else {
            newLines.push('    '.repeat(indentLevel) + trimmed + ';');
        }
    }
    
    // Добавляем закрывающие скобки
    for (let i = 0; i < indentLevel; i++) {
        newLines.push('    '.repeat(indentLevel - i - 1) + '}');
    }
    
    result = newLines.join('\n');
    
    return {
        code: `public class TranslatedCode {\n    public static void main(String[] args) {\n${result}\n    }\n}`,
        warnings: warnings
    };
}

// Python → C++
function translatePythonToCpp(code) {
    let warnings = [];
    let result = code;
    
    // print → cout
    result = result.replace(/print\((.*)\)/g, 'cout << $1 << endl;');
    
    // def function(): → void function() {
    result = result.replace(/def\s+(\w+)\(\):/g, 'void $1() {');
    
    // for i in range(start, end): → for (int i = start; i < end; i++) {
    result = result.replace(/for\s+(\w+)\s+in\s+range\((\d+),\s*(\d+)\):/g, 'for (int $1 = $2; $1 < $3; $1++) {');
    
    // if condition: → if (condition) {
    result = result.replace(/if\s+(.+):/g, 'if ($1) {');
    result = result.replace(/elif\s+(.+):/g, 'else if ($1) {');
    result = result.replace(/else:/g, 'else {');
    
    // Комментарии
    result = result.replace(/#\s*(.*)/g, '// $1');
    
    // Обработка отступов для фигурных скобок
    const lines = result.split('\n');
    let indentLevel = 0;
    let newLines = [];
    
    for (let line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.endsWith('{')) {
            newLines.push('    '.repeat(indentLevel) + trimmed);
            indentLevel++;
        } else if (trimmed.startsWith('}')) {
            indentLevel--;
            newLines.push('    '.repeat(indentLevel) + trimmed);
        } else if (trimmed === '') {
            newLines.push('');
        } else {
            newLines.push('    '.repeat(indentLevel) + trimmed + ';');
        }
    }
    
    // Добавляем закрывающие скобки
    for (let i = 0; i < indentLevel; i++) {
        newLines.push('    '.repeat(indentLevel - i - 1) + '}');
    }
    
    result = newLines.join('\n');
    
    return {
        code: `#include <iostream>\nusing namespace std;\n\n${result}\n\nint main() {\n    // Вставьте сюда вызовы функций\n    return 0;\n}`,
        warnings: warnings
    };
}

// Java → Python
function translateJavaToPython(code) {
    let warnings = [];
    let result = code;
    
    // System.out.println → print
    result = result.replace(/System\.out\.println\((.*)\);/g, 'print($1)');
    result = result.replace(/System\.out\.print\((.*)\);/g, 'print($1, end="")');
    
    // for (int i = 0; i < 10; i++) { → for i in range(0, 10):
    result = result.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\+\+\)\s*\{/g, 'for $1 in range($2, $3):');
    
    // if (condition) { → if condition:
    result = result.replace(/if\s*\((.*)\)\s*\{/g, 'if $1:');
    result = result.replace(/else if\s*\((.*)\)\s*\{/g, 'elif $1:');
    result = result.replace(/else\s*\{/g, 'else:');
    
    // public static void function() { → def function():
    result = result.replace(/public\s+static\s+void\s+(\w+)\s*\(\)\s*\{/g, 'def $1():');
    
    // Удаляем фигурные скобки
    result = result.replace(/[{}]/g, '');
    
    // Удаляем точки с запятой
    result = result.replace(/;/g, '');
    
    // Удаляем объявления классов
    result = result.replace(/public\s+class\s+\w+\s*\{/g, '');
    result = result.replace(/public\s+static\s+void\s+main\s*\(.*\)\s*\{/g, '');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '# $1');
    
    // Убираем лишние пустые строки
    result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return {
        code: result.trim(),
        warnings: warnings
    };
}

// C++ → Python
function translateCppToPython(code) {
    let warnings = [];
    let result = code;
    
    // cout << ... << endl; → print(...)
    result = result.replace(/cout\s*<<\s*(.*?)\s*<<\s*endl\s*;/g, function(match, content) {
        return `print(${content.trim()})`;
    });
    
    // for (int i = 0; i < 10; i++) { → for i in range(0, 10):
    result = result.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\+\+\)\s*\{/g, 'for $1 in range($2, $3):');
    
    // if (condition) { → if condition:
    result = result.replace(/if\s*\((.*)\)\s*\{/g, 'if $1:');
    result = result.replace(/else if\s*\((.*)\)\s*\{/g, 'elif $1:');
    result = result.replace(/else\s*\{/g, 'else:');
    
    // void function() { → def function():
    result = result.replace(/void\s+(\w+)\s*\(\)\s*\{/g, 'def $1():');
    
    // Удаляем фигурные скобки
    result = result.replace(/[{}]/g, '');
    
    // Удаляем точки с запятой
    result = result.replace(/;/g, '');
    
    // Удаляем #include и using namespace
    result = result.replace(/#include.*/g, '');
    result = result.replace(/using namespace.*/g, '');
    result = result.replace(/int main\(\)\s*\{/g, '');
    result = result.replace(/return 0;/g, '');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '# $1');
    
    return {
        code: result.trim(),
        warnings: warnings
    };
}

// Pascal → Java
function translatePascalToJava(code) {
    let warnings = [];
    let result = code;
    
    // writeln → System.out.println
    result = result.replace(/writeln\((.*)\);/g, 'System.out.println($1);');
    result = result.replace(/write\((.*)\);/g, 'System.out.print($1);');
    
    // for i := 1 to 10 do → for (int i = 1; i <= 10; i++) {
    result = result.replace(/for\s+(\w+)\s*:=\s*(\d+)\s+to\s+(\w+)\s+do/g, 'for (int $1 = $2; $1 <= $3; $1++) {');
    
    // if condition then → if (condition) {
    result = result.replace(/if\s+(.+)\s+then/g, 'if ($1) {');
    
    // procedure function(); → public static void function() {
    result = result.replace(/procedure\s+(\w+)\s*\(\);/g, 'public static void $1() {');
    
    // begin → {
    result = result.replace(/begin/g, '{');
    
    // end. → }
    result = result.replace(/end\./g, '}');
    
    // program → public class
    result = result.replace(/program\s+(\w+);/g, 'public class $1 {');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    // Обработка отступов
    const lines = result.split('\n');
    let newLines = [];
    
    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
            newLines.push('        ' + trimmed);
        } else {
            newLines.push('');
        }
    }
    
    result = newLines.join('\n');
    
    return {
        code: `public class TranslatedCode {\n    public static void main(String[] args) {\n${result}\n    }\n}`,
        warnings: warnings
    };
}

// Pascal → C++
function translatePascalToCpp(code) {
    let warnings = [];
    let result = code;
    
    // writeln → cout << ... << endl
    result = result.replace(/writeln\((.*)\);/g, 'cout << $1 << endl;');
    result = result.replace(/write\((.*)\);/g, 'cout << $1;');
    
    // for i := 1 to 10 do → for (int i = 1; i <= 10; i++) {
    result = result.replace(/for\s+(\w+)\s*:=\s*(\d+)\s+to\s+(\w+)\s+do/g, 'for (int $1 = $2; $1 <= $3; $1++) {');
    
    // if condition then → if (condition) {
    result = result.replace(/if\s+(.+)\s+then/g, 'if ($1) {');
    
    // procedure function(); → void function() {
    result = result.replace(/procedure\s+(\w+)\s*\(\);/g, 'void $1() {');
    
    // begin → {
    result = result.replace(/begin/g, '{');
    
    // end. → }
    result = result.replace(/end\./g, '}');
    
    // program → (удаляем)
    result = result.replace(/program\s+\w+;/g, '');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    // Обработка отступов
    const lines = result.split('\n');
    let newLines = [];
    
    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
            newLines.push('    ' + trimmed);
        } else {
            newLines.push('');
        }
    }
    
    result = newLines.join('\n');
    
    return {
        code: `#include <iostream>\nusing namespace std;\n\n${result}\n\nint main() {\n    // Вставьте сюда вызовы функций\n    return 0;\n}`,
        warnings: warnings
    };
}

// Java → Pascal
function translateJavaToPascal(code) {
    let warnings = [];
    let result = code;
    
    // System.out.println → writeln
    result = result.replace(/System\.out\.println\((.*)\);/g, 'writeln($1);');
    result = result.replace(/System\.out\.print\((.*)\);/g, 'write($1);');
    
    // for (int i = 0; i < 10; i++) { → for i := 0 to 9 do
    result = result.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\+\+\)\s*\{/g, 'for $1 := $2 to $3-1 do');
    
    // if (condition) { → if condition then
    result = result.replace(/if\s*\((.*)\)\s*\{/g, 'if $1 then');
    result = result.replace(/else if\s*\((.*)\)\s*\{/g, 'else if $1 then');
    result = result.replace(/else\s*\{/g, 'else');
    
    // public static void function() { → procedure function();
    result = result.replace(/public\s+static\s+void\s+(\w+)\s*\(\)\s*\{/g, 'procedure $1();');
    
    // Удаляем фигурные скобки и заменяем их на begin/end
    result = result.replace(/\{/g, 'begin');
    result = result.replace(/\}/g, 'end;');
    
    // Удаляем объявления классов
    result = result.replace(/public\s+class\s+\w+\s*/g, 'program TranslatedCode;');
    result = result.replace(/public\s+static\s+void\s+main\s*\(.*\)/g, 'begin');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    return {
        code: result,
        warnings: warnings
    };
}

// C++ → Pascal
function translateCppToPascal(code) {
    let warnings = [];
    let result = code;
    
    // cout << ... << endl; → writeln(...);
    result = result.replace(/cout\s*<<\s*(.*?)\s*<<\s*endl\s*;/g, function(match, content) {
        return `writeln(${content.trim()});`;
    });
    
    // cout << ...; → write(...);
    result = result.replace(/cout\s*<<\s*(.*?)\s*;/g, function(match, content) {
        return `write(${content.trim()});`;
    });
    
    // for (int i = 0; i < 10; i++) { → for i := 0 to 9 do
    result = result.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\w+)\s*;\s*\1\+\+\)\s*\{/g, 'for $1 := $2 to $3-1 do');
    
    // if (condition) { → if condition then
    result = result.replace(/if\s*\((.*)\)\s*\{/g, 'if $1 then');
    result = result.replace(/else if\s*\((.*)\)\s*\{/g, 'else if $1 then');
    result = result.replace(/else\s*\{/g, 'else');
    
    // void function() { → procedure function();
    result = result.replace(/void\s+(\w+)\s*\(\)\s*\{/g, 'procedure $1();');
    
    // Удаляем фигурные скобки и заменяем их на begin/end
    result = result.replace(/\{/g, 'begin');
    result = result.replace(/\}/g, 'end;');
    
    // Удаляем #include и using namespace
    result = result.replace(/#include.*/g, '');
    result = result.replace(/using namespace.*/g, '');
    result = result.replace(/int main\(\)/g, 'begin');
    result = result.replace(/return 0;/g, '');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    return {
        code: `program TranslatedCode;\n\n${result}\nend.`,
        warnings: warnings
    };
}

// Java → C++
function translateJavaToCpp(code) {
    let warnings = [];
    let result = code;
    
    // System.out.println → cout << ... << endl
    result = result.replace(/System\.out\.println\((.*)\);/g, 'cout << $1 << endl;');
    result = result.replace(/System\.out\.print\((.*)\);/g, 'cout << $1;');
    
    // public class → // public class (закомментируем)
    result = result.replace(/public\s+class\s+(\w+)/g, '// public class $1');
    
    // public static void main → int main()
    result = result.replace(/public\s+static\s+void\s+main\s*\(.*\)/g, 'int main()');
    
    // String[] args → 
    result = result.replace(/String\[\]\s+args/g, '');
    
    // public static void function() → void function()
    result = result.replace(/public\s+static\s+void\s+(\w+)\s*\(\)/g, 'void $1()');
    
    // Комментарии
    result = result.replace(/\/\/\s*(.*)/g, '// $1');
    
    return {
        code: `#include <iostream>\nusing namespace std;\n\n${result}\n    return 0;\n}`,
        warnings: warnings
    };
}

// C++ → Java
function translateCppToJava(code) {
    let warnings = [];
    let result = code;
    
    // cout << ... << endl; → System.out.println(...);
    result = result.replace(/cout\s*<<\s*(.*?)\s*<<\s*endl\s*;/g, function(match, content) {
        return `System.out.println(${content.trim()});`;
    });
    
    // cout << ...; → System.out.print(...);
    result = result.replace(/cout\s*<<\s*(.*?)\s*;/g, function(match, content) {
        return `System.out.print(${content.trim()});`;
    });
    
    // int main() → public static void main(String[] args)
    result = result.replace(/int main\(\)/g, 'public static void main(String[] args)');
    
    // void function() → public static void function()
    result = result.replace(/void\s+(\w+)\s*\(\)/g, 'public static void $1()');
    
    // Удаляем #include и using namespace
    result = result.replace(/#include.*/g, '');
    result = result.replace(/using namespace.*/g, '');
    
    return {
        code: `public class TranslatedCode {\n    ${result}\n}`,
        warnings: warnings
    };
}

// ==================== ОСНОВНАЯ ФУНКЦИЯ ПЕРЕВОДА ====================

function translateCode() {
    const sourceCode = document.getElementById('source-code').value.trim();
    const warningsContainer = document.getElementById('warnings');
    
    // Очищаем информационный блок
    warningsContainer.innerHTML = '';
    
    if (!sourceCode) {
        showNotification('Введите код для перевода', 'warning');
        return;
    }
    
    if (currentSourceLang === currentTargetLang) {
        document.getElementById('translated-code').textContent = sourceCode;
        showNotification('Исходный и целевой языки совпадают', 'info');
        return;
    }
    
    let result;
    let warnings = [];
    
    // ОПРЕДЕЛЯЕМ КАКОЙ ПЕРЕВОД ИСПОЛЬЗОВАТЬ
    const translationKey = `${currentSourceLang}_to_${currentTargetLang}`;
    
    switch(translationKey) {
        case 'python_to_pascal':
            result = translatePythonToPascal(sourceCode);
            break;
        case 'pascal_to_python':
            result = translatePascalToPython(sourceCode);
            break;
        case 'python_to_java':
            result = translatePythonToJava(sourceCode);
            break;
        case 'python_to_cpp':
            result = translatePythonToCpp(sourceCode);
            break;
        case 'java_to_python':
            result = translateJavaToPython(sourceCode);
            break;
        case 'cpp_to_python':
            result = translateCppToPython(sourceCode);
            break;
        case 'pascal_to_java':
            result = translatePascalToJava(sourceCode);
            break;
        case 'pascal_to_cpp':
            result = translatePascalToCpp(sourceCode);
            break;
        case 'java_to_pascal':
            result = translateJavaToPascal(sourceCode);
            break;
        case 'java_to_cpp':
            result = translateJavaToCpp(sourceCode);
            break;
        case 'cpp_to_pascal':
            result = translateCppToPascal(sourceCode);
            break;
        case 'cpp_to_java':
            result = translateCppToJava(sourceCode);
            break;
        default:
            result = {
                code: '# Этот перевод пока не реализован\n# Выберите другую комбинацию языков',
                warnings: ['Это направление перевода в разработке']
            };
    }
    
    // Отображаем результат
    document.getElementById('translated-code').textContent = result.code;
    
    // Отображаем информацию
    if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
            const infoItem = document.createElement('div');
            infoItem.className = 'info-item';
            infoItem.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>${warning}</span>`;
            warningsContainer.appendChild(infoItem);
        });
    } else {
        const successItem = document.createElement('div');
        successItem.className = 'info-item';
        successItem.innerHTML = `<i class="fas fa-check-circle"></i><span>Перевод выполнен успешно!</span>`;
        warningsContainer.appendChild(successItem);
    }
    
    showNotification('Перевод завершен!', 'success');
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function showNotification(message, type) {
    // Удаляем старые уведомления
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                        type === 'error' ? 'exclamation-circle' : 
                        type === 'warning' ? 'exclamation-triangle' : 
                        'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updateLanguageNames() {
    const langNames = {
        'python': 'Python',
        'pascal': 'Pascal', 
        'java': 'Java',
        'cpp': 'C++'
    };
    
    document.getElementById('source-lang-name').textContent = langNames[currentSourceLang];
    document.getElementById('target-lang-name').textContent = langNames[currentTargetLang];
    document.getElementById('from-lang').textContent = langNames[currentSourceLang];
    document.getElementById('to-lang').textContent = langNames[currentTargetLang];
}

function swapLanguages() {
    // Меняем языки местами
    const temp = currentSourceLang;
    currentSourceLang = currentTargetLang;
    currentTargetLang = temp;
    
    // Обновляем интерфейс
    updateLanguageSelection();
    updateLanguageNames();
    
    // Меняем код местами
    const sourceCode = document.getElementById('source-code').value;
    const translatedCode = document.getElementById('translated-code').textContent;
    
    document.getElementById('source-code').value = translatedCode;
    document.getElementById('translated-code').textContent = sourceCode;
    
    showNotification('Языки поменяны местами', 'info');
}

function updateLanguageSelection() {
    // Обновляем исходный язык
    document.querySelectorAll('#source-selector .lang-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.lang === currentSourceLang) {
            option.classList.add('active');
        }
    });
    
    // Обновляем целевой язык
    document.querySelectorAll('#target-selector .lang-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.lang === currentTargetLang) {
            option.classList.add('active');
        }
    });
}

// КОПИРОВАНИЕ КОДА
function copyTranslatedCode() {
    const code = document.getElementById('translated-code').textContent;
    navigator.clipboard.writeText(code)
        .then(() => showNotification('Код скопирован в буфер!', 'success'))
        .catch(() => showNotification('Ошибка при копировании', 'error'));
}

// ЗАГРУЗКА ПРИМЕРОВ
function loadExample(exampleKey) {
    if (codeExamples[exampleKey]) {
        const example = codeExamples[exampleKey];
        document.getElementById('source-code').value = example.code;
        
        // Устанавливаем правильный язык
        if (example.lang !== currentSourceLang) {
            currentSourceLang = example.lang;
            updateLanguageSelection();
            updateLanguageNames();
        }
        
        showNotification(`Загружен пример: ${exampleKey.replace('_', ' ')}`, 'info');
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ====================

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация
    updateLanguageNames();
    
    // Обработчики выбора языка
    document.querySelectorAll('#source-selector .lang-option').forEach(option => {
        option.addEventListener('click', function() {
            currentSourceLang = this.dataset.lang;
            updateLanguageSelection();
            updateLanguageNames();
        });
    });
    
    document.querySelectorAll('#target-selector .lang-option').forEach(option => {
        option.addEventListener('click', function() {
            currentTargetLang = this.dataset.lang;
            updateLanguageSelection();
            updateLanguageNames();
        });
    });
    
    // Кнопки
    document.querySelector('.translate-btn').addEventListener('click', translateCode);
    document.querySelector('.swap-btn').addEventListener('click', swapLanguages);
    document.querySelector('.clear-btn').addEventListener('click', function() {
        document.getElementById('source-code').value = '';
        document.getElementById('translated-code').textContent = '';
        showNotification('Поля очищены', 'info');
    });
    document.querySelector('.copy-btn').addEventListener('click', copyTranslatedCode);
    
    // Примеры кода
    document.getElementById('examples').addEventListener('change', function() {
        if (this.value) {
            loadExample(this.value);
            this.value = '';
        }
    });
    
    // Горячие клавиши
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            translateCode();
        }
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            swapLanguages();
        }
        if (e.ctrlKey && e.key === 'c' && e.altKey) {
            e.preventDefault();
            copyTranslatedCode();
        }
    });
    
    showNotification('Code Translator готов к работе!', 'info');
});