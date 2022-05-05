<?php

return [
    'bootstrap' => ['log'],
    'components' => [
        'db' => [
            'class' => 'yii\db\Connection',
            'charset' => 'utf8',
        ],

        'log' => [
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],

        'mailer' => ['class' => 'yii\swiftmailer\Mailer'],
        'cache' => ['class' => 'yii\caching\FileCache'],
    ],
    'as auto-module' => 'app\components\ModuleLoader',
];
