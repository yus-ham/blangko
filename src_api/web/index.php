<?php

$ROOT = str_replace('\\', '/', dirname(__DIR__)) . '/';

$config = require $ROOT .'config/env/common.php';
require $ROOT .'config/bootstrap.php';

$config = yii\helpers\ArrayHelper::merge($config, require $ROOT .'config/web.php');
(new yii\web\Application($config))->run();
