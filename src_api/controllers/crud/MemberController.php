<?php

namespace app\controllers\crud;

use Yii;

class MemberController extends \app\components\ActiveController
{
    public $softDelete = false;
    public $modelClass = 'app\models\Member';
    public $skipAuth = true;
}
