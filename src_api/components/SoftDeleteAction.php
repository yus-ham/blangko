<?php

namespace app\components;

use Yii;

class SoftDeleteAction extends \yii\rest\DeleteAction
{
    public function findModel($id)
    {
        $model = parent::findModel($id);
        $model->attachBehavior('soft-delete', [
            'replaceRegularDelete' => true,
            'softDeleteAttributeValues' => ['deleted' => fn ($ar) => Yii::$app->user->id . '@' . time()],
            'class' => \yii2tech\ar\softdelete\SoftDeleteBehavior::class,
        ]);
        return $model;
    }
}
