<?php

namespace app\controllers\auth;

use Yii;
use app\models\auth\LoginForm;
use app\models\auth\User;

class SessionController extends \yii\rest\ActiveController
{
    public $modelClass = 'app\models\auth\Session';
    public $skipAuth = '*';

    // public function actionCreate()
    // {
    //     $model = new LoginForm();
    //     $model->load(Yii::$app->request->bodyParams, '');

    //     if ($model->login()) {
    //         Yii::$app->response->statusCode = 201;
    //     }

    //     return $model;
    // }
}
