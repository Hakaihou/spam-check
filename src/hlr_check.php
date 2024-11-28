<?php
// Укажите ваши учетные данные и настройки
define("SMSC_LOGIN", "dev000ved");             // Ваш логин в SMSC
define("SMSC_PASSWORD", "9fb586e607ed6f57b29423b170fb5efc57c57191");       // Ваш пароль
define("SMSC_POST", 0);                              // Использовать POST (0 - нет, 1 - да)
define("SMSC_HTTPS", 0);                             // Использовать HTTPS (0 - нет, 1 - да)
define("SMSC_CHARSET", "utf-8");                     // Кодировка (utf-8, windows-1251 и т.д.)
define("SMSC_DEBUG", 0);                             // Включить отладку (0 - нет, 1 - да)

// Определяем функции для работы с API
function _smsc_send_cmd($cmd, $arg = "", $files = array()) {
    $url = (SMSC_HTTPS ? "https" : "http") . "://smsc.ru/sys/$cmd.php?login=" . urlencode(SMSC_LOGIN) . "&psw=" . urlencode(SMSC_PASSWORD) . "&fmt=1&" . $arg;
    $ret = @file_get_contents($url);

    if ($ret === FALSE) {
        $ret = ",";
    }

    return explode(",", $ret);
}

function send_sms($phones, $message, $translit = 0, $time = 0, $id = 0, $format = 0, $sender = false, $query = "", $files = array()) {
    static $formats = array(
        1 => "flash=1",
        2 => "push=1",
        3 => "hlr=1",
        4 => "bin=1",
        5 => "bin=2",
        6 => "ping=1",
        7 => "mms=1",
        8 => "mail=1",
        9 => "call=1",
        10 => "viber=1",
        11 => "soc=1"
    );

    $m = _smsc_send_cmd("send", "cost=3&phones=".urlencode($phones)."&mes=".urlencode($message).
        "&translit=$translit&id=$id".($format > 0 ? "&".$formats[$format] : "").
        ($sender === false ? "" : "&sender=".urlencode($sender)).
        ($time ? "&time=".urlencode($time) : "").($query ? "&$query" : ""), $files);

    return $m;
}

function get_hlr_status($id, $phone) {
    $m = _smsc_send_cmd("status", "phone=".urlencode($phone)."&id=".urlencode($id)."&hlr=1");

    if ($m[1] < 0) {
        return false;
    }

    // Определяем статус сообщения
    $status_codes = array(
        -3 => "Сообщение не найдено",
        -1 => "Ожидает отправки",
        0 => "Передано оператору",
        1 => "Доставлено",
        2 => "Прочитано",
        3 => "Просмотрено",
        20 => "Не доставлено"
    );

    $status_code = intval($m[0]);
    $status_text = isset($status_codes[$status_code]) ? $status_codes[$status_code] : "Неизвестный статус";

    return array(
        "status" => $status_text,
        "time" => isset($m[1]) && $m[1] ? date("d.m.Y H:i:s", $m[1]) : "Неизвестно",
        "country" => $m[4] ?? "Неизвестно",
        "operator" => $m[5] ?? "Неизвестно",
        "network_type" => $m[7] ?? "Неизвестно"
    );
}

// Проверяем тип запроса
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Это AJAX-запрос
    header('Content-Type: application/json; charset=utf-8');

    $action = $_POST['action'] ?? '';

    if ($action == 'send_hlr') {
        // Отправляем HLR-запрос
        $phone = $_POST['phone'] ?? '';
        if (!$phone) {
            echo json_encode(['error' => 'Пожалуйста, укажите номер телефона!']);
            exit;
        }

        // Отправляем HLR-запрос
        $result = send_sms($phone, "", 0, 0, 0, 3);

        if ($result[1] < 0) {
            echo json_encode(['error' => 'Ошибка при отправке HLR-запроса. Код ошибки: ' . -$result[1]]);
            exit;
        }

        // Возвращаем ID сообщения
        echo json_encode([
            'success' => true,
            'id' => $result[0],
            'phone' => $phone
        ]);
        exit;
    } elseif ($action == 'get_status') {
        // Получаем статус HLR-запроса
        $phone = $_POST['phone'] ?? '';
        $id = $_POST['id'] ?? '';

        if (!$phone || !$id) {
            echo json_encode(['error' => 'Не указан номер телефона или ID сообщения.']);
            exit;
        }

        // Задержка 2 секунды
        sleep(1);

        // Получаем статус
        $status = get_hlr_status($id, $phone);

        if ($status) {
            echo json_encode(['success' => true, 'status' => $status]);
        } else {
            echo json_encode(['error' => 'Ошибка при получении статуса HLR-запроса.']);
        }
        exit;
    } else {
        echo json_encode(['error' => 'Некорректное действие.']);
        exit;
    }
} else {
    // Выводим форму
    ?>

    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Проверка номера телефона</title>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    </head>
    <body>
        <h2>Введите номер телефона для проверки:</h2>
        <form id="hlrForm">
            <input type="text" id="phone" name="phone" placeholder="+79991234567" required>
            <button type="submit">Проверить номер</button>
        </form>
        <div id="result" style="margin-top: 15px;"></div>

        <script>
            $(document).ready(function () {
                $('#hlrForm').submit(function (e) {
                    e.preventDefault();

                    let phoneNumber = $('#phone').val();
                    $('#result').html('Проверка номера...');

                    // Отправляем HLR-запрос
                    $.ajax({
                        url: '',  // Тот же файл
                        type: 'POST',
                        dataType: 'json',
                        data: { action: 'send_hlr', phone: phoneNumber },
                        success: function (response) {
                            if (response.success) {
                                $('#result').html('HLR-запрос отправлен. Ждем 2 секунды...');

                                // Ждем 2 секунды и получаем статус
                                setTimeout(function () {
                                    checkStatus(response.id, response.phone);
                                }, 2000);
                            } else {
                                $('#result').html('<span style="color:red;">' + response.error + '</span>');
                            }
                        },
                        error: function () {
                            $('#result').html('<span style="color:red;">Ошибка при отправке HLR-запроса.</span>');
                        }
                    });
                });

                function checkStatus(id, phone) {
                    $.ajax({
                        url: '',  // Тот же файл
                        type: 'POST',
                        dataType: 'json',
                        data: { action: 'get_status', id: id, phone: phone },
                        success: function (response) {
                            if (response.success) {
                                let status = response.status;
                                $('#result').html(`
                                    <h3>Статус HLR-запроса:</h3>
                                    <p>Статус: ${status.status}</p>
                                    <p>Время изменения: ${status.time}</p>
                                    <p>Страна: ${status.country}</p>
                                    <p>Оператор: ${status.operator}</p>
                                    <p>Тип сети: ${status.network_type}</p>
                                `);
                            } else {
                                $('#result').html('<span style="color:red;">' + response.error + '</span>');
                            }
                        },
                        error: function () {
                            $('#result').html('<span style="color:red;">Ошибка при получении статуса HLR-запроса.</span>');
                        }
                    });
                }
            });
        </script>
    </body>
    </html>

    <?php
}
?>
