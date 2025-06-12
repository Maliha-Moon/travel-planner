const axios = require('axios');

const getWeatherData = async (location) => {
    try {
        const apiKey = process.env.WEATHER_API_KEY;
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: location,
                units: 'metric',
                appid: apiKey
            }
        });
        return {
            temperature: response.data.main.temp,
            description: response.data.weather[0].description,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed,
            icon: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};

module.exports = {
    getWeatherData
};
