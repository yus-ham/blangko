<?php

namespace app\controllers;

use Yii;

class SiteController extends \yii\rest\Controller
{
    /** @skip-auth */
    public function actionIndex()
    {
        return ['message' => 'Welcome to ' . Yii::$app->name];
    }
}
