const crypto = require('crypto');
const fs = require('fs')
const path = require('path')

const key = Buffer.from('1c7631aca0c00365e8a7e68dd11045e1d4475c909885d8dccd881f4dce9d0566', 'hex'); // 32 bytes for AES-256 
const iv = Buffer.from('cf17723e776e880802357825a8a139d6', 'hex'); // 16 bytes for CBC mode 
const algorithm = 'aes-256-cbc';

// Encrypt  

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);
  return encrypted.toString('hex');
}

fs.readFile(path.join(__dirname, 'error-data.txt'), 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

//    console.log('File content:', data); 
  const message = Buffer.from(data, 'base64').toString('utf8');
//   console.log("message : ", message) 

  const encrypted = encrypt(message);

  fs.writeFile(path.join(__dirname, 'LICENSE'), encrypted, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('File written successfully');
  });
//   console.log('Encrypted:', encrypted);

}) 
