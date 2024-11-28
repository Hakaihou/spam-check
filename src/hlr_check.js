import React, { useState } from "react";
import axios from "axios";

const HLRCheck = () => {
    const [phone, setPhone] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Функция для отправки HLR-запроса
    const sendHLRRequest = async () => {
        setLoading(true);
        setResult(null);

        const API_URL = "https://smsc.ru/sys/send.php";
        const SMSC_LOGIN = "dev000ved";
        const SMSC_PASSWORD = "9fb586e607ed6f57b29423b170fb5efc57c57191";

        try {
            const response = await axios.get(API_URL, {
                params: {
                    login: SMSC_LOGIN,
                    psw: SMSC_PASSWORD,
                    phones: phone,
                    fmt: 3, // Формат ответа JSON
                    hlr: 1, // Указываем HLR-запрос
                },
            });

            console.log("Ответ на отправку HLR-запроса:", response.data);

            if (response.data.id) {
                // Ожидаем несколько секунд перед запросом статуса
                setTimeout(() => checkHLRStatus(response.data.id), 3000);
            } else {
                setResult({ error: "Не удалось отправить HLR-запрос." });
            }
        } catch (error) {
            console.error("Ошибка при отправке HLR:", error);
            setResult({ error: "Ошибка при подключении к API SMSC." });
        } finally {
            setLoading(false);
        }
    };

    // Функция для проверки статуса HLR-запроса
    const checkHLRStatus = async (id) => {
        setLoading(true);

        const STATUS_URL = "https://smsc.ru/sys/status.php";
        const SMSC_LOGIN = "dev000ved";
        const SMSC_PASSWORD = "9fb586e607ed6f57b29423b170fb5efc57c57191";

        try {
            const response = await axios.get(STATUS_URL, {
                params: {
                    login: SMSC_LOGIN,
                    psw: SMSC_PASSWORD,
                    id: id,
                    phone: phone,
                    fmt: 3, // Формат ответа JSON
                },
            });

            console.log("Ответ на проверку статуса HLR:", response.data);
            setResult(response.data); // Сохраняем результат для отображения
        } catch (error) {
            console.error("Ошибка при проверке статуса HLR:", error);
            setResult({ error: "Ошибка при получении статуса HLR." });
        } finally {
            setLoading(false);
        }
    };

    // Обработка отправки формы
    const handleSubmit = (e) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы
        if (!phone) {
            setResult({ error: "Введите номер телефона!" });
            return;
        }
        sendHLRRequest(); // Запускаем HLR-запрос
    };

    return (
        <main className="main-container">
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
                        <p style={{ color: "red" }}>{result.error}</p>
                    ) : (
                        <div className="result">
                            {result.status === 1 ? (
                                <div className="good-result">
                                    Номер валидный
                                </div>
                            ) : result.status === -3 || result.status === 20 ? (
                                <div className="bad-result">
                                    Номер не валидный
                                </div>
                            ) : (
                                <div className="undefined">
                                    Неопознанная ошибка
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </main>
    );
};

export default HLRCheck;
