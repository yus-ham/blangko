<?php

/** @return \Composer\Autoload\ClassLoader $autoloader */
require $ROOT .'vendor/autoload.php';
require $ROOT .'vendor/yiisoft/yii2/Yii.php';

Yii::$container->set('yii\base\Event', app\components\Event::class);
Yii::setAlias('@vendor', $ROOT .'vendor');
