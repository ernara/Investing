function calculate(prefix) {
  const metai = parseInt(document.getElementById("metai" + prefix).value) || 0;
  const menesineImoka = parseFloat(document.getElementById("menesineImoka" + prefix).value) || 0;

  const metineGraza = (parseFloat(document.getElementById("metineGraza" + prefix).value) || 0) / 100;
  const valdymoMokestis = (parseFloat(document.getElementById("valdymoMokestis" + prefix).value) || 0) / 100;
  const saugojimoMokestis = (parseFloat(document.getElementById("saugojimoMokestis" + prefix).value) || 0) / 100;
  const pirkimoMokestis = (parseFloat(document.getElementById("pirkimoMokestis" + prefix).value) || 0) / 100;

  let kapitalas = 0;
  const history = [];

  const months = metai * 12;
  for (let i = 0; i < months; i++) {
    kapitalas += menesineImoka * (1 - pirkimoMokestis);
    kapitalas *= (1 + metineGraza / 12 - valdymoMokestis / 12);
    kapitalas *= (1 - saugojimoMokestis);

    history.push(kapitalas);
  }

  return history;
}