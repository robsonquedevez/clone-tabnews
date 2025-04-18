import bcryptjs from "bcryptjs";

async function hash(providedPassword) {
  const rounds = getNumberRounds();
  const passwordWithPepper = addPepper(providedPassword);
  return await bcryptjs.hash(passwordWithPepper, rounds);
}

function getNumberRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

function addPepper(providedPassword) {
  const pepper = process.env.PASSWORD_PEPPER;
  const startPepper = pepper.substring(0, pepper.length / 2);
  const endPepper = pepper.substring(pepper.length / 2, pepper.length);

  return String().concat(startPepper, providedPassword, endPepper);
}

async function compare(providedPassword, storedPassword) {
  const passwordWithPepper = addPepper(providedPassword);
  return await bcryptjs.compare(passwordWithPepper, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
