<?php

namespace app\cli;

use Yii;
use app\models\User;
use yii\console\Controller;

class DevController extends Controller
{
    public function actionIndex()
    {
        $user = new User([
            'username' => 'admin',
            'password' => Yii::$app->security->generatePasswordHash('admin'),
            'email' => 'admin@example.com',
            'auth_key' => Yii::$app->security->generateRandomString(),
            'status' => User::STATUS_ACTIVE,
        ]);
        $user->save();
    }
}
