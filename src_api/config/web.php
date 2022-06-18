<?php

$host = $_SERVER['HTTP_X_ORIGINAL_HOST'] ?? null;
$http = ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? null) === 'https' ? 'https' : 'http';


return yii\helpers\ArrayHelper::merge(
    require $ROOT .'config/common.php',
    [
        'id' => 'basic',
        'name' => 'Blangko',
        'basePath' => $ROOT,
        'language' => 'id',
        'controllerNamespace' => 'app\controllers',
        'aliases' => [
            '@app' => $ROOT,
            '@bower' => '@vendor/bower-asset',
            '@npm'   => '@vendor/npm-asset',
        ],
        'components' => [
            'request' => [
                'hostInfo' => $host ? "$http://$host" : null,
                'baseUrl' => strpos($_SERVER['SERVER_SOFTWARE'], 'Apache') ? str_replace('/web', '', (new yii\web\Request)->baseUrl) : null,
            ],
            'session' => ['savePath' => '@runtime/session'],
            'user' => [
                'identityClass' => 'app\models\auth\User',
                'enableAutoLogin' => true,
            ],

            'urlManager' => [
                'enablePrettyUrl' => true,
                'showScriptName' => false,
                'baseUrl' => $host ? "$http://$host". (new yii\web\Request)->baseUrl : null,
            ],

            'assetManager' => ['appendTimestamp' => true],
        ],
        'as rest' => ['class' => 'app\components\RestSetup'],
    ],
    require $ROOT .'config/env/common.php',
    require $ROOT .'config/env/web.php',
);
