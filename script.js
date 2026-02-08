// ==================== ИСПРАВЛЕННЫЕ ФУНКЦИИ ПЕРЕВОДА ====================

// Python → Pascal (УПРОЩЕННАЯ И РАБОЧАЯ)
function translatePythonToPascal(code) {
    let result = code;
    
    // 1. Обработка f-строк: print(f"Text {var}") → writeln('Text ', var)
    result = result.replace(/print\(f"([^"]*){([^}]+)}([^"]*)"\)/g, "writeln('$1', $2, '$3');");
    result = result.replace(/print\(f"([^"]*){([^}]+)}"\)/g, "writeln('$1', $2);");
    
    // 2. Простые print
    result = result.replace(/print\("([^"]*)"\)/g, "writeln('$1');");
    
    // 3. for i in range(start, end):
    result = result.replace(/for (\w+) in range\((\d+),\s*(\d+)\):/g, 'for $1 := $2 to $3-1 do');
    
    // 4. def function(param): → function function(param: integer): integer;
    result = result.replace(/def (\w+)\((\w+)\):/g, 'function $1($2: integer): integer;');
    
    // 5. return value → function_name := value
    result = result.replace(/return (\w+)/g, '$1 := $1');
    
    // 6. if condition: → if condition then
    result = result.replace(/if (.+):/g, 'if $1 then');
    result = result.replace(/elif (.+):/g, 'else if $1 then');
    result = result.replace(/else:/g, 'else');
    
    // 7. Переменные
    result = result.replace(/^(\s*)(\w+) = (\d+)/gm, '$1$2 := $3;');
    
    // 8. Комментарии
    result = result.replace(/# (.*)/g, '// $1');
    
    // 9. Собираем программу
    const lines = result.split('\n').filter(l => l.trim());
    let indent = 0;
    let output = [];
    
    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('end') || line.startsWith('else')) {
            indent = Math.max(0, indent - 1);
        }
        
        output.push('  '.repeat(indent) + line);
        
        if (line.endsWith('then') || line.endsWith('do') || line.includes('function')) {
            indent++;
        }
    }
    
    result = output.join('\n');
    
    // Добавляем program если его нет
    if (!result.includes('program')) {
        result = `program TranslatedCode;\n\nbegin\n${result}\nend.`;
    }
    
    return { code: result, warnings: [] };
}

// Python → Java (УПРОЩЕННАЯ И РАБОЧАЯ)
function translatePythonToJava(code) {
    let result = code;
    
    // 1. Обработка f-строк
    result = result.replace(/print\(f"([^"]*){([^}]+)}([^"]*)"\)/g, 'System.out.println("$1" + $2 + "$3");');
    result = result.replace(/print\(f"([^"]*){([^}]+)}"\)/g, 'System.out.println("$1" + $2);');
    
    // 2. Простые print
    result = result.replace(/print\("([^"]*)"\)/g, 'System.out.println("$1");');
    
    // 3. for i in range(start, end):
    result = result.replace(/for (\w+) in range\((\d+),\s*(\d+)\):/g, 'for (int $1 = $2; $1 < $3; $1++) {');
    
    // 4. def function(param): → public static int function(int param) {
    result = result.replace(/def (\w+)\((\w+)\):/g, 'public static int $1(int $2) {');
    
    // 5. return
    result = result.replace(/return (\w+)/g, 'return $1;');
    
    // 6. if condition:
    result = result.replace(/if (.+):/g, 'if ($1) {');
    result = result.replace(/elif (.+):/g, 'else if ($1) {');
    result = result.replace(/else:/g, 'else {');
    
    // 7. Переменные
    result = result.replace(/^(\s*)(\w+) = (\d+)/gm, '$1int $2 = $3;');
    
    // 8. Комментарии
    result = result.replace(/# (.*)/g, '// $1');
    
    // 9. Форматирование
    const lines = result.split('\n');
    let indent = 0;
    let output = [];
    let hasMain = false;
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        if (line.startsWith('}') || line.startsWith('else')) {
            indent = Math.max(0, indent - 1);
        }
        
        output.push('    '.repeat(indent) + line);
        
        if (line.endsWith('{')) {
            indent++;
        }
    }
    
    result = output.join('\n');
    
    // Добавляем main если нужно
    if (!result.includes('main') && !result.includes('public static void')) {
        const lines = result.split('\n');
        let functions = [];
        let mainCode = [];
        
        for (let line of lines) {
            if (line.includes('public static')) {
                functions.push(line);
            } else if (line.trim() && !line.includes('class')) {
                mainCode.push('        ' + line.trim());
            }
        }
        
        if (functions.length > 0) {
            result = `public class TranslatedCode {\n${functions.join('\n')}\n\n    public static void main(String[] args) {\n${mainCode.join('\n')}\n    }\n}`;
        } else {
            result = `public class TranslatedCode {\n    public static void main(String[] args) {\n${mainCode.map(l => '        ' + l.trim()).join('\n')}\n    }\n}`;
        }
    }
    
    return { code: result, warnings: [] };
}

// Python → C++ (УПРОЩЕННАЯ И РАБОЧАЯ)
function translatePythonToCpp(code) {
    let result = code;
    
    // 1. Обработка f-строк
    result = result.replace(/print\(f"([^"]*){([^}]+)}([^"]*)"\)/g, 'cout << "$1" << $2 << "$3" << endl;');
    result = result.replace(/print\(f"([^"]*){([^}]+)}"\)/g, 'cout << "$1" << $2 << endl;');
    
    // 2. Простые print
    result = result.replace(/print\("([^"]*)"\)/g, 'cout << "$1" << endl;');
    
    // 3. for i in range(start, end):
    result = result.replace(/for (\w+) in range\((\d+),\s*(\d+)\):/g, 'for (int $1 = $2; $1 < $3; $1++) {');
    
    // 4. def function(param): → int function(int param) {
    result = result.replace(/def (\w+)\((\w+)\):/g, 'int $1(int $2) {');
    
    // 5. return
    result = result.replace(/return (\w+)/g, 'return $1;');
    
    // 6. if condition:
    result = result.replace(/if (.+):/g, 'if ($1) {');
    result = result.replace(/elif (.+):/g, 'else if ($1) {');
    result = result.replace(/else:/g, 'else {');
    
    // 7. Переменные
    result = result.replace(/^(\s*)(\w+) = (\d+)/gm, '$1int $2 = $3;');
    
    // 8. Комментарии
    result = result.replace(/# (.*)/g, '// $1');
    
    // 9. Форматирование
    const lines = result.split('\n');
    let indent = 0;
    let output = [];
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        if (line.startsWith('}') || line.startsWith('else')) {
            indent = Math.max(0, indent - 1);
        }
        
        output.push('    '.repeat(indent) + line);
        
        if (line.endsWith('{')) {
            indent++;
        }
    }
    
    result = output.join('\n');
    
    // Добавляем заголовки и main
    result = `#include <iostream>\nusing namespace std;\n\n${result}`;
    
    if (!result.includes('int main()')) {
        // Разделяем на функции и основной код
        const lines = result.split('\n');
        let functions = [];
        let mainCode = [];
        
        for (let line of lines) {
            if (line.includes('int ') && line.includes('(') && line.includes(')')) {
                functions.push(line);
            } else if (line.trim() && !line.includes('#include') && !line.includes('using namespace')) {
                mainCode.push('    ' + line.trim());
            }
        }
        
        if (functions.length > 0) {
            result = `#include <iostream>\nusing namespace std;\n\n${functions.join('\n')}\n\nint main() {\n${mainCode.join('\n')}\n    return 0;\n}`;
        } else {
            result = `#include <iostream>\nusing namespace std;\n\nint main() {\n${mainCode.join('\n')}\n    return 0;\n}`;
        }
    }
    
    return { code: result, warnings: [] };
}

// Java → Python (УПРОЩЕННАЯ И РАБОЧАЯ)
function translateJavaToPython(code) {
    let result = code;
    
    // 1. Удаляем public class
    result = result.replace(/public class \w+ \{/g, '');
    
    // 2. Удаляем public static void main
    result = result.replace(/public static void main\(String\[\] args\) \{/g, '');
    
    // 3. System.out.println("text" + var) → print(f"text{var}")
    result = result.replace(/System\.out\.println\("([^"]*)"\s*\+\s*(\w+)\s*\);/g, 'print(f"$1{$2}")');
    result = result.replace(/System\.out\.println\("([^"]*)"\s*\+\s*(\w+)\s*\+\s*"([^"]*)"\);/g, 'print(f"$1{$2}$3")');
    
    // 4. Простые System.out.println
    result = result.replace(/System\.out\.println\("([^"]*)"\);/g, 'print("$1")');
    
    // 5. for (int i = start; i < end; i++)
    result = result.replace(/for \(int (\w+) = (\d+); \1 < (\d+); \1\+\+\) \{/g, 'for $1 in range($2, $3):');
    result = result.replace(/for \(int (\w+) = (\d+); \1 <= (\d+); \1\+\+\) \{/g, 'for $1 in range($2, $3 + 1):');
    
    // 6. public static int function(int param) { → def function(param):
    result = result.replace(/public static int (\w+)\(int (\w+)\) \{/g, 'def $1($2):');
    
    // 7. if (condition) { → if condition:
    result = result.replace(/if \((.+)\) \{/g, 'if $1:');
    result = result.replace(/else if \((.+)\) \{/g, 'elif $1:');
    result = result.replace(/else \{/g, 'else:');
    
    // 8. Удаляем фигурные скобки
    result = result.replace(/[{}]/g, '');
    
    // 9. Удаляем точки с запятой
    result = result.replace(/;/g, '');
    
    // 10. int var = value → var = value
    result = result.replace(/int (\w+) = (\d+)/g, '$1 = $2');
    
    // 11. return value; → return value
    result = result.replace(/return (\w+);/g, 'return $1');
    
    // 12. Комментарии
    result = result.replace(/\/\/ (.*)/g, '# $1');
    
    // 13. Форматирование отступов
    const lines = result.split('\n').filter(l => l.trim());
    let indent = 0;
    let output = [];
    
    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('elif') || line.startsWith('else') || line.startsWith('return')) {
            indent = Math.max(0, indent - 1);
        }
        
        output.push('    '.repeat(indent) + line);
        
        if (line.endsWith(':') && !line.startsWith('#')) {
            indent++;
        }
    }
    
    result = output.join('\n').trim();
    
    return { code: result, warnings: [] };
}

// Pascal → Python (УПРОЩЕННАЯ И РАБОЧАЯ)
function translatePascalToPython(code) {
    let result = code;
    
    // 1. Удаляем program
    result = result.replace(/program \w+;/i, '');
    
    // 2. writeln('text', var) → print(f"text{var}")
    result = result.replace(/writeln\('([^']*)',\s*(\w+)\s*\);/g, 'print(f"$1{$2}")');
    result = result.replace(/writeln\('([^']*)',\s*(\w+),\s*'([^']*)'\);/g, 'print(f"$1{$2}$3")');
    
    // 3. Простые writeln
    result = result.replace(/writeln\('([^']*)'\);/g, 'print("$1")');
    
    // 4. for i := start to end do → for i in range(start, end + 1):
    result = result.replace(/for (\w+) := (\d+) to (\d+) do/g, 'for $1 in range($2, $3 + 1):');
    
    // 5. function name(param: type): type; → def name(param):
    result = result.replace(/function (\w+)\((\w+): integer\): integer;/g, 'def $1($2):');
    
    // 6. name := value; (в функции) → return value
    result = result.replace(/(\w+) := (\w+);/g, 'return $2');
    
    // 7. if condition then → if condition:
    result = result.replace(/if (.+) then/g, 'if $1:');
    result = result.replace(/else if (.+) then/g, 'elif $1:');
    result = result.replace(/else/g, 'else:');
    
    // 8. begin/end
    result = result.replace(/begin|end\.?/gi, '');
    
    // 9. var := value; → var = value
    result = result.replace(/(\w+) := (\d+);/g, '$1 = $2');
    
    // 10. Удаляем точки с запятой
    result = result.replace(/;/g, '');
    
    // 11. Комментарии
    result = result.replace(/\/\/ (.*)/g, '# $1');
    result = result.replace(/\{\$(.*)\}/g, '# $1');
    result = result.replace(/\{(.*)\}/g, '# $1');
    
    // 12. Форматирование
    const lines = result.split('\n').filter(l => l.trim());
    let indent = 0;
    let output = [];
    
    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('elif') || line.startsWith('else') || line.startsWith('return')) {
            indent = Math.max(0, indent - 1);
        }
        
        output.push('    '.repeat(indent) + line);
        
        if (line.endsWith(':') && !line.startsWith('#')) {
            indent++;
        }
    }
    
    result = output.join('\n').trim();
    
    return { code: result, warnings: [] };
}

// C++ → Python (УПРОЩЕННАЯ И РАБОЧАЯ)
function translateCppToPython(code) {
    let result = code;
    
    // 1. Удаляем #include и using namespace
    result = result.replace(/#include.*/g, '');
    result = result.replace(/using namespace.*/g, '');
    
    // 2. Удаляем int main()
    result = result.replace(/int main\(\) \{/g, '');
    result = result.replace(/return 0;/g, '');
    
    // 3. cout << "text" << var << endl; → print(f"text{var}")
    result = result.replace(/cout << "([^"]*)" << (\w+) << endl;/g, 'print(f"$1{$2}")');
    result = result.replace(/cout << "([^"]*)" << (\w+) << "([^"]*)" << endl;/g, 'print(f"$1{$2}$3")');
    
    // 4. Простые cout
    result = result.replace(/cout << "([^"]*)" << endl;/g, 'print("$1")');
    
    // 5. for (int i = start; i < end; i++)
    result = result.replace(/for \(int (\w+) = (\d+); \1 < (\d+); \1\+\+\) \{/g, 'for $1 in range($2, $3):');
    result = result.replace(/for \(int (\w+) = (\d+); \1 <= (\d+); \1\+\+\) \{/g, 'for $1 in range($2, $3 + 1):');
    
    // 6. int function(int param) { → def function(param):
    result = result.replace(/int (\w+)\(int (\w+)\) \{/g, 'def $1($2):');
    
    // 7. if (condition) { → if condition:
    result = result.replace(/if \((.+)\) \{/g, 'if $1:');
    result = result.replace(/else if \((.+)\) \{/g, 'elif $1:');
    result = result.replace(/else \{/g, 'else:');
    
    // 8. Удаляем фигурные скобки
    result = result.replace(/[{}]/g, '');
    
    // 9. Удаляем точки с запятой
    result = result.replace(/;/g, '');
    
    // 10. int var = value → var = value
    result = result.replace(/int (\w+) = (\d+);/g, '$1 = $2');
    
    // 11. return value; → return value
    result = result.replace(/return (\w+);/g, 'return $1');
    
    // 12. Комментарии
    result = result.replace(/\/\/ (.*)/g, '# $1');
    
    // 13. Форматирование
    const lines = result.split('\n').filter(l => l.trim());
    let indent = 0;
    let output = [];
    
    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('elif') || line.startsWith('else') || line.startsWith('return')) {
            indent = Math.max(0, indent - 1);
        }
        
        output.push('    '.repeat(indent) + line);
        
        if (line.endsWith(':') && !line.startsWith('#')) {
            indent++;
        }
    }
    
    result = output.join('\n').trim();
    
    return { code: result, warnings: [] };
}

// Остальные функции (Pascal → Java, Pascal → C++, Java → Pascal, Java → C++, C++ → Java, C++ → Pascal)
// Используем тот же подход - УПРОЩАЕМ!

// Pascal → Java
function translatePascalToJava(code) {
    let result = code;
    
    // Удаляем program
    result = result.replace(/program \w+;/i, '');
    
    // writeln('text', var) → System.out.println("text" + var)
    result = result.replace(/writeln\('([^']*)',\s*(\w+)\s*\);/g, 'System.out.println("$1" + $2);');
    result = result.replace(/writeln\('([^']*)',\s*(\w+),\s*'([^']*)'\);/g, 'System.out.println("$1" + $2 + "$3");');
    
    // Простые writeln
    result = result.replace(/writeln\('([^']*)'\);/g, 'System.out.println("$1");');
    
    // for i := start to end do → for (int i = start; i <= end; i++)
    result = result.replace(/for (\w+) := (\d+) to (\d+) do/g, 'for (int $1 = $2; $1 <= $3; $1++) {');
    
    // function name(param: type): type; → public static int name(int param) {
    result = result.replace(/function (\w+)\((\w+): integer\): integer;/g, 'public static int $1(int $2) {');
    
    // name := value; → return value;
    result = result.replace(/(\w+) := (\w+);/g, 'return $2;');
    
    // if condition then → if (condition) {
    result = result.replace(/if (.+) then/g, 'if ($1) {');
    result = result.replace(/else if (.+) then/g, 'else if ($1) {');
    result = result.replace(/else/g, 'else {');
    
    // begin/end
    result = result.replace(/begin/gi, '{');
    result = result.replace(/end\.?/gi, '}');
    
    // var := value; → int var = value;
    result = result.replace(/(\w+) := (\d+);/g, 'int $1 = $2;');
    
    // Комментарии
    result = result.replace(/\/\/ (.*)/g, '// $1');
    
    // Форматирование
    const lines = result.split('\n').filter(l => l.trim());
    let indent = 0;
    let output = [];
    
    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('}') || line.startsWith('else')) {
            indent = Math.max(0, indent - 1);
        }
        
        output.push('    '.repeat(indent) + line);
        
        if (line.endsWith('{') || line.includes('function')) {
            indent++;
        }
    }
    
    result = output.join('\n');
    
    // Добавляем класс и main
    result = `public class TranslatedCode {\n    public static void main(String[] args) {\n${result}\n    }\n}`;
    
    return { code: result, warnings: [] };
}

// Pascal → C++
function translatePascalToCpp(code) {
    let result = code;
    
    // Удаляем program
    result = result.replace(/program \w+;/i, '');
    
    // writeln('text', var) → cout << "text" << var << endl;
    result = result.replace(/writeln\('([^']*)',\s*(\w+)\s*\);/g, 'cout << "$1" << $2 << endl;');
    result = result.replace(/writeln\('([^']*)',\s*(\w+),\s*'([^']*)'\);/g, 'cout << "$1" << $2 << "$3" << endl;');
    
    // Простые writeln
    result = result.replace(/writeln\('([^']*)'\);/g, 'cout << "$1" << endl;');
    
    // for i := start to end do → for (int i = start; i <= end; i++)
    result = result.replace(/for (\w+) := (\d+) to (\d+) do/g, 'for (int $1 = $2; $1 <= $3; $1++) {');
    
    // function name(param: type): type; → int name(int param) {
    result = result.replace(/function (\w+)\((\w+): integer\): integer;/g, 'int $1(int $2) {');
    
    // name := value; → return value;
    result = result.replace(/(\w+) := (\w+);/g, 'return $2;');
    
    // if condition then → if (condition) {
    result = result.replace(/if (.+) then/g, 'if ($1) {');
    result = result.replace(/else if (.+) then/g, 'else if ($1) {');
    result = result.replace(/else/g, 'else {');
    
    // begin/end
    result = result.replace(/begin/gi, '{');
    result = result.replace(/end\.?/gi, '}');
    
    // var := value; → int var = value;
    result = result.replace(/(\w+) := (\d+);/g, 'int $1 = $2;');
    
    // Комментарии
    result = result.replace(/\/\/ (.*)/g, '// $1');
    
    // Форматирование
    const lines = result.split('\n').filter(l => l.trim());
    let indent = 0;
    let output = [];
    
    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('}') || line.startsWith('else')) {
            indent = Math.max(0, indent - 1);
        }
        
        output.push('    '.repeat(indent) + line);
        
        if (line.endsWith('{') || line.includes('function')) {
            indent++;
        }
    }
    
    result = output.join('\n');
    
    // Добавляем заголовки и main
    result = `#include <iostream>\nusing namespace std;\n\n${result}`;
    
    if (!result.includes('int main()')) {
        result += '\n\nint main() {\n    // Вставьте вызовы функций здесь\n    return 0;\n}';
    }
    
    return { code: result, warnings: [] };
}

// Java → Pascal
function translateJavaToPascal(code) {
    let result = code;
    
    // Удаляем public class
    result = result.replace(/public class \w+ \{/g, '');
    
    // Удаляем public static void main
    result = result.replace(/public static void main\(String\[\] args\) \{/g, '');
    
    // System.out.println("text" + var) → writeln('text', var)
    result = result.replace(/System\.out\.println\("([^"]*)"\s*\+\s*(\w+)\s*\);/g, "writeln('$1', $2);");
    result = result.replace(/System\.out\.println\("([^"]*)"\s*\+\s*(\w+)\s*\+\s*"([^"]*)"\);/g, "writeln('$1', $2, '$3');");
    
    // Простые System.out.println
    result = result.replace(/System\.out\.println\("([^"]*)"\);/g, "writeln('$1');");
    
    // for (int i = start; i <= end; i++) → for i := start to end do
    result = result.replace(/for \(int (\w+) = (\d+); \1 <= (\d+); \1\+\+\) \{/g, 'for $1 := $2 to $3 do');
    
    // public static int function(int param) { → function function(param: integer): integer;
    result = result.replace(/public static int (\w+)\(int (\w+)\) \{/g, 'function $1($2: integer): integer;');
    
    // return value; → function_name := value;
    result = result.replace(/return (\w+);/g, '$1 := $1;');
    
    // if (condition) { → if condition then
    result = result.replace(/if \((.+)\) \{/g, 'if $1 then');
    result = result.replace(/else if \((.+)\) \{/g, 'else if $1 then');
    result = result.replace(/else \{/g, 'else');
    
    // Фигурные скобки → begin/end
    result = result.replace(/\{/g, 'begin');
    result = result.replace(/\}/g, 'end;');
    
    // int var = value; → var := value;
    result = result.replace(/int (\w+) = (\d+);/g, '$1 := $2;');
    
    // Комментарии
    result = result.replace(/\/\/ (.*)/g, '// $1');
    
    // Форматирование
    const lines = result.split('\n').filter(l => l.trim());
    let indent = 0;
    let output = [];
    
    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('end') || line.startsWith('else')) {
            indent = Math.max(0, indent - 1);
        }
        
        output.push('  '.repeat(indent) + line);
        
        if (line.endsWith('then') || line.endsWith('do') || line.includes('function')) {
            indent++;
        }
    }
    
    result = output.join('\n');
    
    // Добавляем program
    result = `program TranslatedCode;\n\nbegin\n${result}\nend.`;
    
    return { code: result, warnings: [] };
}

// Java → C++
function translateJavaToCpp(code) {
    let result = code;
    
    // Удаляем public class (оставляем комментарий)
    result = result.replace(/public class (\w+)/g, '// public class $1');
    
    // public static void main → int main()
    result = result.replace(/public static void main\(String\[\] args\)/g, 'int main()');
    
    // System.out.println → cout
    result = result.replace(/System\.out\.println\("([^"]*)"\s*\+\s*(\w+)\s*\);/g, 'cout << "$1" << $2 << endl;');
    result = result.replace(/System\.out\.println\("([^"]*)"\s*\+\s*(\w+)\s*\+\s*"([^"]*)"\);/g, 'cout << "$1" << $2 << "$3" << endl;');
    result = result.replace(/System\.out\.println\("([^"]*)"\);/g, 'cout << "$1" << endl;');
    
    // public static int function → int function
    result = result.replace(/public static int (\w+)\(int (\w+)\)/g, 'int $1(int $2)');
    
    // if (condition) { остается таким же
    
    // Комментарии
    result = result.replace(/\/\/ (.*)/g, '// $1');
    
    // Добавляем заголовки
    result = `#include <iostream>\nusing namespace std;\n\n${result}`;
    
    return { code: result, warnings: [] };
}

// C++ → Java
function translateCppToJava(code) {
    let result = code;
    
    // Удаляем #include и using namespace
    result = result.replace(/#include.*/g, '');
    result = result.replace(/using namespace.*/g, '');
    
    // int main() → public static void main(String[] args)
    result = result.replace(/int main\(\)/g, 'public static void main(String[] args)');
    
    // cout → System.out.println
    result = result.replace(/cout << "([^"]*)" << (\w+) << endl;/g, 'System.out.println("$1" + $2);');
    result = result.replace(/cout << "([^"]*)" << (\w+) << "([^"]*)" << endl;/g, 'System.out.println("$1" + $2 + "$3");');
    result = result.replace(/cout << "([^"]*)" << endl;/g, 'System.out.println("$1");');
    
    // int function(int param) → public static int function(int param)
    result = result.replace(/int (\w+)\(int (\w+)\)/g, 'public static int $1(int $2)');
    
    // Комментарии
    result = result.replace(/\/\/ (.*)/g, '// $1');
    
    // Добавляем класс
    result = `public class TranslatedCode {\n    ${result}\n}`;
    
    return { code: result, warnings: [] };
}

// C++ → Pascal
function translateCppToPascal(code) {
    let result = code;
    
    // Удаляем #include и using namespace
    result = result.replace(/#include.*/g, '');
    result = result.replace(/using namespace.*/g, '');
    
    // Удаляем int main()
    result = result.replace(/int main\(\) \{/g, '');
    result = result.replace(/return 0;/g, '');
    
    // cout → writeln
    result = result.replace(/cout << "([^"]*)" << (\w+) << endl;/g, "writeln('$1', $2);");
    result = result.replace(/cout << "([^"]*)" << (\w+) << "([^"]*)" << endl;/g, "writeln('$1', $2, '$3');");
    result = result.replace(/cout << "([^"]*)" << endl;/g, "writeln('$1');");
    
    // for (int i = start; i <= end; i++) → for i := start to end do
    result = result.replace(/for \(int (\w+) = (\d+); \1 <= (\d+); \1\+\+\) \{/g, 'for $1 := $2 to $3 do');
    
    // int function(int param) { → function function(param: integer): integer;
    result = result.replace(/int (\w+)\(int (\w+)\) \{/g, 'function $1($2: integer): integer;');
    
    // return value; → function_name := value;
    result = result.replace(/return (\w+);/g, '$1 := $1;');
    
    // if (condition) { → if condition then
    result = result.replace(/if \((.+)\) \{/g, 'if $1 then');
    result = result.replace(/else if \((.+)\) \{/g, 'else if $1 then');
    result = result.replace(/else \{/g, 'else');
    
    // Фигурные скобки → begin/end
    result = result.replace(/\{/g, 'begin');
    result = result.replace(/\}/g, 'end;');
    
    // int var = value; → var := value;
    result = result.replace(/int (\w+) = (\d+);/g, '$1 := $2;');
    
    // Комментарии
    result = result.replace(/\/\/ (.*)/g, '// $1');
    
    // Форматирование
    const lines = result.split('\n').filter(l => l.trim());
    let indent = 0;
    let output = [];
    
    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('end') || line.startsWith('else')) {
            indent = Math.max(0, indent - 1);
        }
        
        output.push('  '.repeat(indent) + line);
        
        if (line.endsWith('then') || line.endsWith('do') || line.includes('function')) {
            indent++;
        }
    }
    
    result = output.join('\n');
    
    // Добавляем program
    result = `program TranslatedCode;\n\nbegin\n${result}\nend.`;
    
    return { code: result, warnings: [] };
}
