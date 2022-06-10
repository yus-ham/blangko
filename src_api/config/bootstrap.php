<?php

/** @return \Composer\Autoload\ClassLoader $autoloader */
require $ROOT .'vendor/autoload.php';
require $ROOT .'vendor/yiisoft/yii2/Yii.php';

Yii::$container->set('yii\base\Event', app\components\Event::class);
Yii::setAlias('@vendor', $ROOT .'vendor');

if (YII_ENV_DEV) {
    app\components\Event::on(yii\base\Model::class, 'afterValidate', function ($e) {
        $fn = $e->sender->errors ? 'warning' : 'info';
        call_user_func(['Yii', $fn], ['errors'=>$e->sender->errors,'attrs'=>$e->sender->attributes], $e->sender->formName().'::afterValidate');
    });
}
