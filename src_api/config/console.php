<?php

return yii\helpers\ArrayHelper::merge(
    require $ROOT .'config/common.php',
    [
        'id' => 'basic-console',
        'basePath' => $ROOT,
        'controllerNamespace' => 'app\cli',
        'aliases' => [
            '@bower' => '@vendor/bower-asset',
            '@npm'   => '@vendor/npm-asset',
        ],
        'components' => [
            'log' => ['traceLevel' => 3]
        ]
    ],
    is_file($ROOT .'config/env/common.php') ? require $ROOT .'config/env/common.php' : [],
);
