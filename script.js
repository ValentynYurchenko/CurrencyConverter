'use strict';

const inputUa = document.querySelector('.input[name=ua]');
const inputUs = document.querySelector('.input[name=us]');
const inputEu = document.querySelector('.input[name=eu]');
const inputRu = document.querySelector('.input[name=ru]');
let averageRateUsd, averageRateEur;

const clearInputAndRussiaBan = function () {
  inputRu.value = 'BAN!';
  inputRu.style.backgroundColor = 'red';

  if (!inputUa.value || !inputUs.value || !inputEu.value) {
    inputUs.value = inputEu.value = inputRu.value = inputUa.value = '';
    inputRu.style.backgroundColor = '';
  }
};

const addCurrencyValuesAndTime = function (dataNbu, dataMono) {
  averageRateUsd = dataNbu[24];
  averageRateEur = dataNbu[31];
  console.log(averageRateUsd, averageRateEur);

  const marketRateUsd = dataMono[0];
  const marketRateEur = dataMono[1];
  console.log(marketRateUsd, marketRateEur);

  document.querySelector('tbody').innerHTML = `<tr>
    <td>${averageRateUsd.cc}</td>
    <td>${marketRateUsd.rateBuy}</td>
    <td>${marketRateUsd.rateSell}</td>
    <td>${averageRateUsd.rate}</td>
  </tr>
  <tr>
    <td>${averageRateEur.cc}</td>
    <td>${marketRateEur.rateBuy}</td>
    <td>${marketRateEur.rateSell}</td>
    <td>${averageRateEur.rate}</td>
  </tr>`;

  const date = new Date();

  const formatDate = new Intl.DateTimeFormat('uk-Uk').format(date);

  console.log(formatDate);

  document.querySelector('.time').innerHTML = `
<time datetime="${date.getDate()}-${(date.getMonth() + 1 + '').padStart(
    2,
    '0'
  )}-${date.getFullYear()}">Станом на ${formatDate}</time>`;
};

const getCurrency = async function () {
  try {
    const responseNbu = await fetch(
      'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json'
    );

    console.log(responseNbu);

    if (!responseNbu.ok)
      throw new Error(`Не має зв'язку з банком. Помилка ${responseNbu.status}`);

    const dataNbu = await responseNbu.json();

    console.log(dataNbu);

    const responseMono = await fetch('https://api.monobank.ua/bank/currency');
    console.log(responseMono);

    if (!responseMono.ok)
      throw new Error(
        `Не має зв'язку з банком. Помилка ${responseMono.status}`
      );

    const dataMono = await responseMono.json();

    console.log(dataMono);

    addCurrencyValuesAndTime(dataNbu, dataMono);
  } catch (e) {
    console.error(e.message);

    document
      .querySelector('.container')
      .insertAdjacentHTML(
        'beforeend',
        `<div class="text-error"><p>${e.message}</p></div>`
      );
  }
};

getCurrency();

inputUa.addEventListener('input', function (e) {
  inputUs.value = (inputUa.value / averageRateUsd.rate).toFixed(2);
  inputEu.value = (inputUa.value / averageRateEur.rate).toFixed(2);

  clearInputAndRussiaBan();
});

inputUs.addEventListener('input', function (e) {
  inputUa.value = (inputUs.value * averageRateUsd.rate).toFixed(2);
  inputEu.value = (inputUa.value / averageRateEur.rate).toFixed(2);

  clearInputAndRussiaBan();
});

inputEu.addEventListener('input', function (e) {
  inputUa.value = (inputEu.value * averageRateEur.rate).toFixed(2);
  inputUs.value = (inputUa.value / averageRateUsd.rate).toFixed(2);

  clearInputAndRussiaBan();
});
