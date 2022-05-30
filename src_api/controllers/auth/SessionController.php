<?php

namespace app\controllers\auth;

use Yii;
use app\models\auth\LoginForm;
use app\models\auth\User;

class SessionController extends \yii\rest\Controller
{
    public $skipAuth = '*';

    public static function extraUrlRules()
    {
        return [
            'GET' => 'view',
            'DELETE' => 'delete',
        ];
    }

    public function actionView()
    {
        $token = Yii::$app->request->cookies['rt'];

        if ($user = User::findIdentityByRefreshToken($token)) {
            return [
                'token' => $user->jwt,
                'identity' => $user,
            ];
        }

        throw new \yii\web\UnauthorizedHttpException();
    }

    public function actionCreate()
    {
        $model = new LoginForm();
        $model->load(Yii::$app->request->bodyParams, '');

        if ($model->login()) {
            $cookie = Yii::createObject([
                'class' => 'yii\web\Cookie',
                'name' => 'rt',
                'value' => $model->refreshToken->value,
            ]);
            Yii::$app->response->cookies->add($cookie);
            Yii::$app->response->statusCode = 201;
        }

        return $model;
    }

    public function actionDelete()
    {
        Yii::$app->response->cookies->remove('rt');
        Yii::$app->response->statusCode = 204;
    }
}
