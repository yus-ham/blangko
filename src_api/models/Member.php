<?php

namespace app\models;

use Yii;
use Firebase\JWT\JWT;

class Member extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'member';
    }

    public function rules()
    {
        return [
            [['name', 'email', 'phone', 'dob'], 'required'],
        ];
    }


    // public function fields()
    // {
    //     return [
    //         'id',
    //         'username',
    //         'email',
    //         'role_id',
    //         'role' => fn () => $this->role->name ?? '',
    //     ];
    // }
}
