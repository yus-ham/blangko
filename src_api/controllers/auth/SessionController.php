<?php

namespace app\controllers\auth;

use app\models\auth\Session;
use yii\web\ServerErrorHttpException;
use Yii;

class SessionController extends \yii\rest\Controller
{
    public $skipAuth = '*';

    public function actionCreate()
    {
        $model = new Session();
        $model->load(Yii::$app->request->bodyParams, '');

        if ($model->login()) {
            Yii::$app->response->statusCode = 201;
        } elseif (!$model->hasErrors()) {
            throw new ServerErrorHttpException('Failed to create the object for unknown reason.');
        }

        return $model;
    }
}
