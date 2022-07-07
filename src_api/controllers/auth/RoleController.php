<?php

namespace app\controllers\auth;

use Yii;

class RoleController extends \app\components\ActiveController
{
    public $modelClass = \app\models\auth\Role::class;
    public $softDelete = false;
}
