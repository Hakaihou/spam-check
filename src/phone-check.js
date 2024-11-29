import React, {useState} from "react";
import axios from "axios";

const HLRCheck = () => {
    const [phone, setPhone] = useState(""); // Номер телефона
    const [result, setResult] = useState(null); // Результат проверки
    const [loading, setLoading] = useState(false); // Индикатор загрузки

    const API_KEY = "8Mvo1ELI4aHg16iFZiIw9GmUPYO7qCso"; // Ваш ключ API IPQS

    // Функция для проверки номера через IPQS API
    const validatePhoneNumber = async () => {
        setLoading(true);
        setResult(null);

        const API_URL = `https://ipqualityscore.com/api/json/phone/${API_KEY}/${phone}`;
        try {
            const response = await axios.get(API_URL);

            console.log("Ответ от API IPQS:", response.data);
            setResult(response.data);
        } catch (error) {
            console.error("Ошибка при запросе к API IPQS:", error);

            if (error.response && error.response.status === 403) {
                setResult({error: "Доступ к API запрещен. Проверьте API-ключ или ограничения IP."});
            } else if (error.response) {
                setResult({error: `Ошибка API: ${error.response.statusText}`});
            } else {
                setResult({error: "Ошибка при подключении к API."});
            }
        } finally {
            setLoading(false);
        }
    };

    // Обработка отправки формы
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!phone) {
            setResult({error: "Введите номер телефона!"});
            return;
        }
        validatePhoneNumber();
    };

    return (
        <div className="flex-item">
            <h2>Введите номер телефона для проверки:</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+79991234567"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Проверка..." : "Проверить номер"}
                </button>
            </form>
            {result && (
                <div>
                    {result.error ? (
                        <p style={{color: "red"}}>{result.error}</p>
                    ) : (
                        <div className="result">
                            <h3>Результат проверки:</h3>
                            <p>Сообщение: {result.message}</p>
                            <p>Действительный: {result.valid ? "Да" : "Нет"}</p>
                            <p>Тип линии: {result.line_type || "Неизвестно"}</p>
                            <p>Оператор: {result.carrier || "Неизвестно"}</p>
                            <p>Страна: {result.country || "Неизвестно"}</p>
                            <p>Регион: {result.region || "Неизвестно"}</p>
                            <p>Часовой пояс: {result.timezone || "Неизвестно"}</p>
                            <p>Форматированный номер: {result.formatted || "Неизвестно"}</p>
                            <p>Риск: {result.risky ? "Высокий" : "Низкий"}</p>
                            <p>Fraud Score: {result.fraud_score}</p>
                        </div>
                    )}
                    <h4>Полный ответ:</h4>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default HLRCheck;
