const CurrencyConverter = require('currency-converter');

const converter = new CurrencyConverter();

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    try {
        const rate = await converter.convert(fromCurrency, toCurrency);
        return amount * rate;
    } catch (error) {
        console.error('Error converting currency:', error);
        throw error;
    }
};

const getExchangeRate = async (fromCurrency, toCurrency) => {
    try {
        return await converter.convert(fromCurrency, toCurrency);
    } catch (error) {
        console.error('Error getting exchange rate:', error);
        throw error;
    }
};

module.exports = {
    convertCurrency,
    getExchangeRate
};
