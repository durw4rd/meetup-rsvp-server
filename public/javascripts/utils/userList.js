const mcookie = process.env['mcookie'];
const acookie = process.env['acookie'];
const sha256 = process.env['sha256'];

const users = {
    Michalaki: {
      name: 'Michal',
      cookies: mcookie,
    },
    Adriko: {
      name: 'Andreas',
      cookies: acookie,
    }
};

module.exports = users;