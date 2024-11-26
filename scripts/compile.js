const bytenode = require('bytenode');
const fs = require('fs');
const path = require('path');
const javascriptObfuscator = require('javascript-obfuscator');

// 获取 src 文件夹下所有的 JavaScript 文件
const directoryPath = path.join(__dirname, '../');
const files = fs.readdirSync(directoryPath);

// 编译所有的 .js 文件
files.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(directoryPath, file);
    const outputPath = path.join(__dirname, '../dist', file.replace('.js', '.jsc'));

    // 读取文件内容
    const jsCode = fs.readFileSync(filePath, 'utf8');

    // 混淆 JavaScript 代码
    const obfuscatedCode = javascriptObfuscator.obfuscate(jsCode).getObfuscatedCode();
console.log('obfuscatedCode', obfuscatedCode);

    // 将混淆后的代码保存到一个临时文件
    const tempFilePath = path.join(__dirname, '../dist', file.replace('.js', '.obfuscated.js'));
    fs.writeFileSync(tempFilePath, obfuscatedCode, 'utf8');

    // 编译混淆后的文件
    bytenode.compileFile({
      filename: tempFilePath,
      output: outputPath
    });

    console.log(`Compiled obfuscated ${file} to ${outputPath}`);

    // 删除临时混淆文件
    fs.unlinkSync(tempFilePath);
  }
});
``
