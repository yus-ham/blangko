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
        'params' => yii\helpers\ArrayHelper::merge(
            require $ROOT .'config/params.php',
            require $ROOT .'config/env/params.php',
        ),
        /*
        'controllerMap' => [
            'fixture' => [ // Fixture generation command line.
                'class' => 'yii\faker\FixtureController',
            ],
        ],
        */
    ],
    require $ROOT .'config/env/common.php',
    require $ROOT .'config/env/console.php',
);
