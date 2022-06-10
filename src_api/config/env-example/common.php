<?php

defined('YII_DEBUG') or define('YII_DEBUG', true);
defined('YII_ENV') or define('YII_ENV', 'dev');


return [
    'components' => [
        'log' => ['traceLevel' => 3],
        'mailer' => ['useFileTransport' => true],

        'db' => [
            'dsn' => 'mysql:host=localhost;port=3306;dbname=blangko',
            'username' => '',
            'password' => '',
        ],
    ]
];
