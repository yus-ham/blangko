<?php

namespace app\controllers\auth;

use Yii;
use yii\web\UnprocessableEntityHttpException;

class UserController extends \app\components\ActiveController
{
    public $modelClass = \app\models\auth\User::class;

    public function actionIndex()
    {
        $dp = parent::actionIndex();
        $dp->query->andWhere("deleted is null or deleted = ''");
        $dp->query->with('role')->orderBy('role_id,name');

        return $dp;
    }
}
