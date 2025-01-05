const mcookie = process.env.M_COOKIE;
const acookie = process.env.A_COOKIE;
// const sha256 = process.env.SHA_265;

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

export default users;
