<?php

namespace app\controllers\auth;

use Yii;

class SessionController extends \yii\rest\ActiveController
{
    public $modelClass = 'app\models\auth\Session';
    public $skipAuth = '*';
}
