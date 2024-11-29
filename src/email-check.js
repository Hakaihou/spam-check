import React, {useState} from "react";
import axios from "axios";

const EmailValidation = () => {
    const [email, setEmail] = useState(""); // Email для проверки
    const [result, setResult] = useState(null); // Результат проверки
    const [loading, setLoading] = useState(false); // Индикатор загрузки

    const API_KEY = "AakOoTugw1ij91jmRYKlI"; // Вставьте ваш API-ключ

    // Функция для проверки email через API EmailListVerify
    const validateEmail = async () => {
        setLoading(true);
        setResult(null);

        const API_URL = `https://api.emaillistverify.com/api/verifyEmail?secret=${API_KEY}&email=${email}`;

        try {
            const response = await axios.get(API_URL);

            console.log("Ответ от API EmailListVerify:", response.data);
            setResult(response.data);
        } catch (error) {
            console.error("Ошибка при запросе к API EmailListVerify:", error);

            if (error.response) {
                setResult({
                    error: `Ошибка API: ${error.response.data.message || error.response.statusText}`,
                });
            } else {
                setResult({ error: "Ошибка при подключении к API." });
            }
        } finally {
            setLoading(false);
        }
    };

    // Обработка отправки формы
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) {
            setResult({ error: "Введите адрес электронной почты!" });
            return;
        }
        validateEmail();
    };

    return (
            <div className="flex-item">
            <h2>Введите email для проверки:</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@example.com"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Проверка..." : "Проверить email"}
                </button>
            </form>
            {result && (
                <div>
                    {result.error ? (
                        <p style={{ color: "red" }}>{result.error}</p>
                    ) : (
                        <div className="result">
                            {result === 'ok' ? <div className="good-result">Email валидный</div> : <div className="undefined">Email невалидный</div>}
                        </div>
                    )}
                </div>
            )}
            </div>
    );
};

export default EmailValidation;
