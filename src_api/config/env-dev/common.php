<?php

defined('YII_DEBUG') or define('YII_DEBUG', true);
defined('YII_ENV') or define('YII_ENV', 'dev');


if (class_exists('app\components\Event')) {
    app\components\Event::on(yii\base\Model::class, 'afterValidate', function ($e) {
        $fn = $e->sender->errors ? 'warning' : 'info';
        call_user_func(['Yii', $fn], ['errors'=>$e->sender->errors,'attrs'=>$e->sender->attributes], $e->sender->formName().'::afterValidate');
    });
}


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
