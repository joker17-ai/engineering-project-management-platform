const http = require('node:http');

function get(pathname) {
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:4174/${pathname}`, (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => resolve({ statusCode: response.statusCode, body }));
      })
      .on('error', reject);
  });
}

(async () => {
  const home = await get('');
  const database = await get('database.html');

  const result = {
    homeStatus: home.statusCode,
    databaseStatus: database.statusCode,
    hasBlueArrow: home.body.includes('蓝箭项目管理平台'),
    hasLogo: home.body.includes('./assets/blue-arrow-logo.jpg'),
    hasAppScript: home.body.includes('./src/app.mjs'),
    hasDatabaseScript: database.body.includes('./src/database.mjs'),
  };

  console.log(JSON.stringify(result, null, 2));

  if (Object.values(result).some((value) => value === false) || home.statusCode !== 200 || database.statusCode !== 200) {
    process.exit(1);
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
