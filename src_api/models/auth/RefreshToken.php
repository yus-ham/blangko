<?php

namespace app\models\auth;

use Yii;

class RefreshToken extends \yii\db\ActiveRecord
{
    public static function tableName()
    {
        return 'refresh_token';
    }
}
